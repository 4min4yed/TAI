"""Security tests for document role-based actions."""

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_db_dep
from app.main import app
from app.models.base import Base
from app.models.document import Document
from app.models.tenant import Tenant
from app.models.user import User
from app.security.auth.jwt_handler import create_Ajwt


class FakeStorage:
    def __init__(self) -> None:
        self.objects: dict[str, tuple[bytes, str]] = {}

    def put_bytes(self, object_name: str, data: bytes, content_type: str) -> None:
        self.objects[object_name] = (data, content_type)

    def get_bytes(self, object_name: str) -> tuple[bytes, str]:
        return self.objects[object_name]

    def remove(self, object_name: str) -> None:
        self.objects.pop(object_name, None)


def _build_db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return Session()


def _seed(db):
    tenant = Tenant(name="Tenant Docs")
    db.add(tenant)
    db.flush()

    owner = User(
        first_name="Owner",
        last_name="User",
        email="owner@docs.test",
        password_hash="hash-owner",
        tenant_id=tenant.id,
        role="owner",
        is_active=True,
        is_verified=True,
        is_2fa_enabled=False,
    )
    viewer = User(
        first_name="Viewer",
        last_name="User",
        email="viewer@docs.test",
        password_hash="hash-viewer",
        tenant_id=tenant.id,
        role="viewer",
        is_active=True,
        is_verified=True,
        is_2fa_enabled=False,
    )
    db.add_all([owner, viewer])
    db.commit()
    return tenant, owner, viewer


def test_owner_uploads_and_viewer_cannot_upload(monkeypatch):
    db = _build_db()
    tenant, owner, viewer = _seed(db)
    storage = FakeStorage()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    monkeypatch.setattr("app.routes.v1.documents._get_storage", lambda: storage)
    app.dependency_overrides[get_db_dep] = override_get_db

    try:
        with TestClient(app) as client:
            owner_token = create_Ajwt(owner.id, tenant.id, "owner")
            upload_response = client.post(
                "/v1/documents/upload",
                headers={"Authorization": f"Bearer {owner_token}"},
                data={"doc_type": "Legal", "department": "Compliance", "tags": "urgent,contract"},
                files={"file": ("contract.pdf", b"%PDF-1.4\nhello-world", "application/pdf")},
            )
            assert upload_response.status_code == 200
            payload = upload_response.json()
            assert payload["status"] == "uploaded"
            assert payload["document"]["filename"] == "contract.pdf"

            bad_signature = client.post(
                "/v1/documents/upload",
                headers={"Authorization": f"Bearer {owner_token}"},
                data={"doc_type": "Legal", "department": "Compliance", "tags": "urgent"},
                files={"file": ("fake.pdf", b"not-a-pdf", "application/pdf")},
            )
            assert bad_signature.status_code == 400

            viewer_token = create_Ajwt(viewer.id, tenant.id, "viewer")
            denied_upload = client.post(
                "/v1/documents/upload",
                headers={"Authorization": f"Bearer {viewer_token}"},
                data={"doc_type": "Legal", "department": "Compliance", "tags": "x"},
                files={"file": ("blocked.pdf", b"%PDF-1.4\nblocked", "application/pdf")},
            )
            assert denied_upload.status_code == 403

            list_response = client.get(
                "/v1/documents/",
                headers={"Authorization": f"Bearer {viewer_token}"},
            )
            assert list_response.status_code == 200
            docs = list_response.json()["documents"]
            assert len(docs) == 1

            doc_id = docs[0]["id"]
            download_response = client.get(
                f"/v1/documents/{doc_id}/download",
                headers={"Authorization": f"Bearer {viewer_token}"},
            )
            assert download_response.status_code == 200
            assert download_response.content == b"%PDF-1.4\nhello-world"
    finally:
        app.dependency_overrides.clear()
        db.close()
