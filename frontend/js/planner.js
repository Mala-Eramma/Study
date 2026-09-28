const plannerForm =
    document.getElementById("plannerForm");

const taskList =
    document.getElementById("taskList");

const API_URL = "http://localhost:8000";


// Get logged-in student
const userData =
    localStorage.getItem("user");

if (!userData) {

    window.location.href =
        "login.html";

}

const user =
    JSON.parse(userData);

const userId =
    user.user.id;


// Load study tasks
async function loadTasks() {

    try {

        const response = await fetch(
            `${API_URL}/planner/?user_id=${userId}`
        );

        const tasks =
            await response.json();

        taskList.innerHTML = "";

        if (tasks.length === 0) {

            taskList.innerHTML = `
                <div class="empty-tasks">
                    <p>
                        No study tasks added yet.
                    </p>
                </div>
            `;

            return;
        }

        tasks.forEach(function (task) {

            addTaskToPage(task);

        });

    } catch (error) {

        console.error(error);

    }

}


// Display task
function addTaskToPage(task) {

    const taskItem =
        document.createElement("div");

    taskItem.className =
        "study-task";

    const taskContent =
        document.createElement("div");

    const heading =
        document.createElement("h3");

    heading.textContent =
        task.subject;

    const taskText =
        document.createElement("p");

    taskText.textContent =
        `Task: ${task.task}`;

    const dateText =
        document.createElement("p");

    dateText.textContent =
        `Date: ${task.study_date}`;

    const timeText =
        document.createElement("p");

    timeText.textContent =
        `Time: ${task.study_time}`;

    taskContent.appendChild(heading);
    taskContent.appendChild(taskText);
    taskContent.appendChild(dateText);
    taskContent.appendChild(timeText);

    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.className =
        "delete-task";

    deleteButton.textContent =
        "Delete";

    deleteButton.addEventListener(
        "click",
        async function () {

            await deleteTask(task.id);

        }
    );

    taskItem.appendChild(taskContent);
    taskItem.appendChild(deleteButton);

    taskList.appendChild(taskItem);

}


// Delete task
async function deleteTask(taskId) {

    try {

        const response =
            await fetch(
                `${API_URL}/planner/${taskId}?user_id=${userId}`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {

            return;

        }

        loadTasks();

    } catch (error) {

        console.error(error);

    }

}


// Add task
plannerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const subject =
            document.getElementById("subject")
                .value.trim();

        const task =
            document.getElementById("task")
                .value.trim();

        const studyDate =
            document.getElementById("studyDate")
                .value;

        const studyTime =
            document.getElementById("studyTime")
                .value;

        if (
            !subject ||
            !task ||
            !studyDate ||
            !studyTime
        ) {

            return;

        }

        try {

            const response =
                await fetch(
                    `${API_URL}/planner/?user_id=${userId}`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            subject: subject,
                            task: task,
                            study_date: studyDate,
                            study_time: studyTime
                        })
                    }
                );

            if (!response.ok) {

                alert(
                    "Unable to add study task."
                );

                return;

            }

            plannerForm.reset();

            loadTasks();

        } catch (error) {

            alert(
                "Unable to connect to the server."
            );

            console.error(error);

        }

    }
);


loadTasks();