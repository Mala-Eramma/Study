const USER_KEY = "user";
const PLANNER_KEY = "study_assistant_planner";
const MATERIALS_KEY = "study_assistant_materials";
const CHAT_HISTORY_KEY = "study_assistant_chat_history";
const CHAT_TOPICS_KEY = "study_assistant_chat_topics";
const QUIZ_PROGRESS_KEY = "study_assistant_quiz_progress";

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);
const userId = user.user_id || user.id || user.email;

const taskCount = document.getElementById("taskCount");
const materialCount = document.getElementById("materialCount");
const quizScore = document.getElementById("quizScore");
const progressBar = document.getElementById("progressBar");
const progressMessage = document.getElementById("progressMessage");
const studySummary = document.getElementById("studySummary");


function getUserData(key) {
    let data = [];

    try {
        data = JSON.parse(localStorage.getItem(key) || "[]");
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        data = [];
    }

    if (!Array.isArray(data)) {
        return [];
    }

    return data.filter(item =>
        String(item.user_id) === String(userId)
    );
}


/* ---------------- TASKS ---------------- */

function getTaskCount() {

    const tasks = getUserData(PLANNER_KEY);

    if (taskCount) {
        taskCount.textContent = tasks.length;
    }

    return tasks.length;
}


/* ---------------- MATERIALS ---------------- */

function getMaterialCount() {

    const materials = getUserData(MATERIALS_KEY);

    if (materialCount) {
        materialCount.textContent = materials.length;
    }

    return materials.length;
}


/* ---------------- CHAT ---------------- */

function getChatCount() {

    return getUserData(CHAT_HISTORY_KEY).length;
}


/* ---------------- QUIZ ---------------- */

function getQuizData() {

    return getUserData(QUIZ_PROGRESS_KEY);
}


function getQuizCount() {

    return getQuizData().length;
}


function getQuizScore() {

    const quizzes = getQuizData();

    if (quizzes.length === 0) {

        if (quizScore) {
            quizScore.textContent = "0%";
        }

        return 0;
    }

    let totalPercentage = 0;

    quizzes.forEach(quiz => {

        let percentage = Number(quiz.percentage);

        if (!Number.isFinite(percentage)) {

            const score = Number(quiz.score);
            const total = Number(quiz.total);

            if (total > 0) {
                percentage = (score / total) * 100;
            } else {
                percentage = 0;
            }
        }

        totalPercentage += percentage;
    });

    const averageScore =
        Math.round(totalPercentage / quizzes.length);

    if (quizScore) {
        quizScore.textContent = `${averageScore}%`;
    }

    return averageScore;
}


/* ---------------- SUBJECT DETECTION ---------------- */

function detectSubject(topic) {

    const q = topic.toLowerCase();

    if (
        q.includes("python") ||
        q.includes("list") ||
        q.includes("tuple") ||
        q.includes("dictionary") ||
        q.includes("function") ||
        q.includes("inheritance") ||
        q.includes("class") ||
        q.includes("object") ||
        q.includes("exception") ||
        q.includes("loop") ||
        q.includes("variable") ||
        q.includes("string")
    ) {
        return "Python";
    }

    if (
        q.includes("html") ||
        q.includes("anchor") ||
        q.includes("root element") ||
        q.includes("tag") ||
        q.includes("form") ||
        q.includes("heading") ||
        q.includes("paragraph")
    ) {
        return "HTML";
    }

    if (
        q.includes("css") ||
        q.includes("flexbox") ||
        q.includes("grid") ||
        q.includes("media query") ||
        q.includes("responsive")
    ) {
        return "CSS";
    }

    if (
        q.includes("javascript") ||
        q.includes("javascript") ||
        q.includes("array") ||
        q.includes("let") ||
        q.includes("const") ||
        q.includes("dom")
    ) {
        return "JavaScript";
    }

    if (
        q.includes("sql") ||
        q.includes("mysql") ||
        q.includes("primary key") ||
        q.includes("foreign key") ||
        q.includes("select") ||
        q.includes("insert") ||
        q.includes("update") ||
        q.includes("delete")
    ) {
        return "SQL / MySQL";
    }

    if (
        q.includes("oops") ||
        q.includes("oop") ||
        q.includes("encapsulation") ||
        q.includes("polymorphism") ||
        q.includes("abstraction")
    ) {
        return "OOP";
    }

    return "Other";
}


/* ---------------- CLEAN TOPIC NAME ---------------- */

function getTopicName(topic) {

    let name = topic.trim();

    name = name.replace(
        /^(what is|what are|explain|define|tell me about|meaning of|why is|why do we use|how does|how do|how to)\s+/i,
        ""
    );

    if (!name) {
        name = topic.trim();
    }

    return name.charAt(0).toUpperCase() + name.slice(1);
}


/* ---------------- LEARNED SUBJECTS ---------------- */

function getLearnedSubjects() {

    const topics = getUserData(CHAT_TOPICS_KEY);
    const history = getUserData(CHAT_HISTORY_KEY);

    const allTopics = [];

    // New chat topics
    topics.forEach(item => {
        if (item.topic) {
            allTopics.push(item.topic);
        }
    });

    // Older chat history
    history.forEach(item => {
        if (item.question) {
            allTopics.push(item.question);
        }
    });

    const subjects = {};

    allTopics.forEach(topic => {

        const subject = detectSubject(topic);
        const topicName = getTopicName(topic);

        if (!topicName) {
            return;
        }

        if (!subjects[subject]) {
            subjects[subject] = [];
        }

        const alreadyExists =
            subjects[subject].some(
                existingTopic =>
                    existingTopic.toLowerCase() ===
                    topicName.toLowerCase()
            );

        if (!alreadyExists) {
            subjects[subject].push(topicName);
        }
    });

    return subjects;
}

/* ---------------- STUDY SUMMARY ---------------- */

function updateStudySummary() {

    if (!studySummary) {
        return;
    }

    studySummary.innerHTML = "";

    const subjects = getLearnedSubjects();

    const subjectNames = Object.keys(subjects);

    if (subjectNames.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "Your learned topics will appear here after you study using AI Chat.";

        studySummary.appendChild(emptyMessage);

        return;
    }

    subjectNames.forEach(subject => {

        const subjectContainer =
            document.createElement("div");

        subjectContainer.className =
            "subject-summary-container";


        const subjectTitle =
            document.createElement("h3");

        subjectTitle.textContent = subject;


        const learnedTitle =
            document.createElement("p");

        learnedTitle.textContent =
            "What you learned";


        const topicList =
            document.createElement("ul");


        subjects[subject].forEach(topic => {

            const topicItem =
                document.createElement("li");

            topicItem.textContent = topic;

            topicList.appendChild(topicItem);

        });


        subjectContainer.appendChild(subjectTitle);
        subjectContainer.appendChild(learnedTitle);
        subjectContainer.appendChild(topicList);

        studySummary.appendChild(subjectContainer);

    });
}


/* ---------------- PROGRESS ---------------- */

function updateLearningProgress(
    tasks,
    materials,
    chatCount,
    quizCount
) {

    let progress = 0;

    if (tasks > 0) {
        progress += 25;
    }

    if (materials > 0) {
        progress += 25;
    }

    if (chatCount > 0) {
        progress += 25;
    }

    if (quizCount > 0) {
        progress += 25;
    }

    progress = Math.min(progress, 100);


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


/* ---------------- LOAD PROGRESS ---------------- */

function loadProgress() {

    const tasks = getTaskCount();

    const materials =
        getMaterialCount();

    const chatCount =
        getChatCount();

    const quizCount =
        getQuizCount();

    getQuizScore();

    updateLearningProgress(
        tasks,
        materials,
        chatCount,
        quizCount
    );

    updateStudySummary();
}


loadProgress();