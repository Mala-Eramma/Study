const API_URL = "http://localhost:8000";

const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);
const userId = user.user.id;

const taskCount = document.getElementById("taskCount");
const quizScore = document.getElementById("quizScore");
const materialCount = document.getElementById("materialCount");
const progressBar = document.getElementById("progressBar");
const progressMessage = document.getElementById("progressMessage");
const studySummary = document.getElementById("studySummary");


/* =========================================================
   Load Progress
   ========================================================= */

async function loadProgress() {

    try {

        const response = await fetch(
            `${API_URL}/progress/?user_id=${userId}`
        );

        if (!response.ok) {
            throw new Error("Unable to load progress.");
        }

        const data = await response.json();

        taskCount.textContent = data.study_tasks;
        quizScore.textContent = `${data.quiz_score}%`;
        materialCount.textContent = data.materials;

        let progress = 0;

        if (data.study_tasks > 0) {
            progress += 40;
        }

        if (data.materials > 0) {
            progress += 30;
        }

        if (data.quiz_score > 0) {
            progress += 30;
        }

        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;

        if (progress === 0) {

            progressMessage.textContent =
                "Start studying to track your progress.";

        } else if (progress < 50) {

            progressMessage.textContent =
                "Good start. Keep studying consistently.";

        } else if (progress < 80) {

            progressMessage.textContent =
                "You are making good progress. Keep going.";

        } else {

            progressMessage.textContent =
                "Excellent progress. Keep learning!";
        }

    } catch (error) {

        console.error("Progress error:", error);

        progressMessage.textContent =
            "Unable to load your progress.";
    }
}


/* =========================================================
   Load Study Summary
   ========================================================= */

async function loadStudySummary() {

    try {

        const response = await fetch(
            `${API_URL}/progress/summary?user_id=${userId}`
        );

        if (!response.ok) {
            throw new Error("Unable to load study summary.");
        }

        const activities = await response.json();

        studySummary.innerHTML = "";


        if (
            !Array.isArray(activities) ||
            activities.length === 0
        ) {

            studySummary.innerHTML = `
                <p>No learning activity recorded yet.</p>
            `;

            return;
        }


        /* =====================================================
           Summary Grid
           ===================================================== */

        studySummary.style.display = "grid";

        studySummary.style.gridTemplateColumns =
            "repeat(2, minmax(0, 1fr))";

        studySummary.style.gap = "25px";

        studySummary.style.backgroundColor =
            "transparent";

        studySummary.style.padding = "0";


        /* =====================================================
           Group Activities By Subject
           ===================================================== */

        const subjects = {};


        activities.forEach(function (activity) {

            const subject =
                activity.subject || "Other";


            if (!subjects[subject]) {

                subjects[subject] = [];

            }


            subjects[subject].push(
                activity
            );

        });


        /* =====================================================
           Create One Grid Card For Each Subject
           ===================================================== */

        Object.keys(subjects).forEach(
            function (subject) {

                const subjectCard =
                    document.createElement("div");


                subjectCard.style.backgroundColor =
                    "white";

                subjectCard.style.color =
                    "black";

                subjectCard.style.padding =
                    "25px";

                subjectCard.style.borderRadius =
                    "15px";

                subjectCard.style.borderLeft =
                    "6px solid darkblue";

                subjectCard.style.boxShadow =
                    "0 6px 18px rgba(0, 0, 0, 0.18)";

                subjectCard.style.width =
                    "100%";

                subjectCard.style.boxSizing =
                    "border-box";


                /* =================================================
                   Subject Heading
                   ================================================= */

                const subjectHeading =
                    document.createElement("h3");


                subjectHeading.textContent =
                    subject;


                subjectHeading.style.margin =
                    "0 0 20px 0";

                subjectHeading.style.color =
                    "darkblue";

                subjectHeading.style.fontSize =
                    "22px";


                subjectCard.appendChild(
                    subjectHeading
                );


                /* =================================================
                   Add All Activities Of This Subject
                   ================================================= */

                subjects[subject].forEach(
                    function (activity) {

                        const topic =
                            activity.topic ||
                            "Topic";


                        /* =========================================
                           Topic
                           ========================================= */

                        const topicHeading =
                            document.createElement("h4");


                        topicHeading.textContent =
                            topic;


                        topicHeading.style.margin =
                            "0 0 8px 0";

                        topicHeading.style.fontSize =
                            "17px";

                        topicHeading.style.color =
                            "black";


                        subjectCard.appendChild(
                            topicHeading
                        );


                        /* =========================================
                           Activity
                           ========================================= */

                        const activityText =
                            document.createElement("p");


                        activityText.textContent =
                            activity.activity || "";


                        activityText.style.margin =
                            "0 0 12px 0";

                        activityText.style.fontSize =
                            "15px";

                        activityText.style.lineHeight =
                            "1.6";

                        activityText.style.color =
                            "black";


                        subjectCard.appendChild(
                            activityText
                        );


                        /* =========================================
                           Learned Content
                           ========================================= */

                        if (
                            activity.learned_content
                        ) {

                            const learnedContent =
                                document.createElement("p");


                            learnedContent.textContent =
                                activity.learned_content;


                            learnedContent.style.margin =
                                "0 0 20px 0";

                            learnedContent.style.fontSize =
                                "15px";

                            learnedContent.style.lineHeight =
                                "1.6";

                            learnedContent.style.color =
                                "black";


                            subjectCard.appendChild(
                                learnedContent
                            );

                        }

                    }
                );


                /* =================================================
                   Add Subject Card To Grid
                   ================================================= */

                studySummary.appendChild(
                    subjectCard
                );

            }
        );

    } catch (error) {

        console.error(
            "Study summary error:",
            error
        );

        studySummary.innerHTML = `
            <p>Unable to load your learning activity.</p>
        `;
    }
}


/* =========================================================
   Mobile Layout
   ========================================================= */

window.addEventListener(
    "resize",
    function () {

        if (window.innerWidth <= 600) {

            studySummary.style.gridTemplateColumns =
                "1fr";

        } else {

            studySummary.style.gridTemplateColumns =
                "repeat(2, minmax(0, 1fr))";
        }

    }
);


/* =========================================================
   Start
   ========================================================= */

loadProgress();
loadStudySummary();