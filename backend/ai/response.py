import os

from google import genai
from dotenv import load_dotenv

from .prompts import SYSTEM_PROMPT


load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")


def generate_response(question: str) -> str:

    question = question.strip()

    if not question:
        return "Please enter a question."

    if not API_KEY:
        return "Gemini API key is not configured."

    client = genai.Client(
        api_key=API_KEY
    )

    prompt = f"""
{SYSTEM_PROMPT}

Student question:
{question}
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        if not response.text:
            return "Gemini returned an empty response."

        return response.text.strip()

    except Exception as error:

        print(
            f"Gemini response error: {error}"
        )

        return "Unable to generate an AI response right now."