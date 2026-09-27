from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    HTTPException
)

from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from pathlib import Path

import os

from dotenv import load_dotenv

from google import genai

from ..database import get_db

from ..models import StudyMaterial


router = APIRouter()


# =========================================
# ENVIRONMENT
# =========================================

load_dotenv()

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)


# =========================================
# GEMINI CLIENT
# =========================================

if GEMINI_API_KEY:

    client = genai.Client(
        api_key=GEMINI_API_KEY
    )

else:

    client = None


# =========================================
# UPLOAD DIRECTORY
# =========================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
    .parent
)

UPLOAD_DIR = (
    BASE_DIR
    / "uploads"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================
# UPLOAD MATERIAL
# =========================================

@router.post("/upload")
async def upload_material(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Please select a file."
        )


    file_path = (
        UPLOAD_DIR
        / file.filename
    )


    content = await file.read()


    with open(
        file_path,
        "wb"
    ) as uploaded_file:

        uploaded_file.write(
            content
        )


    material = StudyMaterial(

        user_id=user_id,

        filename=file.filename,

        file_path=str(
            file_path
        )
    )


    db.add(
        material
    )

    db.commit()

    db.refresh(
        material
    )


    return {

        "message":
            "Study material saved successfully.",

        "material_id":
            material.id,

        "filename":
            material.filename
    }


# =========================================
# GET MATERIALS
# =========================================

@router.get("/")
def get_materials(
    user_id: int,
    db: Session = Depends(get_db)
):

    materials = (
        db.query(
            StudyMaterial
        )
        .filter(
            StudyMaterial.user_id == user_id
        )
        .all()
    )


    return materials


# =========================================
# GENERATE AI SUMMARY
# =========================================

@router.get(
    "/summary/{material_id}"
)
def summarize_material(
    material_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    if not client:

        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured."
        )


    material = (
        db.query(
            StudyMaterial
        )
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id == user_id
        )
        .first()
    )


    if not material:

        raise HTTPException(
            status_code=404,
            detail="Study material not found."
        )


    file_path = Path(
        material.file_path
    )


    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Material file not found."
        )


    extension = (
        file_path
        .suffix
        .lower()
    )


    if extension not in [
        ".pdf",
        ".txt"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files can be summarized."
        )


    try:

        # =========================================
        # UPLOAD COMPLETE FILE TO GEMINI
        # =========================================

        uploaded_file = client.files.upload(
            file=str(file_path)
        )


        # =========================================
        # SUMMARY INSTRUCTIONS
        # =========================================

        prompt = """
Read the complete uploaded study material from beginning to end.

Do not summarize only the first page or first section.

Understand all sections of the file before creating the summary.

Extract only the most important information useful for studying.

Rules:

1. Give a short and effective summary.
2. Use clear numbered points.
3. Include important definitions.
4. Include important concepts.
5. Include important facts.
6. Include important advantages or disadvantages when present.
7. Include important examples when present.
8. Include important conclusions when present.
9. Remove unnecessary details and repetition.
10. Do not invent information that is not present in the file.
11. Do not use emojis or decorative symbols.
12. Keep the final summary easy for a student to revise.

The final answer should contain only the important study points.
"""


        # =========================================
        # GENERATE SUMMARY
        # =========================================

        response = client.models.generate_content(

            model="gemini-3.5-flash-lite",

            contents=[
                uploaded_file,
                prompt
            ]
        )


        if not response.text:

            raise HTTPException(
                status_code=500,
                detail="Gemini returned an empty summary."
            )


        return {

            "filename":
                material.filename,

            "summary":
                response.text.strip()
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "Summary generation error:",
            error
        )


        raise HTTPException(
            status_code=500,
            detail="Unable to generate summary."
        )


# =========================================
# VIEW MATERIAL
# =========================================

@router.get(
    "/view/{material_id}"
)
def view_material(
    material_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    material = (
        db.query(
            StudyMaterial
        )
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id == user_id
        )
        .first()
    )


    if not material:

        raise HTTPException(
            status_code=404,
            detail="Study material not found."
        )


    file_path = Path(
        material.file_path
    )


    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Material file not found."
        )


    extension = (
        file_path
        .suffix
        .lower()
    )


    if extension == ".pdf":

        return FileResponse(

            path=file_path,

            media_type="application/pdf",

            headers={
                "Content-Disposition":
                    "inline"
            }
        )


    elif extension == ".txt":

        return FileResponse(

            path=file_path,

            media_type="text/plain",

            headers={
                "Content-Disposition":
                    "inline"
            }
        )


    else:

        raise HTTPException(
            status_code=400,
            detail=
                "Only PDF and TXT files can be viewed."
        )


# =========================================
# DELETE MATERIAL
# =========================================

@router.delete(
    "/{material_id}"
)
def delete_material(
    material_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    material = (
        db.query(
            StudyMaterial
        )
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id == user_id
        )
        .first()
    )


    if not material:

        raise HTTPException(
            status_code=404,
            detail="Study material not found."
        )


    file_path = Path(
        material.file_path
    )


    if file_path.exists():

        file_path.unlink()


    db.delete(
        material
    )

    db.commit()


    return {

        "message":
            "Study material deleted successfully."
    }