"""Open Policy Agent client for policy evaluation."""

class OPAClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def evaluate(self, policy: str, input_data: dict):
        # call OPA REST API
        return {}
