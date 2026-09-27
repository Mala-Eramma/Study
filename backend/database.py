from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pathlib import Path


# =========================================
# DATABASE PATH
# =========================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_PATH = (
    BASE_DIR
    / "database"
    / "study_assistant.db"
)


DATABASE_URL = (
    f"sqlite:///{DATABASE_PATH}"
)


# =========================================
# DATABASE ENGINE
# =========================================

engine = create_engine(

    DATABASE_URL,

    connect_args={
        "check_same_thread": False
    }
)


# =========================================
# SESSION
# =========================================

SessionLocal = sessionmaker(

    autocommit=False,

    autoflush=False,

    bind=engine
)


# =========================================
# BASE
# =========================================

Base = declarative_base()


# =========================================
# DATABASE SESSION
# =========================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()