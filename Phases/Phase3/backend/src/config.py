"""Configuration settings for the backend."""

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://localhost/todo_app"
)

# OpenAI API Key (for gpt-4o-mini)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://todo-app-evolution.vercel.app",
    "https://todo-phase3.vercel.app",
    "https://todo-app-evolution-phase3.vercel.app",  # Current production URL
]
