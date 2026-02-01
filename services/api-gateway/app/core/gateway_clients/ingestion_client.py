"""Client for ingestion service (document upload events)."""
import httpx

class IngestionClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def notify_upload(self, payload: dict):
        async with httpx.AsyncClient() as c:
            await c.post(f"{self.base_url}/ingest/events", json=payload)
