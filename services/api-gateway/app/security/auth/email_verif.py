import hashlib
import hmac
import secrets
import smtplib
import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.email_verification_token import EmailVerificationToken


settings = Settings()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def hash_verification_token(raw_token: str) -> str:
    digest_input = f"{settings.SECRET_KEY}:{raw_token}".encode("utf-8")
    return hashlib.sha256(digest_input).hexdigest()


def issue_verification_token(db: Session, user_id: int, email: str) -> str:
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_verification_token(raw_token)
    ttl_minutes = max(10, min(settings.EMAIL_VERIFICATION_TTL_MINUTES, 1440))
    expires_at = utc_now() + timedelta(minutes=ttl_minutes)

    db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == user_id,
        EmailVerificationToken.is_used.is_(False),
        EmailVerificationToken.is_invalidated.is_(False),
    ).update(
        {
            "is_invalidated": True,
            "invalidated_at": utc_now(),
            "invalidation_reason": "superseded",
        },
        synchronize_session=False,
    )

    db.add(
        EmailVerificationToken(
            user_id=user_id,
            email=email,
            token_hash=token_hash,
            expires_at=expires_at,
        )
    )
    db.commit()
    return raw_token


def get_valid_token_record(db: Session, raw_token: str) -> Optional[EmailVerificationToken]:
    token_hash = hash_verification_token(raw_token)
    record = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token_hash == token_hash,
    ).first()

    if not record:
        return None
    if record.is_used or record.is_invalidated:
        return None
    if as_utc(record.expires_at) < utc_now():
        return None
    return record


def consume_token(db: Session, record: EmailVerificationToken) -> None:
    record.is_used = True
    record.used_at = utc_now()
    db.commit()


def invalidate_token_by_raw_token(db: Session, raw_token: str, reason: str) -> bool:
    token_hash = hash_verification_token(raw_token)
    record = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token_hash == token_hash,
    ).first()
    if not record:
        return False

    if not record.is_used and not record.is_invalidated:
        record.is_invalidated = True
        record.invalidated_at = utc_now()
        record.invalidation_reason = reason
        db.commit()
    return True


def verify_token_matches(record: EmailVerificationToken, raw_token: str) -> bool:
    expected_hash = hash_verification_token(raw_token)
    return hmac.compare_digest(record.token_hash, expected_hash)


def _send_email_sync(email: str, text_body: str, html_body: str) -> bool:
    """Synchronous email sending (runs in thread pool)."""
    logger = logging.getLogger(__name__)
    try:
        if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
            logger.error("SMTP credentials are missing. Configure SMTP_EMAIL and SMTP_PASSWORD in .env")
            return False

        # Create email message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Verify Your Email - TAI Platform"
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_EMAIL}>"
        msg["To"] = email
        
        # Add text first, then HTML as recommended for multipart/alternative.
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))
        
        # Send via Google SMTP
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()  # Secure connection
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_EMAIL, [email], msg.as_string())
        
        logger.info(f"Verification email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email to {email}: {str(e)}")
        return False


async def send_verification_email(email: str, user_id: int, verification_token: str) -> bool:
    """Send verification email using Google SMTP server (async, non-blocking)."""
    verify_url = f"{settings.FRONTEND_URL}/verify?token={verification_token}"
    not_me_url = f"{settings.FRONTEND_URL}/verify?token={verification_token}&action=not-me"
    
    text_body = (
        "Email Verification - TAI Platform\n\n"
        "Thank you for signing up! Please verify your email to activate your account.\n\n"
        f"Verify now: {verify_url}\n\n"
        f"Not me? Reclaim your email: {not_me_url}\n\n"
        f"This link expires in {settings.EMAIL_VERIFICATION_TTL_MINUTES} minutes.\n"
    )

    # Create HTML email body
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Email Verification - TAI Platform</h2>
            <p>Thank you for signing up! Please verify your email to activate your account.</p>
            
            <p>
                <a href="{verify_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Verify Email Now
                </a>
            </p>
            
            <p>Or copy and paste this link in your browser:</p>
            <p><code>{verify_url}</code></p>
            
            <hr style="margin: 20px 0;">
            
            <p style="font-size: 12px; color: #666;">
                <strong>Didn't sign up?</strong> 
                <a href="{not_me_url}">Click here to reclaim your email</a>
            </p>
            
            <p style="font-size: 12px; color: #666; margin-top: 20px;">
                This link expires in {settings.EMAIL_VERIFICATION_TTL_MINUTES} minutes.
            </p>
        </body>
    </html>
    """
    
    # Run the blocking SMTP operation in a thread pool to avoid blocking the event loop
    return await asyncio.to_thread(_send_email_sync, email, text_body, html_body)