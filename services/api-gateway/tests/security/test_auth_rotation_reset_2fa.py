"""Security tests for refresh rotation, forgot-password, and 2FA flows."""

import importlib

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

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


def _patch_login_email_2fa(monkeypatch, fixed_code: str = "123456"):
    async def _fake_send(_email: str, _code: str) -> bool:
        return True

    login_email_2fa_module = importlib.import_module("app.security.auth.login_email_2fa")
    login_user_module = importlib.import_module("app.security.auth.login_user")
    monkeypatch.setattr(login_email_2fa_module, "generate_email_login_code", lambda: fixed_code)
    monkeypatch.setattr(login_user_module, "send_login_email_code", _fake_send)


def _reset_rate_limit_state():
    middleware_rate_module = importlib.import_module("app.middleware.rate_limit")
    auth_rate_module = importlib.import_module("app.security.auth.rate_limit")
    middleware_rate_module._BUCKETS.clear()
    auth_rate_module.auth_rate_limiter._events.clear()


def _login_and_verify(client: TestClient, *, email: str, password: str, code: str = "123456") -> dict:
    login = client.post("/v1/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    assert login.json()["mfa_required"] is True
    challenge = login.json()["mfa_token"]
    verify = client.post("/v1/auth/2fa/verify-login", json={"mfa_token": challenge, "code": code})
    assert verify.status_code == 200
    return verify.json()


def test_refresh_token_rotation_and_reuse_detection(monkeypatch):
    db = _build_session()
    _seed_user(db)
    _override_db(db)
    _patch_login_email_2fa(monkeypatch)
    _reset_rate_limit_state()

    try:
        with TestClient(app) as client:
            verified = _login_and_verify(client, email="auth@test.com", password="StrongPass123")
            first_refresh = verified["refresh_token"]

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
    _reset_rate_limit_state()

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


def test_login_with_email_2fa_challenge_and_verification(monkeypatch):
    db = _build_session()
    _seed_user(db)
    _override_db(db)
    _patch_login_email_2fa(monkeypatch)
    _reset_rate_limit_state()

    try:
        with TestClient(app) as client:
            verify_payload = _login_and_verify(client, email="auth@test.com", password="StrongPass123")
            assert verify_payload["access_token"]
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_email_2fa_invalid_code_attempt_lockout(monkeypatch):
    db = _build_session()
    _seed_user(db)
    _override_db(db)
    _patch_login_email_2fa(monkeypatch)
    _reset_rate_limit_state()

    try:
        with TestClient(app) as client:
            login = client.post("/v1/auth/login", json={"email": "auth@test.com", "password": "StrongPass123"})
            assert login.status_code == 200
            challenge = login.json()["mfa_token"]

            for _ in range(5):
                invalid = client.post(
                    "/v1/auth/2fa/verify-login",
                    json={"mfa_token": challenge, "code": "000000"},
                )
                assert invalid.status_code == 401

            blocked = client.post(
                "/v1/auth/2fa/verify-login",
                json={"mfa_token": challenge, "code": "123456"},
            )
            assert blocked.status_code == 401
    finally:
        app.dependency_overrides.clear()
        db.close()
