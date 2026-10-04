from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# REGISTER
@router.post("/register")
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    email = user_data.email.strip().lower()

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered. Please log in."
        )

    try:
        new_user = User(
            name=user_data.name.strip(),
            email=email,
            password=pwd_context.hash(user_data.password)
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "Registration successful",
            "user_id": new_user.id,
            "user": {
                "id": new_user.id,
                "user_id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Registration failed. Please try again."
        )


# LOGIN
@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    email = user_data.email.strip().lower()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user or not pwd_context.verify(
        user_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return {
        "message": "Login successful",
        "user_id": user.id,
        "user": {
            "id": user.id,
            "user_id": user.id,
            "name": user.name,
            "email": user.email
        }
    }