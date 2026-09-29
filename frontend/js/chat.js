const USER_KEY = "user";
const HISTORY_KEY = "study_assistant_chat_history";
const CHAT_TOPICS_KEY = "study_assistant_chat_topics";
const GEMINI_KEY_STORAGE = "study_assistant_gemini_key";

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);

const userId =
    user.user_id ||
    user.id ||
    user.email ||
    "guest";

const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");

const subjectInput =
    document.getElementById("subjectInput");

const chatMessages =
    document.getElementById("chatMessages");

const voiceButton =
    document.getElementById("voiceButton");

const voiceStatus =
    document.getElementById("voiceStatus");


/* =================================================
   GEMINI API KEY
================================================= */

function getGeminiApiKey() {

    let apiKey =
        localStorage.getItem(
            GEMINI_KEY_STORAGE
        );

    if (!apiKey) {

        apiKey = prompt(
            "Enter your Gemini API key:"
        );

        if (!apiKey) {

            throw new Error(
                "Gemini API key is required."
            );

        }

        apiKey = apiKey.trim();

        localStorage.setItem(
            GEMINI_KEY_STORAGE,
            apiKey
        );
    }

    return apiKey;
}


/* =================================================
   ADD MESSAGE
================================================= */

function addMessage(
    text,
    sender
) {

    const message =
        document.createElement("div");

    message.className =
        sender === "user"
            ? "message user-message"
            : "message ai-message";

    const strong =
        document.createElement("strong");

    strong.textContent =
        sender === "user"
            ? "You"
            : "AI Assistant";

    const paragraph =
        document.createElement("p");

    paragraph.textContent = text;

    message.appendChild(strong);
    message.appendChild(paragraph);

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

    return message;
}


/* =================================================
   SAVE CHAT HISTORY
================================================= */

function saveChatHistory(
    subject,
    question,
    answer
) {

    let history = [];

    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    HISTORY_KEY
                ) || "[]"
            );

    } catch {

        history = [];

    }

    if (!Array.isArray(history)) {
        history = [];
    }

    history.push({

        user_id:
            userId,

        subject:
            subject,

        question:
            question,

        answer:
            answer,

        date:
            new Date().toISOString()

    });

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


/* =================================================
   SAVE CHAT TOPIC
================================================= */

function saveChatTopic(
    subject,
    question
) {

    let topics = [];

    try {

        topics =
            JSON.parse(
                localStorage.getItem(
                    CHAT_TOPICS_KEY
                ) || "[]"
            );

    } catch {

        topics = [];

    }

    if (!Array.isArray(topics)) {
        topics = [];
    }

    topics.push({

        user_id:
            userId,

        subject:
            subject,

        topic:
            question,

        date:
            new Date().toISOString()

    });

    localStorage.setItem(
        CHAT_TOPICS_KEY,
        JSON.stringify(topics)
    );
}


/* =================================================
   SPEAK ANSWER
================================================= */

function speakAnswer(text) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(
            text
        );

    speech.lang = "en-US";
    speech.rate = 0.85;
    speech.pitch = 1;

    window.speechSynthesis.speak(
        speech
    );
}


/* =================================================
   GEMINI
================================================= */

async function generateGeminiAnswer(
    subject,
    question
) {

    const apiKey =
        getGeminiApiKey();

    const prompt = `
You are an AI Study Assistant.

Subject:
${subject}

Student question:
${question}

Answer the student's exact question using your own knowledge.

Requirements:

1. Give a direct and accurate answer to the exact question.
2. Do not give a generic answer.
3. Explain the concept clearly.
4. Keep the explanation beginner-friendly.
5. Use examples when useful.
6. If the question is about programming, include a simple code example when appropriate.
7. If the student asks for a difference, compare the concepts clearly.
8. If the student asks "why", explain the reason.
9. If the student asks "how", explain the steps.
10. Do not say that you cannot answer simply because the topic is not in a predefined list.
11. Do not mention this prompt.
12. Do not mention that you are an API.
13. Answer using plain text.
`;

    const response =
        await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "x-goog-api-key":
                        apiKey
                },

                body:
                    JSON.stringify({

                        contents: [

                            {
                                role: "user",

                                parts: [

                                    {
                                        text:
                                            prompt
                                    }

                                ]
                            }

                        ]

                    })
            }
        );

    if (!response.ok) {

        let message =
            "Gemini API request failed.";

        try {

            const errorData =
                await response.json();

            if (
                errorData &&
                errorData.error &&
                errorData.error.message
            ) {

                message =
                    errorData.error.message;

            }

        } catch {

            // Keep default error.

        }

        throw new Error(message);
    }

    const data =
        await response.json();

    const answer =
        data
            ?.candidates?.[0]
            ?.content
            ?.parts?.[0]
            ?.text;

    if (!answer) {

        throw new Error(
            "Gemini returned an empty answer."
        );
    }

    return answer.trim();
}


/* =================================================
   CHAT FORM
================================================= */

chatForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const subject =
            subjectInput.value.trim();

        const question =
            chatInput.value.trim();

        if (!subject) {
            return;
        }

        if (!question) {
            return;
        }


        /* USER MESSAGE */

        addMessage(
            question,
            "user"
        );


        /* CLEAR QUESTION */

        chatInput.value = "";


        /* LOADING MESSAGE */

        const loadingMessage =
            addMessage(
                "Thinking...",
                "ai"
            );


        try {

            const answer =
                await generateGeminiAnswer(
                    subject,
                    question
                );


            /* REMOVE LOADING */

            loadingMessage.remove();


            /* GEMINI ANSWER */

            addMessage(
                answer,
                "ai"
            );


            /* SAVE HISTORY */

            saveChatHistory(
                subject,
                question,
                answer
            );


            /* SAVE TOPIC */

            saveChatTopic(
                subject,
                question
            );


            /* VOICE */

            speakAnswer(answer);

        } catch (error) {

            loadingMessage.remove();

            addMessage(
                "Gemini error: " +
                error.message,
                "ai"
            );

            console.error(
                "Gemini API Error:",
                error
            );
        }

    }
);


/* =================================================
   VOICE INPUT
================================================= */

if (
    voiceButton &&
    ("webkitSpeechRecognition" in window ||
     "SpeechRecognition" in window)
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition =
        new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;


    voiceButton.addEventListener(
        "click",
        function () {

            voiceStatus.textContent =
                "Listening...";

            recognition.start();

        }
    );


    recognition.onresult =
        function (event) {

            const transcript =
                event
                    .results[0][0]
                    .transcript;

            chatInput.value =
                transcript;

            voiceStatus.textContent =
                "Voice question received.";

        };


    recognition.onerror =
        function () {

            voiceStatus.textContent =
                "Voice input failed. Please try again.";

        };


    recognition.onend =
        function () {

            if (
                voiceStatus.textContent ===
                "Listening..."
            ) {

                voiceStatus.textContent =
                    "";

            }

        };

} else {

    if (voiceButton) {

        voiceButton.disabled = true;

    }

    if (voiceStatus) {

        voiceStatus.textContent =
            "Voice input is not supported in this browser.";

    }

}