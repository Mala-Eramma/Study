const PLANNER_KEY = "study_assistant_planner";
const USER_KEY = "user";

const plannerForm =
    document.getElementById("plannerForm");

const plannerList =
    document.getElementById("plannerList");

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);

const userId = user.user_id;

function getPlannerTasks() {
    const tasks = JSON.parse(
        localStorage.getItem(PLANNER_KEY) || "[]"
    );

    return tasks.filter(
        task => String(task.user_id) === String(userId)
    );
}

function savePlannerTasks(tasks) {
    const allTasks = JSON.parse(
        localStorage.getItem(PLANNER_KEY) || "[]"
    );

    const otherUsersTasks = allTasks.filter(
        task => String(task.user_id) !== String(userId)
    );

    localStorage.setItem(
        PLANNER_KEY,
        JSON.stringify([
            ...otherUsersTasks,
            ...tasks
        ])
    );
}

function addTask(taskData) {
    const tasks = getPlannerTasks();

    const newTask = {
        id: Date.now(),
        user_id: userId,
        subject: taskData.subject,
        task: taskData.task,
        study_date: taskData.study_date,
        study_time: taskData.study_time
    };

    tasks.push(newTask);

    savePlannerTasks(tasks);

    loadTasks();
}

function deleteTask(taskId) {
    const tasks = getPlannerTasks();

    const updatedTasks = tasks.filter(
        task => String(task.id) !== String(taskId)
    );

    savePlannerTasks(updatedTasks);

    loadTasks();
}

function createTaskElement(task) {
    const item =
        document.createElement("div");

    item.className = "planner-task";

    const subject =
        document.createElement("h3");

    subject.textContent =
        task.subject;

    const taskText =
        document.createElement("p");

    taskText.textContent =
        task.task;

    const date =
        document.createElement("p");

    date.textContent =
        `Date: ${task.study_date}`;

    const time =
        document.createElement("p");

    time.textContent =
        `Time: ${task.study_time}`;

    const deleteButton =
        document.createElement("button");

    deleteButton.textContent =
        "Delete";

    deleteButton.addEventListener(
        "click",
        function () {
            deleteTask(task.id);
        }
    );

    item.appendChild(subject);
    item.appendChild(taskText);
    item.appendChild(date);
    item.appendChild(time);
    item.appendChild(deleteButton);

    return item;
}

function loadTasks() {
    if (!plannerList) {
        return;
    }

    plannerList.innerHTML = "";

    const tasks = getPlannerTasks();

    if (tasks.length === 0) {
        const message =
            document.createElement("p");

        message.textContent =
            "No study tasks available.";

        plannerList.appendChild(message);

        return;
    }

    tasks
        .sort(
            (a, b) =>
                new Date(
                    `${a.study_date}T${a.study_time}`
                ) -
                new Date(
                    `${b.study_date}T${b.study_time}`
                )
        )
        .forEach(task => {
            plannerList.appendChild(
                createTaskElement(task)
            );
        });
}

if (plannerForm) {
    plannerForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const subject =
                document.getElementById("subject");

            const task =
                document.getElementById("task");

            const studyDate =
                document.getElementById("studyDate");

            const studyTime =
                document.getElementById("studyTime");

            if (
                !subject ||
                !task ||
                !studyDate ||
                !studyTime
            ) {
                return;
            }

            if (
                !subject.value.trim() ||
                !task.value.trim() ||
                !studyDate.value ||
                !studyTime.value
            ) {
                return;
            }

            addTask({
                subject: subject.value.trim(),
                task: task.value.trim(),
                study_date: studyDate.value,
                study_time: studyTime.value
            });

            plannerForm.reset();
        }
    );
}

loadTasks();