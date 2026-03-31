"""Security-focused tests for signup verification token lifecycle."""
from datetime import datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.email_verification_token import EmailVerificationToken
from app.models.tenant import Tenant
from app.models.user import User
from app.security.auth.email_verif import consume_token, get_valid_token_record, issue_verification_token
from app.security.auth.rate_limit import SlidingWindowRateLimiter


def _build_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()


def _seed_user(db):
    tenant = Tenant(name="Acme")
    db.add(tenant)
    db.flush()
    user = User(
        first_name="Jane",
        last_name="Doe",
        email="jane@example.com",
        password_hash="hashed",
        tenant_id=tenant.id,
        role="owner",
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    return user


def test_verification_token_is_single_use():
    db = _build_session()
    user = _seed_user(db)

    token = issue_verification_token(db, user.id, user.email)
    record = get_valid_token_record(db, token)
    assert record is not None

    consume_token(db, record)

    consumed = get_valid_token_record(db, token)
    assert consumed is None


def test_expired_verification_token_is_rejected():
    db = _build_session()
    user = _seed_user(db)

    token = issue_verification_token(db, user.id, user.email)
    record = get_valid_token_record(db, token)
    assert record is not None

    record.expires_at = datetime.utcnow() - timedelta(minutes=1)
    db.commit()

    expired = get_valid_token_record(db, token)
    assert expired is None


def test_rate_limiter_blocks_excessive_requests():
    limiter = SlidingWindowRateLimiter()
    key = "signup:security@test.com"

    assert limiter.allow(key, max_attempts=2, window_seconds=300)
    assert limiter.allow(key, max_attempts=2, window_seconds=300)
    assert not limiter.allow(key, max_attempts=2, window_seconds=300)
