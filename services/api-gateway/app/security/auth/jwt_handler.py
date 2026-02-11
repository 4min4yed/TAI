"""JWT creation and validation helpers (multi-algorithm support)."""
import datetime
import jwt
import os
import secrets
import time
def verify_jwt(token: str):
    # Decode JWT, verify 'iss' claim and algorithm
    raise NotImplementedError

def create_Ajwt(user_id, tenant_id, algorithm: str = "HS256"):
    print("Creating Access Token for user with user_id:", user_id)
    now = int(time.time())
    jwt_payload = {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "iat": now,
        "exp": now + (15 * 60)  # 15 minutes from now
    }
    secret = os.getenv("JWT_SECRET", "changeme")
    token = jwt.encode(jwt_payload, secret, algorithm=algorithm)
    return token

def create_Rt(user_id, tenant_id, algorithm: str = "HS256"):
    return secrets.token_urlsafe(256) 

#Verify JWT Vulnerabilities (JWKs, alg none, key confusion...)
#Tie refresh tokens to IP/device fingerprint
#Multi-Algorithm JWT: EdDSA (Ed25519), RS256 (RSA 2048), HS256 (HMAC-SHA256)