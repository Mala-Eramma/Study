const API_URL = window.location.origin;

const generateQuizButton =
    document.getElementById("generateQuiz");

const quizSubject =
    document.getElementById("quizSubject");

const questionCount =
    document.getElementById("questionCount");

const quizArea =
    document.getElementById("quizArea");

const quizMessage =
    document.getElementById("quizMessage");

let currentQuiz = [];

let currentQuizType = "mcq";

let quizSubmitted = false;


/* =========================================================
   GENERATE QUIZ
========================================================= */

generateQuizButton.addEventListener(
    "click",
    generateQuiz
);


async function generateQuiz() {

    const subject =
        quizSubject.value.trim();

    const count =
        Number(questionCount.value);

    const selectedType =
        document.querySelector(
            'input[name="quizType"]:checked'
        );


    if (!subject) {

        quizMessage.textContent =
            "Please enter a subject.";

        quizMessage.style.color =
            "red";

        return;
    }


    if (!selectedType) {

        quizMessage.textContent =
            "Please select a quiz type.";

        quizMessage.style.color =
            "red";

        return;
    }


    currentQuizType =
        selectedType.value;

    quizSubmitted =
        false;


    quizMessage.textContent =
        "Generating quiz...";

    quizMessage.style.color =
        "darkblue";


    quizArea.innerHTML = "";


    generateQuizButton.disabled =
        true;


    try {

        const response =
            await fetch(
                `${API_URL}/quiz/generate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        subject:
                            subject,

                        question_count:
                            count,

                        quiz_type:
                            currentQuizType

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to generate quiz."
            );

        }


        if (
            !data.questions ||
            !Array.isArray(data.questions)
        ) {

            throw new Error(
                "Invalid quiz data received from server."
            );

        }


        currentQuiz =
            data.questions;


        quizMessage.textContent =
            "Quiz generated successfully.";

        quizMessage.style.color =
            "green";


        displayQuiz();

    }

    catch (error) {

        console.error(
            "QUIZ ERROR:",
            error
        );


        quizMessage.textContent =
            error.message;

        quizMessage.style.color =
            "red";


        quizArea.innerHTML = `

            <div class="empty-quiz">

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

    finally {

        generateQuizButton.disabled =
            false;

    }
}


/* =========================================================
   DISPLAY QUIZ
========================================================= */

function displayQuiz() {

    quizArea.innerHTML = "";


    currentQuiz.forEach(
        (item, index) => {

            const questionContainer =
                document.createElement(
                    "div"
                );


            questionContainer.className =
                "quiz-question";


            const questionTitle =
                document.createElement(
                    "h3"
                );


            questionTitle.textContent =
                `${index + 1}. ${item.question}`;


            questionContainer.appendChild(
                questionTitle
            );


            /* =========================
               MCQ
            ========================= */

            if (
                currentQuizType === "mcq"
            ) {

                item.options.forEach(
                    (option) => {

                        const label =
                            document.createElement(
                                "label"
                            );


                        label.className =
                            "quiz-option";


                        const radio =
                            document.createElement(
                                "input"
                            );


                        radio.type =
                            "radio";


                        radio.name =
                            `question-${index}`;


                        radio.value =
                            option;


                        label.appendChild(
                            radio
                        );


                        label.appendChild(
                            document.createTextNode(
                                ` ${option}`
                            )
                        );


                        questionContainer.appendChild(
                            label
                        );

                    }
                );

            }


            /* =========================
               WRITTEN ANSWER
            ========================= */

            else {

                const answerInput =
                    document.createElement(
                        "input"
                    );


                answerInput.type =
                    "text";


                answerInput.className =
                    "written-answer";


                answerInput.id =
                    `answer-${index}`;


                answerInput.placeholder =
                    "Write your answer";


                questionContainer.appendChild(
                    answerInput
                );

            }


            quizArea.appendChild(
                questionContainer
            );

        }
    );


    /* =========================
       SUBMIT BUTTON
    ========================= */

    const submitButton =
        document.createElement(
            "button"
        );


    submitButton.type =
        "button";


    submitButton.className =
        "submit-quiz";


    submitButton.textContent =
        "Submit Quiz";


    submitButton.addEventListener(
        "click",
        submitQuiz
    );


    quizArea.appendChild(
        submitButton
    );
}


/* =========================================================
   SUBMIT QUIZ
========================================================= */

async function submitQuiz() {

    if (quizSubmitted) {
        return;
    }


    quizSubmitted = true;


    let score = 0;


    const questionContainers =
        document.querySelectorAll(
            ".quiz-question"
        );


    currentQuiz.forEach(
        (item, index) => {

            let userAnswer = "";


            /* =========================
               GET USER ANSWER
            ========================= */

            if (
                currentQuizType === "mcq"
            ) {

                const selected =
                    document.querySelector(
                        `input[name="question-${index}"]:checked`
                    );


                if (selected) {

                    userAnswer =
                        selected.value;

                }

            }

            else {

                const input =
                    document.getElementById(
                        `answer-${index}`
                    );


                if (input) {

                    userAnswer =
                        input.value.trim();

                }

            }


            const questionContainer =
                questionContainers[index];


            if (!questionContainer) {
                return;
            }


            const correctAnswer =
                String(
                    item.answer
                ).trim();


            const normalizedUserAnswer =
                userAnswer
                    .trim()
                    .toLowerCase();


            const normalizedCorrectAnswer =
                correctAnswer
                    .toLowerCase();


            const isCorrect =
                normalizedUserAnswer !== "" &&
                normalizedUserAnswer ===
                    normalizedCorrectAnswer;


            /* =========================
               MCQ COLORS
            ========================= */

            if (
                currentQuizType === "mcq"
            ) {

                const options =
                    questionContainer.querySelectorAll(
                        ".quiz-option"
                    );


                options.forEach(
                    (optionLabel) => {

                        const radio =
                            optionLabel.querySelector(
                                'input[type="radio"]'
                            );


                        if (!radio) {
                            return;
                        }


                        optionLabel.classList.remove(
                            "correct-answer",
                            "wrong-answer"
                        );


                        /*
                           Always show the correct
                           answer in green.
                        */

                        if (
                            radio.value
                                .trim()
                                .toLowerCase() ===
                            normalizedCorrectAnswer
                        ) {

                            optionLabel.classList.add(
                                "correct-answer"
                            );

                        }


                        /*
                           If user selected a wrong
                           answer, show it in red.
                        */

                        if (
                            radio.checked &&
                            !isCorrect
                        ) {

                            optionLabel.classList.remove(
                                "correct-answer"
                            );

                            optionLabel.classList.add(
                                "wrong-answer"
                            );

                        }


                        radio.disabled =
                            true;

                    }
                );

            }


            /* =========================
               WRITTEN ANSWER COLORS
            ========================= */

            else {

                const input =
                    questionContainer.querySelector(
                        ".written-answer"
                    );


                if (input) {

                    input.classList.remove(
                        "correct-answer",
                        "wrong-answer"
                    );


                    if (isCorrect) {

                        input.classList.add(
                            "correct-answer"
                        );

                    }

                    else {

                        input.classList.add(
                            "wrong-answer"
                        );

                    }


                    input.disabled =
                        true;

                }

            }


            /* =========================
               SCORE
            ========================= */

            if (isCorrect) {

                score++;

            }

        }
    );


    /* =====================================================
       RESULT
    ===================================================== */

    const totalQuestions =
        currentQuiz.length;


    const percentage =
        totalQuestions > 0
            ? (score / totalQuestions) * 100
            : 0;


    /* Remove submit button */

    const submitButton =
        quizArea.querySelector(
            ".submit-quiz"
        );


    if (submitButton) {

        submitButton.remove();

    }


    /* Add result at bottom */

    const result =
        document.createElement(
            "div"
        );


    result.className =
        "quiz-result";


    result.innerHTML = `

        <h2>
            Quiz Completed
        </h2>

        <p>
            Score: ${score}/${totalQuestions}
        </p>

        <p>
            Percentage: ${percentage.toFixed(0)}%
        </p>

    `;


    quizArea.appendChild(
        result
    );


    quizMessage.textContent =
        "Quiz submitted successfully.";

    quizMessage.style.color =
        "green";


    /* =====================================================
       SAVE RESULT
    ===================================================== */

    let user = null;


    try {

        user =
            JSON.parse(
                localStorage.getItem(
                    "user"
                )
            );

    }

    catch (error) {

        console.error(
            "Unable to read user data:",
            error
        );

    }


    if (
        !user ||
        !user.id
    ) {

        return;
    }


    try {

        await fetch(
            `${API_URL}/quiz/result?user_id=${user.id}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    subject:
                        quizSubject.value.trim(),

                    score:
                        percentage,

                    total_questions:
                        totalQuestions

                })
            }
        );

    }

    catch (error) {

        console.error(
            "Unable to save quiz result:",
            error
        );

    }


    /* =====================================================
       SAVE PROGRESS
    ===================================================== */

    try {

        await fetch(
            `${API_URL}/progress/activity?user_id=${user.id}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    subject:
                        quizSubject.value.trim(),

                    activity_type:
                        "quiz",

                    score:
                        percentage

                })
            }
        );

    }

    catch (error) {

        console.error(
            "Unable to save learning activity:",
            error
        );

    }

}