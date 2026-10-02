// ============================================================
// AI STUDY ASSISTANT - CHAT
// Gemini AI + History + Voice
// GitHub Pages compatible
// No popup messages
// ============================================================


// ============================================================
// 1. STORAGE KEYS
// ============================================================

const USER_KEY = "user";
const HISTORY_KEY = "study_assistant_chat_history";
const CHAT_TOPICS_KEY = "study_assistant_chat_topics";


// ============================================================
// 2. GEMINI API KEY
// ============================================================
//
// Put your Gemini API key between the quotes.
//
// Example:
//
// Do NOT share your real API key in chat.
//

const GEMINI_API_KEY = "";


// ============================================================
// 3. GET LOGGED-IN USER
// ============================================================

const user = JSON.parse(
    localStorage.getItem(USER_KEY) || "null"
);

if (!user) {
    window.location.href = "login.html";
}


// ============================================================
// 4. GET USER ID
// ============================================================

const userId =
    user?.user_id ||
    user?.id ||
    user?.email ||
    "guest";


// ============================================================
// 5. GET CHAT ELEMENTS
// ============================================================

const chatForm =
    document.getElementById("chatForm");

const subjectInput =
    document.getElementById("subjectInput");

const chatInput =
    document.getElementById("chatInput");

const chatMessages =
    document.getElementById("chatMessages");

const voiceButton =
    document.getElementById("voiceButton");

const voiceStatus =
    document.getElementById("voiceStatus");


// ============================================================
// 6. SHOW INLINE STATUS MESSAGE
// ============================================================

function showStatusMessage(message) {

    let statusMessage =
        document.getElementById("chatStatusMessage");


    if (!statusMessage) {

        statusMessage =
            document.createElement("p");

        statusMessage.id =
            "chatStatusMessage";

        statusMessage.style.marginTop =
            "10px";

        statusMessage.style.textAlign =
            "center";

        statusMessage.style.fontSize =
            "14px";

        statusMessage.style.fontWeight =
            "500";

        chatForm.insertAdjacentElement(
            "afterend",
            statusMessage
        );
    }


    statusMessage.textContent =
        message;
}


// ============================================================
// 7. CLEAR STATUS MESSAGE
// ============================================================

function clearStatusMessage() {

    const statusMessage =
        document.getElementById(
            "chatStatusMessage"
        );


    if (statusMessage) {

        statusMessage.textContent =
            "";
    }
}


// ============================================================
// 8. ADD MESSAGE TO CHAT
// ============================================================

function addMessage(
    message,
    type
) {

    const messageDiv =
        document.createElement("div");


    messageDiv.className =
        type === "ai"
            ? "message ai-message"
            : "message user-message";


    const strong =
        document.createElement("strong");


    strong.textContent =
        type === "ai"
            ? "AI Assistant"
            : "You";


    const paragraph =
        document.createElement("p");


    paragraph.textContent =
        message;


    messageDiv.appendChild(
        strong
    );

    messageDiv.appendChild(
        paragraph
    );


    chatMessages.appendChild(
        messageDiv
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// ============================================================
// 9. SAVE CHAT HISTORY
// ============================================================

function saveChatHistory(
    subject,
    question,
    answer
) {

    const existingHistory =
        JSON.parse(
            localStorage.getItem(
                HISTORY_KEY
            ) || "[]"
        );


    const historyItem = {

        user_id: userId,

        subject: subject,

        question: question,

        answer: answer,

        created_at:
            new Date().toISOString()
    };


    existingHistory.push(
        historyItem
    );


    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
            existingHistory
        )
    );
}


// ============================================================
// 10. SAVE CHAT TOPIC
// ============================================================

function saveChatTopic(
    subject
) {

    const topics =
        JSON.parse(
            localStorage.getItem(
                CHAT_TOPICS_KEY
            ) || "[]"
        );


    if (!topics.includes(subject)) {

        topics.push(subject);


        localStorage.setItem(
            CHAT_TOPICS_KEY,
            JSON.stringify(topics)
        );
    }
}


// ============================================================
// 11. SPEAK AI ANSWER
// ============================================================

function speakAnswer(
    answer
) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            answer
        );


    speech.lang =
        "en-US";

    speech.rate =
        0.8;

    speech.pitch =
        1;


    window.speechSynthesis.speak(
        speech
    );
}


// ============================================================
// 12. GEMINI API FUNCTION
// ============================================================

async function generateGeminiAnswer(
    subject,
    question
) {

    if (
        !GEMINI_API_KEY ||
        GEMINI_API_KEY ===
        "PASTE_YOUR_GEMINI_API_KEY_HERE"
    ) {

        throw new Error(
            "Gemini API key is missing. Add your API key in chat.js."
        );
    }


    const prompt = `
You are an AI Study Assistant.

Subject:
${subject}

Student Question:
${question}

Give a clear, accurate, beginner-friendly educational answer.

Requirements:
- Explain the concept clearly.
- Use simple language.
- Give examples when useful.
- Use headings or bullet points when they improve understanding.
- Stay focused on the student's question.
- Do not mention that you are an API.
- Do not say that the answer is hard-coded.
- Do not return programming code unless the student asks for code.
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
                        GEMINI_API_KEY
                },

                body: JSON.stringify({

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

        let errorMessage =
            "Gemini API request failed.";


        try {

            const errorData =
                await response.json();


            if (
                errorData?.error?.message
            ) {

                errorMessage =
                    errorData.error.message;
            }

        } catch (error) {

            console.error(
                "Gemini error response could not be read.",
                error
            );
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
            ?.content?.parts?.[0]
            ?.text;


    if (!answer) {

        throw new Error(
            "Gemini did not return an answer."
        );
    }


    return answer.trim();
}


// ============================================================
// 13. CHAT FORM SUBMIT
// ============================================================

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            clearStatusMessage();


            const subject =
                subjectInput.value.trim();


            const question =
                chatInput.value.trim();


            // ----------------------------------------------------
            // SUBJECT VALIDATION
            // ----------------------------------------------------

            if (!subject) {

                showStatusMessage(
                    "Please enter the subject."
                );

                subjectInput.focus();

                return;
            }


            // ----------------------------------------------------
            // QUESTION VALIDATION
            // ----------------------------------------------------

            if (!question) {

                showStatusMessage(
                    "Please enter your question."
                );

                chatInput.focus();

                return;
            }


            // ----------------------------------------------------
            // SHOW USER QUESTION
            // ----------------------------------------------------

            addMessage(
                question,
                "user"
            );


            // ----------------------------------------------------
            // CLEAR QUESTION INPUT
            // ----------------------------------------------------

            chatInput.value =
                "";


            // ----------------------------------------------------
            // GET ASK BUTTON
            // ----------------------------------------------------

            const askButton =
                chatForm.querySelector(
                    'button[type="submit"]'
                );


            // ----------------------------------------------------
            // DISABLE BUTTONS
            // ----------------------------------------------------

            if (askButton) {

                askButton.disabled =
                    true;

                askButton.textContent =
                    "Thinking...";
            }


            if (voiceButton) {

                voiceButton.disabled =
                    true;
            }


            try {

                // ------------------------------------------------
                // GEMINI GENERATES ANSWER
                // ------------------------------------------------

                const answer =
                    await generateGeminiAnswer(
                        subject,
                        question
                    );


                // ------------------------------------------------
                // DISPLAY AI ANSWER
                // ------------------------------------------------

                addMessage(
                    answer,
                    "ai"
                );


                // ------------------------------------------------
                // SAVE HISTORY
                // ------------------------------------------------

                saveChatHistory(
                    subject,
                    question,
                    answer
                );


                // ------------------------------------------------
                // SAVE SUBJECT
                // ------------------------------------------------

                saveChatTopic(
                    subject
                );


                // ------------------------------------------------
                // SPEAK ANSWER
                // ------------------------------------------------

                speakAnswer(
                    answer
                );


                clearStatusMessage();

            } catch (error) {

                console.error(
                    "Gemini Error:",
                    error
                );


                // ------------------------------------------------
                // SHOW ERROR INSIDE CHAT
                // NO POPUP
                // ------------------------------------------------

                addMessage(
                    "Sorry, I could not generate an answer. " +
                    error.message,
                    "ai"
                );

            } finally {

                // ------------------------------------------------
                // ENABLE ASK BUTTON
                // ------------------------------------------------

                if (askButton) {

                    askButton.disabled =
                        false;

                    askButton.textContent =
                        "Ask";
                }


                // ------------------------------------------------
                // ENABLE VOICE BUTTON
                // ------------------------------------------------

                if (voiceButton) {

                    voiceButton.disabled =
                        false;
                }
            }

        }
    );
}


// ============================================================
// 14. VOICE INPUT
// ============================================================

let recognition =
    null;


const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    // --------------------------------------------------------
    // VOICE START
    // --------------------------------------------------------

    recognition.onstart =
        function () {

            if (voiceStatus) {

                voiceStatus.textContent =
                    "Listening...";
            }


            if (voiceButton) {

                voiceButton.classList.add(
                    "listening"
                );
            }
        };


    // --------------------------------------------------------
    // VOICE RESULT
    // --------------------------------------------------------

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
                    "Voice input received.";
            }
        };


    // --------------------------------------------------------
    // VOICE ERROR
    // --------------------------------------------------------

    recognition.onerror =
        function (event) {

            console.error(
                "Voice recognition error:",
                event.error
            );


            if (voiceStatus) {

                voiceStatus.textContent =
                    "Voice input failed. Please try again.";
            }
        };


    // --------------------------------------------------------
    // VOICE END
    // --------------------------------------------------------

    recognition.onend =
        function () {

            if (voiceButton) {

                voiceButton.classList.remove(
                    "listening"
                );
            }
        };


    // --------------------------------------------------------
    // VOICE BUTTON
    // --------------------------------------------------------

    if (voiceButton) {

        voiceButton.addEventListener(
            "click",
            function () {

                try {

                    recognition.start();

                } catch (error) {

                    console.log(
                        "Voice recognition is already running."
                    );
                }
            }
        );
    }

} else {

    if (voiceButton) {

        voiceButton.disabled =
            true;

        voiceButton.title =
            "Voice input is not supported in this browser.";
    }


    if (voiceStatus) {

        voiceStatus.textContent =
            "Voice input is not supported in this browser.";
    }
}
