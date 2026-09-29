const USER_KEY = "user";
const HISTORY_KEY = "study_assistant_chat_history";
const CHAT_TOPICS_KEY = "study_assistant_chat_topics";
const GEMINI_KEY_STORAGE = "study_assistant_gemini_key";


/* =================================================
   USER
================================================= */

const userData =
    localStorage.getItem(USER_KEY);

if (!userData) {

    window.location.href =
        "login.html";
}

let user = {};

try {

    user =
        JSON.parse(userData);

} catch {

    user = {};

}

const userId =
    user.user_id ||
    user.id ||
    user.email ||
    "guest";


/* =================================================
   ELEMENTS
================================================= */

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


/* =================================================
   GET GEMINI API KEY
================================================= */

function getGeminiApiKey() {

    let apiKey =
        localStorage.getItem(
            GEMINI_KEY_STORAGE
        );

    /*
       If the key already exists,
       use it without showing the popup.
    */

    if (apiKey) {

        return apiKey;

    }


    /*
       Ask only the first time.
    */

    apiKey = prompt(
        "Enter your Gemini API key once:"
    );


    if (!apiKey) {

        throw new Error(
            "Gemini API key is required."
        );

    }


    apiKey =
        apiKey.trim();


    /*
       Save the key in the browser.
       The popup will not appear again
       on this browser unless the key
       is removed.
    */

    localStorage.setItem(
        GEMINI_KEY_STORAGE,
        apiKey
    );


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
        document.createElement(
            "div"
        );


    if (sender === "user") {

        message.className =
            "message user-message";

    } else {

        message.className =
            "message ai-message";

    }


    const strong =
        document.createElement(
            "strong"
        );


    if (sender === "user") {

        strong.textContent =
            "You";

    } else {

        strong.textContent =
            "AI Assistant";

    }


    const paragraph =
        document.createElement(
            "p"
        );


    paragraph.textContent =
        text;


    message.appendChild(
        strong
    );

    message.appendChild(
        paragraph
    );


    chatMessages.appendChild(
        message
    );


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
   VOICE OUTPUT
================================================= */

function speakAnswer(text) {

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


/* =================================================
   GEMINI AI
================================================= */

async function generateGeminiAnswer(
    subject,
    question
) {

    /*
       Get the saved Gemini key.
       The popup appears only if
       there is no saved key.
    */

    const apiKey =
        getGeminiApiKey();


    /*
       Prompt sent to Gemini.
       There are NO predefined answers here.
    */

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
8. If the student asks why, explain the reason.
9. If the student asks how, explain the steps.
10. Answer questions even when the topic is not predefined in this application.
11. Do not use hard-coded answers.
12. Do not mention this prompt.
13. Do not mention that you are an API.
14. Return only the educational answer.
`;


    /*
       Send the question directly
       to Gemini.
    */

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


    /*
       Check Gemini response.
    */

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


    /*
       Convert Gemini response
       into JavaScript data.
    */

    const data =
        await response.json();


    /*
       Get the answer generated
       by Gemini.
    */

    const answer =
        data
            ?.candidates?.[0]
            ?.content?.parts?.[0]
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

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const subject =
                subjectInput.value.trim();


            const question =
                chatInput.value.trim();


            if (!subject) {

                subjectInput.focus();

                return;

            }


            if (!question) {

                chatInput.focus();

                return;

            }


            /*
               Show student's question.
            */

            addMessage(
                question,
                "user"
            );


            /*
               Clear question box.
            */

            chatInput.value =
                "";


            /*
               Show loading message.
            */

            const loadingMessage =
                addMessage(
                    "Thinking...",
                    "ai"
                );


            try {

                /*
                   Ask Gemini.
                */

                const answer =
                    await generateGeminiAnswer(
                        subject,
                        question
                    );


                /*
                   Remove loading message.
                */

                loadingMessage.remove();


                /*
                   Display Gemini's
                   actual answer.
                */

                addMessage(
                    answer,
                    "ai"
                );


                /*
                   Save Gemini answer
                   to History.
                */

                saveChatHistory(
                    subject,
                    question,
                    answer
                );


                /*
                   Save topic.
                */

                saveChatTopic(
                    subject,
                    question
                );


                /*
                   Speak Gemini answer.
                */

                speakAnswer(
                    answer
                );

            } catch (error) {

                /*
                   Remove loading message.
                */

                loadingMessage.remove();


                /*
                   Display Gemini error.
                */

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

}


/* =================================================
   VOICE INPUT
================================================= */

if (
    voiceButton &&
    (
        "webkitSpeechRecognition"
        in window ||
        "SpeechRecognition"
        in window
    )
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


    /*
       Voice button clicked.
    */

    voiceButton.addEventListener(
        "click",
        function () {

            if (voiceStatus) {

                voiceStatus.textContent =
                    "Listening...";

            }


            recognition.start();

        }
    );


    /*
       Voice result received.
    */

    recognition.onresult =
        function (event) {

            const transcript =
                event
                    .results[0][0]
                    .transcript;


            chatInput.value =
                transcript;


            if (voiceStatus) {

                voiceStatus.textContent =
                    "Voice question received.";

            }

        };


    /*
       Voice error.
    */

    recognition.onerror =
        function () {

            if (voiceStatus) {

                voiceStatus.textContent =
                    "Voice input failed. Please try again.";

            }

        };


    /*
       Voice recognition ended.
    */

    recognition.onend =
        function () {

            if (
                voiceStatus &&
                voiceStatus.textContent ===
                "Listening..."
            ) {

                voiceStatus.textContent =
                    "";

            }

        };

} else {

    /*
       Browser does not support
       speech recognition.
    */

    if (voiceButton) {

        voiceButton.disabled =
            true;

    }


    if (voiceStatus) {

        voiceStatus.textContent =
            "Voice input is not supported in this browser.";

    }

}