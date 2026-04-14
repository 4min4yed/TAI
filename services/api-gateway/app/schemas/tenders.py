"""Schemas for tender scraping endpoints."""

from __future__ import annotations

from datetime import date
from pydantic import Field, field_validator

from app.schemas.base import StrictSchema


class TenderScrapeRequest(StrictSchema):
    query: str = Field(min_length=2, max_length=120)
    months_back: int = Field(default=3, ge=1, le=36)
    max_results: int = Field(default=20, ge=1, le=50)
    language: str = Field(default="fr", min_length=2, max_length=5)

    @field_validator("language")
    @classmethod
    def normalize_language(cls, value: str) -> str:
        return value.lower()


class ScrapedTenderPdf(StrictSchema):
    id: str
    title: str
    snippet: str
    source_url: str
    pdf_url: str
    domain: str
    published_hint: str | None = None


class TenderScrapeResponse(StrictSchema):
    query: str
    generated_google_query: str
    from_date: date
    to_date: date
    total_results: int
    results: list[ScrapedTenderPdf]