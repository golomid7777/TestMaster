from sqlalchemy import inspect, text

from database.db import engine


def migrate():
    inspector = inspect(engine)

    columns = {
        column["name"]
        for column in inspector.get_columns("topic_accesses")
    }

    with engine.begin() as connection:

        if "payment_id" not in columns:
            connection.execute(text("""
                ALTER TABLE topic_accesses
                ADD COLUMN payment_id INTEGER
                REFERENCES payments(id)
            """))
            print("Добавлено: topic_accesses.payment_id")
        else:
            print("Уже есть: topic_accesses.payment_id")

        connection.execute(text("""
            CREATE UNIQUE INDEX IF NOT EXISTS
            ix_topic_accesses_payment_id
            ON topic_accesses(payment_id)
        """))

        print("Уникальный индекс payment_id готов")


if __name__ == "__main__":
    migrate()