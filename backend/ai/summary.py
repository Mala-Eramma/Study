from .prompts import SUMMARY_PROMPT


def generate_summary(content: str) -> str:
    """
    Generate a summary of study material.

    AI summarization will be connected here later.
    """

    content = content.strip()

    if not content:
        return "No study material was provided."

    return (
        "Study material received. "
        "AI summarization will be connected here next."
    )