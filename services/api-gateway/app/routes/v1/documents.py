"""Document management (upload, list, download, delete)."""
from fastapi import APIRouter

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document():
    return {"status": "accepted"}
