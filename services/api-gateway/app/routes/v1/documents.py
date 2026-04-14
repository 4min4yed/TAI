"""Document management (upload, list, download, delete)."""
import re
from datetime import datetime, timezone
from io import BytesIO

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse

from app.core.object_storage import ObjectStorageService
from app.core.dependencies import get_db_dep
from app.models.document import Document
from app.models.user import User
from app.security.auth.jwt_handler import verify_jwt
from app.security.rbac import can
from app.validators.document_validators import (
    antivirus_scan_passed,
    validate_file_size,
    validate_file_type,
    validate_magic_number,
)

router = APIRouter(prefix="/documents", tags=["documents"])
_storage: ObjectStorageService | None = None

READ_PERMISSION = "documents.read"
UPLOAD_PERMISSION = "documents.upload"
EDIT_PERMISSION = "documents.edit"
DELETE_PERMISSION = "documents.delete"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _get_storage() -> ObjectStorageService:
    global _storage
    if _storage is None:
        _storage = ObjectStorageService()
    return _storage


def _safe_filename(filename: str) -> str:
    base = filename.strip() or "document.bin"
    return re.sub(r"[^a-zA-Z0-9_.-]", "_", base)


def _split_tags(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [tag.strip() for tag in raw.split(",") if tag.strip()]


def _join_tags(tags: list[str]) -> str:
    return ",".join(tags)


def _auth_payload(request: Request) -> dict:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = header.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    try:
        return verify_jwt(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid bearer token") from exc


def _auth_context(request: Request, db) -> tuple[str, User, str]:
    payload = _auth_payload(request)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session payload")

    tenant_id = str(payload.get("tenant_id") or getattr(request.state, "tenant_id", "") or "")
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Invalid session payload")

    user = db.query(User).filter(User.id == str(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User does not exist")
    if str(user.tenant_id) != tenant_id:
        raise HTTPException(status_code=403, detail="Cross-tenant access denied")
    if not user.is_active or not user.is_verified:
        raise HTTPException(status_code=403, detail="User is not active")

    role = str(user.role).lower()
    return tenant_id, user, role


def _require_permission(role: str, permission: str, action: str) -> None:
    if not can(role, permission):
        raise HTTPException(status_code=403, detail=f"Role is not allowed to {action}")


def _doc_to_payload(doc: Document, role: str) -> dict:
    allowed_actions = ["view", "download"]
    if can(role, EDIT_PERMISSION):
        allowed_actions.append("edit")
    if can(role, DELETE_PERMISSION):
        allowed_actions.append("delete")

    return {
        "id": doc.id,
        "tenant_id": doc.tenant_id,
        "filename": doc.filename,
        "doc_type": doc.doc_type,
        "department": doc.department,
        "status": doc.status,
        "mime_type": doc.mime_type,
        "size_bytes": doc.size_bytes,
        "tags": _split_tags(doc.tags),
        "path": doc.path,
        "created_at_utc": doc.created_at_utc.isoformat() if doc.created_at_utc else None,
        "updated_at_utc": doc.updated_at_utc.isoformat() if doc.updated_at_utc else None,
        "uploaded_by_user_id": doc.uploaded_by_user_id,
        "allowed_actions": allowed_actions,
    }

@router.get("/")
async def list_documents(request: Request, db=Depends(get_db_dep)):
    tenant_id, _, role = _auth_context(request, db)
    _require_permission(role, READ_PERMISSION, "view documents")

    documents = db.query(Document).filter(Document.tenant_id == tenant_id).all()
    return {"documents": [_doc_to_payload(doc, role) for doc in documents]}

@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    doc_type: str = Form("General"),
    department: str = Form("General"),
    tags: str = Form(""),
    db=Depends(get_db_dep),
):
    tenant_id, user, role = _auth_context(request, db)
    _require_permission(role, UPLOAD_PERMISSION, "upload documents")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    filename = _safe_filename(file.filename or "document.bin")
    content_type = file.content_type or "application/octet-stream"
    if not validate_file_type(content_type):
        raise HTTPException(status_code=400, detail="File type is not allowed")
    if not validate_file_size(len(data)):
        raise HTTPException(status_code=400, detail="File exceeds maximum size limit")
    if not validate_magic_number(content_type, data):
        raise HTTPException(status_code=400, detail="File signature does not match declared type")
    if not antivirus_scan_passed(data):
        raise HTTPException(status_code=400, detail="File failed antivirus scan")

    document = Document(
        tenant_id=tenant_id,
        filename=filename,
        path="",
        doc_type=doc_type.strip() or "General",
        department=department.strip() or "General",
        status="uploaded",
        mime_type=content_type,
        size_bytes=len(data),
        uploaded_by_user_id=user.id,
        tags=tags.strip(),
    )
    db.add(document)
    db.flush()

    object_key = f"{tenant_id}/{document.id}/{filename}"
    try:
        _get_storage().put_bytes(object_key, data, content_type)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Object storage unavailable") from exc
    document.path = object_key
    document.updated_at_utc = _utc_now()
    db.commit()
    db.refresh(document)

    return {"status": "uploaded", "document": _doc_to_payload(document, role)}


@router.get("/{document_id}/view")
async def view_document(document_id: int, request: Request, db=Depends(get_db_dep)):
    tenant_id, _, role = _auth_context(request, db)
    _require_permission(role, READ_PERMISSION, "view documents")

    doc = db.query(Document).filter(Document.id == document_id, Document.tenant_id == tenant_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        payload, content_type = _get_storage().get_bytes(doc.path)
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Stored object not found") from exc
    headers = {"Content-Disposition": f'inline; filename="{doc.filename}"'}
    return StreamingResponse(BytesIO(payload), media_type=content_type, headers=headers)


@router.get("/{document_id}/download")
async def download_document(document_id: int, request: Request, db=Depends(get_db_dep)):
    tenant_id, _, role = _auth_context(request, db)
    _require_permission(role, READ_PERMISSION, "download documents")

    doc = db.query(Document).filter(Document.id == document_id, Document.tenant_id == tenant_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        payload, content_type = _get_storage().get_bytes(doc.path)
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Stored object not found") from exc
    headers = {"Content-Disposition": f'attachment; filename="{doc.filename}"'}
    return StreamingResponse(BytesIO(payload), media_type=content_type, headers=headers)


@router.patch("/{document_id}")
async def update_document(document_id: int, request: Request, payload: dict, db=Depends(get_db_dep)):
    tenant_id, _, role = _auth_context(request, db)
    _require_permission(role, EDIT_PERMISSION, "edit documents")

    doc = db.query(Document).filter(Document.id == document_id, Document.tenant_id == tenant_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if "filename" in payload and str(payload["filename"]).strip():
        doc.filename = _safe_filename(str(payload["filename"]))
    if "doc_type" in payload and str(payload["doc_type"]).strip():
        doc.doc_type = str(payload["doc_type"]).strip()
    if "department" in payload and str(payload["department"]).strip():
        doc.department = str(payload["department"]).strip()
    if "tags" in payload:
        raw_tags = payload["tags"]
        if isinstance(raw_tags, list):
            doc.tags = _join_tags([str(tag).strip() for tag in raw_tags if str(tag).strip()])
        else:
            doc.tags = str(raw_tags or "").strip()

    doc.updated_at_utc = _utc_now()
    db.commit()
    db.refresh(doc)
    return {"status": "updated", "document": _doc_to_payload(doc, role)}


@router.delete("/{document_id}")
async def delete_document(document_id: int, request: Request, db=Depends(get_db_dep)):
    tenant_id, _, role = _auth_context(request, db)
    _require_permission(role, DELETE_PERMISSION, "delete documents")

    doc = db.query(Document).filter(Document.id == document_id, Document.tenant_id == tenant_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        _get_storage().remove(doc.path)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Object storage unavailable") from exc
    db.delete(doc)
    db.commit()
    return {"status": "deleted"}