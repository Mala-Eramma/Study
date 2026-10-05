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

        models = [
            "gemini-3.8-flash",
            "gemini-3.5-flash-lite"
        ]

        for model in models:
            for attempt in range(2):
                try:
                    print(
                        f"Trying Gemini model: {model}, "
                        f"attempt: {attempt + 1}"
                    )

                    response = client.models.generate_content(
                        model=model,
                        contents=prompt
                    )

                    if response.text:
                        return response.text.strip()

                    print(
                        f"Gemini returned an empty response from {model}."
                    )

                except Exception as error:
                    error_message = str(error)

                    temporary_error = (
                        "503" in error_message
                        or "UNAVAILABLE" in error_message
                        or "429" in error_message
                        or "RESOURCE_EXHAUSTED" in error_message
                    )

                    print(
                        f"Gemini error from {model}: {error_message}"
                    )

                    if not temporary_error:
                        raise

                    if attempt == 0:
                        print(
                            f"Temporary Gemini error. "
                            f"Retrying {model}..."
                        )
                        time.sleep(2)

            print(
                f"Model {model} is unavailable. "
                f"Trying the next Chat model..."
            )

        return "Unable to generate an AI response right now. Please try again."

    except Exception as error:
        print(f"Gemini response error: {error}")
        return "Unable to generate an AI response right now. Please try again."