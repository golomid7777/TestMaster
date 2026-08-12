from database.db import engine, Base, SessionLocal
from database.models import Service, Question


Base.metadata.create_all(bind=engine)


db = SessionLocal()


service = Service(
    name="лектробезопасность"
)


db.add(service)
db.commit()
db.refresh(service)


question = Question(
    service_id=service.id,
    question="акое напряжение считается опасным?",
    answer="220 ",
    keywords="напряжение, опасное, ток"
)


db.add(question)
db.commit()


db.close()


print("аза TestMaster создана")
