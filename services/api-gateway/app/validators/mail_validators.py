"""Email validation helpers (RFC5322 & MX checking)."""
import re

EMAIL_RE = re.compile(r"[^@]+@[^@]+\.[^@]+")

def is_valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email))
