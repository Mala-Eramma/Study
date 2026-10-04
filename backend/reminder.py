
import os
from datetime import datetime
from zoneinfo import ZoneInfo

import resend
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

from .database import SessionLocal
from .models import User, StudyTask


load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
REMINDER_EMAIL = "erammamala5@gmail.com"

IST = ZoneInfo("Asia/Kolkata")

scheduler = BackgroundScheduler(timezone=IST)


def check_study_reminders():
    db = SessionLocal()

    try:
        now = datetime.now(IST)

        print(f"\nReminder checker running at {now}")

        tasks = (
            db.query(StudyTask)
            .filter(
                StudyTask.study_date == now.date(),
                StudyTask.reminder_sent == 0
            )
            .all()
        )

        print(f"Pending tasks found for today: {len(tasks)}")

        for task in tasks:
            try:
                scheduled_time = datetime.combine(
                    task.study_date,
                    task.study_time
                ).replace(tzinfo=IST)

                if scheduled_time > now:
                    continue

                user = (
                    db.query(User)
                    .filter(User.id == task.user_id)
                    .first()
                )

                if not user:
                    print(f"User not found for task {task.id}")
                    continue

                if not resend.api_key:
                    print("RESEND_API_KEY is missing from .env")
                    continue

                subject = task.subject or "Study Reminder"
                description = task.task or "Your scheduled study session"

                email_html = f"""
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>AI Study Assistant - Study Reminder</h2>
                    <p>Hello {user.name or 'Student'},</p>
                    <p>This is a reminder for your scheduled study session.</p>
                    <p><strong>Subject:</strong> {subject}</p>
                    <p><strong>Task:</strong> {description}</p>
                    <p><strong>Date:</strong> {task.study_date}</p>
                    <p><strong>Time:</strong> {task.study_time}</p>
                    <p>It's time to start studying. Good luck!</p>
                    <p>AI Study Assistant</p>
                </div>
                """

                print(f"Sending reminder to: {REMINDER_EMAIL}")

                response = resend.Emails.send({
                    "from": FROM_EMAIL,
                    "to": [REMINDER_EMAIL],
                    "subject": f"Study Reminder: {subject}",
                    "html": email_html
                })

                if response:
                    task.reminder_sent = 1
                    db.commit()

                    print(
                        f"Reminder email accepted by Resend for "
                        f"{REMINDER_EMAIL}, task ID {task.id}"
                    )
                    print(f"Resend response: {response}")
                else:
                    print(
                        f"Resend did not return a response for task {task.id}"
                    )

            except Exception as error:
                db.rollback()
                print(
                    f"Failed to send reminder to {REMINDER_EMAIL} "
                    f"for task {task.id}: {error}"
                )

    except Exception as error:
        print(f"Reminder checker error: {error}")

    finally:
        db.close()


def start_reminder_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            check_study_reminders,
            trigger="interval",
            seconds=10,
            id="study_reminders",
            replace_existing=True,
            max_instances=1
        )

        scheduler.start()
        print("Study reminder scheduler started (Asia/Kolkata).")