from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..schemas import ChatRequest, ChatResponse
from ..ai.response import generate_response
from ..database import get_db
from ..models import ChatHistory, LearningActivity


router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    user_id: int,
    db: Session = Depends(get_db)
):

    answer = generate_response(
        request.question
    )

    history = ChatHistory(
        user_id=user_id,
        question=request.question,
        answer=answer
    )

    db.add(history)

    activity = LearningActivity(
        user_id=user_id,
        subject=request.subject,
        topic=request.question,
        activity="Learned this topic through AI Study Chat."
    )

    db.add(activity)

    db.commit()

    return ChatResponse(
        answer=answer
    )


@router.get("/history")
def get_chat_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == user_id
        )
        .order_by(
            ChatHistory.id.desc()
        )
        .all()
    )

    return [
        {
            "id": item.id,
            "question": item.question,
            "answer": item.answer,
            "created_at": item.created_at
        }

        for item in history
    ]


@router.delete("/history/{history_id}")
def delete_chat_history(
    history_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.id == history_id,
            ChatHistory.user_id == user_id
        )
        .first()
    )

    if not history:
        return {
            "message": "Chat history not found."
        }

    db.delete(history)
    db.commit()

    return {
        "message": "Chat history deleted successfully."
    }