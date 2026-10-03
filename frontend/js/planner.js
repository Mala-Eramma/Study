
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
    currentUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
} catch (error) {
    console.error("Unable to read user information:", error);
}

const currentUserId =
    currentUser.user_id || currentUser.id || localStorage.getItem("user_id");

function getTaskForm() {
    return plannerForm;
}

function getFormValues() {
    return {
        subject: subjectInput?.value.trim() || "",
        description: taskInput?.value.trim() || "",
        date: dateInput?.value || "",
        time: timeInput?.value || "",
        subjectInput,
        taskInput,
        dateInput,
        timeInput
    };
}

function showMessage(message, type = "success") {
    let element = document.getElementById("plannerMessage");

    if (!element) {
        element = document.createElement("p");
        element.id = "plannerMessage";
        element.setAttribute("role", "status");
        plannerForm.insertAdjacentElement("afterend", element);
    }

    element.textContent = message;
    element.style.color = type === "error" ? "#dc2626" : "#15803d";
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    let result = {};

    try {
        result = text ? JSON.parse(text) : {};
    } catch {
        result = { message: text };
    }

    if (!response.ok) {
        throw new Error(
            result.detail || result.message || `Request failed (${response.status})`
        );
    }

    return result;
}

function formatDate(date) {
    if (!date) return "";

    const parts = String(date).split("-");
    return parts.length === 3
        ? `${parts[2]}-${parts[1]}-${parts[0]}`
        : date;
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
    if (!currentUserId) {
        showMessage("Please log in again to schedule study tasks.", "error");
        return;
    }

    try {
        const tasks = await apiRequest(
            `/planner/?user_id=${encodeURIComponent(currentUserId)}`
        );

        displayTasks(tasks);
    } catch (error) {
        console.error("Unable to load study tasks:", error);
        showMessage(
            `Unable to load tasks: ${error.message}. Please try again.`,
            "error"
        );
    }
}

async function addTask(event) {
    event.preventDefault();

    if (!currentUserId) {
        showMessage("Please log in again before scheduling a task.", "error");
        return;
    }

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

    const selectedDateTime = new Date(`${values.date}T${values.time}`);

    if (Number.isNaN(selectedDateTime.getTime())) {
        showMessage("Please select a valid date and time.", "error");
        return;
    }

    if (selectedDateTime.getTime() < Date.now()) {
        showMessage("Please select a future date and time.", "error");
        return;
    }

    const submitButton = plannerForm.querySelector('button[type="submit"]');

    if (submitButton) submitButton.disabled = true;

    try {
        const result = await apiRequest(
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
        if (submitButton) submitButton.disabled = false;
    }
}

async function deleteTask(taskId, button) {
    if (!currentUserId) return;

    if (button) button.disabled = true;

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

        if (button) button.disabled = false;
    }
}

if (plannerForm) {
    plannerForm.addEventListener("submit", addTask);
}

loadTasks();