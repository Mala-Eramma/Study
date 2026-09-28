const USER_KEY = "user";

const PLANNER_KEY =
    "study_assistant_planner";

const MATERIALS_KEY =
    "study_assistant_materials";

const CHAT_HISTORY_KEY =
    "study_assistant_chat_history";

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

const taskCount =
    document.getElementById(
        "taskCount"
    );

const materialCount =
    document.getElementById(
        "materialCount"
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

function getUserData(key) {

    const data =
        JSON.parse(
            localStorage.getItem(
                key
            ) || "[]"
        );

    return data.filter(
        item =>
            String(item.user_id) ===
            String(userId)
    );
}

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

function getChatCount() {

    return getUserData(
        CHAT_HISTORY_KEY
    ).length;
}

function updateLearningProgress(
    tasks,
    materials,
    chatCount
) {

    let progress = 0;

    if (tasks > 0) {
        progress += 35;
    }

    if (materials > 0) {
        progress += 35;
    }

    if (chatCount > 0) {
        progress += 30;
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

        } else if (progress < 50) {

            progressMessage.textContent =
                "Good start. Keep studying regularly.";

        } else if (progress < 100) {

            progressMessage.textContent =
                "Good progress. Keep learning and practicing.";

        } else {

            progressMessage.textContent =
                "Great work. You are actively using your study assistant.";
        }
    }
}

function updateStudySummary(
    tasks,
    materials,
    chatCount
) {

    if (!studySummary) {
        return;
    }

    studySummary.innerHTML = "";

    const summaryItems = [

        `Study tasks: ${tasks}`,

        `Study materials: ${materials}`,

        `AI study questions: ${chatCount}`
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

function loadProgress() {

    const tasks =
        getTaskCount();

    const materials =
        getMaterialCount();

    const chatCount =
        getChatCount();

    updateLearningProgress(
        tasks,
        materials,
        chatCount
    );

    updateStudySummary(
        tasks,
        materials,
        chatCount
    );
}

loadProgress();