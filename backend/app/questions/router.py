from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database.db import SessionLocal
from database.models import Question, User

from security import decode_token


router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User id missing in token"
        )

    db = SessionLocal()

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    db.close()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user



@router.get("/suggest")
def suggest_questions(
    q: str = Query(...),
    user: User = Depends(get_current_user)
):

    db = SessionLocal()

    results = db.query(Question).filter(
        Question.service_id == user.service_id,
        Question.question.ilike(
            f"%{q}%"
        )
    ).limit(10).all()


    response = []

    for item in results:

        response.append(
            {
                "id": item.id,
                "question": item.question
            }
        )


    db.close()

    return response



@router.get("/{question_id}")
def get_question(
    question_id: int,
    user: User = Depends(get_current_user)
):

    db = SessionLocal()

    question = db.query(Question).filter(
        Question.id == question_id,
        Question.service_id == user.service_id
    ).first()


    db.close()


    if not question:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )


    return {
        "question": question.question,
        "answer": question.answer
    }
