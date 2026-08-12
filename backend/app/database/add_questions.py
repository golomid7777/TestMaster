from database.db import SessionLocal
from database.models import Question


db = SessionLocal()


questions = [

    {
        "service_id": 1,
        "question": "акое напряжение считается опасным?",
        "answer": "220 ",
        "keywords": "напряжение, опасное, ток"
    },

    {
        "service_id": 2,
        "question": "акой огнетушитель использовать для электрооборудования?",
        "answer": "-5",
        "keywords": "огнетушитель, электрооборудование, пожар"
    },

    {
        "service_id": 3,
        "question": "то необходимо использовать при работе на высоте?",
        "answer": "Страховочная система",
        "keywords": "высота, безопасность, работа"
    }

]


for item in questions:

    exists = db.query(Question).filter(
        Question.question == item["question"]
    ).first()


    if not exists:

        question = Question(
            service_id=item["service_id"],
            question=item["question"],
            answer=item["answer"],
            keywords=item["keywords"]
        )

        db.add(question)


db.commit()
db.close()


print("опросы добавлены")
