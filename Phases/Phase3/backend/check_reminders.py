"""Check which tasks have reminder_time set."""

from sqlalchemy import text
from src.database import engine

with engine.connect() as conn:
    result = conn.execute(
        text("SELECT id, title, reminder_time, is_reminded, status FROM task WHERE reminder_time IS NOT NULL ORDER BY id DESC LIMIT 10")
    )

    rows = result.fetchall()

    if rows:
        print(f"Found {len(rows)} tasks with reminder_time:")
        for row in rows:
            print(f"  ID: {row[0]}, Title: {row[1]}, Reminder: {row[2]}, Reminded: {row[3]}, Status: {row[4]}")
    else:
        print("No tasks have reminder_time set!")
        print("\nChecking last 5 tasks created:")
        result2 = conn.execute(
            text("SELECT id, title, reminder_time FROM task ORDER BY id DESC LIMIT 5")
        )
        for row in result2.fetchall():
            print(f"  ID: {row[0]}, Title: {row[1]}, Reminder: {row[2]}")
