import os
from datetime import datetime

import resend
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

from .database import SessionLocal
from .models import StudyTask, User


load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

FROM_EMAIL = os.getenv(
    "RESEND_FROM_EMAIL"
)


scheduler = BackgroundScheduler()


def send_study_reminder(
    student_email,
    student_name,
    subject,
    task
):

    try:

        resend.Emails.send(
            {
                "from": FROM_EMAIL,
                "to": [student_email],
                "subject": "AI Study Assistant - Study Reminder",
                "html": f"""
                    <h2>Study Reminder</h2>

                    <p>
                        Hello {student_name},
                    </p>

                    <p>
                        It is time for your planned study session.
                    </p>

                    <p>
                        <strong>Subject:</strong>
                        {subject}
                    </p>

                    <p>
                        <strong>Task:</strong>
                        {task}
                    </p>

                    <p>
                        Keep learning and stay consistent!
                    </p>
                """
            }
        )

        print(
            f"Reminder email sent to {student_email}"
        )

    except Exception as error:

        print(
            f"Unable to send reminder email: {error}"
        )


def check_study_tasks():

    db = SessionLocal()

    try:

        now = datetime.now()

        tasks = (
            db.query(StudyTask)
            .filter(
                StudyTask.study_date == now.date()
            )
            .all()
        )

        for task in tasks:

            task_datetime = datetime.combine(
                task.study_date,
                task.study_time
            )

            if (
                task_datetime.hour == now.hour
                and task_datetime.minute == now.minute
            ):

                student = (
                    db.query(User)
                    .filter(
                        User.id == task.user_id
                    )
                    .first()
                )

                if not student:
                    continue

                send_study_reminder(
                    "erammamala5@gmail.com",
                    student.name,
                    task.subject,
                    task.task
                )

    finally:

        db.close()


def start_reminder_scheduler():

    scheduler.add_job(
        check_study_tasks,
        "interval",
        minutes=1,
        id="study_reminder_checker",
        replace_existing=True
    )

    scheduler.start()