from sqlalchemy import inspect, text

from database.db import engine


def migrate():
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if "payments" in tables:
        print("Таблица payments уже существует")
        return

    with engine.begin() as connection:
        connection.execute(text("""
            CREATE TABLE payments (
                id INTEGER PRIMARY KEY,
                user_id INTEGER NOT NULL,
                topic_id INTEGER NOT NULL,
                yookassa_payment_id VARCHAR UNIQUE,
                idempotency_key VARCHAR NOT NULL UNIQUE,
                amount_kopecks INTEGER NOT NULL,
                access_minutes INTEGER NOT NULL,
                status VARCHAR NOT NULL DEFAULT 'pending',
                created_at DATETIME NOT NULL,
                paid_at DATETIME,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(topic_id) REFERENCES topics(id)
            )
        """))

        connection.execute(text("""
            CREATE INDEX ix_payments_id
            ON payments (id)
        """))

        connection.execute(text("""
            CREATE INDEX ix_payments_user_id
            ON payments (user_id)
        """))

        connection.execute(text("""
            CREATE INDEX ix_payments_topic_id
            ON payments (topic_id)
        """))

        connection.execute(text("""
            CREATE UNIQUE INDEX ix_payments_yookassa_payment_id
            ON payments (yookassa_payment_id)
        """))

        connection.execute(text("""
            CREATE UNIQUE INDEX ix_payments_idempotency_key
            ON payments (idempotency_key)
        """))

        connection.execute(text("""
            CREATE INDEX ix_payments_status
            ON payments (status)
        """))

    print("Таблица payments создана")


if __name__ == "__main__":
    migrate()