"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import CORS_ORIGINS
from src.database import create_db_and_tables
from src.models.task import Task  # noqa: F401 - needed for table creation
from src.api.tasks import router as tasks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - create tables on startup."""
    create_db_and_tables()
    yield


app = FastAPI(
    title="Todo API",
    description="RESTful API for Todo Application - Phase 2",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks_router)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Todo API - Phase 2",
        "docs": "/docs",
        "version": "2.0.0"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
