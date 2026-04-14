"""Security tests for refresh rotation, forgot-password, and 2FA flows."""

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import pyotp

from app.core.dependencies import get_db
from app.core.security import hash_password, verify_password
from app.main import app
from app.models.base import Base
from app.models.auth_security import PasswordResetToken
from app.models.tenant import Tenant
from app.models.user import User


def _build_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return Session()


def _override_db(db):
    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db


def _seed_user(db):
    tenant = Tenant(name="Tenant Auth")
    db.add(tenant)
    db.flush()

    user = User(
        first_name="Auth",
        last_name="User",
        email="auth@test.com",
        password_hash=hash_password("StrongPass123"),
        tenant_id=tenant.id,
        role="owner",
        is_active=True,
        is_verified=True,
        is_2fa_enabled=False,
    )
    db.add(user)
    db.commit()
    return user


def test_refresh_token_rotation_and_reuse_detection(monkeypatch):
    db = _build_session()
    _seed_user(db)
    _override_db(db)

    try:
        with TestClient(app) as client:
            login = client.post("/v1/auth/login", json={"email": "auth@test.com", "password": "StrongPass123"})
            assert login.status_code == 200
            first_refresh = login.json()["refresh_token"]

            refresh_once = client.post("/v1/auth/refresh", json={"refresh_token": first_refresh})
            assert refresh_once.status_code == 200

            replay = client.post("/v1/auth/refresh", json={"refresh_token": first_refresh})
            assert replay.status_code == 401
            assert "reuse" in replay.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_forgot_password_flow_updates_password(monkeypatch):
    db = _build_session()
    user = _seed_user(db)
    captured = {"token": None}

    async def _fake_send(email: str, token: str) -> bool:
        captured["token"] = token
        return True

    monkeypatch.setattr("app.routes.v1.auth._send_password_reset_email", _fake_send)
    _override_db(db)

    try:
        with TestClient(app) as client:
            req = client.post("/v1/auth/forgot-password/request", json={"email": "auth@test.com"})
            assert req.status_code == 200
            assert captured["token"]

            confirm = client.post(
                "/v1/auth/forgot-password/confirm",
                json={
                    "token": captured["token"],
                    "new_password": "EvenStronger123",
                    "confirm_password": "EvenStronger123",
                },
            )
            assert confirm.status_code == 200

        db.refresh(user)
        assert verify_password(user.password_hash, "EvenStronger123")
        used_record = db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).first()
        assert used_record is not None
        assert used_record.is_used is True
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_login_with_2fa_challenge_and_verification():
    db = _build_session()
    _seed_user(db)
    _override_db(db)

    try:
        with TestClient(app) as client:
            login = client.post("/v1/auth/login", json={"email": "auth@test.com", "password": "StrongPass123"})
            assert login.status_code == 200
            access = login.json()["access_token"]

            setup = client.post("/v1/auth/2fa/setup", headers={"Authorization": f"Bearer {access}"})
            assert setup.status_code == 200
            secret = setup.json()["secret"]
            code = pyotp.TOTP(secret).now()

            enable = client.post(
                "/v1/auth/2fa/enable",
                json={"code": code},
                headers={"Authorization": f"Bearer {access}"},
            )
            assert enable.status_code == 200

            mfa_login = client.post("/v1/auth/login", json={"email": "auth@test.com", "password": "StrongPass123"})
            assert mfa_login.status_code == 200
            assert mfa_login.json()["mfa_required"] is True
            challenge = mfa_login.json()["mfa_token"]

            verify = client.post(
                "/v1/auth/2fa/verify-login",
                json={"mfa_token": challenge, "code": pyotp.TOTP(secret).now()},
            )
            assert verify.status_code == 200
            assert verify.json()["access_token"]
    finally:
        app.dependency_overrides.clear()
        db.close()
