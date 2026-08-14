from sqlalchemy import inspect, text

from database.db import engine


def migrate():

    inspector = inspect(engine)

    columns = [
        column["name"]
        for column in inspector.get_columns("topics")
    ]

    if "time_limit_minutes" not in columns:

        with engine.begin() as connection:

            connection.execute(
                text(
                    "ALTER TABLE topics "
                    "ADD COLUMN time_limit_minutes "
                    "INTEGER NOT NULL DEFAULT 30"
                )
            )

        print(
            "Добавлена колонка topics.time_limit_minutes"
        )

    else:

        print(
            "Колонка topics.time_limit_minutes уже существует"
        )

    print("Миграция завершена")


if __name__ == "__main__":
    migrate()