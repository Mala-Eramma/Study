
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..database import get_db
from ..models import User, StudyTask
from ..schemas import StudyTaskCreate

router = APIRouter()


def find_user(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid user ID. Please log out and log in again."
        )

    return user


@router.get("/")
def list_tasks(
    user_id: int = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    user = find_user(user_id, db)

    tasks = (
        db.query(StudyTask)
        .filter(StudyTask.user_id == user.id)
        .order_by(StudyTask.study_date, StudyTask.study_time)
        .all()
    )

    return [
        {
            "id": item.id,
            "subject": item.subject,
            "task": item.task,
            "study_date": str(item.study_date),
            "study_time": str(item.study_time),
            "reminder_sent": item.reminder_sent
        }
        for item in tasks
    ]


@router.post("/")
def create_task(
    data: StudyTaskCreate,
    user_id: int = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    user = find_user(user_id, db)

    new_task = StudyTask(
        user_id=user.id,
        subject=data.subject.strip(),
        task=data.task.strip(),
        study_date=data.study_date,
        study_time=data.study_time,
        reminder_sent=0
    )

    try:
        db.add(new_task)
        db.commit()
        db.refresh(new_task)

        return {
            "message": "Task saved successfully",
            "task_id": new_task.id
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save the task to the database."
        )


@router.delete("/{task_id}")
def remove_task(
    task_id: int,
    user_id: int = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    user = find_user(user_id, db)

    task = (
        db.query(StudyTask)
        .filter(
            StudyTask.id == task_id,
            StudyTask.user_id == user.id
        )
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found."
        )

    try:
        db.delete(task)
        db.commit()
        return {"message": "Task deleted successfully"}

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to delete the task."
        )