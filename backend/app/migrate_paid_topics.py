"""
Одноразовая миграция для существующей SQLite БД TestMaster.

Запуск из:
D:\Projects\TestMaster\backend\app

python migrate_paid_topics.py
"""

from sqlalchemy import inspect, text

from database.db import engine, Base
import database.models  # noqa: F401


def main():
    inspector = inspect(engine)
    columns = {
        item["name"]
        for item in inspector.get_columns("topics")
    }

    with engine.begin() as conn:
        if "price_kopecks" not in columns:
            conn.execute(text(
                "ALTER TABLE topics "
                "ADD COLUMN price_kopecks INTEGER NOT NULL DEFAULT 0"
            ))
            print("Добавлено: topics.price_kopecks")
        else:
            print("Уже есть: topics.price_kopecks")

        if "access_minutes" not in columns:
            conn.execute(text(
                "ALTER TABLE topics "
                "ADD COLUMN access_minutes INTEGER NOT NULL DEFAULT 0"
            ))
            print("Добавлено: topics.access_minutes")
        else:
            print("Уже есть: topics.access_minutes")

    # Создаст topic_accesses, если таблицы ещё нет.
    Base.metadata.create_all(bind=engine)

    print("Миграция завершена.")


if __name__ == "__main__":
    main()
