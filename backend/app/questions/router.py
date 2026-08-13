from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database.db import SessionLocal
from database.models import Question, User, Topic, TestSession, TopicAccess
from datetime import datetime

from security import decode_token

from sqlalchemy import or_

router = APIRouter(prefix="/questions", tags=["Questions"])


security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):

    token = credentials.credentials

    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="User id missing in token")

    db = SessionLocal()

    try:

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        db.expunge(user)

        return user

    finally:
        db.close()



def get_active_topic_access(db, user_id: int, topic: Topic):
    """
    Бесплатная тема доступна всегда.
    Для платной темы возвращает активный TopicAccess или None.
    """
    if (topic.price_kopecks or 0) <= 0:
        return True, None

    now = datetime.utcnow()

    access = (
        db.query(TopicAccess)
        .filter(
            TopicAccess.user_id == user_id,
            TopicAccess.topic_id == topic.id,
            TopicAccess.expires_at > now,
        )
        .order_by(TopicAccess.expires_at.desc())
        .first()
    )

    return access is not None, access


# =========================================================
# ТЕМЫ ТЕКУЩЕЙ СЛУЖБЫ
# =========================================================


@router.get("/topics")
def get_user_topics(user: User = Depends(get_current_user)):

    if user.service_id is None:
        return []

    db = SessionLocal()

    try:

        topics = (
            db.query(Topic)
            .filter(Topic.service_id == user.service_id)
            .order_by(Topic.name)
            .all()
        )

        result = []

        for topic in topics:
            has_access, access = get_active_topic_access(
                db,
                user.id,
                topic
            )

            result.append({
                "id": topic.id,
                "name": topic.name,
                "question_count": (
                    db.query(Question)
                    .filter(
                        Question.service_id == user.service_id,
                        Question.topic_id == topic.id,
                    )
                    .count()
                ),
                "price_kopecks": topic.price_kopecks,
                "access_minutes": topic.access_minutes,
                "is_paid": (topic.price_kopecks or 0) > 0,
                "has_access": has_access,
                "access_expires_at": (
                    access.expires_at.isoformat()
                    if access
                    else None
                ),
            })

        return result

    finally:
        db.close()


# =========================================================
# ЗАПУСК СЕССИИ ТЕМЫ
# =========================================================


@router.post("/topics/{topic_id}/start")
def start_topic_session(topic_id: int, user: User = Depends(get_current_user)):

    db = SessionLocal()

    try:

        topic = (
            db.query(Topic)
            .filter(Topic.id == topic_id, Topic.service_id == user.service_id)
            .first()
        )

        if not topic:
            raise HTTPException(status_code=403, detail="Topic access denied")

        has_access, access = get_active_topic_access(
            db,
            user.id,
            topic
        )

        if not has_access:
            raise HTTPException(
                status_code=402,
                detail={
                    "message": "Для этой темы требуется оплата",
                    "topic_id": topic.id,
                    "price_kopecks": topic.price_kopecks,
                    "access_minutes": topic.access_minutes,
                }
            )

        # Бесплатная тема не имеет таймера.
        if (topic.price_kopecks or 0) <= 0:
            return {
                "topic_id": topic.id,
                "is_paid": False,
                "has_access": True,
                "expires_at": None,
            }

        # Для платной темы таймер равен сроку уже выданного доступа.
        # Время НЕ запускается заново при повторном выборе темы.
        return {
            "topic_id": topic.id,
            "is_paid": True,
            "has_access": True,
            "access_minutes": topic.access_minutes,
            "expires_at": access.expires_at.isoformat(),
        }

    finally:
        db.close()


# =========================================================
# ПОИСК ВОПРОСОВ В ВЫБРАННОЙ ТЕМЕ
# =========================================================


@router.get("/suggest")
def suggest_questions(
    q: str = Query(...),
    topic_id: int = Query(...),
    user: User = Depends(get_current_user),
):

    db = SessionLocal()

    try:

        topic = (
            db.query(Topic)
            .filter(Topic.id == topic_id, Topic.service_id == user.service_id)
            .first()
        )

        if not topic:
            raise HTTPException(status_code=403, detail="Topic access denied")

        has_access, access = get_active_topic_access(
            db,
            user.id,
            topic
        )

        if not has_access:
            raise HTTPException(
                status_code=402,
                detail="Срок оплаченного доступа к теме истёк"
            )

        results = (
            db.query(Question)
            .filter(
                Question.service_id == user.service_id,
                Question.topic_id == topic_id,
                or_(
                    Question.question.ilike(f"%{q}%"), Question.keywords.ilike(f"%{q}%")
                ),
            )
            .limit(10)
            .all()
        )

        return [{"id": item.id, "question": item.question} for item in results]

    finally:
        db.close()


# =========================================================
# ПОЛУЧЕНИЕ ОТВЕТА
# =========================================================


@router.get("/{question_id}")
def get_question(
    question_id: int, topic_id: int = Query(...), user: User = Depends(get_current_user)
):

    db = SessionLocal()

    try:

        topic = (
            db.query(Topic)
            .filter(
                Topic.id == topic_id,
                Topic.service_id == user.service_id
            )
            .first()
        )

        if not topic:
            raise HTTPException(status_code=403, detail="Topic access denied")

        has_access, access = get_active_topic_access(
            db,
            user.id,
            topic
        )

        if not has_access:
            raise HTTPException(
                status_code=402,
                detail="Срок оплаченного доступа к теме истёк"
            )

        question = (
            db.query(Question)
            .filter(
                Question.id == question_id,
                Question.service_id == user.service_id,
                Question.topic_id == topic_id,
            )
            .first()
        )

        if not question:
            raise HTTPException(status_code=403, detail="Access denied")

        return {"question": question.question, "answer": question.answer}

    finally:
        db.close()
