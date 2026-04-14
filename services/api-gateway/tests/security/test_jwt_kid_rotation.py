"""Security tests for KID-based JWT verification and key rotation."""

from app.security.auth import jwt_handler


def test_access_token_carries_kid_and_verifies_across_rotation():
    original = {
        "JWT_KEY_RING_JSON": jwt_handler.settings.JWT_KEY_RING_JSON,
        "JWT_ACTIVE_KID": jwt_handler.settings.JWT_ACTIVE_KID,
        "JWT_ALGORITHMS": jwt_handler.settings.JWT_ALGORITHMS,
    }
    try:
        jwt_handler.settings.JWT_KEY_RING_JSON = (
            '{"key-v1":{"alg":"HS256","private_key":"secret-v1","public_key":"secret-v1"},'
            '"key-v2":{"alg":"HS256","private_key":"secret-v2","public_key":"secret-v2"}}'
        )
        jwt_handler.settings.JWT_ACTIVE_KID = "key-v1"
        jwt_handler.settings.JWT_ALGORITHMS = "HS256"

        token, claims = jwt_handler.create_access_token("user-1", "tenant-1", "owner")
        verified_v1 = jwt_handler.verify_jwt(token, expected_type="access")
        assert verified_v1["jti"] == claims["jti"]

        # Rotate active signing key; existing token still verifies via token header KID.
        jwt_handler.settings.JWT_ACTIVE_KID = "key-v2"
        verified_after_rotation = jwt_handler.verify_jwt(token, expected_type="access")
        assert verified_after_rotation["jti"] == claims["jti"]
    finally:
        jwt_handler.settings.JWT_KEY_RING_JSON = original["JWT_KEY_RING_JSON"]
        jwt_handler.settings.JWT_ACTIVE_KID = original["JWT_ACTIVE_KID"]
        jwt_handler.settings.JWT_ALGORITHMS = original["JWT_ALGORITHMS"]
