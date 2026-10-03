
const API_URL = "https://study-i3wy.onrender.com";
const USER_KEY = "user";

const plannerForm = document.getElementById("plannerForm");
const subjectInput = document.getElementById("subject");
const taskInput = document.getElementById("task");
const dateInput = document.getElementById("studyDate");
const timeInput = document.getElementById("studyTime");
const taskList = document.getElementById("taskList");

let currentUser = {};

try {
    currentUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}") || {};
} catch (error) {
    console.error("Unable to read user information:", error);
}

const storedUserId =
    currentUser.user_id ??
    currentUser.id ??
    localStorage.getItem("user_id");

const currentUserId = Number(storedUserId);

function showMessage(message, type = "success") {
    let messageElement = document.getElementById("plannerMessage");

    if (!messageElement && plannerForm) {
        messageElement = document.createElement("p");
        messageElement.id = "plannerMessage";
        messageElement.setAttribute("role", "status");
        plannerForm.insertAdjacentElement("afterend", messageElement);
    }

    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color =
            type === "error" ? "#dc2626" : "#15803d";
    }
}

function validateUserId() {
    if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
        showMessage(
            "Your numeric user ID is missing. Please log out and log in again.",
            "error"
        );
        return false;
    }

    return true;
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const responseText = await response.text();
    let result = {};

    try {
        result = responseText ? JSON.parse(responseText) : {};
    } catch {
        result = { message: responseText };
    }

    if (!response.ok) {
        const detail = Array.isArray(result.detail)
            ? result.detail.map(item => item.msg || JSON.stringify(item)).join(", ")
            : result.detail;

        throw new Error(
            detail || result.message || `Server error (${response.status})`
        );
    }

    return result;
}

function formatDate(date) {
    if (!date) return "";

    const parts = String(date).split("-");

    return parts.length === 3
        ? `${parts[2]}-${parts[1]}-${parts[0]}`
        : String(date);
}

function formatTime(time) {
    if (!time) return "";

    const parts = String(time).split(":");
    const hours = Number(parts[0]);
    const minutes = parts[1] || "00";
    const suffix = hours >= 12 ? "PM" : "AM";

    return `${hours % 12 || 12}:${minutes} ${suffix}`;
}

function displayTasks(tasks) {
    if (!taskList) return;

    taskList.innerHTML = "";

    if (!Array.isArray(tasks) || tasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-tasks";

        const message = document.createElement("p");
        message.textContent = "No study tasks added yet.";

        empty.appendChild(message);
        taskList.appendChild(empty);
        return;
    }

    tasks.sort((a, b) => {
        const dateA = `${a.study_date || ""}T${a.study_time || ""}`;
        const dateB = `${b.study_date || ""}T${b.study_time || ""}`;

        return dateA.localeCompare(dateB);
    });

    tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";

        const heading = document.createElement("h3");
        heading.textContent = task.subject || "Study Task";

        const description = document.createElement("p");
        description.textContent = task.task || "";

        const schedule = document.createElement("p");
        schedule.textContent =
            `Date: ${formatDate(task.study_date)} | Time: ${formatTime(task.study_time)}`;

        card.append(heading, description, schedule);

        if (task.id != null) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "planner-button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteTask(task.id, deleteButton);
            });

            card.appendChild(deleteButton);
        }

        taskList.appendChild(card);
    });
}

async function loadTasks() {
    if (!validateUserId()) return;

    try {
        const tasks = await apiRequest(
            `/planner/?user_id=${encodeURIComponent(currentUserId)}`
        );

        displayTasks(tasks);
    } catch (error) {
        console.error("Unable to load study tasks:", error);

        showMessage(
            `Unable to load tasks: ${error.message}`,
            "error"
        );
    }
}

async function addTask(event) {
    event.preventDefault();

    if (!validateUserId()) return;

    const subject = subjectInput?.value.trim() || "";
    const description = taskInput?.value.trim() || "";
    const date = dateInput?.value || "";
    const time = timeInput?.value || "";

    if (!subject || !description || !date || !time) {
        showMessage("Please fill in all task details.", "error");
        return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);

    if (Number.isNaN(selectedDateTime.getTime())) {
        showMessage("Please select a valid date and time.", "error");
        return;
    }

    if (selectedDateTime.getTime() < Date.now()) {
        showMessage("Please select a future date and time.", "error");
        return;
    }

    const submitButton = plannerForm.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        const result = await apiRequest(
            `/planner/?user_id=${encodeURIComponent(currentUserId)}`,
            {
                method: "POST",
                body: JSON.stringify({
                    subject: subject,
                    task: description,
                    study_date: date,
                    study_time: time
                })
            }
        );

        if (result.task_id == null) {
            throw new Error(
                result.message || "The server did not confirm that the task was saved."
            );
        }

        plannerForm.reset();

        showMessage("Study task scheduled successfully.", "success");

        await loadTasks();
    } catch (error) {
        console.error("Unable to schedule study task:", error);

        showMessage(
            `Unable to schedule task: ${error.message}`,
            "error"
        );
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

async function deleteTask(taskId, button) {
    if (!validateUserId()) return;

    if (button) {
        button.disabled = true;
    }

    try {
        await apiRequest(
            `/planner/${encodeURIComponent(taskId)}?user_id=${encodeURIComponent(currentUserId)}`,
            { method: "DELETE" }
        );

        showMessage("Study task deleted successfully.", "success");

        await loadTasks();
    } catch (error) {
        console.error("Unable to delete study task:", error);

        showMessage(
            `Unable to delete task: ${error.message}`,
            "error"
        );

        if (button) {
            button.disabled = false;
        }
    }
}

if (plannerForm) {
    plannerForm.addEventListener("submit", addTask);
}

loadTasks();