"""HMAC request signer for webhook authentication."""
import hmac
import hashlib

class RequestSigner:
    def __init__(self, secret: bytes):
        self.secret = secret

    def sign(self, payload: bytes) -> str:
        return hmac.new(self.secret, payload, hashlib.sha256).hexdigest()
