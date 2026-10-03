
import os
from datetime import datetime
from zoneinfo import ZoneInfo

import resend
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

from .database import SessionLocal
from .models import StudyTask, User


load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")

IST = ZoneInfo("Asia/Kolkata")

scheduler = BackgroundScheduler(timezone=IST)


def send_study_reminder(student_email, student_name, subject, task):
    if not resend.api_key:
        print("ERROR: RESEND_API_KEY is missing.")
        return False

    if not FROM_EMAIL:
        print("ERROR: RESEND_FROM_EMAIL is missing.")
        return False

    try:
        resend.Emails.send(
            {
                "from": FROM_EMAIL,
                "to": [student_email],
                "subject": "AI Study Assistant - Study Reminder",
                "html": f"""
                    <h2>Study Reminder</h2>
                    <p>Hello {student_name},</p>
                    <p>It is time for your planned study session.</p>
                    <p><strong>Subject:</strong> {subject}</p>
                    <p><strong>Task:</strong> {task}</p>
                    <p>Keep learning and stay consistent!</p>
                """
            }
        )

        print(f"Reminder email sent to {student_email}")
        return True

    except Exception as error:
        print(f"Unable to send reminder email: {error}")
        return False



def check_study_tasks():
    db = SessionLocal()

    try:
        now = datetime.now(IST)

        tasks = (
            db.query(StudyTask)
            .filter(
                StudyTask.study_date == now.date(),
                StudyTask.reminder_sent == 0
            )
            .all()
        )

        for study_task in tasks:
            task_datetime = datetime.combine(
                study_task.study_date,
                study_task.study_time,
                tzinfo=IST
            )

            # Send the reminder if the scheduled time has arrived,
            # even if the scheduler checks a little late.
            if task_datetime > now:
                continue

            student = (
                db.query(User)
                .filter(User.id == study_task.user_id)
                .first()
            )

            if not student:
                print(
                    f"Student not found for task ID {study_task.id}"
                )
                continue

            email_sent = send_study_reminder(
                student.email,
                student.name,
                study_task.subject,
                study_task.task
            )

            if email_sent:
                study_task.reminder_sent = 1
                db.commit()
                print(
                    f"Reminder completed for task ID {study_task.id}"
                )

    except Exception as error:
        db.rollback()
        print(f"Reminder checker error: {error}")

    finally:
        db.close()


def start_reminder_scheduler():
    if scheduler.running:
        return

    scheduler.add_job(
        check_study_tasks,
        "interval",
        minutes=1,
        id="study_reminder_checker",
        replace_existing=True,
        max_instances=1
    )

    scheduler.start()
    print("Study reminder scheduler started (Asia/Kolkata).")