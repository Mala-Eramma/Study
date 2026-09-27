from datetime import date, time

from pydantic import BaseModel, EmailStr


# =========================================================
# Authentication
# =========================================================

class UserRegister(BaseModel):

    name: str

    email: EmailStr

    password: str


class UserLogin(BaseModel):

    email: EmailStr

    password: str


# =========================================================
# Chat
# =========================================================

class ChatRequest(BaseModel):

    question: str

    subject:str


class ChatResponse(BaseModel):

    answer: str


# =========================================================
# Study Planner
# =========================================================

class StudyTaskCreate(BaseModel):

    subject: str

    task: str

    study_date: date

    study_time: time


# =========================================================
# Quiz
# =========================================================

class QuizRequest(BaseModel):

    subject: str

    question_count: int = 5

    quiz_type:str="msq"

class QuizResultCreate(BaseModel):

    subject: str

    score: float

    total_questions: int