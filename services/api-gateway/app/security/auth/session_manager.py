"""Session lifecycle management (refresh rotation, expiry policies)."""
from .jwt_handler import create_Ajwt, create_Rt
import random




class SessionManager:
    def create_session(self, user_id: int, tenant_id: int):
        Ajwt_token=create_Ajwt(user_id, tenant_id)
        R_token=create_Rt(user_id, tenant_id)
        return {"access_token": Ajwt_token, "refresh_token": R_token, "token_type": "bearer"}
    def rotate_refresh(self, session_id: int):
        # Logic to rotate refresh token
        pass



