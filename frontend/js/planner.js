
const PLANNER_KEY = "study_assistant_planner";
const USER_KEY = "user";

const plannerForm = document.getElementById("plannerForm");
const plannerList = document.getElementById("taskList");


/* =========================================
   GET LOGGED-IN USER
========================================= */

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
} else {
    let user = null;

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

        const REMINDER_KEY =
            "study_assistant_planner_reminders_" + String(userId);

        /* =========================================
           GET PLANNER TASKS
        ========================================= */

        function getAllTasks() {
            try {
                const tasks = JSON.parse(
                    localStorage.getItem(PLANNER_KEY) || "[]"
                );

                return Array.isArray(tasks) ? tasks : [];
            } catch (error) {
                console.error("Unable to read planner tasks:", error);
                return [];
            }
        }

        function getPlannerTasks() {
            return getAllTasks().filter(function (task) {
                return String(task.user_id) === String(userId);
            });
        }

        /* =========================================
           SAVE PLANNER TASKS
        ========================================= */

        function savePlannerTasks(tasks) {
            try {
                const allTasks = getAllTasks();

                const otherUsersTasks = allTasks.filter(function (task) {
                    return String(task.user_id) !== String(userId);
                });

                localStorage.setItem(
                    PLANNER_KEY,
                    JSON.stringify([...otherUsersTasks, ...tasks])
                );

                return true;
            } catch (error) {
                console.error("Unable to save planner tasks:", error);
                alert("Unable to save your study task. Please try again.");
                return false;
            }
        }

        /* =========================================
           REMINDER STATUS
        ========================================= */

        const reminderStatus = document.createElement("p");
        reminderStatus.style.margin = "12px 0";
        reminderStatus.style.fontSize = "14px";
        reminderStatus.style.color = "#344563";
        reminderStatus.setAttribute("role", "status");

        const reminderButton = document.createElement("button");
        reminderButton.type = "button";
        reminderButton.textContent = "Enable Study Reminders";
        reminderButton.style.margin = "8px 0 16px";
        reminderButton.style.padding = "10px 16px";
        reminderButton.style.backgroundColor = "darkblue";
        reminderButton.style.color = "white";
        reminderButton.style.border = "none";
        reminderButton.style.borderRadius = "8px";
        reminderButton.style.cursor = "pointer";

        if (plannerForm) {
            plannerForm.insertAdjacentElement("afterend", reminderButton);
            reminderButton.insertAdjacentElement("afterend", reminderStatus);
        }

        function updateReminderStatus(message, color) {
            reminderStatus.textContent = message;
            reminderStatus.style.color = color || "#344563";
        }

        function updatePermissionStatus() {
            if (!("Notification" in window)) {
                reminderButton.disabled = true;
                reminderButton.textContent = "Reminders Not Supported";

                updateReminderStatus(
                    "This browser does not support notifications.",
                    "#b42318"
                );
                return;
            }

            if (Notification.permission === "granted") {
                reminderButton.textContent = "Reminders Enabled";
                updateReminderStatus(
                    "Study reminders are enabled. Keep this page open.",
                    "#18794e"
                );
            } else if (Notification.permission === "denied") {
                reminderButton.textContent = "Notifications Blocked";

                updateReminderStatus(
                    "Notifications are blocked. Allow them in your browser's site settings.",
                    "#b42318"
                );
            } else {
                reminderButton.textContent = "Enable Study Reminders";

                updateReminderStatus(
                    "Enable notifications to receive reminders when tasks are due.",
                    "#344563"
                );
            }
        }

        /* =========================================
           ENABLE BROWSER NOTIFICATIONS
        ========================================= */

        reminderButton.addEventListener("click", async function () {
            if (!("Notification" in window)) {
                updatePermissionStatus();
                return;
            }

            try {
                if (Notification.permission === "default") {
                    await Notification.requestPermission();
                }

                updatePermissionStatus();

                if (Notification.permission === "granted") {
                    checkDueReminders();
                }
            } catch (error) {
                console.error("Notification permission error:", error);

                updateReminderStatus(
                    "Unable to enable notifications in this browser.",
                    "#b42318"
                );
            }
        });

        /* =========================================
           GET ALREADY-SENT REMINDERS
        ========================================= */

        function getSentReminders() {
            try {
                const reminders = JSON.parse(
                    localStorage.getItem(REMINDER_KEY) || "[]"
                );

                return Array.isArray(reminders) ? reminders : [];
            } catch (error) {
                console.error("Unable to read reminder history:", error);
                return [];
            }
        }

        function saveSentReminders(reminders) {
            try {
                localStorage.setItem(
                    REMINDER_KEY,
                    JSON.stringify(reminders)
                );
            } catch (error) {
                console.error("Unable to save reminder history:", error);
            }
        }

        /* =========================================
           CHECK AND SEND DUE REMINDERS
        ========================================= */

        function checkDueReminders() {
            if (
                !("Notification" in window) ||
                Notification.permission !== "granted"
            ) {
                return;
            }

            const tasks = getPlannerTasks();
            const sentReminders = getSentReminders();
            const now = Date.now();

            tasks.forEach(function (task) {
                if (
                    !task.id ||
                    !task.study_date ||
                    !task.study_time
                ) {
                    return;
                }

                const scheduledTime = new Date(
                    `${task.study_date}T${task.study_time}`
                ).getTime();

                if (
                    Number.isNaN(scheduledTime) ||
                    scheduledTime > now ||
                    sentReminders.includes(String(task.id))
                ) {
                    return;
                }

                try {
                    const notification = new Notification(
                        "Study Planner Reminder",
                        {
                            body:
                                `${task.subject}: ${task.task}\n` +
                                `Scheduled for ${task.study_date} at ${task.study_time}.`
                        }
                    );

                    notification.onclick = function () {
                        window.focus();
                        notification.close();
                    };

                    sentReminders.push(String(task.id));
                    saveSentReminders(sentReminders);
                } catch (error) {
                    console.error("Unable to send reminder:", error);
                }
            });
        }

        /* =========================================
           ADD NEW TASK
        ========================================= */

        function addTask(taskData) {
            const tasks = getPlannerTasks();

            const newTask = {
                id:
                    Date.now().toString() +
                    "-" +
                    Math.random().toString(36).slice(2, 8),
                user_id: userId,
                subject: taskData.subject,
                task: taskData.task,
                study_date: taskData.study_date,
                study_time: taskData.study_time
            };

            tasks.push(newTask);

            if (savePlannerTasks(tasks)) {
                loadTasks();
                checkDueReminders();
                return true;
            }

            return false;
        }

        /* =========================================
           DELETE INDIVIDUAL TASK
        ========================================= */

        function deleteTask(taskId) {
            const tasks = getPlannerTasks();

            const updatedTasks = tasks.filter(function (task) {
                return String(task.id) !== String(taskId);
            });

            if (savePlannerTasks(updatedTasks)) {
                const sentReminders = getSentReminders().filter(
                    function (id) {
                        return String(id) !== String(taskId);
                    }
                );

                saveSentReminders(sentReminders);
                loadTasks();
            }
        }

        /* =========================================
           CREATE TASK CARD
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
                if (
                    window.confirm(
                        "Are you sure you want to delete this study task?"
                    )
                ) {
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
                console.error('Task container "#taskList" was not found.');
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

        updatePermissionStatus();
        loadTasks();
        checkDueReminders();

        // Check every 15 seconds while this page is open.
        window.setInterval(checkDueReminders, 15000);
    }
}