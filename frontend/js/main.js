document.addEventListener("DOMContentLoaded", function () {
    console.log("AI Study Assistant loaded successfully.");

    const userData = localStorage.getItem("user");

    const protectedPages = [
        "dashboard.html",
        "chat.html",
        "history.html",
        "materials.html",
        "planner.html",
        "progress.html",
        "profile.html",
        "quiz.html"
    ];

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();

    if (
        protectedPages.includes(currentPage) &&
        !userData
    ) {
        window.location.href = "login.html";
    }
});