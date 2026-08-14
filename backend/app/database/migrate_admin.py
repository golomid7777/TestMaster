from sqlalchemy import inspect, text

from database.db import engine


def migrate():
    inspector = inspect(engine)

    columns = [
        column["name"]
        for column in inspector.get_columns("users")
    ]

    if "is_admin" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN is_admin BOOLEAN "
                    "NOT NULL DEFAULT 0"
                )
            )

        print("Добавлена колонка users.is_admin")
    else:
        print("Колонка users.is_admin уже существует")

    print("Миграция завершена")


if __name__ == "__main__":
    migrate()