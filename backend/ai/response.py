import os

from dotenv import load_dotenv
from google import genai

from .prompts import SYSTEM_PROMPT


load_dotenv()


API_KEY = os.getenv("GEMINI_API_KEY")


def generate_response(question: str) -> str:

    question = question.strip()

    if not question:
        return "Please enter a question."

    if not API_KEY:
        return "Gemini API key is not configured."

    try:

        client = genai.Client(
            api_key=API_KEY
        )

        prompt = f"""
{SYSTEM_PROMPT}

Student question:
{question}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
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