"""Helpers to emit per-request middleware traces to the server terminal."""
import json
from datetime import datetime, timezone


def middleware_trace(request, middleware: str, stage: str = "enter", extra: dict | None = None) -> None:
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": "middleware_trace",
        "middleware": middleware,
        "stage": stage,
        "request_id": getattr(request.state, "request_id", None),
        "method": request.method,
        "path": request.url.path,
    }
    if extra:
        payload.update(extra)
    print(json.dumps(payload, default=str))
