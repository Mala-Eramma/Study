
document.addEventListener("DOMContentLoaded", initializePlanner);

// ============================================================
// AI STUDY ASSISTANT - STUDY PLANNER
// Backend Database + Immediate Delete + Browser Notifications
// ============================================================

const API_URL = "https://study-i3wy.onrender.com";
const USER_KEY = "user";
const PLANNER_KEY = "study_assistant_planner";

let currentUser = null;
let currentUserId = null;
let tasks = [];
let loadingTasks = false;

// ============================================================
// 1. INITIALIZE PLANNER
// ============================================================

async function initializePlanner() {
    currentUser = getLoggedInUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    currentUserId =
        currentUser.user_id ??
        currentUser.id ??
        currentUser.user?.user_id ??
        currentUser.user?.id ??
        null;

    if (
        currentUserId === null ||
        !/^\d+$/.test(String(currentUserId))
    ) {
        showMessage(
            "Please log out and log in again to use Study Planner.",
            "error"
        );
        return;
    }

    currentUserId = Number(currentUserId);

    setupTaskForm();
    setupNotificationButton();

    await loadTasks();

    // Browser reminders work while this page is open.
    setInterval(checkDueReminders, 15000);
}

// ============================================================
// 2. GET LOGGED-IN USER
// ============================================================

function getLoggedInUser() {
    try {
        return JSON.parse(
            localStorage.getItem(USER_KEY) || "null"
        );
    } catch (error) {
        console.error("Unable to read user information:", error);
        return null;
    }
}

// ============================================================
// 3. ELEMENT HELPERS
// ============================================================

function findElement(selectors) {
    for (const selector of selectors) {
        const element = document.querySelector(selector);

        if (element) {
            return element;
        }
    }

    return null;
}

function getTaskForm() {
    return findElement([
        "#taskForm",
        "#plannerForm",
        "#studyTaskForm",
        ".task-form",
        "form"
    ]);
}

function getTaskContainer() {
    return findElement([
        "#taskList",
        "#tasksList",
        "#tasksContainer",
        "#plannerTasks",
        "#studyTasks",
        ".task-list",
        ".tasks-list",
        ".tasks-container"
    ]);
}

function getFormValues() {
    const subjectInput = findElement([
        "#subject",
        "#taskSubject",
        "#task-subject",
        'input[name="subject"]'
    ]);

    const taskInput = findElement([
        "#task",
        "#taskDescription",
        "#taskName",
        "#task-description",
        'input[name="task"]',
        'textarea[name="task"]'
    ]);

    const dateInput = findElement([
        "#studyDate",
        "#taskDate",
        "#task-date",
        'input[name="study_date"]',
        'input[type="date"]'
    ]);

    const timeInput = findElement([
        "#studyTime",
        "#taskTime",
        "#task-time",
        'input[name="study_time"]',
        'input[type="time"]'
    ]);

    return {
        subjectInput,
        taskInput,
        dateInput,
        timeInput,
        subject: subjectInput?.value.trim() || "",
        description: taskInput?.value.trim() || "",
        date: dateInput?.value || "",
        time: dateInput && timeInput ? timeInput.value : timeInput?.value || ""
    };
}

// ============================================================
// 4. INLINE STATUS MESSAGE - NO POPUPS
// ============================================================

function showMessage(message, type = "success") {
    let messageElement = document.getElementById("plannerMessage");

    if (!messageElement) {
        messageElement = document.createElement("p");
        messageElement.id = "plannerMessage";
        messageElement.setAttribute("role", "status");
        messageElement.setAttribute("aria-live", "polite");

        const form = getTaskForm();
        const container = getTaskContainer();
        const anchor = form || container;

        if (anchor?.parentNode) {
            anchor.parentNode.insertBefore(
                messageElement,
                anchor.nextSibling
            );
        } else {
            document.body.appendChild(messageElement);
        }
    }

    messageElement.textContent = message;
    messageElement.className = `planner-message ${type}`;

    messageElement.style.display = "block";
    messageElement.style.padding = "10px";
    messageElement.style.margin = "10px 0";
    messageElement.style.borderRadius = "6px";
    messageElement.style.fontWeight = "500";
    messageElement.style.color =
        type === "error" ? "#b91c1c" : "#15803d";
}

// ============================================================
// 5. BACKEND REQUEST HELPER
// ============================================================

async function apiRequest(path, options = {}) {
    let response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });
    } catch (error) {
        console.error("Backend connection error:", error);

        throw new Error(
            "Could not connect to the server. Please try again."
        );
    }

    const text = await response.text();
    let data = {};

    if (text) {
        try {
            data = JSON.parse(text);
        } catch (error) {
            throw new Error("The server returned an invalid response.");
        }
    }

    if (!response.ok) {
        const detail = Array.isArray(data.detail)
            ? data.detail.map(item => item.msg).join(", ")
            : data.detail;

        throw new Error(
            detail || `Server error (${response.status}).`
        );
    }

    return data;
}

// ============================================================
// 6. LOAD TASKS FROM BACKEND DATABASE
// ============================================================

async function loadTasks() {
    if (loadingTasks) return;

    loadingTasks = true;

    try {
        const data = await apiRequest(
            `/planner/?user_id=${encodeURIComponent(currentUserId)}`
        );

        tasks = Array.isArray(data) ? data : [];
        renderTasks();
    } catch (error) {
        console.error("Unable to load study tasks:", error);
        showMessage(error.message, "error");
    } finally {
        loadingTasks = false;
    }
}

// ============================================================
// 7. CONNECT TASK FORM
// ============================================================

function setupTaskForm() {
    const form = getTaskForm();

    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            addTask();
        });
    }

    const addButton = findElement([
        "#addTaskBtn",
        "#addTask",
        "#add-task",
        ".add-task-btn"
    ]);

    if (addButton && !form) {
        addButton.addEventListener("click", event => {
            event.preventDefault();
            addTask();
        });
    }
}

// ============================================================
// 8. ADD TASK TO BACKEND DATABASE
// ============================================================

async function addTask() {
    const values = getFormValues();

    if (
        !values.subject ||
        !values.description ||
        !values.date ||
        !values.time
    ) {
        showMessage("Please fill in all task details.", "error");
        return;
    }

    const form = getTaskForm();
    const submitButton = form?.querySelector(
        'button[type="submit"]'
    ) || findElement([
        "#addTaskBtn",
        "#addTask",
        "#add-task",
        ".add-task-btn"
    ]);

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        const newTask = await apiRequest(
            `/planner/?user_id=${encodeURIComponent(currentUserId)}`,
            {
                method: "POST",
                body: JSON.stringify({
                    subject: values.subject,
                    task: values.description,
                    study_date: values.date,
                    study_time: values.time
                })
            }
        );

        // Reload the database list to use the actual saved task ID.
        await loadTasks();

        if (values.subjectInput) values.subjectInput.value = "";
        if (values.taskInput) values.taskInput.value = "";
        if (values.dateInput) values.dateInput.value = "";
        if (values.timeInput) values.timeInput.value = "";

        showMessage(
            newTask?.message || "Study task added successfully.",
            "success"
        );
    } catch (error) {
        console.error("Unable to add task:", error);
        showMessage(error.message, "error");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

// ============================================================
// 9. DELETE TASK - NO CONFIRMATION POPUP
// ============================================================

async function deleteTask(taskId, deleteButton = null) {
    const taskIndex = tasks.findIndex(
        task => String(task.id) === String(taskId)
    );

    if (taskIndex === -1) {
        showMessage("Task not found. Please refresh the planner.", "error");
        return;
    }

    const taskCard = document.querySelector(
        `[data-task-id="${CSS.escape(String(taskId))}"]`
    );

    if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.textContent = "Deleting...";
    }

    try {
        // Delete from the backend first.
        const result = await apiRequest(
            `/planner/${encodeURIComponent(taskId)}?user_id=${encodeURIComponent(currentUserId)}`,
            { method: "DELETE" }
        );

        // Remove immediately from the current UI after server success.
        tasks = tasks.filter(
            task => String(task.id) !== String(taskId)
        );

        if (taskCard) {
            taskCard.remove();
        }

        renderTasks();

        showMessage(
            result?.message === "Study task not found."
                ? "Task was not found on the server. The list has been refreshed."
                : "Study task deleted successfully.",
            result?.message === "Study task not found."
                ? "error"
                : "success"
        );

        // Verify the current list against the database.
        await loadTasks();
    } catch (error) {
        console.error("Unable to delete task:", error);

        // Keep the task visible if deletion failed.
        await loadTasks();
        showMessage(error.message, "error");
    }
}

// ============================================================
// 10. DISPLAY TASKS
// ============================================================

function renderTasks() {
    const container = getTaskContainer();

    if (!container) {
        console.error(
            "Task container was not found. Check the IDs in planner.html."
        );
        return;
    }

    container.innerHTML = "";

    if (tasks.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-tasks-message";
        emptyMessage.textContent = "No study tasks added yet.";
        container.appendChild(emptyMessage);
        return;
    }

    const sortedTasks = [...tasks].sort((a, b) => {
        const dateA =
            `${a.study_date || ""} ${a.study_time || ""}`;
        const dateB =
            `${b.study_date || ""} ${b.study_time || ""}`;

        return dateA.localeCompare(dateB);
    });

    sortedTasks.forEach(task => {
        container.appendChild(createTaskElement(task));
    });
}

// ============================================================
// 11. CREATE TASK CARD
// ============================================================

function createTaskElement(task) {
    const card = document.createElement("div");
    card.className = "task-card";
    card.dataset.taskId = task.id;

    const subject = document.createElement("h3");
    subject.textContent = task.subject || "Study Task";

    const description = document.createElement("p");
    description.textContent = task.task || "";

    const date = document.createElement("p");
    date.textContent = `Date: ${task.study_date || ""}`;

    const time = document.createElement("p");
    time.textContent = `Time: ${formatTime(task.study_time || "")}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
        // No window.confirm() or other confirmation popup.
        deleteTask(task.id, deleteButton);
    });

    card.append(subject, description, date, time, deleteButton);

    return card;
}

// ============================================================
// 12. FORMAT TIME
// ============================================================

function formatTime(timeValue) {
    if (!timeValue) return "";

    const parts = timeValue.split(":");

    if (parts.length < 2) return timeValue;

    let hour = Number(parts[0]);
    const minute = parts[1];
    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minute} ${period}`;
}

// ============================================================
// 13. BROWSER NOTIFICATIONS
// ============================================================

function setupNotificationButton() {
    const button = findElement([
        "#enableNotifications",
        "#enableNotificationBtn",
        "#notificationButton",
        "#enableReminders",
        ".notification-btn"
    ]);

    if (!button) return;

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        button.textContent = "Notifications Enabled";
    }

    button.addEventListener("click", async () => {
        if (!("Notification" in window)) {
            showMessage(
                "Browser notifications are not supported.",
                "error"
            );
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            button.textContent = "Notifications Enabled";
            showMessage("Browser reminders enabled.", "success");
        } else {
            showMessage(
                "Please allow notifications in your browser settings.",
                "error"
            );
        }
    });
}

// ============================================================
// 14. CHECK BROWSER REMINDERS
// ============================================================

function checkDueReminders() {
    if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    const now = new Date();

    const currentDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    const currentTime = [
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0")
    ].join(":");

    const reminderKey =
        `study_assistant_planner_reminders_${currentUserId}`;

    let sentReminders = {};

    try {
        sentReminders = JSON.parse(
            localStorage.getItem(reminderKey) || "{}"
        );
    } catch (error) {
        sentReminders = {};
    }

    tasks.forEach(task => {
        const taskDate = task.study_date || "";
        const taskTime = (task.study_time || "").slice(0, 5);

        const reminderId =
            `${task.id}_${taskDate}_${taskTime}`;

        if (
            taskDate === currentDate &&
            taskTime === currentTime &&
            !sentReminders[reminderId]
        ) {
            new Notification("Study Reminder", {
                body: `${task.subject}: ${task.task}`
            });

            sentReminders[reminderId] = true;
        }
    });

    localStorage.setItem(
        reminderKey,
        JSON.stringify(sentReminders)
    );
}