from database.db import engine
from database.models import User


User.__table__.drop(
    engine,
    checkfirst=True
)


User.__table__.create(
    engine,
    checkfirst=True
)


print("Users обновлена")
