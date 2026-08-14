from database.db import engine
from database.models import Base


def migrate():
    Base.metadata.create_all(bind=engine)

    print("Таблица test_sessions готова")
    print("Миграция завершена")


if __name__ == "__main__":
    migrate()