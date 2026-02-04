"""Migration script to add reminder columns to task table."""

from sqlalchemy import text
from src.database import engine

def add_reminder_columns():
    """Add reminder_time and is_reminded columns to task table."""
    with engine.begin() as conn:
        # Add reminder_time column
        conn.execute(
            text("ALTER TABLE task ADD COLUMN IF NOT EXISTS reminder_time TIMESTAMP")
        )
        print("[OK] Added reminder_time column")

        # Add is_reminded column
        conn.execute(
            text("ALTER TABLE task ADD COLUMN IF NOT EXISTS is_reminded BOOLEAN DEFAULT FALSE")
        )
        print("[OK] Added is_reminded column")

        print("\nDatabase migration completed successfully!")

if __name__ == "__main__":
    add_reminder_columns()
