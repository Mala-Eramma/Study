import os
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from google import genai
from google.genai import types

from ..database import get_db
from ..models import QuizResult
from ..schemas import QuizRequest, QuizResultCreate


load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

router = APIRouter()


@router.post("/generate")
def generate_quiz(
    quiz_data: QuizRequest,
    db: Session = Depends(get_db)
):
    subject = quiz_data.subject.strip()
    question_count = quiz_data.question_count

    quiz_type = getattr(
        quiz_data,
        "quiz_type",
        "mcq"
    )

    if not subject:
        raise HTTPException(
            status_code=400,
            detail="Please enter a subject."
        )

    if question_count < 1 or question_count > 20:
        raise HTTPException(
            status_code=400,
            detail="Question count must be between 1 and 20."
        )

    if quiz_type not in ["mcq", "written"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid quiz type."
        )

    if not API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured."
        )


    if quiz_type == "mcq":

        prompt = f"""
Create a multiple-choice quiz about {subject}.

Generate exactly {question_count} questions.

Return a JSON object with exactly this structure:

{{
    "questions": [
        {{
            "question": "Question text",
            "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "answer": "Correct option"
        }}
    ]
}}

Rules:

1. Generate exactly {question_count} questions.
2. Every question must have exactly 4 options.
3. Every option must be a string.
4. The answer must exactly match one of the four options.
5. Do not include explanations.
6. Do not include markdown.
7. Do not include code fences.
8. Return JSON only.
"""

    else:

        prompt = f"""
Create a written-answer quiz about {subject}.

Generate exactly {question_count} questions.

Return a JSON object with exactly this structure:

{{
    "questions": [
        {{
            "question": "Question text",
            "answer": "Correct answer"
        }}
    ]
}}

Rules:

1. Generate exactly {question_count} questions.
2. Every question must require the student to write the answer.
3. The answer must be short and objectively correct.
4. Do not include multiple-choice options.
5. Do not include explanations.
6. Do not include markdown.
7. Do not include code fences.
8. Return JSON only.
"""


    try:

        client = genai.Client(
            api_key=API_KEY
        )


        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )


        if not response.text:

            raise HTTPException(
                status_code=500,
                detail="Gemini returned an empty response."
            )


        print(
            "\n========== GEMINI QUIZ RESPONSE =========="
        )

        print(response.text)

        print(
            "===========================================\n"
        )


        try:

            quiz = json.loads(
                response.text
            )

        except json.JSONDecodeError as error:

            print(
                "JSON ERROR:",
                error
            )

            raise HTTPException(
                status_code=500,
                detail="Gemini returned invalid JSON."
            )


        questions = quiz.get(
            "questions"
        )


        if not isinstance(
            questions,
            list
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "Gemini response does not contain "
                    "valid questions."
                )
            )


        if len(questions) != question_count:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Gemini returned "
                    f"{len(questions)} questions "
                    f"instead of "
                    f"{question_count}."
                )
            )


        for index, question in enumerate(
            questions,
            start=1
        ):

            if not isinstance(
                question,
                dict
            ):

                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"Question {index} has "
                        "an invalid format."
                    )
                )


            if "question" not in question:

                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"Question {index} is missing "
                        "question text."
                    )
                )


            if "answer" not in question:

                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"Question {index} is missing "
                        "the correct answer."
                    )
                )


            if quiz_type == "mcq":

                if "options" not in question:

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"Question {index} is missing "
                            "options."
                        )
                    )


                options = question["options"]


                if not isinstance(
                    options,
                    list
                ):

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"Question {index} has "
                            "invalid options."
                        )
                    )


                if len(options) != 4:

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"Question {index} does not "
                            "have exactly 4 options."
                        )
                    )


                if question["answer"] not in options:

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"Question {index} has an "
                            "answer that does not "
                            "match its options."
                        )
                    )


            else:

                if "options" in question:

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"Written question "
                            f"{index} should not "
                            "contain options."
                        )
                    )


        return {
            "message": "Quiz generated successfully.",
            "subject": subject,
            "quiz_type": quiz_type,
            "questions": questions
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "\n========== QUIZ GENERATION ERROR =========="
        )

        print(error)

        print(
            "============================================\n"
        )


        raise HTTPException(
            status_code=500,
            detail=(
                f"Quiz generation failed: "
                f"{str(error)}"
            )
        )

@router.post("/result")
def save_quiz_result(
    result_data: QuizResultCreate,
    user_id: int,
    db: Session = Depends(get_db)
):


    try:

        result = QuizResult(
            user_id=user_id,
            subject=result_data.subject,
            score=result_data.score,
            total_questions=result_data.total_questions
        )


        db.add(result)

        db.commit()

        db.refresh(result)


        return {
            "message": "Quiz result saved successfully.",
            "result_id": result.id
        }


    except Exception as error:

        db.rollback()

        print(
            "QUIZ RESULT ERROR:",
            error
        )


        raise HTTPException(
            status_code=500,
            detail="Unable to save quiz result."
        )