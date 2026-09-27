from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import StudyTask
from ..schemas import StudyTaskCreate


router = APIRouter()


@router.post("/")
def create_task(
    task_data: StudyTaskCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    new_task = StudyTask(
        user_id=user_id,
        subject=task_data.subject,
        task=task_data.task,
        study_date=task_data.study_date,
        study_time=task_data.study_time
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Study task created successfully.",
        "task_id": new_task.id
    }


@router.get("/")
def get_tasks(
    user_id: int,
    db: Session = Depends(get_db)
):
    tasks = (
        db.query(StudyTask)
        .filter(
            StudyTask.user_id == user_id
        )
        .all()
    )

    return tasks


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    task = (
        db.query(StudyTask)
        .filter(
            StudyTask.id == task_id,
            StudyTask.user_id == user_id
        )
        .first()
    )

    if not task:
        return {
            "message": "Study task not found."
        }

    db.delete(task)
    db.commit()

    return {
        "message": "Study task deleted successfully."
    }