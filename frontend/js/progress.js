const USER_KEY = "user";
const PLANNER_KEY = "study_assistant_planner";
const MATERIALS_KEY = "study_assistant_materials";
const CHAT_HISTORY_KEY = "study_assistant_chat_history";

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);
const userId = user.user_id;

const taskCount =
    document.getElementById("taskCount");

const quizScore =
    document.getElementById("quizScore");

const materialCount =
    document.getElementById("materialCount");

const progressBar =
    document.getElementById("progressBar");

const progressMessage =
    document.getElementById("progressMessage");

const studySummary =
    document.getElementById("studySummary");


function getUserData(key) {
    const data = JSON.parse(
        localStorage.getItem(key) || "[]"
    );

    return data.filter(
        item =>
            String(item.user_id) ===
            String(userId)
    );
}


/* =========================================
   STUDY TASKS
========================================= */

function getTaskCount() {
    const tasks =
        getUserData(PLANNER_KEY);

    if (taskCount) {
        taskCount.textContent =
            tasks.length;
    }

    return tasks.length;
}


/* =========================================
   STUDY MATERIALS
========================================= */

function getMaterialCount() {
    const materials =
        getUserData(MATERIALS_KEY);

    if (materialCount) {
        materialCount.textContent =
            materials.length;
    }

    return materials.length;
}


/* =========================================
   QUIZ SCORE
========================================= */

function getQuizScore() {
    const quizResults =
        getUserData(
            "study_assistant_quiz_results"
        );

    if (quizResults.length === 0) {
        if (quizScore) {
            quizScore.textContent = "0%";
        }

        return 0;
    }

    let totalScore = 0;
    let totalQuestions = 0;

    quizResults.forEach(result => {
        totalScore +=
            Number(result.score) || 0;

        totalQuestions +=
            Number(result.total_questions) || 0;
    });

    if (totalQuestions === 0) {
        if (quizScore) {
            quizScore.textContent = "0%";
        }

        return 0;
    }

    const percentage =
        Math.round(
            (totalScore / totalQuestions) * 100
        );

    if (quizScore) {
        quizScore.textContent =
            `${percentage}%`;
    }

    return percentage;
}


/* =========================================
   LEARNING PROGRESS
========================================= */

function updateLearningProgress(
    tasks,
    materials,
    quizPercentage
) {
    const activityCount =
        tasks +
        materials;

    let progress = 0;

    if (activityCount > 0) {
        progress += 40;
    }

    if (materials > 0) {
        progress += 20;
    }

    if (tasks > 0) {
        progress += 20;
    }

    if (quizPercentage > 0) {
        progress += 20;
    }

    progress =
        Math.min(progress, 100);

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
        } else if (progress < 50) {
            progressMessage.textContent =
                "Good start. Keep studying regularly.";
        } else if (progress < 80) {
            progressMessage.textContent =
                "Good progress. Keep learning and practicing.";
        } else {
            progressMessage.textContent =
                "Great work. You are making strong study progress.";
        }
    }

    return progress;
}


/* =========================================
   STUDY SUMMARY
========================================= */

function updateStudySummary(
    tasks,
    materials,
    quizPercentage,
    chatHistory
) {
    if (!studySummary) {
        return;
    }

    studySummary.innerHTML = "";

    const summaryItems = [
        `Study tasks completed or planned: ${tasks}`,
        `Study materials saved: ${materials}`,
        `Quiz performance: ${quizPercentage}%`,
        `AI study questions asked: ${chatHistory}`
    ];

    summaryItems.forEach(text => {

        const paragraph =
            document.createElement("p");

        paragraph.textContent =
            text;

        studySummary.appendChild(
            paragraph
        );
    });
}


/* =========================================
   LOAD PROGRESS
========================================= */

function loadProgress() {

    const tasks =
        getTaskCount();

    const materials =
        getMaterialCount();

    const quizPercentage =
        getQuizScore();

    const chatHistory =
        getUserData(
            CHAT_HISTORY_KEY
        ).length;

    updateLearningProgress(
        tasks,
        materials,
        quizPercentage
    );

    updateStudySummary(
        tasks,
        materials,
        quizPercentage,
        chatHistory
    );
}


loadProgress();