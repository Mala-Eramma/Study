
const PLANNER_KEY = "study_assistant_planner";
const USER_KEY = "user";

const plannerForm = document.getElementById("plannerForm");

// Fixed: this ID now matches planner.html.
const plannerList = document.getElementById("taskList");


/* =========================================
   GET LOGGED-IN USER
========================================= */

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
} else {
    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error("Unable to read user data:", error);
        window.location.href = "login.html";
    }

    if (user) {
        const userId =
            user.user_id ??
            user.id ??
            user.email ??
            user.user?.id ??
            user.user?.user_id;

        /* =========================================
           GET PLANNER TASKS
        ========================================= */

        function getPlannerTasks() {
            try {
                const tasks = JSON.parse(
                    localStorage.getItem(PLANNER_KEY) || "[]"
                );

                if (!Array.isArray(tasks)) {
                    return [];
                }

                return tasks.filter(function (task) {
                    return String(task.user_id) === String(userId);
                });
            } catch (error) {
                console.error("Unable to read planner tasks:", error);
                return [];
            }
        }

        /* =========================================
           SAVE PLANNER TASKS
        ========================================= */

        function savePlannerTasks(tasks) {
            try {
                const allTasks = JSON.parse(
                    localStorage.getItem(PLANNER_KEY) || "[]"
                );

                const safeTasks = Array.isArray(allTasks)
                    ? allTasks
                    : [];

                const otherUsersTasks = safeTasks.filter(
                    function (task) {
                        return String(task.user_id) !== String(userId);
                    }
                );

                localStorage.setItem(
                    PLANNER_KEY,
                    JSON.stringify([
                        ...otherUsersTasks,
                        ...tasks
                    ])
                );

                return true;
            } catch (error) {
                console.error("Unable to save planner tasks:", error);
                alert("Unable to save your study task. Please try again.");
                return false;
            }
        }

        /* =========================================
           ADD NEW TASK
        ========================================= */

        function addTask(taskData) {
            const tasks = getPlannerTasks();

            const newTask = {
                id: Date.now().toString(),
                user_id: userId,
                subject: taskData.subject,
                task: taskData.task,
                study_date: taskData.study_date,
                study_time: taskData.study_time
            };

            tasks.push(newTask);

            if (savePlannerTasks(tasks)) {
                loadTasks();
                return true;
            }

            return false;
        }

        /* =========================================
           DELETE TASK
        ========================================= */

        function deleteTask(taskId) {
            const tasks = getPlannerTasks();

            const updatedTasks = tasks.filter(function (task) {
                return String(task.id) !== String(taskId);
            });

            if (savePlannerTasks(updatedTasks)) {
                loadTasks();
            }
        }

        /* =========================================
           CREATE TASK ELEMENT
        ========================================= */

        function createTaskElement(task) {
            const item = document.createElement("div");
            item.className = "planner-task";

            const subject = document.createElement("h3");
            subject.textContent = task.subject || "Untitled subject";

            const taskText = document.createElement("p");
            taskText.textContent = task.task || "";

            const date = document.createElement("p");
            date.textContent = `Date: ${task.study_date || "Not set"}`;

            const time = document.createElement("p");
            time.textContent = `Time: ${task.study_time || "Not set"}`;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                const confirmed = window.confirm(
                    "Are you sure you want to delete this study task?"
                );

                if (confirmed) {
                    deleteTask(task.id);
                }
            });

            item.appendChild(subject);
            item.appendChild(taskText);
            item.appendChild(date);
            item.appendChild(time);
            item.appendChild(deleteButton);

            return item;
        }

        /* =========================================
           LOAD AND DISPLAY TASKS
        ========================================= */

        function loadTasks() {
            if (!plannerList) {
                console.error(
                    'Task container "#taskList" was not found.'
                );
                return;
            }

            plannerList.innerHTML = "";

            const tasks = getPlannerTasks();

            if (tasks.length === 0) {
                const message = document.createElement("div");
                message.className = "empty-tasks";

                const paragraph = document.createElement("p");
                paragraph.textContent = "No study tasks added yet.";

                message.appendChild(paragraph);
                plannerList.appendChild(message);

                return;
            }

            // Sort tasks by scheduled date and time.
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
        }

        /* =========================================
           FORM SUBMISSION
        ========================================= */

        if (plannerForm) {
            plannerForm.addEventListener("submit", function (event) {
                event.preventDefault();

                const subject = document.getElementById("subject");
                const task = document.getElementById("task");
                const studyDate = document.getElementById("studyDate");
                const studyTime = document.getElementById("studyTime");

                if (!subject || !task || !studyDate || !studyTime) {
                    console.error("One or more planner fields are missing.");
                    return;
                }

                if (
                    !subject.value.trim() ||
                    !task.value.trim() ||
                    !studyDate.value ||
                    !studyTime.value
                ) {
                    alert("Please fill in all fields.");
                    return;
                }

                const saved = addTask({
                    subject: subject.value.trim(),
                    task: task.value.trim(),
                    study_date: studyDate.value,
                    study_time: studyTime.value
                });

                if (saved) {
                    plannerForm.reset();
                }
            });
        } else {
            console.error('Planner form "#plannerForm" was not found.');
        }

        /* =========================================
           START
        ========================================= */

        loadTasks();
    }
}