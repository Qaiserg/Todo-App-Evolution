"""ChatKit endpoint for the OpenAI ChatKit frontend."""

import json
from collections.abc import AsyncIterator
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import Response, StreamingResponse

from chatkit.server import ChatKitServer
from chatkit.store import Store, NotFoundError
from chatkit.types import (
    ThreadMetadata,
    UserMessageItem,
    UserMessageTextContent,
    ThreadItem,
    Page,
    Attachment,
    ThreadStreamEvent,
    AssistantMessageItem,
    AssistantMessageContent,
    ThreadItemAddedEvent,
    ThreadItemDoneEvent,
)
import logging

logger = logging.getLogger(__name__)

from agents import Agent, Runner

from src.agent.chat import create_agent

router = APIRouter(tags=["chatkit"])


class InMemoryStore(Store[dict]):
    """Simple in-memory store for ChatKit threads."""

    def __init__(self):
        self.threads: dict[str, ThreadMetadata] = {}
        self.items: dict[str, list[ThreadItem]] = {}
        self.attachments: dict[str, Attachment] = {}

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata:
        if thread_id not in self.threads:
            raise NotFoundError(f"Thread {thread_id} not found")
        return self.threads[thread_id]

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        self.threads[thread.id] = thread

    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: dict,
    ) -> Page[ThreadItem]:
        items = self.items.get(thread_id, [])
        if order == "desc":
            items = list(reversed(items))
        return Page(data=items[:limit], has_more=len(items) > limit, after=None)

    async def save_attachment(self, attachment: Attachment, context: dict) -> None:
        self.attachments[attachment.id] = attachment

    async def load_attachment(self, attachment_id: str, context: dict) -> Attachment:
        if attachment_id not in self.attachments:
            raise NotFoundError(f"Attachment {attachment_id} not found")
        return self.attachments[attachment_id]

    async def delete_attachment(self, attachment_id: str, context: dict) -> None:
        if attachment_id in self.attachments:
            del self.attachments[attachment_id]

    async def load_threads(
        self,
        limit: int,
        after: str | None,
        order: str,
        context: dict,
    ) -> Page[ThreadMetadata]:
        threads = list(self.threads.values())
        if order == "desc":
            threads = list(reversed(threads))
        return Page(data=threads[:limit], has_more=len(threads) > limit, after=None)

    async def add_thread_item(
        self, thread_id: str, item: ThreadItem, context: dict
    ) -> None:
        if thread_id not in self.items:
            self.items[thread_id] = []
        self.items[thread_id].append(item)

    async def save_item(
        self, thread_id: str, item: ThreadItem, context: dict
    ) -> None:
        if thread_id not in self.items:
            self.items[thread_id] = []
        # Update existing or add new
        for i, existing in enumerate(self.items[thread_id]):
            if existing.id == item.id:
                self.items[thread_id][i] = item
                return
        self.items[thread_id].append(item)

    async def load_item(
        self, thread_id: str, item_id: str, context: dict
    ) -> ThreadItem:
        items = self.items.get(thread_id, [])
        for item in items:
            if item.id == item_id:
                return item
        raise NotFoundError(f"Item {item_id} not found in thread {thread_id}")

    async def delete_item(self, thread_id: str, item_id: str, context: dict) -> None:
        if thread_id in self.items:
            self.items[thread_id] = [
                item for item in self.items[thread_id] if item.id != item_id
            ]

    async def delete_thread(self, thread_id: str, context: dict) -> None:
        if thread_id in self.threads:
            del self.threads[thread_id]
        if thread_id in self.items:
            del self.items[thread_id]

    async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None:
        await self.delete_item(thread_id, item_id, context)


# Global store instance
store = InMemoryStore()


class TodoChatKitServer(ChatKitServer[dict]):
    """ChatKit server that uses OpenAI Agents SDK for todo management."""

    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Process a message and yield streaming events."""

        import sys
        print("[CHATKIT] === RESPOND METHOD CALLED ===", flush=True)
        sys.stdout.flush()

        if not input_user_message:
            print("[CHATKIT] No input message, returning", flush=True)
            return

        # Extract user message content
        message_text = ""
        for part in input_user_message.content:
            if isinstance(part, UserMessageTextContent):
                message_text = part.text
                break

        if not message_text:
            return

        # Get user_id and language from context
        user_id = context.get("user_id", "default_user")
        language = context.get("language", "en")

        # Create agent for this user with language support
        agent = create_agent(user_id, language=language)

        try:
            # Build input for the agent using standard OpenAI message format
            messages = []

            # Load existing thread items for context
            existing_items = await self.store.load_thread_items(
                thread.id, None, 100, "asc", context
            )

            # Convert existing items to messages
            for item in existing_items.data:
                if hasattr(item, 'role') and hasattr(item, 'content'):
                    content_text = ""
                    for part in item.content:
                        if hasattr(part, 'text'):
                            content_text = part.text
                            break
                    if content_text:
                        messages.append({"role": item.role, "content": content_text})

            # Add the new user message
            messages.append({"role": "user", "content": message_text})

            print(f"[CHATKIT] Running agent for user {user_id} with message: {message_text}", flush=True)

            # Run agent
            result = await Runner.run(agent, messages)

            # Log tool calls
            print(f"[CHATKIT] New items count: {len(result.new_items)}", flush=True)
            for item in result.new_items:
                print(f"[CHATKIT] Item type: {type(item).__name__}", flush=True)
                if hasattr(item, 'name'):
                    print(f"[CHATKIT] Tool called: {item.name}", flush=True)
                if hasattr(item, 'output'):
                    print(f"[CHATKIT] Tool output: {item.output}", flush=True)

            # Get response text
            response_text = result.final_output or "I processed your request."
            print(f"[CHATKIT] Agent response: {response_text}", flush=True)

            # Create assistant message item
            msg_id = self.store.generate_item_id("message", thread, context)
            assistant_msg = AssistantMessageItem(
                id=msg_id,
                thread_id=thread.id,
                created_at=datetime.now(),
                content=[AssistantMessageContent(text=response_text, annotations=[])]
            )

            # Yield the response events
            yield ThreadItemAddedEvent(item=assistant_msg)
            yield ThreadItemDoneEvent(item=assistant_msg)

            # Save the assistant message to store
            await self.store.add_thread_item(thread.id, assistant_msg, context)

        except Exception as e:
            # Create error message
            msg_id = self.store.generate_item_id("message", thread, context)
            error_msg = AssistantMessageItem(
                id=msg_id,
                thread_id=thread.id,
                created_at=datetime.now(),
                content=[AssistantMessageContent(
                    text=f"Sorry, an error occurred: {str(e)}",
                    annotations=[]
                )]
            )
            yield ThreadItemAddedEvent(item=error_msg)
            yield ThreadItemDoneEvent(item=error_msg)


# Create server instance with store
chatkit_server = TodoChatKitServer(store=store)


@router.post("/chatkit")
async def chatkit_endpoint(request: Request):
    """Handle ChatKit requests."""
    try:
        body = await request.body()

        print(f"[ENDPOINT] Received ChatKit request", flush=True)

        # Patch request to add missing required fields for SDK compatibility
        try:
            body_json = json.loads(body)
            print(f"[ENDPOINT] Request type: {body_json.get('type')}", flush=True)
            if body_json.get("type") in ("threads.create", "threads.add_user_message"):
                if "params" in body_json and "input" in body_json["params"]:
                    input_obj = body_json["params"]["input"]
                    if "attachments" not in input_obj:
                        input_obj["attachments"] = []
                    if "inference_options" not in input_obj:
                        input_obj["inference_options"] = {}
                    body = json.dumps(body_json).encode()
        except json.JSONDecodeError:
            pass  # Keep original body if not valid JSON

        # Extract user_id and language from headers or use defaults
        user_id = request.headers.get("X-User-Id", "default_user")
        language = request.headers.get("X-Language", "en")

        print(f"[ENDPOINT] Processing with user_id: {user_id}, language: {language}", flush=True)
        result = await chatkit_server.process(
            body,
            context={"user_id": user_id, "language": language}
        )
        print(f"[ENDPOINT] Process complete, result type: {type(result).__name__}", flush=True)

        # Check if it's a streaming result
        if hasattr(result, '__aiter__'):
            # StreamingResult from ChatKit SDK yields SSE-formatted bytes directly
            return StreamingResponse(
                result,
                media_type="text/event-stream"
            )

        # Non-streaming response - NonStreamingResult has .json attribute
        if hasattr(result, 'json'):
            return Response(
                content=result.json,
                media_type="application/json"
            )

        return Response(
            content=b"{}",
            media_type="application/json"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            content=json.dumps({"error": str(e)}),
            media_type="application/json",
            status_code=500
        )
