from sqlalchemy import Column, Integer, String, Text, Date, Time, Float, DateTime
from datetime import datetime

from .database import Base


# =========================================
# USER
# =========================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )


# =========================================
# STUDY MATERIAL
# =========================================

class StudyMaterial(Base):

    __tablename__ = "study_materials"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    filename = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )


# =========================================
# STUDY TASK
# =========================================

class StudyTask(Base):

    __tablename__ = "study_tasks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    subject = Column(
        String(100),
        nullable=False
    )

    task = Column(
        Text,
        nullable=False
    )

    study_date = Column(
        Date,
        nullable=False
    )

    study_time = Column(
        Time,
        nullable=False
    )
    reminder_sent = Column(
        Integer,
        default=0,
        nullable=False
    )


# =========================================
# QUIZ RESULT
# =========================================

class QuizResult(Base):

    __tablename__ = "quiz_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    subject = Column(
        String(100),
        nullable=False
    )

    score = Column(
        Float,
        nullable=False
    )

    total_questions = Column(
        Integer,
        nullable=False
    )


# =========================================
# LEARNING ACTIVITY
# =========================================

class LearningActivity(Base):

    __tablename__ = "learning_activities"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    subject = Column(
        String(100),
        nullable=False
    )

    topic = Column(
        String(255),
        nullable=False
    )

    activity = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# =========================================
# CHAT HISTORY
# =========================================

class ChatHistory(Base):

    __tablename__ = "chat_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    question = Column(
        Text,
        nullable=False
    )

    answer = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )