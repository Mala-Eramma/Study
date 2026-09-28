const USER_KEY = "user";

const PLANNER_KEY =
    "study_assistant_planner";

const MATERIALS_KEY =
    "study_assistant_materials";

const CHAT_HISTORY_KEY =
    "study_assistant_chat_history";

const QUIZ_PROGRESS_KEY =
    "study_assistant_quiz_progress";


/* =========================
   USER
========================= */

const userData =
    localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

const user =
    JSON.parse(userData);

const userId =
    user.user_id ||
    user.id ||
    user.email;


/* =========================
   ELEMENTS
========================= */

const taskCount =
    document.getElementById(
        "taskCount"
    );

const materialCount =
    document.getElementById(
        "materialCount"
    );

const quizScore =
    document.getElementById(
        "quizScore"
    );

const progressBar =
    document.getElementById(
        "progressBar"
    );

const progressMessage =
    document.getElementById(
        "progressMessage"
    );

const studySummary =
    document.getElementById(
        "studySummary"
    );


/* =========================
   GET USER DATA
========================= */

function getUserData(key) {

    let data = [];

    try {

        data =
            JSON.parse(
                localStorage.getItem(
                    key
                ) || "[]"
            );

    } catch (error) {

        console.error(
            `Unable to read ${key}:`,
            error
        );

        data = [];
    }


    if (!Array.isArray(data)) {
        return [];
    }


    return data.filter(
        item =>
            String(
                item.user_id
            ) ===
            String(
                userId
            )
    );
}


/* =========================
   TASK COUNT
========================= */

function getTaskCount() {

    const tasks =
        getUserData(
            PLANNER_KEY
        );


    if (taskCount) {

        taskCount.textContent =
            tasks.length;
    }


    return tasks.length;
}


/* =========================
   MATERIAL COUNT
========================= */

function getMaterialCount() {

    const materials =
        getUserData(
            MATERIALS_KEY
        );


    if (materialCount) {

        materialCount.textContent =
            materials.length;
    }


    return materials.length;
}


/* =========================
   CHAT COUNT
========================= */

function getChatCount() {

    return getUserData(
        CHAT_HISTORY_KEY
    ).length;
}


/* =========================
   QUIZ DATA
========================= */

function getQuizData() {

    return getUserData(
        QUIZ_PROGRESS_KEY
    );
}


/* =========================
   QUIZ COUNT
========================= */

function getQuizCount() {

    const quizzes =
        getQuizData();

    return quizzes.length;
}


/* =========================
   QUIZ SCORE
========================= */

function getQuizScore() {

    const quizzes =
        getQuizData();


    if (
        !quizzes ||
        quizzes.length === 0
    ) {

        if (quizScore) {
            quizScore.textContent =
                "0%";
        }

        return 0;
    }


    let totalPercentage = 0;


    quizzes.forEach(
        quiz => {

            let percentage =
                Number(
                    quiz.percentage
                );


            /*
             * If percentage is not stored,
             * calculate it from score and total.
             */

            if (
                !Number.isFinite(
                    percentage
                )
            ) {

                const score =
                    Number(
                        quiz.score
                    );

                const total =
                    Number(
                        quiz.total
                    );


                if (
                    total > 0
                ) {

                    percentage =
                        (
                            score /
                            total
                        ) *
                        100;

                } else {

                    percentage = 0;
                }
            }


            totalPercentage +=
                percentage;
        }
    );


    /*
     * Average score of all
     * completed quizzes.
     */

    const averageScore =
        Math.round(
            totalPercentage /
            quizzes.length
        );


    if (quizScore) {

        quizScore.textContent =
            `${averageScore}%`;
    }


    return averageScore;
}


/* =========================
   LEARNING PROGRESS
========================= */

function updateLearningProgress(
    tasks,
    materials,
    chatCount,
    quizCount
) {

    let progress = 0;


    /*
     * Planner
     */

    if (tasks > 0) {

        progress += 25;
    }


    /*
     * Materials
     */

    if (materials > 0) {

        progress += 25;
    }


    /*
     * AI Tutor
     */

    if (chatCount > 0) {

        progress += 25;
    }


    /*
     * Quiz
     */

    if (quizCount > 0) {

        progress += 25;
    }


    progress =
        Math.min(
            progress,
            100
        );


    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;

        progressBar.textContent =
            `${progress}%`;
    }


    if (progressMessage) {

        if (progress === 0) {

            progressMessage.textContent =
                "Start studying to track your progress.";

        }

        else if (progress < 50) {

            progressMessage.textContent =
                "Good start. Keep studying regularly.";

        }

        else if (progress < 100) {

            progressMessage.textContent =
                "Good progress. Keep learning and practicing.";

        }

        else {

            progressMessage.textContent =
                "Great work. You are actively using your study assistant.";
        }
    }
}


/* =========================
   STUDY SUMMARY
========================= */

function updateStudySummary(
    tasks,
    materials,
    chatCount,
    quizCount,
    score
) {

    if (!studySummary) {
        return;
    }


    studySummary.innerHTML =
        "";


    const summaryItems = [

        `Study tasks: ${tasks}`,

        `Study materials: ${materials}`,

        `AI study questions: ${chatCount}`,

        `Quizzes completed: ${quizCount}`,

        `Average quiz score: ${score}%`
    ];


    summaryItems.forEach(
        text => {

            const paragraph =
                document.createElement(
                    "p"
                );


            paragraph.textContent =
                text;


            studySummary.appendChild(
                paragraph
            );
        }
    );
}


/* =========================
   LOAD PROGRESS
========================= */

function loadProgress() {

    const tasks =
        getTaskCount();


    const materials =
        getMaterialCount();


    const chatCount =
        getChatCount();


    const quizCount =
        getQuizCount();


    const score =
        getQuizScore();


    updateLearningProgress(
        tasks,
        materials,
        chatCount,
        quizCount
    );


    updateStudySummary(
        tasks,
        materials,
        chatCount,
        quizCount,
        score
    );
}


/* =========================
   START
========================= */

loadProgress();