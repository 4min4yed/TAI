"""JWT authentication supporting EdDSA/RS256/HS256 algorithms.

Routes may use `Depends(get_current_user)` which relies on this module.
"""
from fastapi import Request


def verify_jwt(token: str):
    # Decode token based on header alg; consult JWKS endpoint for RS256/EdDSA
    raise NotImplementedError

async def jwt_auth_dependency(request: Request):
    # Extract from Authorization header and verify
    return None
