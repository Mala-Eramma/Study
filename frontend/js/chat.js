const USER_KEY = "user";
const HISTORY_KEY = "study_assistant_chat_history";
const CHAT_TOPICS_KEY = "study_assistant_chat_topics";

/* =====================================================
   GEMINI API
===================================================== */

/*
    IMPORTANT:
    Do NOT put your real Gemini API key in GitHub.

    For GitHub Pages testing, enter your Gemini API key
    when prompted. It will be kept only in this browser.
*/

const GEMINI_KEY_STORAGE = "study_assistant_gemini_key";

function getGeminiApiKey() {

    let apiKey =
        localStorage.getItem(
            GEMINI_KEY_STORAGE
        );

    if (!apiKey) {

        apiKey =
            prompt(
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


/* =====================================================
   USER
===================================================== */

const userData =
    localStorage.getItem(USER_KEY);

if (!userData) {

    window.location.href =
        "login.html";

    throw new Error(
        "User is not logged in."
    );
}

const user =
    JSON.parse(userData);

const userId =
    user.user_id ||
    user.id ||
    user.email;


/* =====================================================
   ELEMENTS
===================================================== */

const chatForm =
    document.getElementById(
        "chatForm"
    );

const chatInput =
    document.getElementById(
        "chatInput"
    );

const subjectInput =
    document.getElementById(
        "subjectInput"
    );

const chatMessages =
    document.getElementById(
        "chatMessages"
    );

const voiceButton =
    document.getElementById(
        "voiceButton"
    );

const voiceStatus =
    document.getElementById(
        "voiceStatus"
    );


/* =====================================================
   ADD MESSAGE
===================================================== */

function addMessage(
    text,
    sender
) {

    const message =
        document.createElement(
            "div"
        );

    message.className =
        sender === "user"
            ? "message user-message"
            : "message ai-message";

    message.textContent =
        text;

    chatMessages.appendChild(
        message
    );

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =====================================================
   SAVE CHAT HISTORY
===================================================== */

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


/* =====================================================
   SAVE TOPICS
===================================================== */

function saveChatTopic(
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


/* =====================================================
   GEMINI ANSWER
===================================================== */

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

Give a clear, accurate, beginner-friendly educational answer.

Requirements:

1. Answer the exact question asked.
2. Do not give a generic response.
3. Explain the concept clearly.
4. Use simple examples when useful.
5. If the question is about programming, include a simple code example when appropriate.
6. Do not mention that you are an API.
7. Do not mention this prompt.
8. Keep the answer suitable for a student.
9. Use plain text formatting.
`;

    const response =
    await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {

            method:
                "POST",

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

                            role:
                                "user",

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

        let errorMessage =
            "Gemini API request failed.";

        try {

            const errorData =
                await response.json();

            if (
                errorData &&
                errorData.error &&
                errorData.error.message
            ) {

                errorMessage =
                    errorData.error.message;

            }

        } catch {

            // Keep default error message.

        }

        throw new Error(
            errorMessage
        );
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


/* =====================================================
   SPEAK ANSWER
===================================================== */

function speakAnswer(
    text
) {

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {

        return;

    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(
            text
        );

    speech.lang =
        "en-US";

    speech.rate =
        0.85;

    speech.pitch =
        1;

    window.speechSynthesis.speak(
        speech
    );
}


/* =====================================================
   ASK QUESTION
===================================================== */

chatForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const subject =
            subjectInput.value.trim();

        const question =
            chatInput.value.trim();


        if (!subject) {

            alert(
                "Please enter a subject."
            );

            subjectInput.focus();

            return;
        }


        if (!question) {

            return;

        }


        /* SHOW USER QUESTION */

        addMessage(
            question,
            "user"
        );


        /* CLEAR INPUT */

        chatInput.value =
            "";


        /* SHOW LOADING MESSAGE */

        addMessage(
            "Thinking...",
            "ai"
        );


        const aiMessages =
            chatMessages.querySelectorAll(
                ".ai-message"
            );

        const loadingMessage =
            aiMessages[
                aiMessages.length - 1
            ];


        try {

            /* =========================================
               SEND QUESTION TO GEMINI
            ========================================= */

            const answer =
                await generateGeminiAnswer(
                    subject,
                    question
                );


            /* REMOVE LOADING TEXT */

            loadingMessage.textContent =
                answer;


            /* =========================================
               SAVE HISTORY
            ========================================= */

            saveChatHistory(
                subject,
                question,
                answer
            );


            saveChatTopic(
                question
            );


            /* =========================================
               VOICE ANSWER
            ========================================= */

            speakAnswer(
                answer
            );

        }

        catch (error) {

            console.error(
                "Gemini error:",
                error
            );


            loadingMessage.textContent =
                "Unable to generate the answer from Gemini. "
                + error.message;

        }

    }
);


/* =====================================================
   VOICE INPUT
===================================================== */

if (
    "webkitSpeechRecognition"
    in window ||
    "SpeechRecognition"
    in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    voiceButton.addEventListener(
        "click",
        function () {

            try {

                recognition.start();

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "Listening...";

                }

            }

            catch (error) {

                console.log(
                    "Voice recognition already running."
                );

            }

        }
    );


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0]
                    .transcript;


            chatInput.value =
                transcript;


            if (voiceStatus) {

                voiceStatus.textContent =
                    "Voice captured.";

            }

        };


    recognition.onstart =
        function () {

            if (voiceStatus) {

                voiceStatus.textContent =
                    "Listening...";

            }

        };


    recognition.onend =
        function () {

            if (voiceStatus) {

                voiceStatus.textContent =
                    "";

            }

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            if (voiceStatus) {

                voiceStatus.textContent =
                    "Voice recognition error. Please try again.";

            }

        };

}

else {

    if (voiceButton) {

        voiceButton.disabled =
            true;

        voiceButton.title =
            "Voice recognition is not supported in this browser.";

    }

}


/* =====================================================
   CHAT STARTS FRESH
===================================================== */

/*
    Previous chats remain saved in localStorage.

    They are used by the History page.

    Previous chats are NOT loaded automatically
    when the Chat page opens.
*/