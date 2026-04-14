"""Cross-tenant data isolation tests."""

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_db_dep
from app.main import app
from app.models.base import Base
from app.models.document import Document
from app.models.tenant import Tenant
from app.models.user import User
from app.security.auth.jwt_handler import create_Ajwt


def test_cross_tenant_data_leak():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)
    db = Session()

    tenant_a = Tenant(name="Tenant A")
    tenant_b = Tenant(name="Tenant B")
    db.add_all([tenant_a, tenant_b])
    db.flush()

    owner_a = User(
        id="user-a",
        first_name="Owner",
        last_name="A",
        email="owner-a@test.local",
        password_hash="hash-owner-a",
        tenant_id=tenant_a.id,
        role="owner",
        is_active=True,
        is_verified=True,
        is_2fa_enabled=False,
    )
    db.add(owner_a)

    db.add_all(
        [
            Document(tenant_id=tenant_a.id, filename="a_doc.pdf", path="/docs/a_doc.pdf"),
            Document(tenant_id=tenant_b.id, filename="b_doc.pdf", path="/docs/b_doc.pdf"),
        ]
    )
    db.commit()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db_dep] = override_get_db
    try:
        with TestClient(app) as client:
            jwt_a = create_Ajwt("user-a", tenant_a.id, "owner")
            response = client.get(
                "/v1/documents/",
                headers={"Authorization": f"Bearer {jwt_a}"},
            )
            assert response.status_code == 200
            payload = response.json()
            assert len(payload["documents"]) == 1
            assert payload["documents"][0]["tenant_id"] == tenant_a.id
            assert payload["documents"][0]["filename"] == "a_doc.pdf"
    finally:
        app.dependency_overrides.pop(get_db_dep, None)
        db.close()
