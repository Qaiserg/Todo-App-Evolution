"""Chat API endpoint for AI assistant."""

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session, select

from src.database import get_session
from src.auth import verify_user_token, security
from src.models.conversation import (
    Conversation,
    Message,
    ChatRequest,
    ChatResponse,
)
from src.agent.chat import process_chat_message

router = APIRouter(prefix="/api/{user_id}", tags=["chat"])


def get_conversation_history(
    session: Session,
    conversation_id: str,
    limit: int = 20
) -> List[dict]:
    """Get recent messages from a conversation formatted for OpenAI."""
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    messages = list(session.exec(statement).all())
    messages.reverse()  # Oldest first

    history = []
    for msg in messages:
        if msg.role == "user":
            history.append({"role": "user", "content": msg.content})
        elif msg.role == "assistant":
            # Only include content, not tool_calls (avoids format issues)
            if msg.content:
                history.append({"role": "assistant", "content": msg.content})
        # Skip tool messages - they cause format issues when replayed

    return history


def save_message(
    session: Session,
    conversation_id: str,
    role: str,
    content: str,
    tool_calls: dict = None,
    tool_call_id: str = None,
) -> Message:
    """Save a message to the database."""
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        tool_calls=json.dumps(tool_calls) if tool_calls else None,
        tool_call_id=tool_call_id,
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message


@router.post("/chat", response_model=ChatResponse)
def chat(
    user_id: str,
    request: ChatRequest,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> ChatResponse:
    """
    Send a message to the AI assistant and get a response.

    The assistant can manage tasks through natural language.
    """
    verify_user_token(user_id, credentials)

    # Get or create conversation
    conversation_id = request.conversation_id

    if conversation_id:
        # Verify conversation exists and belongs to user
        conversation = session.get(Conversation, conversation_id)
        if not conversation or conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
    else:
        # Create new conversation
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        conversation_id = conversation.id

    # Get conversation history
    history = get_conversation_history(session, conversation_id)

    # Save user message
    save_message(session, conversation_id, "user", request.message)

    try:
        # Process message with AI agent
        result = process_chat_message(
            session=session,
            user_id=user_id,
            message=request.message,
            conversation_history=history,
        )

        # Save assistant response (don't save tool_calls - causes issues on replay)
        save_message(
            session,
            conversation_id,
            "assistant",
            result["response"],
        )

        # Update conversation timestamp
        conversation.updated_at = conversation.created_at.__class__.now()
        session.add(conversation)
        session.commit()

        return ChatResponse(
            response=result["response"],
            conversation_id=conversation_id,
            tool_calls=result.get("tool_calls", []),
        )

    except ValueError as e:
        # Handle missing API key or other config errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing error: {str(e)}"
        )


@router.get("/conversations", response_model=List[dict])
def list_conversations(
    user_id: str,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> List[dict]:
    """List user's conversations."""
    verify_user_token(user_id, credentials)

    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(20)
    )
    conversations = list(session.exec(statement).all())

    return [
        {
            "id": c.id,
            "title": c.title or "New Conversation",
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
        }
        for c in conversations
    ]


@router.get("/conversations/{conversation_id}/messages", response_model=List[dict])
def get_messages(
    user_id: str,
    conversation_id: str,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> List[dict]:
    """Get messages from a conversation."""
    verify_user_token(user_id, credentials)

    # Verify conversation exists and belongs to user
    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .limit(100)
    )
    messages = list(session.exec(statement).all())

    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
        if m.role in ("user", "assistant")  # Don't expose tool messages
    ]


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    user_id: str,
    conversation_id: str,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> None:
    """Delete a conversation and its messages."""
    verify_user_token(user_id, credentials)

    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Delete messages first
    statement = select(Message).where(Message.conversation_id == conversation_id)
    messages = session.exec(statement).all()
    for message in messages:
        session.delete(message)

    # Delete conversation
    session.delete(conversation)
    session.commit()
