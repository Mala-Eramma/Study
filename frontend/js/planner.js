const STORAGE_KEY = "studyPlannerTasks";

const plannerForm = document.getElementById("plannerForm");
const subjectInput = document.getElementById("subject");
const taskInput = document.getElementById("task");
const dateInput = document.getElementById("studyDate");
const timeInput = document.getElementById("studyTime");
const taskList = document.getElementById("taskList");

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

function getTasks() {
    try {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
        console.error("Unable to read saved tasks:", error);
        return [];
    }
}

function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Unable to save tasks:", error);
        showMessage("Unable to save tasks in this browser.", "error");
        return false;
    }
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

    if (tasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-tasks";

        const message = document.createElement("p");
        message.textContent = "No study tasks added yet.";

        empty.appendChild(message);
        taskList.appendChild(empty);
        return;
    }

    tasks.sort((a, b) => {
        const dateA = `${a.study_date}T${a.study_time}`;
        const dateB = `${b.study_date}T${b.study_time}`;
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

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "planner-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        card.append(heading, description, schedule, deleteButton);
        taskList.appendChild(card);
    });
}

function loadTasks() {
    displayTasks(getTasks());
}

function addTask(event) {
    event.preventDefault();

    const subject = subjectInput.value.trim();
    const description = taskInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

    if (!subject || !description || !date || !time) {
        showMessage("Please fill in all task details.", "error");
        return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);

    if (
        Number.isNaN(selectedDateTime.getTime()) ||
        selectedDateTime.getTime() < Date.now()
    ) {
        showMessage("Please select a future date and time.", "error");
        return;
    }

    const tasks = getTasks();

    tasks.push({
        id: Date.now(),
        subject,
        task: description,
        study_date: date,
        study_time: time
    });

    if (saveTasks(tasks)) {
        plannerForm.reset();
        showMessage("Study task saved successfully.");
        loadTasks();
    }
}

function deleteTask(taskId) {
    const tasks = getTasks().filter(task => task.id !== taskId);

    if (saveTasks(tasks)) {
        showMessage("Study task deleted successfully.");
        loadTasks();
    }
}

if (plannerForm) {
    plannerForm.addEventListener("submit", addTask);
}

loadTasks();