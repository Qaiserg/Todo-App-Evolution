"""Debug script to test if add_task accepts reminder_time parameter."""

from datetime import datetime, timedelta
from src.database import get_engine
from sqlmodel import Session
from src.agent.tools import add_task

engine = get_engine()

# Test adding a task with reminder_time
with Session(engine) as session:
    # Calculate a reminder time 1 minute from now
    reminder_time = (datetime.now() + timedelta(minutes=1)).isoformat()

    print(f"Testing add_task with reminder_time: {reminder_time}")

    result = add_task(
        session=session,
        user_id="test_user",
        title="Test Reminder",
        description="Testing reminder functionality",
        priority="medium",
        due_date=None,
        reminder_time=reminder_time
    )

    print("\nResult:")
    print(result)

    # Check if it was saved
    from sqlalchemy import text
    check_result = session.exec(
        text("SELECT id, title, reminder_time, is_reminded FROM task WHERE title = 'Test Reminder' ORDER BY id DESC LIMIT 1")
    ).fetchone()

    if check_result:
        print(f"\nVerification from database:")
        print(f"  ID: {check_result[0]}")
        print(f"  Title: {check_result[1]}")
        print(f"  Reminder Time: {check_result[2]}")
        print(f"  Is Reminded: {check_result[3]}")
    else:
        print("\nERROR: Task was not saved to database!")
