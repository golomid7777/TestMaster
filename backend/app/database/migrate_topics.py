from sqlalchemy import inspect, text

from database.db import engine
from database.models import Base


def migrate():
    # Создаст новую таблицу topics.
    # Уже существующие таблицы и данные не удаляются.
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)

    columns = [
        column["name"]
        for column in inspector.get_columns("questions")
    ]

    # Для существующей SQLite-таблицы questions
    # добавляем topic_id только если его ещё нет.
    if "topic_id" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE questions "
                    "ADD COLUMN topic_id INTEGER "
                    "REFERENCES topics(id)"
                )
            )

        print("Добавлена колонка questions.topic_id")
    else:
        print("Колонка questions.topic_id уже существует")

    print("Таблица topics готова")
    print("Миграция завершена")


if __name__ == "__main__":
    migrate()