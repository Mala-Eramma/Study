const CHAT_HISTORY_KEY = "study_assistant_chat_history";
const USER_KEY = "user";

const historyContainer =
    document.getElementById("historyContainer");

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);

const userId = user.user_id;

function getUserHistory() {
    const history = JSON.parse(
        localStorage.getItem(CHAT_HISTORY_KEY) || "[]"
    );

    return history.filter(
        item => String(item.user_id) === String(userId)
    );
}

function saveHistory(history) {
    const allHistory = JSON.parse(
        localStorage.getItem(CHAT_HISTORY_KEY) || "[]"
    );

    const otherUsersHistory = allHistory.filter(
        item => String(item.user_id) !== String(userId)
    );

    localStorage.setItem(
        CHAT_HISTORY_KEY,
        JSON.stringify([
            ...otherUsersHistory,
            ...history
        ])
    );
}

function deleteHistory(historyId) {
    const history = getUserHistory();

    const updatedHistory = history.filter(
        item => String(item.id) !== String(historyId)
    );

    saveHistory(updatedHistory);

    loadHistory();
}

function createHistoryItem(item) {
    const wrapper = document.createElement("div");

    wrapper.className = "history-item";

    const question = document.createElement("h3");

    question.textContent =
        `Question: ${item.question}`;

    const answer = document.createElement("p");

    answer.textContent =
        `Answer: ${item.answer}`;

    const date = document.createElement("small");

    const dateValue = new Date(item.created_at);

    date.textContent =
        dateValue.toLocaleString();

    const deleteButton =
        document.createElement("button");

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener(
        "click",
        function () {
            deleteHistory(item.id);
        }
    );

    wrapper.appendChild(question);
    wrapper.appendChild(answer);
    wrapper.appendChild(date);
    wrapper.appendChild(deleteButton);

    return wrapper;
}

function loadHistory() {
    if (!historyContainer) {
        return;
    }

    historyContainer.innerHTML = "";

    const history = getUserHistory();

    if (history.length === 0) {
        const message =
            document.createElement("p");

        message.textContent =
            "No chat history available.";

        historyContainer.appendChild(message);

        return;
    }

    history
        .slice()
        .reverse()
        .forEach(item => {
            historyContainer.appendChild(
                createHistoryItem(item)
            );
        });
}

loadHistory();