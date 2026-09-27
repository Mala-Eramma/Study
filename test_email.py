import os

import resend
from dotenv import load_dotenv


load_dotenv()

resend.api_key = os.getenv(
    "RESEND_API_KEY"
)

from_email = os.getenv(
    "RESEND_FROM_EMAIL"
)

to_email = input(
    "Enter the email address to receive the test: "
).strip()


response = resend.Emails.send(
    {
        "from": from_email,
        "to": [to_email],
        "subject": "AI Study Assistant Test Email",
        "html": """
            <h2>AI Study Assistant</h2>

            <p>
                This is a test email.
            </p>

            <p>
                Your email reminder system is connected successfully.
            </p>
        """
    }
)


print("Email sent successfully.")
print(response)