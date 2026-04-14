"""Ensure tenant isolation denies cross-tenant user visibility."""

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_db_dep
from app.main import app
from app.models.base import Base
from app.models.tenant import Tenant
from app.models.user import User
from app.security.auth.jwt_handler import create_Ajwt


def _seed_db(db):
    tenant_a = Tenant(name="Tenant A")
    tenant_b = Tenant(name="Tenant B")
    db.add_all([tenant_a, tenant_b])
    db.flush()

    db.add_all(
        [
            User(
                first_name="Alice",
                last_name="A",
                email="alice@a.test",
                password_hash="hash-a",
                tenant_id=tenant_a.id,
                role="owner",
                is_active=True,
                is_verified=True,
            ),
            User(
                first_name="Bob",
                last_name="B",
                email="bob@b.test",
                password_hash="hash-b",
                tenant_id=tenant_b.id,
                role="owner",
                is_active=True,
                is_verified=True,
            ),
        ]
    )
    db.commit()
    owner_a = db.query(User).filter(User.email == "alice@a.test").first()
    return tenant_a, tenant_b, owner_a


def test_rls_violation_attempts():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)

    db = Session()
    tenant_a, tenant_b, owner_a = _seed_db(db)

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db_dep] = override_get_db
    try:
        with TestClient(app) as client:
            token_a = create_Ajwt(owner_a.id, tenant_a.id, "owner")
            response = client.get(
                "/v1/users/",
                headers={
                    "Authorization": f"Bearer {token_a}",
                },
            )
            assert response.status_code == 200
            payload = response.json()
            assert len(payload["users"]) == 1
            assert payload["users"][0]["tenant_id"] == tenant_a.id

            # Caller from tenant A must never observe tenant B records.
            assert all(user["tenant_id"] != tenant_b.id for user in payload["users"])

            missing_auth = client.get("/v1/users/")
            assert missing_auth.status_code == 401
    finally:
        app.dependency_overrides.pop(get_db_dep, None)
        db.close()
