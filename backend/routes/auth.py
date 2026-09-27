from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin


router = APIRouter()


@router.post("/register")
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )


    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=user_data.password
    )


    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    return {
        "message": "Registration successful.",
        "user_id": new_user.id
    }


@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )


    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    if user.password != user_data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    return {
        "message": "Login successful.",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }