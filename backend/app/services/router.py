from fastapi import APIRouter
from database.db import SessionLocal
from database.models import Service


router = APIRouter(
    prefix="/services",
    tags=["Services"]
)


@router.get("/")
def get_services():

    db = SessionLocal()

    services = db.query(Service).all()

    result = []

    for service in services:
        result.append(
            {
                "id": service.id,
                "name": service.name
            }
        )

    db.close()

    return result
