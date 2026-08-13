from datetime import datetime, timedelta
import hashlib

from jose import jwt, JWTError

SECRET_KEY = "testmaster-secret-key-change"
ALGORITHM = "HS256"


def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def _password_signature(password_hash: str) -> str:
    return hashlib.sha256(password_hash.encode("utf-8")).hexdigest()[:24]


def create_password_reset_token(user_id: int, password_hash: str, expires_minutes: int = 30):
    payload = {
        "user_id": user_id,
        "purpose": "password_reset",
        "pwd_sig": _password_signature(password_hash),
        "exp": datetime.utcnow() + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_password_reset_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "password_reset":
            return None
        return payload
    except JWTError:
        return None


def password_signature_matches(password_hash: str, signature: str) -> bool:
    return _password_signature(password_hash) == signature
