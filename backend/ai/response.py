
import os

from dotenv import load_dotenv
from google import genai

from .prompts import SYSTEM_PROMPT


load_dotenv()


def generate_response(question: str) -> str:
    question = question.strip()

    if not question:
        return "Please enter a question."

    # Read the API key when a request arrives.
    load_dotenv(override=False)
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("ERROR: GEMINI_API_KEY is missing from backend environment.")
        return "Gemini API key is not configured on the backend."

    try:
        client = genai.Client(api_key=api_key)

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
            print("ERROR: Gemini returned an empty response.")
            return "Gemini returned an empty response."

        return response.text.strip()

    except Exception as error:
        print(f"Gemini response error: {error}")
        return "Unable to generate an AI response right now."
