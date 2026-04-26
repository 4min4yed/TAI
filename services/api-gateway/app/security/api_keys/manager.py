"""API key lifecycle manager (generate, rotate, revoke)."""
import bcrypt
import secrets

class APIKeyManager:
    """Create and manage API keys.

    Raw keys are returned once to the caller, while persistent storage should
    use only the hashed representation.
    """

    def generate(self):
        """Generate a new API key pair: (raw_key, bcrypt_hash)."""
        raw = secrets.token_urlsafe(32)
        hashed = bcrypt.hashpw(raw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        return raw, hashed

    def rotate(self, key_id):
        """Rotate existing key material for a key identifier.

        TODO: implement persistence update and key revocation flow.
        """
        pass
