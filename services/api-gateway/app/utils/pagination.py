"""Pagination helpers (offset, cursor-based)."""

def offset_pagination(query, limit, offset):
    return query.limit(limit).offset(offset)
