import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parent / "database" / "testmaster.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

cursor.execute("""
CREATE INDEX IF NOT EXISTS ix_push_subscriptions_user_id
ON push_subscriptions(user_id)
""")

conn.commit()
conn.close()

print("push_subscriptions migration complete")
