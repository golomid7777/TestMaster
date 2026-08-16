import os
import uuid
from datetime import datetime, timedelta

import requests
from fastapi import APIRouter, Depends, HTTPException

from database.db import SessionLocal
from database.models import Payment, Topic, User, TopicAccess
from questions.router import get_current_user


router = APIRouter(
    prefix="/payments",
    tags=["payments"],
)


# =========================================================
# СОЗДАНИЕ ПЛАТЕЖА
# =========================================================

@router.post("/create/{topic_id}")
def create_payment(
    topic_id: int,
    current_user=Depends(get_current_user),
):
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.id == current_user.id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Пользователь не найден",
            )

        topic = (
            db.query(Topic)
            .filter(Topic.id == topic_id)
            .first()
        )

        if not topic:
            raise HTTPException(
                status_code=404,
                detail="Тема не найдена",
            )

        if topic.service_id != user.service_id:
            raise HTTPException(
                status_code=403,
                detail="Тема недоступна для службы пользователя",
            )

        if (topic.price_kopecks or 0) <= 0:
            raise HTTPException(
                status_code=400,
                detail="Эта тема бесплатная",
            )

        if (topic.access_minutes or 0) < 1:
            raise HTTPException(
                status_code=400,
                detail="Для темы не настроено время доступа",
            )

        shop_id = os.getenv("YOOKASSA_SHOP_ID")
        secret_key = os.getenv("YOOKASSA_SECRET_KEY")
        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:5173",
        ).rstrip("/")

        if not shop_id or not secret_key:
            raise HTTPException(
                status_code=500,
                detail="ЮKassa не настроена",
            )

        idempotency_key = str(uuid.uuid4())

        payment_row = Payment(
            user_id=user.id,
            topic_id=topic.id,
            idempotency_key=idempotency_key,
            amount_kopecks=topic.price_kopecks,
            access_minutes=topic.access_minutes,
            status="pending",
            created_at=datetime.utcnow(),
        )

        db.add(payment_row)
        db.commit()
        db.refresh(payment_row)

        amount_rubles = (
            f"{topic.price_kopecks / 100:.2f}"
        )

        payload = {
            "amount": {
                "value": amount_rubles,
                "currency": "RUB",
            },
            "capture": True,
            "confirmation": {
                "type": "redirect",
                "return_url": (
                    f"{frontend_url}/?payment=return"
                ),
            },
            "description": (
                f"Доступ TestMaster: {topic.name}"
            ),
            "metadata": {
                "payment_db_id": str(payment_row.id),
                "user_id": str(user.id),
                "topic_id": str(topic.id),
            },
        }

        try:
            response = requests.post(
                "https://api.yookassa.ru/v3/payments",
                json=payload,
                auth=(shop_id, secret_key),
                headers={
                    "Idempotence-Key": idempotency_key,
                    "Content-Type": "application/json",
                },
                timeout=20,
            )

        except requests.RequestException:
            raise HTTPException(
                status_code=502,
                detail="Не удалось связаться с ЮKassa",
            )

        try:
            result = response.json()

        except ValueError:
            raise HTTPException(
                status_code=502,
                detail="Некорректный ответ ЮKassa",
            )

        if response.status_code not in (200, 201):
            raise HTTPException(
                status_code=502,
                detail=result.get(
                    "description",
                    "ЮKassa не смогла создать платёж",
                ),
            )

        yookassa_payment_id = result.get("id")

        confirmation = (
            result.get("confirmation") or {}
        )

        confirmation_url = confirmation.get(
            "confirmation_url"
        )

        if (
            not yookassa_payment_id
            or not confirmation_url
        ):
            raise HTTPException(
                status_code=502,
                detail=(
                    "ЮKassa не вернула ссылку на оплату"
                ),
            )

        payment_row.yookassa_payment_id = (
            yookassa_payment_id
        )

        payment_row.status = result.get(
            "status",
            "pending",
        )

        db.commit()

        return {
            "payment_id": payment_row.id,
            "yookassa_payment_id": (
                yookassa_payment_id
            ),
            "status": payment_row.status,
            "amount_kopecks": (
                payment_row.amount_kopecks
            ),
            "access_minutes": (
                payment_row.access_minutes
            ),
            "confirmation_url": confirmation_url,
        }

    finally:
        db.close()


# =========================================================
# WEBHOOK ЮKASSA
# =========================================================

@router.post("/webhook")
def yookassa_webhook(data: dict):
    event = data.get("event")
    obj = data.get("object") or {}

    if event != "payment.succeeded":
        return {
            "status": "ignored"
        }

    yookassa_payment_id = obj.get("id")

    if not yookassa_payment_id:
        raise HTTPException(
            status_code=400,
            detail="Payment id missing",
        )

    shop_id = os.getenv("YOOKASSA_SHOP_ID")
    secret_key = os.getenv(
        "YOOKASSA_SECRET_KEY"
    )

    if not shop_id or not secret_key:
        raise HTTPException(
            status_code=500,
            detail="ЮKassa не настроена",
        )

    # Повторно проверяем платёж
    # напрямую через API ЮKassa.
    try:
        response = requests.get(
            (
                "https://api.yookassa.ru/v3/"
                f"payments/{yookassa_payment_id}"
            ),
            auth=(shop_id, secret_key),
            timeout=20,
        )

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail=(
                "Не удалось проверить платёж "
                "в ЮKassa"
            ),
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=(
                "ЮKassa не подтвердила платёж"
            ),
        )

    try:
        payment_data = response.json()

    except ValueError:
        raise HTTPException(
            status_code=502,
            detail=(
                "Некорректный ответ ЮKassa"
            ),
        )

    if (
        payment_data.get("status")
        != "succeeded"
    ):
        return {
            "status": "ignored",
            "payment_status": (
                payment_data.get("status")
            ),
        }

    db = SessionLocal()

    try:
        payment = (
            db.query(Payment)
            .filter(
                Payment.yookassa_payment_id
                == yookassa_payment_id
            )
            .first()
        )

        if not payment:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Платёж TestMaster не найден"
                ),
            )

        # Если платёж уже отмечен как успешный,
        # повторно доступ не выдаём.
        if payment.status == "succeeded":
            return {
                "status": "already_processed",
                "payment_id": payment.id,
            }

        # Дополнительная защита:
        # один payment_id может быть связан
        # только с одним TopicAccess.
        existing_access = (
            db.query(TopicAccess)
            .filter(
                TopicAccess.payment_id
                == payment.id
            )
            .first()
        )

        if existing_access:
            payment.status = "succeeded"

            if payment.paid_at is None:
                payment.paid_at = (
                    datetime.utcnow()
                )

            db.commit()

            return {
                "status": "already_processed",
                "payment_id": payment.id,
                "access_id": existing_access.id,
            }

        # Сверяем сумму платежа.
        amount = (
            payment_data.get("amount") or {}
        )

        expected_amount = (
            f"{payment.amount_kopecks / 100:.2f}"
        )

        if (
            amount.get("currency") != "RUB"
            or amount.get("value")
            != expected_amount
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Сумма платежа не совпадает"
                ),
            )

        now = datetime.utcnow()

        current_access = (
            db.query(TopicAccess)
            .filter(
                TopicAccess.user_id
                == payment.user_id,
                TopicAccess.topic_id
                == payment.topic_id,
                TopicAccess.expires_at > now,
            )
            .order_by(
                TopicAccess.expires_at.desc()
            )
            .first()
        )

        # Если доступ ещё активен,
        # добавляем новое время к его окончанию.
        # Если уже истёк — считаем от текущего момента.
        starts_from = (
            current_access.expires_at
            if current_access
            else now
        )

        expires_at = (
            starts_from
            + timedelta(
                minutes=payment.access_minutes
            )
        )

        access = TopicAccess(
            user_id=payment.user_id,
            topic_id=payment.topic_id,
            payment_id=payment.id,
            granted_at=now,
            expires_at=expires_at,
            source="yookassa",
        )

        payment.status = "succeeded"
        payment.paid_at = now

        db.add(access)

        try:
            db.commit()

        except Exception:
            db.rollback()
            raise

        db.refresh(access)

        return {
            "status": "processed",
            "payment_id": payment.id,
            "access_id": access.id,
            "user_id": payment.user_id,
            "topic_id": payment.topic_id,
            "expires_at": (
                access.expires_at.isoformat()
            ),
        }

    finally:
        db.close()