"""Centralized exception handling to return consistent error shapes."""
from fastapi import Request
from fastapi.responses import JSONResponse

async def http_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"error": "internal_error", "message": str(exc)})
