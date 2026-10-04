// ============================================================
// AI STUDY ASSISTANT - STUDY PLANNER
// Backend database integration
// Email reminders are handled by the Python backend scheduler
// ============================================================

const API_URL = (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
)
    ? "http://127.0.0.1:8000"
    : "https://study-i3wy.onrender.com";
const USER_KEY = "user";
const DATABASE_USER_ID =Number(localStorage.getItem("user_id")) ;

const plannerForm = document.getElementById("plannerForm");
const plannerList = document.getElementById("taskList");

// ------------------------------------------------------------
// CHECK LOGIN
// ------------------------------------------------------------

function checkLoggedInUser() {
    try {
        const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");

        if (!user) {
            window.location.href = "login.html";
            return false;
        }

        return true;
    } catch (error) {
        console.error("Unable to read login information:", error);
        window.location.href = "login.html";
        return false;
    }
}

// ------------------------------------------------------------
// SHOW STATUS MESSAGE
// ------------------------------------------------------------

function showMessage(message, isError = false) {
    let status = document.getElementById("plannerStatus");

    if (!status) {
        status = document.createElement("p");
        status.id = "plannerStatus";
        status.setAttribute("role", "status");
        status.style.margin = "12px 0";
        status.style.padding = "10px";
        status.style.borderRadius = "6px";

        if (plannerForm) {
            plannerForm.insertAdjacentElement("afterend", status);
        } else if (plannerList) {
            plannerList.insertAdjacentElement("beforebegin", status);
        }
    }

    status.textContent = message;
    status.style.color = isError ? "#c62828" : "#176b36";
}

// ------------------------------------------------------------
// SEND REQUEST TO BACKEND
// ------------------------------------------------------------

async function plannerRequest(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, options);

    if (!response.ok) {
        let errorMessage = "The planner request failed.";

        try {
            const errorData = await response.json();
            errorMessage =
                errorData.detail ||
                errorData.message ||
                errorMessage;
        } catch {
            // Keep the default error message.
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// ------------------------------------------------------------
// GET TASKS FROM DATABASE
// ------------------------------------------------------------

async function getPlannerTasks() {
    const tasks = await plannerRequest(
        `/planner/?user_id=${DATABASE_USER_ID}`
    );

    if (!Array.isArray(tasks)) {
        throw new Error("The server returned an invalid task list.");
    }

    return tasks;
}

// ------------------------------------------------------------
// SAVE TASK TO DATABASE
// ------------------------------------------------------------

async function savePlannerTask(taskData) {
    return plannerRequest(
        `/planner/?user_id=${DATABASE_USER_ID}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(taskData)
        }
    );
}

// ------------------------------------------------------------
// DELETE TASK FROM DATABASE
// ------------------------------------------------------------

async function deleteTask(taskId) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this study task?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await plannerRequest(
            `/planner/${encodeURIComponent(taskId)}?user_id=${DATABASE_USER_ID}`,
            {
                method: "DELETE"
            }
        );

        showMessage("Study task deleted successfully.");
        await loadTasks();
    } catch (error) {
        console.error("Unable to delete study task:", error);
        showMessage(error.message, true);
    }
}

// ------------------------------------------------------------
// CREATE TASK CARD
// ------------------------------------------------------------

function createTaskElement(task) {
    const item = document.createElement("div");
    item.className = "planner-task";

    const subject = document.createElement("h3");
    subject.textContent = task.subject || "Untitled subject";

    const taskDescription = document.createElement("p");
    taskDescription.textContent = task.task || "";

    const date = document.createElement("p");
    date.textContent = `Date: ${task.study_date || "Not set"}`;

    const time = document.createElement("p");
    time.textContent = `Time: ${String(task.study_time || "Not set").slice(0, 5)}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async function () {
        await deleteTask(task.id);
    });

    item.appendChild(subject);
    item.appendChild(taskDescription);
    item.appendChild(date);
    item.appendChild(time);
    item.appendChild(deleteButton);

    return item;
}

// ------------------------------------------------------------
// LOAD AND DISPLAY TASKS
// ------------------------------------------------------------

async function loadTasks() {
    if (!plannerList) {
        console.error('Task container "#taskList" was not found.');
        return;
    }

    plannerList.innerHTML = "";

    const loading = document.createElement("p");
    loading.textContent = "Loading study tasks...";
    plannerList.appendChild(loading);

    try {
        const tasks = await getPlannerTasks();

        plannerList.innerHTML = "";

        if (tasks.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-tasks";

            const paragraph = document.createElement("p");
            paragraph.textContent = "No study tasks added yet.";

            emptyMessage.appendChild(paragraph);
            plannerList.appendChild(emptyMessage);
            return;
        }

        tasks.sort(function (a, b) {
            const dateA = new Date(
                `${a.study_date}T${a.study_time}`
            ).getTime();

            const dateB = new Date(
                `${b.study_date}T${b.study_time}`
            ).getTime();

            return dateA - dateB;
        });

        tasks.forEach(function (task) {
            plannerList.appendChild(createTaskElement(task));
        });
    } catch (error) {
        console.error("Unable to load study tasks:", error);
        plannerList.innerHTML = "";

        const errorMessage = document.createElement("p");
        errorMessage.textContent =
            `Unable to load tasks: ${error.message}`;
        errorMessage.style.color = "#c62828";

        plannerList.appendChild(errorMessage);
    }
}

// ------------------------------------------------------------
// ADD TASK
// ------------------------------------------------------------

async function addTask(taskData) {
    try {
        await savePlannerTask(taskData);
        showMessage("Study task saved successfully.");
        await loadTasks();
        return true;
    } catch (error) {
        console.error("Unable to save study task:", error);
        showMessage(error.message, true);
        return false;
    }
}

// ------------------------------------------------------------
// FORM SUBMISSION
// ------------------------------------------------------------

if (!checkLoggedInUser()) {
    // The login page will open.
} else if (!plannerForm || !plannerList) {
    console.error(
        'Planner form "#plannerForm" or task list "#taskList" was not found.'
    );
} else {
    plannerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const subjectInput = document.getElementById("subject");
        const taskInput = document.getElementById("task");
        const dateInput = document.getElementById("studyDate");
        const timeInput = document.getElementById("studyTime");

        if (!subjectInput || !taskInput || !dateInput || !timeInput) {
            showMessage("One or more planner fields are missing.", true);
            return;
        }

        const taskData = {
            subject: subjectInput.value.trim(),
            task: taskInput.value.trim(),
            study_date: dateInput.value,
            study_time: timeInput.value
        };

        if (
            !taskData.subject ||
            !taskData.task ||
            !taskData.study_date ||
            !taskData.study_time
        ) {
            showMessage("Please fill in all fields.", true);
            return;
        }

        const submitButton = plannerForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const saved = await addTask(taskData);

            if (saved) {
                plannerForm.reset();
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });

    // Load saved tasks when the page opens.
    loadTasks();
}