import os
import smtplib
from email.message import EmailMessage
from urllib.parse import quote

from fastapi import APIRouter
from pydantic import BaseModel
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from dotenv import load_dotenv

from database.db import SessionLocal
from database.models import User, Service
from security import (
    create_token,
    create_password_reset_token,
    decode_password_reset_token,
    password_signature_matches,
)

load_dotenv()

router = APIRouter(prefix="/users", tags=["Users"])
ph = PasswordHasher()


class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    service_id: int


class LoginData(BaseModel):
    email: str
    password: str


class ForgotPasswordData(BaseModel):
    email: str


class ResetPasswordData(BaseModel):
    token: str
    new_password: str


def send_password_reset_email(email: str, reset_token: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", smtp_user)
    frontend_url = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173").rstrip("/")

    if not all([smtp_host, smtp_user, smtp_password, smtp_from]):
        raise RuntimeError("SMTP settings are not configured")

    reset_url = f"{frontend_url}/?reset_token={quote(reset_token)}"

    msg = EmailMessage()
    msg["Subject"] = "TestMaster — восстановление пароля"
    msg["From"] = smtp_from
    msg["To"] = email
    msg.set_content(
        "Здравствуйте!\n\n"
        "Для восстановления пароля TestMaster перейдите по ссылке:\n\n"
        f"{reset_url}\n\n"
        "Ссылка действует 30 минут.\n"
        "Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо."
    )

    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=20) as smtp:
            smtp.login(smtp_user, smtp_password)
            smtp.send_message(msg)
    else:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(smtp_user, smtp_password)
            smtp.send_message(msg)


@router.post("/register")
def register_user(user_data: UserCreate):
    db = SessionLocal()
    try:
        service = db.query(Service).filter(Service.id == user_data.service_id).first()
        if not service:
            return {"error": "необходимо выбрать службу"}

        email = user_data.email.strip().lower()
        exists = db.query(User).filter(User.email == email).first()
        if exists:
            return {"error": "Email уже зарегистрирован"}

        user = User(
            email=email,
            name=user_data.name,
            password_hash=ph.hash(user_data.password),
            service_id=user_data.service_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        return {"id": user.id, "email": user.email, "service_id": user.service_id}
    finally:
        db.close()


@router.post("/login")
def login(data: LoginData):
    db = SessionLocal()
    try:
        email = data.email.strip().lower()
        user = db.query(User).filter(User.email == email).first()

        if not user:
            return {"error": "Неверный email или пароль"}

        try:
            ph.verify(user.password_hash, data.password)
        except VerifyMismatchError:
            return {"error": "Неверный email или пароль"}

        token = create_token({
            "user_id": user.id,
            "service_id": user.service_id,
            "is_admin": user.is_admin
        })

        return {
            "token": token,
            "user_id": user.id,
            "service_id": user.service_id,
            "is_admin": user.is_admin
        }
    finally:
        db.close()


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordData):
    db = SessionLocal()
    try:
        email = data.email.strip().lower()
        user = db.query(User).filter(User.email == email).first()

        generic = {
            "message": "Если такой email зарегистрирован, на него отправлена ссылка для восстановления пароля."
        }

        if not user:
            return generic

        token = create_password_reset_token(
            user_id=user.id,
            password_hash=user.password_hash,
            expires_minutes=30
        )

        try:
            send_password_reset_email(user.email, token)
        except Exception as exc:
            print("Password reset email error:", repr(exc))
            return {"error": "Не удалось отправить письмо. Попробуйте позже."}

        return generic
    finally:
        db.close()


@router.post("/reset-password")
def reset_password(data: ResetPasswordData):
    if len(data.new_password) < 8:
        return {"error": "Новый пароль должен содержать не менее 8 символов"}

    payload = decode_password_reset_token(data.token)
    if not payload:
        return {"error": "Ссылка недействительна или срок её действия истёк"}

    user_id = payload.get("user_id")
    pwd_sig = payload.get("pwd_sig")
    if not user_id or not pwd_sig:
        return {"error": "Некорректная ссылка"}

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "Пользователь не найден"}

        if not password_signature_matches(user.password_hash, pwd_sig):
            return {"error": "Ссылка уже была использована или стала недействительной"}

        user.password_hash = ph.hash(data.new_password)
        db.commit()

        return {"message": "Пароль успешно изменён"}
    finally:
        db.close()
