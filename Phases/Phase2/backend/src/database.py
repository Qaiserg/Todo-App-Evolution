"""Database connection and session management."""

from typing import Generator
from sqlmodel import Session, SQLModel, create_engine
from src.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)


def create_db_and_tables() -> None:
    """Create all database tables if they don't exist."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Get a database session for dependency injection."""
    with Session(engine) as session:
        yield session
