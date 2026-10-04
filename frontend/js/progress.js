
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

let user = {};

try {
    user = JSON.parse(userData || "{}") || {};
} catch (error) {
    console.error("Unable to read logged-in user:", error);
    window.location.href = "login.html";
}

const userId = user.user_id || user.id || user.email;

const taskCount = document.getElementById("taskCount");
const materialCount = document.getElementById("materialCount");
const quizScore = document.getElementById("quizScore");
const progressBar = document.getElementById("progressBar");
const progressMessage = document.getElementById("progressMessage");
const studySummary = document.getElementById("studySummary");


/* ---------------- USER DATA ---------------- */

function getUserData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");

        if (!Array.isArray(data)) {
            return [];
        }

        return data.filter(item => {
            if (!item || typeof item !== "object") return false;

            const itemUserId = item.user_id ?? item.userId;

            return itemUserId == null ||
                String(itemUserId) === String(userId);
        });
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return [];
    }
}


/* ---------------- TASKS ---------------- */

async function getTaskCount() {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.id || user.user_id;

        if (!userId) {
            throw new Error("Invalid user ID.");
        }

        const response = await fetch(
            `https://study-i3wy.onrender.com/planner/?user_id=${encodeURIComponent(userId)}`
        );

        if (!response.ok) {
            throw new Error("Unable to load study tasks.");
        }

        const tasks = await response.json();

        if (taskCount) {
            taskCount.textContent = tasks.length;
        }

        return tasks.length;
    } catch (error) {
        console.error("Unable to load progress tasks:", error);

        if (taskCount) {
            taskCount.textContent = "0";
        }

        return 0;
    }
}


/* ---------------- MATERIALS ---------------- */

// Read materials from the existing IndexedDB database.
// Keep localStorage as a fallback for older saved records.

async function getMaterialCount() {
    const DB_NAME = "AIStudyAssistantMaterialsDB";
    const STORE_NAME = "materials";

    function readLocalMaterials() {
        return getUserData(MATERIALS_KEY).length;
    }

    if (!("indexedDB" in window)) {
        const count = readLocalMaterials();

        if (materialCount) {
            materialCount.textContent = count;
        }

        return count;
    }

    let database;

    try {
        database = await new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.close();

            const count = readLocalMaterials();

            if (materialCount) {
                materialCount.textContent = count;
            }

            return count;
        }

        const records = await new Promise((resolve, reject) => {
            const transaction = database.transaction(
                STORE_NAME,
                "readonly"
            );

            const request = transaction
                .objectStore(STORE_NAME)
                .getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);

            transaction.onerror = () => reject(transaction.error);
        });

        const materials = records.filter(item => {
            if (!item || typeof item !== "object") return false;

            const itemUserId = item.user_id ?? item.userId;

            return itemUserId == null ||
                String(itemUserId) === String(userId);
        });

        const count = materials.length;

        if (materialCount) {
            materialCount.textContent = count;
        }

        database.close();

        return count;

    } catch (error) {
        console.error("Unable to load saved materials:", error);

        if (database) {
            database.close();
        }

        const count = readLocalMaterials();

        if (materialCount) {
            materialCount.textContent = count;
        }

        return count;
    }
}


/* ---------------- CHAT ---------------- */

function getChatCount() {
    return getUserData(CHAT_HISTORY_KEY).length;
}


/* ---------------- QUIZ ---------------- */

// Read the existing quiz progress key first.
// If it is empty, look for other existing quiz-related localStorage keys.

function getQuizData() {
    const primaryData = getUserData(QUIZ_PROGRESS_KEY);

    if (primaryData.length > 0) {
        return primaryData;
    }

    const quizRecords = [];

    try {
        for (let index = 0; index < localStorage.length; index++) {
            const key = localStorage.key(index);

            if (!key || !key.toLowerCase().includes("quiz")) {
                continue;
            }

            if (key === USER_KEY) {
                continue;
            }

            let parsed;

            try {
                parsed = JSON.parse(localStorage.getItem(key) || "null");
            } catch {
                continue;
            }

            let records = [];

            if (Array.isArray(parsed)) {
                records = parsed;
            } else if (parsed && typeof parsed === "object") {
                if (
                    parsed.user_id != null ||
                    parsed.userId != null ||
                    parsed.score != null ||
                    parsed.percentage != null ||
                    parsed.total != null
                ) {
                    records = [parsed];
                } else if (Array.isArray(parsed.results)) {
                    records = parsed.results;
                } else if (Array.isArray(parsed.history)) {
                    records = parsed.history;
                }
            }

            records.forEach(item => {
                if (!item || typeof item !== "object") return;

                const itemUserId = item.user_id ?? item.userId;

                if (
                    itemUserId != null &&
                    String(itemUserId) !== String(userId)
                ) {
                    return;
                }

                const hasScore =
                    item.percentage != null ||
                    item.score != null;

                if (hasScore) {
                    quizRecords.push(item);
                }
            });
        }
    } catch (error) {
        console.error("Unable to read quiz records:", error);
    }

    return quizRecords;
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
    let validQuizCount = 0;

    quizzes.forEach(quiz => {
        let percentage = Number(quiz.percentage);

        if (
            quiz.percentage == null ||
            !Number.isFinite(percentage)
        ) {
            const score = Number(quiz.score);
            const total = Number(quiz.total);

            if (
                Number.isFinite(score) &&
                Number.isFinite(total) &&
                total > 0
            ) {
                percentage = (score / total) * 100;
            } else {
                return;
            }
        }

        if (Number.isFinite(percentage)) {
            totalPercentage += percentage;
            validQuizCount++;
        }
    });

    const averageScore = validQuizCount > 0
        ? Math.round(totalPercentage / validQuizCount)
        : 0;

    if (quizScore) {
        quizScore.textContent = `${averageScore}%`;
    }

    return averageScore;
}


/* ---------------- SUBJECT DETECTION ---------------- */

function detectSubject(topic) {
    const q = String(topic || "").toLowerCase();

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
        q.includes("array") ||
        q.includes("let ") ||
        q.includes("const ") ||
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
    let name = String(topic || "").trim();

    name = name.replace(
        /^(what is|what are|explain|define|tell me about|meaning of|why is|why do we use|how does|how do|how to)\s+/i,
        ""
    );

    if (!name) {
        return "";
    }

    return name.charAt(0).toUpperCase() + name.slice(1);
}


/* ---------------- LEARNED SUBJECTS ---------------- */

function getLearnedSubjects() {
    const topics = getUserData(CHAT_TOPICS_KEY);
    const history = getUserData(CHAT_HISTORY_KEY);

    const allTopics = [];

    topics.forEach(item => {
        if (item.topic) {
            allTopics.push(item.topic);
        }
    });

    history.forEach(item => {
        if (item.question) {
            allTopics.push(item.question);
        }
    });

    const subjects = {};

    allTopics.forEach(topic => {
        const subject = detectSubject(topic);
        const topicName = getTopicName(topic);

        if (!topicName) return;

        if (!subjects[subject]) {
            subjects[subject] = [];
        }

        const exists = subjects[subject].some(
            existingTopic =>
                existingTopic.toLowerCase() === topicName.toLowerCase()
        );

        if (!exists) {
            subjects[subject].push(topicName);
        }
    });

    return subjects;
}


/* ---------------- STUDY SUMMARY ---------------- */

function updateStudySummary() {
    if (!studySummary) return;

    studySummary.innerHTML = "";

    const subjects = getLearnedSubjects();
    const subjectNames = Object.keys(subjects).sort();

    const totalTopics = subjectNames.reduce(
        (total, subject) => total + subjects[subject].length,
        0
    );

    const header = document.createElement("div");
    header.className = "study-summary-header";
    header.innerHTML = `
        <div>
            <p>My Learning Summary</p>
            <span>Subjects and topics explored through AI Chat</span>
        </div>
        <strong>${totalTopics} topics</strong>
    `;

    studySummary.appendChild(header);

    if (subjectNames.length === 0) {
        const empty = document.createElement("div");
        empty.className = "summary-empty";
        empty.innerHTML = `
            <p>No learning activity recorded yet.</p>
            <span>Start learning through AI Chat to see your subjects and topics here.</span>
        `;

        studySummary.appendChild(empty);
        return;
    }

    const summaryGrid = document.createElement("div");
    summaryGrid.className = "study-summary-grid";

    subjectNames.forEach(subject => {
        const topics = subjects[subject];

        const card = document.createElement("section");
        card.className = "study-summary-card";

        const heading = document.createElement("div");
        heading.className = "study-summary-card-header";

        const title = document.createElement("h3");
        title.textContent = subject;

        const count = document.createElement("span");
        count.className = "study-summary-count";
        count.textContent = `${topics.length} topics`;

        heading.append(title, count);

        const topicList = document.createElement("ul");
        topicList.className = "study-summary-topic-list";

        topics.forEach(topic => {
            const item = document.createElement("li");
            item.textContent = topic;
            topicList.appendChild(item);
        });

        card.append(heading, topicList);
        summaryGrid.appendChild(card);
    });

    studySummary.appendChild(summaryGrid);
}


/* ---------------- PROGRESS ---------------- */

function updateLearningProgress(tasks, materials, chatCount, quizCount) {
    let progress = 0;

    if (tasks > 0) progress += 25;
    if (materials > 0) progress += 25;
    if (chatCount > 0) progress += 25;
    if (quizCount > 0) progress += 25;

    progress = Math.min(progress, 100);

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;
        progressBar.setAttribute("aria-valuenow", String(progress));
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

async function loadProgress() {
    const tasks = await getTaskCount();
    const materials = await getMaterialCount();
    const chatCount = getChatCount();
    const quizCount = getQuizCount();

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
