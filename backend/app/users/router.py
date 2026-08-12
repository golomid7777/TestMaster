from fastapi import APIRouter
from pydantic import BaseModel
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from database.db import SessionLocal
from database.models import User, Service

from security import create_token


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


ph = PasswordHasher()



class UserCreate(BaseModel):

    email: str
    name: str
    password: str
    service_id: int



class LoginData(BaseModel):

    email: str
    password: str



@router.post("/register")
def register_user(
    user_data: UserCreate
):

    db = SessionLocal()


    service = db.query(Service).filter(
        Service.id == user_data.service_id
    ).first()


    if not service:
        db.close()

        return {
            "error": "еобходимо выбрать службу"
        }


    exists = db.query(User).filter(
        User.email == user_data.email
    ).first()


    if exists:
        db.close()

        return {
            "error": "Email уже зарегистрирован"
        }



    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=ph.hash(
            user_data.password
        ),
        service_id=user_data.service_id
    )


    db.add(user)
    db.commit()
    db.refresh(user)

    db.close()


    return {
        "id": user.id,
        "email": user.email,
        "service_id": user.service_id
    }



@router.post("/login")
def login(
    data: LoginData
):

    db = SessionLocal()


    user = db.query(User).filter(
        User.email == data.email
    ).first()


    if not user:
        db.close()

        return {
            "error": "еверный email или пароль"
        }


    try:

        ph.verify(
            user.password_hash,
            data.password
        )

    except VerifyMismatchError:

        db.close()

        return {
            "error": "еверный email или пароль"
        }



    token = create_token(
        {
            "user_id": user.id,
            "service_id": user.service_id
        }
    )


    db.close()


    return {
        "token": token,
        "user_id": user.id,
        "service_id": user.service_id
    }
