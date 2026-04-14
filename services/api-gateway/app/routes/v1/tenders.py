"""Tenders endpoints for discovery/scraping workflows."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request

from app.schemas.tenders import ScrapedTenderPdf, TenderScrapeRequest, TenderScrapeResponse
from app.utils.tender_scraper import scrape_tender_pdfs


router = APIRouter(prefix="/tenders", tags=["tenders"])

ALLOWED_SCRAPE_ROLES = {"owner", "admin", "manager", "analyst", "user"}


@router.post("/scrape", response_model=TenderScrapeResponse)
async def scrape_tenders(payload: TenderScrapeRequest, request: Request):
    role = str(getattr(request.state, "role", "") or "").lower()
    if not role:
        raise HTTPException(status_code=401, detail="Authentication required")
    if role not in ALLOWED_SCRAPE_ROLES:
        raise HTTPException(status_code=403, detail="Insufficient role to launch scraping")

    to_date = datetime.now(timezone.utc).date()
    from_date = to_date - timedelta(days=payload.months_back * 30)

    try:
        query, results = await scrape_tender_pdfs(
            keyword=payload.query,
            from_date=from_date,
            language=payload.language,
            max_results=payload.max_results,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Scraping failed: {exc}") from exc

    return TenderScrapeResponse(
        query=payload.query,
        generated_google_query=query,
        from_date=from_date,
        to_date=to_date,
        total_results=len(results),
        results=[
            ScrapedTenderPdf(
                id=item.id,
                title=item.title,
                snippet=item.snippet,
                source_url=item.source_url,
                pdf_url=item.pdf_url,
                domain=item.domain,
                published_hint=item.published_hint,
            )
            for item in results
        ],
    )