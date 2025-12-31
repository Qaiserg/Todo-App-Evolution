"""Database connection and session management for Todo App.

This module provides PostgreSQL database connection using SQLModel/SQLAlchemy
with Neon serverless PostgreSQL.
"""

import os
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://localhost/todo_app"  # Fallback for local development
)

# Create engine with PostgreSQL
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL debugging
    pool_pre_ping=True,  # Verify connections before using
)


def create_db_and_tables() -> None:
    """Create all database tables if they don't exist."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Get a database session.

    Yields:
        Session: SQLModel database session
    """
    with Session(engine) as session:
        yield session


def get_session_direct() -> Session:
    """Get a database session directly (not as generator).

    Returns:
        Session: SQLModel database session
    """
    return Session(engine)
