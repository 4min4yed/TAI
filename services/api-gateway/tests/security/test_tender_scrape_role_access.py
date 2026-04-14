"""Security tests for tender scraping role access."""

from fastapi.testclient import TestClient

from app.main import app
from app.security.auth.jwt_handler import create_Ajwt


def test_tender_scrape_requires_authentication():
    with TestClient(app) as client:
        response = client.post(
            "/v1/tenders/scrape",
            json={"query": "informatique", "months_back": 3, "max_results": 2, "language": "fr"},
        )
        assert response.status_code == 401


def test_tender_scrape_blocks_viewer_role(monkeypatch):
    async def fake_scraper(**kwargs):
        return "fake query", []

    monkeypatch.setattr("app.routes.v1.tenders.scrape_tender_pdfs", fake_scraper)

    with TestClient(app) as client:
        token = create_Ajwt("user-1", "tenant-1", "viewer")
        response = client.post(
            "/v1/tenders/scrape",
            headers={"Authorization": f"Bearer {token}"},
            json={"query": "informatique", "months_back": 3, "max_results": 2, "language": "fr"},
        )
        assert response.status_code == 403


def test_tender_scrape_allows_manager_role(monkeypatch):
    async def fake_scraper(**kwargs):
        return "fake query", [
            type("Item", (), {
                "id": "pdf-1",
                "title": "Avis AO PDF",
                "snippet": "Annonce 2026-02-01",
                "source_url": "https://example.gov",
                "pdf_url": "https://example.gov/ao.pdf",
                "domain": "example.gov",
                "published_hint": "2026-02-01",
            })()
        ]

    monkeypatch.setattr("app.routes.v1.tenders.scrape_tender_pdfs", fake_scraper)

    with TestClient(app) as client:
        token = create_Ajwt("user-1", "tenant-1", "manager")
        response = client.post(
            "/v1/tenders/scrape",
            headers={"Authorization": f"Bearer {token}"},
            json={"query": "informatique", "months_back": 3, "max_results": 2, "language": "fr"},
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload["query"] == "informatique"
        assert payload["generated_google_query"] == "fake query"
        assert payload["total_results"] == 1
        assert payload["results"][0]["pdf_url"].endswith(".pdf")