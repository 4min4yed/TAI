"""Secrets manager integration (HashiCorp Vault).

This module centralizes secrets fetching and caching. Look for `VAULT_ADDR` and `VAULT_TOKEN` usage in env.
"""

class VaultClient:
    def __init__(self, address: str, token: str):
        self.address = address
        self.token = token

    def get_secret(self, path: str):
        # Implement Vault API calls or use hvac
        raise NotImplementedError
