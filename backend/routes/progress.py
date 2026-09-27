from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    StudyTask,
    StudyMaterial,
    QuizResult,
    LearningActivity,
    ChatHistory
)


router = APIRouter()


# =========================================
# STUDENT PROGRESS
# =========================================

@router.get("/")
def get_progress(
    user_id: int,
    db: Session = Depends(get_db)
):

    task_count = (
        db.query(StudyTask)
        .filter(
            StudyTask.user_id == user_id
        )
        .count()
    )

    material_count = (
        db.query(StudyMaterial)
        .filter(
            StudyMaterial.user_id == user_id
        )
        .count()
    )

    quiz_results = (
        db.query(QuizResult)
        .filter(
            QuizResult.user_id == user_id
        )
        .all()
    )

    if quiz_results:

        total_score = sum(
            result.score
            for result in quiz_results
        )

        quiz_score = (
            total_score /
            len(quiz_results)
        )

    else:

        quiz_score = 0

    return {

        "study_tasks":
            task_count,

        "materials":
            material_count,

        "quiz_score":
            round(
                quiz_score,
                2
            )
    }


# =========================================
# SAVE LEARNING ACTIVITY
# =========================================

@router.post("/activity")
def save_learning_activity(
    data: dict,
    user_id: int,
    db: Session = Depends(get_db)
):

    subject = (
        data.get(
            "subject",
            ""
        ).strip()
    )

    topic = (
        data.get(
            "topic",
            ""
        ).strip()
    )

    activity = (
        data.get(
            "activity",
            ""
        ).strip()
    )

    if not subject:

        raise HTTPException(
            status_code=400,
            detail="Subject is required."
        )

    if not topic:

        raise HTTPException(
            status_code=400,
            detail="Topic is required."
        )

    if not activity:

        raise HTTPException(
            status_code=400,
            detail="Activity is required."
        )

    new_activity = LearningActivity(

        user_id=user_id,

        subject=subject,

        topic=topic,

        activity=activity
    )

    db.add(
        new_activity
    )

    db.commit()

    db.refresh(
        new_activity
    )

    return {

        "message":
            "Learning activity saved successfully.",

        "activity_id":
            new_activity.id
    }


# =========================================
# GET STUDY SUMMARY
# =========================================

@router.get("/summary")
def get_study_summary(
    user_id: int,
    db: Session = Depends(get_db)
):

    activities = (
        db.query(LearningActivity)
        .filter(
            LearningActivity.user_id == user_id
        )
        .order_by(
            LearningActivity.id.desc()
        )
        .all()
    )

    summary = []

    for activity in activities:

        chat = (
            db.query(ChatHistory)
            .filter(
                ChatHistory.user_id == user_id,
                ChatHistory.question == activity.topic
            )
            .order_by(
                ChatHistory.id.desc()
            )
            .first()
        )

        learned_content = ""

        if chat:

            learned_content = (
                chat.answer
            )

        summary.append({

            "id":
                activity.id,

            "subject":
                activity.subject,

            "topic":
                activity.topic,

            "learned_content":
                learned_content,

            "activity":
                activity.activity,

            "created_at":
                activity.created_at
        })

    return summary


# =========================================
# GET COMPLETE LEARNING HISTORY
# =========================================

@router.get("/history")
def get_learning_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    activities = (
        db.query(LearningActivity)
        .filter(
            LearningActivity.user_id == user_id
        )
        .order_by(
            LearningActivity.id.desc()
        )
        .all()
    )

    return [

        {

            "id":
                activity.id,

            "subject":
                activity.subject,

            "topic":
                activity.topic,

            "activity":
                activity.activity,

            "created_at":
                activity.created_at
        }

        for activity in activities
    ]