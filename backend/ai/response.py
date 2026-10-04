import os
import time

from dotenv import load_dotenv
from google import genai

from .prompts import SYSTEM_PROMPT


load_dotenv()


def generate_response(question: str) -> str:
    question = question.strip()

    if not question:
        return "Please enter a question."

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

        response = None

        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt
                )
                break

            except Exception as error:
                error_message = str(error)

                is_temporary_error = (
                    "503" in error_message
                    or "UNAVAILABLE" in error_message
                    or "429" in error_message
                    or "RESOURCE_EXHAUSTED" in error_message
                )

                if not is_temporary_error or attempt == 2:
                    raise

                delay = 2 ** (attempt + 1)
                print(
                    f"Gemini temporarily unavailable. "
                    f"Retrying in {delay} seconds..."
                )
                time.sleep(delay)

        if response is None or not response.text:
            print("ERROR: Gemini returned an empty response.")
            return "Gemini returned an empty response. Please try again."

        return response.text.strip()

    except Exception as error:
        print(f"Gemini response error: {error}")
        return "Unable to generate an AI response right now. Please try again."