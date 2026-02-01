"""AES-256-GCM cipher suite helpers (production should use libsodium or cryptography)."""

def encrypt(plaintext: bytes, key: bytes) -> bytes:
    raise NotImplementedError

def decrypt(ciphertext: bytes, key: bytes) -> bytes:
    raise NotImplementedError
