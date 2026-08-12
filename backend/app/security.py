from datetime import datetime, timedelta

from jose import jwt, JWTError


SECRET_KEY = "testmaster-secret-key-change"
ALGORITHM = "HS256"


def create_token(data: dict):

    payload = data.copy()

    expire = datetime.utcnow() + timedelta(
        hours=24
    )

    payload["exp"] = expire

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def decode_token(token: str):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None