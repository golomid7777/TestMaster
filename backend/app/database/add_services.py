from database.db import SessionLocal
from database.models import Service


db = SessionLocal()


services = [
    "лектробезопасность",
    "ожарная безопасность",
    "храна труда"
]


for name in services:

    exists = db.query(Service).filter(
        Service.name == name
    ).first()

    if not exists:

        service = Service(
            name=name
        )

        db.add(service)


db.commit()

db.close()


print("Службы добавлены")
