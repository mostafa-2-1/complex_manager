
import jwt
from datetime import datetime, timedelta, timezone
from flask import current_app
from app.extensions import bcrypt


# ─── Password Helpers ─────────────────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    Returns the hashed password as a UTF-8 string.
    """
    return bcrypt.generate_password_hash(plain_password).decode('utf-8')


def check_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a bcrypt hash.
    Returns True if match, False otherwise.
    """
    return bcrypt.check_password_hash(hashed_password, plain_password)


# ─── JWT Helpers ──────────────────────────────────────────────────────────────

def generate_token(admin_id: int, role: str) -> str:
    """
    Generate a signed JWT token containing admin ID and role.
    Expiry is driven by JWT_EXPIRATION_HOURS in config.
    """
    payload = {
        'sub':  admin_id,                    # Subject — who the token belongs to
        'role': role,                        # Role embedded for quick access
        'iat':  datetime.now(timezone.utc),  # Issued at
        'exp':  datetime.now(timezone.utc) + timedelta(
                    hours=current_app.config['JWT_EXPIRATION_HOURS']
                )
    }
    return jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    Raises jwt.ExpiredSignatureError or jwt.InvalidTokenError on failure.
    """
    return jwt.decode(
        token,
        current_app.config['JWT_SECRET_KEY'],
        algorithms=['HS256']
    )