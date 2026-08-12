from database.db import SessionLocal
from database.models import Service


db = SessionLocal()


db.query(Service).delete()


services = [
    "\u042d\u043b\u0435\u043a\u0442\u0440\u043e\u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c",
    "\u041f\u043e\u0436\u0430\u0440\u043d\u0430\u044f \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c",
    "\u041e\u0445\u0440\u0430\u043d\u0430 \u0442\u0440\u0443\u0434\u0430"
]


for name in services:

    service = Service(
        name=name
    )

    db.add(service)


db.commit()

db.close()


print("Службы исправлены")
