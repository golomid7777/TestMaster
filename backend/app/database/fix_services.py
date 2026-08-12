from database.db import SessionLocal
from database.models import Service


db = SessionLocal()


services = {
    1: "лектробезопасность",
    2: "ожарная безопасность",
    3: "храна труда"
}


for service_id, name in services.items():

    service = db.query(Service).filter(
        Service.id == service_id
    ).first()

    if service:
        service.name = name


db.commit()
db.close()


print("азвания служб исправлены")
