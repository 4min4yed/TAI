"""Session lifecycle management (refresh rotation, expiry policies)."""
class SessionManager:
    def create_session(self, user_id: int):
        # create refresh token, set expiry
        pass

    def rotate_refresh(self, session_id: int):
        # rotate token
        pass
