"""Semantic search endpoints (RAG queries and hybrid search)."""
from fastapi import APIRouter

router = APIRouter(prefix="/search", tags=["search"])

@router.post("/query")
async def query():
    return {"results": []}
