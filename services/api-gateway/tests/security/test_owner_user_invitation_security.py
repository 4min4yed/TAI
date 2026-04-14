"""Security tests for owner-only user invitation and activation flow."""

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_db, get_db_dep
from app.core.security import verify_password
from app.main import app
from app.models.base import Base
from app.models.tenant import Tenant
from app.models.user import User
from app.security.auth.email_verif import issue_verification_token
from app.security.auth.jwt_handler import create_Ajwt


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
    app.dependency_overrides[get_db_dep] = _override_get_db


def _seed_owner_and_member(db):
    tenant = Tenant(name="Tenant One")
    db.add(tenant)
    db.flush()

    owner = User(
        first_name="Owner",
        last_name="User",
        email="owner@test.com",
        password_hash="owner-hash",
        tenant_id=tenant.id,
        role="owner",
        is_active=True,
        is_verified=True,
        is_2fa_enabled=False,
    )
    member = User(
        first_name="Member",
        last_name="User",
        email="member@test.com",
        password_hash="member-hash",
        tenant_id=tenant.id,
        role="viewer",
        is_active=True,
        is_verified=True,
        is_2fa_enabled=False,
    )
    db.add_all([owner, member])
    db.commit()
    return tenant, owner, member


def test_owner_can_invite_user(monkeypatch):
    db = _build_session()
    tenant, owner, _ = _seed_owner_and_member(db)

    async def _fake_send_verification_email(email: str, user_id: str, verification_token: str) -> bool:
        return True

    monkeypatch.setattr("app.routes.v1.users.send_verification_email", _fake_send_verification_email)

    _override_db(db)
    try:
        with TestClient(app) as client:
            owner_token = create_Ajwt(owner.id, tenant.id, "owner")
            response = client.post(
                "/v1/users/invite",
                headers={"Authorization": f"Bearer {owner_token}"},
                json={
                    "email": "invitee@test.com",
                    "first_name": "Invited",
                    "last_name": "User",
                    "role": "editor",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "verification_required"

        invited = db.query(User).filter(User.email == "invitee@test.com").first()
        assert invited is not None
        assert invited.role == "editor"
        assert invited.is_active is False
        assert invited.is_verified is False
        assert invited.is_2fa_enabled is False
        assert invited.password_hash.startswith("!pending!")
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_non_owner_cannot_invite_user(monkeypatch):
    db = _build_session()
    tenant, _, member = _seed_owner_and_member(db)

    async def _fake_send_verification_email(email: str, user_id: str, verification_token: str) -> bool:
        return True

    monkeypatch.setattr("app.routes.v1.users.send_verification_email", _fake_send_verification_email)

    _override_db(db)
    try:
        with TestClient(app) as client:
            member_token = create_Ajwt(member.id, tenant.id, "viewer")
            response = client.post(
                "/v1/users/invite",
                headers={"Authorization": f"Bearer {member_token}"},
                json={
                    "email": "blocked@test.com",
                    "first_name": "Blocked",
                    "last_name": "User",
                    "role": "viewer",
                },
            )

        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_invited_user_verifies_and_sets_password():
    db = _build_session()
    tenant, _, _ = _seed_owner_and_member(db)

    invited = User(
        first_name="Invited",
        last_name="User",
        email="new-user@test.com",
        password_hash="!pending!temp",
        tenant_id=tenant.id,
        role="viewer",
        is_active=False,
        is_verified=False,
        is_2fa_enabled=False,
    )
    db.add(invited)
    db.commit()

    verification_token = issue_verification_token(db, invited.id, invited.email)

    _override_db(db)
    try:
        with TestClient(app) as client:
            validate_response = client.post(
                "/v1/auth/verify-email/validate",
                json={"token": verification_token},
            )
            assert validate_response.status_code == 200
            assert validate_response.json()["valid"] is True
            assert validate_response.json()["requires_password_setup"] is True

            confirm_response = client.post(
                "/v1/auth/verify-email/confirm",
                json={
                    "token": verification_token,
                    "new_password": "StrongPass123",
                    "confirm_password": "StrongPass123",
                },
            )

        assert confirm_response.status_code == 200
        assert confirm_response.json()["status"] == "verified"

        db.refresh(invited)
        assert invited.is_verified is True
        assert invited.is_active is True
        assert not invited.password_hash.startswith("!pending!")
        assert verify_password(invited.password_hash, "StrongPass123")
    finally:
        app.dependency_overrides.clear()
        db.close()
