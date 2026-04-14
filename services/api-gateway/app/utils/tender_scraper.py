"""Google advanced search scraper for tender PDF discovery."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from html import unescape
from urllib.parse import parse_qs, unquote, urlparse
import re

import httpx


GOOGLE_SEARCH_URL = "https://www.google.com/search"
BING_SEARCH_URL = "https://www.bing.com/search"
DUCKDUCKGO_HTML_URL = "https://html.duckduckgo.com/html/"
MIN_AVIS_AO_PAGES = 3


@dataclass
class ScrapedPdfItem:
    id: str
    title: str
    snippet: str
    source_url: str
    pdf_url: str
    domain: str
    published_hint: str | None = None


def build_google_advanced_query(keyword: str, from_date: date) -> str:
    # We force French tender intent + PDF output and date constraint.
    return (
        f'("appel d\'offres" OR "avis d\'appel d\'offres" OR AO) '
        f"{keyword} site:gov.tn filetype:pdf after:{from_date.isoformat()}"
    )


def build_relaxed_fallback_query(keyword: str) -> str:
    # Keep tender intent but avoid strict date operators that many engines ignore.
    return f"{keyword} (\"appel d'offres\" OR tender OR AO) site:gov.tn filetype:pdf"



def _extract_google_redirect_url(href: str) -> str | None:
    if not href.startswith("/url?"):
        return None
    query = parse_qs(urlparse(href).query)
    raw_target = query.get("q", [None])[0] or query.get("url", [None])[0]
    if not raw_target:
        return None
    raw_target = unquote(raw_target)
    if not raw_target.startswith("http://") and not raw_target.startswith("https://"):
        return None
    return raw_target


def _extract_duckduckgo_redirect_url(href: str) -> str | None:
    # Typical DDG result links are /l/?kh=-1&uddg=<encoded_target>
    if href.startswith("//"):
        href = f"https:{href}"

    parsed = urlparse(href)
    if not parsed.path.endswith("/l/") and parsed.path != "/l/":
        return None
    query = parse_qs(parsed.query)
    raw_target = query.get("uddg", [None])[0]
    if not raw_target:
        return None
    raw_target = unquote(raw_target)
    if not raw_target.startswith("http://") and not raw_target.startswith("https://"):
        return None
    return raw_target


def _is_pdf_url(url: str) -> bool:
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return False
    path = (parsed.path or "").lower()
    if path.endswith(".pdf"):
        return True
    # Some portals expose PDFs through query params (e.g. ...?file=xxx.pdf).
    query = (parsed.query or "").lower()
    return ".pdf" in query


def _extract_pdf_title_from_url(url: str) -> str:
    path = urlparse(url).path
    filename = path.rsplit("/", 1)[-1]
    if not filename:
        return "Tender PDF"
    filename = re.sub(r"\.pdf$", "", filename, flags=re.IGNORECASE)
    filename = re.sub(r"[_-]+", " ", filename).strip()
    return filename or "Tender PDF"


def _is_avis_ao_item(item: ScrapedPdfItem) -> bool:
    text = f"{item.title} {item.snippet} {item.pdf_url}".lower()
    has_avis = "avis" in text
    has_ao_marker = (
        "ao" in text
        or "a.o" in text
        or "appel d'offres" in text
        or "appel d offres" in text
    )
    return has_avis and has_ao_marker
def _estimate_pdf_page_count(pdf_bytes: bytes) -> int | None:
    # Lightweight heuristic: count '/Type /Page' markers in PDF content.
    # It is not perfect but reliable for the common tender PDFs we process.
    if not pdf_bytes.startswith(b"%PDF"):
        return None
    matches = re.findall(rb"/Type\s*/Page\b", pdf_bytes)
    if not matches:
        return None
    return len(matches)


async def _fetch_pdf_page_count(client: httpx.AsyncClient, pdf_url: str, headers: dict[str, str]) -> int | None:
    try:
        # Try a bounded read first to avoid downloading large files.
        response = await client.get(
            pdf_url,
            headers={**headers, "Range": "bytes=0-2097151"},
            timeout=12.0,
            follow_redirects=True,
        )
        if response.status_code >= 400:
            return None
        page_count = _estimate_pdf_page_count(response.content)
        if page_count is not None:
            return page_count

        # Some servers ignore range or compress differently; fallback to full fetch.
        response = await client.get(pdf_url, headers=headers, timeout=15.0, follow_redirects=True)
        if response.status_code >= 400:
            return None
        return _estimate_pdf_page_count(response.content)
    except Exception:
        return None


async def _exclude_short_avis_ao_items(items: list[ScrapedPdfItem], headers: dict[str, str]) -> list[ScrapedPdfItem]:
    if not items:
        return items

    filtered: list[ScrapedPdfItem] = []
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        for item in items:
            if not _is_avis_ao_item(item):
                filtered.append(item)
                continue

            page_count = await _fetch_pdf_page_count(client, item.pdf_url, headers)
            if page_count is None:
                # Fail-open to avoid false negatives on inaccessible PDFs.
                filtered.append(item)
                continue

            if page_count >= MIN_AVIS_AO_PAGES:
                filtered.append(item)

    return filtered


def _sanitize_text(value: str) -> str:
    text = unescape(re.sub(r"<[^>]+>", " ", value))
    return re.sub(r"\s+", " ", text).strip()


def _extract_title(html: str) -> str:
    match = re.search(r"<h3[^>]*>(.*?)</h3>", html, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        return "Untitled tender document"
    title = _sanitize_text(match.group(1))
    return title or "Untitled tender document"


def _extract_snippet(html: str) -> str:
    snippet_match = re.search(
        r'<div class="(?:VwiC3b|s3v9rd)[^\"]*"[^>]*>(.*?)</div>',
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if snippet_match:
        snippet = _sanitize_text(snippet_match.group(1))
        if snippet:
            return snippet
    return ""


def _extract_published_hint(snippet: str) -> str | None:
    match = re.search(r"\b(\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2})\b", snippet)
    if match:
        return match.group(1)
    return None


def _iter_google_result_blocks(html: str) -> list[str]:
    return re.findall(r'<div class="MjjYud".*?</div>\s*</div>', html, flags=re.IGNORECASE | re.DOTALL)


def _extract_pdf_candidates_from_html(html: str) -> list[str]:
    href_values = re.findall(r'href="([^"]+)"', html, flags=re.IGNORECASE)
    candidates: list[str] = []

    for href in href_values:
        href = unescape(href)

        target = _extract_google_redirect_url(href)
        if target and _is_pdf_url(target):
            candidates.append(target)
            continue

        if href.startswith("http://") or href.startswith("https://"):
            if _is_pdf_url(href):
                candidates.append(href)

    return candidates


async def _scrape_pdf_candidates_from_bing(
    *,
    search_query: str,
    language: str,
    max_results: int,
    headers: dict[str, str],
) -> list[str]:
    params = {
        "q": search_query,
        "setlang": language,
        "count": str(max_results),
    }

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(BING_SEARCH_URL, params=params, headers=headers)
        response.raise_for_status()

    html = response.text
    href_values = re.findall(r'href="([^"]+)"', html, flags=re.IGNORECASE)
    candidates: list[str] = []
    for href in href_values:
        href = unescape(href)
        if (href.startswith("http://") or href.startswith("https://")) and _is_pdf_url(href):
            candidates.append(href)
    return candidates


async def _scrape_pdf_candidates_from_duckduckgo(
    *,
    search_query: str,
    language: str,
    max_results: int,
    headers: dict[str, str],
) -> list[str]:
    params = {
        "q": search_query,
        "kl": "fr-fr" if language == "fr" else "us-en",
    }

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(DUCKDUCKGO_HTML_URL, params=params, headers=headers)
        response.raise_for_status()

    html = response.text
    href_values = re.findall(r'href="([^"]+)"', html, flags=re.IGNORECASE)
    candidates: list[str] = []
    for href in href_values:
        href = unescape(href)

        target = _extract_duckduckgo_redirect_url(href)
        if target and _is_pdf_url(target):
            candidates.append(target)
            if len(candidates) >= max_results:
                break
            continue

        if (href.startswith("http://") or href.startswith("https://")) and _is_pdf_url(href):
            candidates.append(href)
            if len(candidates) >= max_results:
                break

    return candidates


async def scrape_tender_pdfs(
    *,
    keyword: str,
    from_date: date,
    language: str,
    max_results: int,
) -> tuple[str, list[ScrapedPdfItem]]:
    advanced_query = build_google_advanced_query(keyword, from_date)
    relaxed_query = build_relaxed_fallback_query(keyword)

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
    }

    params = {
        "q": advanced_query,
        "hl": language,
        "num": str(max_results),
        "safe": "off",
    }

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(GOOGLE_SEARCH_URL, params=params, headers=headers)
        response.raise_for_status()

    html = response.text
    blocks = _iter_google_result_blocks(html)

    out: list[ScrapedPdfItem] = []
    seen_pdf_urls: set[str] = set()

    for idx, block in enumerate(blocks, start=1):
        href_match = re.search(r'href="([^"]+)"', block)
        if not href_match:
            continue

        target_url = _extract_google_redirect_url(href_match.group(1))
        if not target_url:
            continue

        lower_target = target_url.lower()
        if ".pdf" not in lower_target:
            continue
        if target_url in seen_pdf_urls:
            continue

        seen_pdf_urls.add(target_url)
        parsed = urlparse(target_url)
        snippet = _extract_snippet(block)
        item = ScrapedPdfItem(
            id=f"pdf-{idx}",
            title=_extract_title(block),
            snippet=snippet,
            source_url=f"{parsed.scheme}://{parsed.netloc}",
            pdf_url=target_url,
            domain=parsed.netloc,
            published_hint=_extract_published_hint(snippet),
        )
        out.append(item)

        if len(out) >= max_results:
            break

    if len(out) < max_results:
        # Fallback parser: scan all links in the HTML to capture PDFs when
        # Google changes result block markup.
        candidates = _extract_pdf_candidates_from_html(html)
        for target_url in candidates:
            if target_url in seen_pdf_urls:
                continue

            seen_pdf_urls.add(target_url)
            parsed = urlparse(target_url)
            out.append(
                ScrapedPdfItem(
                    id=f"pdf-{len(out) + 1}",
                    title=_extract_pdf_title_from_url(target_url),
                    snippet="",
                    source_url=f"{parsed.scheme}://{parsed.netloc}",
                    pdf_url=target_url,
                    domain=parsed.netloc,
                    published_hint=None,
                )
            )

            if len(out) >= max_results:
                break

    if len(out) < max_results:
        # Secondary fallback when Google HTML is sparse/blocked in server-side contexts.
        bing_candidates = await _scrape_pdf_candidates_from_bing(
            search_query=relaxed_query,
            language=language,
            max_results=max_results,
            headers=headers,
        )
        for target_url in bing_candidates:
            if target_url in seen_pdf_urls:
                continue

            seen_pdf_urls.add(target_url)
            parsed = urlparse(target_url)
            out.append(
                ScrapedPdfItem(
                    id=f"pdf-{len(out) + 1}",
                    title=_extract_pdf_title_from_url(target_url),
                    snippet="",
                    source_url=f"{parsed.scheme}://{parsed.netloc}",
                    pdf_url=target_url,
                    domain=parsed.netloc,
                    published_hint=None,
                )
            )
            if len(out) >= max_results:
                break

    if len(out) < max_results:
        ddg_candidates = await _scrape_pdf_candidates_from_duckduckgo(
            search_query=relaxed_query,
            language=language,
            max_results=max_results,
            headers=headers,
        )
        for target_url in ddg_candidates:
            if target_url in seen_pdf_urls:
                continue

            seen_pdf_urls.add(target_url)
            parsed = urlparse(target_url)
            out.append(
                ScrapedPdfItem(
                    id=f"pdf-{len(out) + 1}",
                    title=_extract_pdf_title_from_url(target_url),
                    snippet="",
                    source_url=f"{parsed.scheme}://{parsed.netloc}",
                    pdf_url=target_url,
                    domain=parsed.netloc,
                    published_hint=None,
                )
            )
            if len(out) >= max_results:
                break

    out = await _exclude_short_avis_ao_items(out, headers)
    return advanced_query, out