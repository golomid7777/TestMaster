import os
import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pywebpush import webpush, WebPushException

from database.db import SessionLocal
from database.models import PushSubscription, User
from admin.router import require_admin
from questions.router import get_current_user


router = APIRouter(
    prefix="/push",
    tags=["Push"]
)


class PushKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscriptionData(BaseModel):
    endpoint: str
    keys: PushKeys


class ServicePushData(BaseModel):
    title: str
    body: str
    url: str = "/"


@router.post("/subscribe")
def subscribe(
    data: PushSubscriptionData,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        existing = (
            db.query(PushSubscription)
            .filter(
                PushSubscription.endpoint == data.endpoint
            )
            .first()
        )

        if existing:
            existing.user_id = current_user.id
            existing.p256dh = data.keys.p256dh
            existing.auth = data.keys.auth

            db.commit()

            return {
                "status": "updated"
            }

        subscription = PushSubscription(
            user_id=current_user.id,
            endpoint=data.endpoint,
            p256dh=data.keys.p256dh,
            auth=data.keys.auth,
        )

        db.add(subscription)
        db.commit()

        return {
            "status": "subscribed"
        }

    finally:
        db.close()


@router.get("/public-key")
def get_public_key():
    public_key = os.getenv("VAPID_PUBLIC_KEY")

    if not public_key:
        return {
            "error": "VAPID public key is not configured"
        }

    return {
        "public_key": public_key
    }


@router.post("/test")
def send_test_push(
    current_user: User = Depends(get_current_user),
):
    private_key = os.getenv("VAPID_PRIVATE_KEY")
    subject = os.getenv(
        "VAPID_SUBJECT",
        "mailto:golomid777@yandex.ru"
    )

    if not private_key:
        raise HTTPException(
            status_code=500,
            detail="VAPID private key is not configured"
        )

    db = SessionLocal()

    try:
        subscriptions = (
            db.query(PushSubscription)
            .filter(
                PushSubscription.user_id == current_user.id
            )
            .all()
        )

        if not subscriptions:
            raise HTTPException(
                status_code=404,
                detail="Push subscription not found"
            )

        sent = 0
        failed = 0

        payload = json.dumps(
            {
                "title": "TestMaster",
                "body": "Тестовое PUSH-уведомление работает.",
                "url": "/"
            },
            ensure_ascii=False
        )

        for subscription in subscriptions:
            subscription_info = {
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh,
                    "auth": subscription.auth
                }
            }

            try:
                webpush(
                    subscription_info=subscription_info,
                    data=payload,
                    vapid_private_key=private_key,
                    vapid_claims={
                        "sub": subject
                    }
                )

                sent += 1

            except WebPushException as exc:
                print(
                    "Push test error:",
                    repr(exc)
                )
                failed += 1

                status_code = getattr(
                    getattr(exc, "response", None),
                    "status_code",
                    None
                )

                if status_code in (404, 410):
                    db.delete(subscription)
                    db.commit()

        return {
            "status": "done",
            "sent": sent,
            "failed": failed
        }

    finally:
        db.close()


@router.post("/notify-service/{service_id}")
def notify_service(
    service_id: int,
    data: ServicePushData,
    admin=Depends(require_admin),
):
    private_key = os.getenv("VAPID_PRIVATE_KEY")
    subject = os.getenv(
        "VAPID_SUBJECT",
        "mailto:golomid777@yandex.ru"
    )

    if not private_key:
        raise HTTPException(
            status_code=500,
            detail="VAPID private key is not configured"
        )

    db = SessionLocal()

    try:
        subscriptions = (
            db.query(PushSubscription)
            .join(
                User,
                User.id == PushSubscription.user_id
            )
            .filter(
                User.service_id == service_id
            )
            .all()
        )

        if not subscriptions:
            return {
                "status": "done",
                "sent": 0,
                "failed": 0,
                "message": "No push subscriptions for this service"
            }

        payload = json.dumps(
            {
                "title": data.title,
                "body": data.body,
                "url": data.url
            },
            ensure_ascii=False
        )

        sent = 0
        failed = 0

        for subscription in subscriptions:
            subscription_info = {
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh,
                    "auth": subscription.auth
                }
            }

            try:
                webpush(
                    subscription_info=subscription_info,
                    data=payload,
                    vapid_private_key=private_key,
                    vapid_claims={
                        "sub": subject
                    }
                )

                sent += 1

            except WebPushException as exc:
                print(
                    "Push service error:",
                    repr(exc)
                )
                failed += 1

                status_code = getattr(
                    getattr(exc, "response", None),
                    "status_code",
                    None
                )

                if status_code in (404, 410):
                    db.delete(subscription)
                    db.commit()

        return {
            "status": "done",
            "service_id": service_id,
            "sent": sent,
            "failed": failed
        }

    finally:
        db.close()
