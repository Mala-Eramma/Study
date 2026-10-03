async function addTask() {
    const values = getFormValues();

    if (!values.subject || !values.description || !values.date || !values.time) {
        showMessage("Please fill in all task details.", "error");
        return;
    }

    const form = getTaskForm();
    const submitButton =
        form?.querySelector('button[type="submit"]') ||
        findElement(["#addTaskBtn", "#addTask", "#add-task", ".add-task-btn"]);

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

        if (!result || !result.task_id) {
            throw new Error("Task save confirmation was not received from the server.");
        }

        showMessage("Study task saved successfully.", "success");

        if (values.subjectInput) values.subjectInput.value = "";
        if (values.taskInput) values.taskInput.value = "";
        if (values.dateInput) values.dateInput.value = "";
        if (values.timeInput) values.timeInput.value = "";

        await loadTasks();

    } catch (error) {
        console.error("Unable to save study task:", error);
        showMessage(error.message || "Unable to save the study task.", "error");
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}