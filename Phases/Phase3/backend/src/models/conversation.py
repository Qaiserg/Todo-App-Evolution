"""Conversation and Message models for chat history."""

import uuid
from datetime import datetime
from typing import Optional, List

from sqlmodel import Field, SQLModel, Relationship


class Conversation(SQLModel, table=True):
    """Conversation model for storing chat sessions."""

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True
    )
    user_id: str = Field(index=True)
    title: Optional[str] = Field(default=None, max_length=200)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    messages: List["Message"] = Relationship(back_populates="conversation")


class Message(SQLModel, table=True):
    """Message model for storing individual chat messages."""

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True
    )
    conversation_id: str = Field(foreign_key="conversation.id", index=True)
    role: str = Field(max_length=20)  # 'user', 'assistant', 'tool'
    content: str
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    tool_call_id: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.now)

    conversation: Optional[Conversation] = Relationship(back_populates="messages")


class ChatRequest(SQLModel):
    """Request schema for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None
    timezone_offset: int = 0  # User's UTC offset in minutes (e.g., 300 for UTC+5)


class ChatResponse(SQLModel):
    """Response schema for chat endpoint."""
    response: str
    conversation_id: str
    tool_calls: List[dict] = []
