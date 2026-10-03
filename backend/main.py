from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path

from .database import engine, Base

# Import models before creating tables
from . import models
from .reminder import start_reminder_scheduler

from .routes import (
    auth,
    chat,
    materials,
    planner,
    progress,
    quiz
)

from sqlalchemy import inspect, text

# =========================================
# CREATE DATABASE TABLES
# =========================================

Base.metadata.create_all(
    bind=engine
)

# Add reminder tracking to existing study_tasks table
columns = [
    column["name"]
    for column in inspect(engine).get_columns("study_tasks")
]

if "reminder_sent" not in columns:
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE study_tasks "
                "ADD COLUMN reminder_sent INTEGER NOT NULL DEFAULT 0"
            )
        )



# =========================================
# FASTAPI APP
# =========================================

app = FastAPI(
    title="AI Study Assistant"
)
start_reminder_scheduler()


# =========================================
# CORS
# =========================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =========================================
# API ROUTES
# =========================================

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    chat.router,
    prefix="/chat",
    tags=["Chat"]
)

app.include_router(
    materials.router,
    prefix="/materials",
    tags=["Materials"]
)

app.include_router(
    planner.router,
    prefix="/planner",
    tags=["Planner"]
)

app.include_router(
    progress.router,
    prefix="/progress",
    tags=["Progress"]
)

app.include_router(
    quiz.router,
    prefix="/quiz",
    tags=["Quiz"]
)


# =========================================
# FRONTEND
# =========================================

BASE_DIR = Path(
    __file__
).resolve().parent.parent

FRONTEND_DIR = (
    BASE_DIR / "frontend"
)

app.mount(
    "/",
    StaticFiles(
        directory=FRONTEND_DIR,
        html=True
    ),
    name="frontend"
)