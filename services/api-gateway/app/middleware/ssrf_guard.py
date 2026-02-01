"""SSRF protection: block requests to private IP ranges and metadata endpoints."""
from urllib.parse import urlparse

PRIVATE_PREFIXES = ("127.", "10.", "192.168.", "169.254.")


def is_private(hostname):
    return any(hostname.startswith(p) for p in PRIVATE_PREFIXES)


def guard_url(url: str):
    parsed = urlparse(url)
    if is_private(parsed.hostname or ""):
        raise ValueError("SSRF blocked: private address")
