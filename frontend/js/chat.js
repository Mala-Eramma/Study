// ============================================================
// AI STUDY ASSISTANT - CHAT
// Gemini AI + Chat History + Voice Input + Voice Output
// ============================================================


// ============================================================
// 1. STORAGE KEYS
// ============================================================

const USER_KEY = "user";
const HISTORY_KEY = "study_assistant_chat_history";
const CHAT_TOPICS_KEY = "study_assistant_chat_topics";


// ============================================================
// 2. GET LOGGED-IN USER
// ============================================================

let user = null;

try {
    user = JSON.parse(
        localStorage.getItem(USER_KEY) || "null"
    );
} catch (error) {
    console.error("Unable to read user data:", error);
}

if (!user) {
    window.location.href = "login.html";
}

const userId =
    user?.user_id ||
    user?.id ||
    user?.email ||
    "guest";


// ============================================================
// 3. GET CHAT ELEMENTS
// ============================================================

const chatForm = document.getElementById("chatForm");
const subjectInput = document.getElementById("subjectInput");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const voiceButton = document.getElementById("voiceButton");
const voiceStatus = document.getElementById("voiceStatus");


// ============================================================
// 4. INLINE STATUS MESSAGE
// ============================================================

function showStatusMessage(message) {
    let statusMessage = document.getElementById(
        "chatStatusMessage"
    );

    if (!statusMessage && chatForm) {
        statusMessage = document.createElement("p");
        statusMessage.id = "chatStatusMessage";

        statusMessage.style.marginTop = "10px";
        statusMessage.style.textAlign = "center";
        statusMessage.style.fontSize = "14px";
        statusMessage.style.fontWeight = "500";

        chatForm.insertAdjacentElement(
            "afterend",
            statusMessage
        );
    }

    if (statusMessage) {
        statusMessage.textContent = message;
    }
}

function clearStatusMessage() {
    const statusMessage = document.getElementById(
        "chatStatusMessage"
    );

    if (statusMessage) {
        statusMessage.textContent = "";
    }
}


// ============================================================
// 5. ADD MESSAGE TO CHAT
// ============================================================

function addMessage(message, type) {
    if (!chatMessages) {
        return;
    }

    const messageDiv = document.createElement("div");

    messageDiv.className =
        type === "ai"
            ? "message ai-message"
            : "message user-message";

    const strong = document.createElement("strong");

    strong.textContent =
        type === "ai"
            ? "AI Assistant"
            : "You";

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    messageDiv.appendChild(strong);
    messageDiv.appendChild(paragraph);

    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ============================================================
// 6. SAVE CHAT HISTORY
// ============================================================

function saveChatHistory(subject, question, answer) {
    try {
        const existingHistory = JSON.parse(
            localStorage.getItem(HISTORY_KEY) || "[]"
        );

        const historyItem = {
            user_id: userId,
            subject: subject,
            question: question,
            answer: answer,
            created_at: new Date().toISOString()
        };

        existingHistory.push(historyItem);

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(existingHistory)
        );
    } catch (error) {
        console.error("Unable to save chat history:", error);
    }
}


// ============================================================
// 7. SAVE CHAT TOPICS
// ============================================================

function saveChatTopic(subject) {
    try {
        const topics = JSON.parse(
            localStorage.getItem(CHAT_TOPICS_KEY) || "[]"
        );

        if (!topics.includes(subject)) {
            topics.push(subject);

            localStorage.setItem(
                CHAT_TOPICS_KEY,
                JSON.stringify(topics)
            );
        }
    } catch (error) {
        console.error("Unable to save chat topic:", error);
    }
}


// ============================================================
// 8. GEMINI AI ANSWER
// ============================================================

async function generateGeminiAnswer(subject, question) {
    let apiKey = sessionStorage.getItem("GEMINI_API_KEY");

    // Ask for the API key if it has not been entered
    if (!apiKey) {
        apiKey = window.prompt(
            "Enter your Gemini API key:"
        );

        if (!apiKey || !apiKey.trim()) {
            throw new Error(
                "Gemini API key is required to generate an answer."
            );
        }

        apiKey = apiKey.trim();

        sessionStorage.setItem(
            "GEMINI_API_KEY",
            apiKey
        );
    }

    const promptText = `
You are an AI Study Assistant helping a student learn.

Subject: ${subject}

Student question:
${question}

Instructions:
- Give a clear, accurate, beginner-friendly answer.
- Explain the concept using simple language.
- Include a definition when appropriate.
- Include examples and real-world usage when relevant.
- Use headings or bullet points when helpful.
- Stay focused on the student's question.
- Do not claim that the answer is hard-coded.
- Provide programming code when the student asks for code.
- Do not invent facts when uncertain.
`;

    let response;

    try {
        response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: promptText
                                }
                            ]
                        }
                    ]
                })
            }
        );
    } catch (error) {
        throw new Error(
            "Could not connect to Gemini. Check your internet connection."
        );
    }

    let data;

    try {
        data = await response.json();
    } catch (error) {
        throw new Error(
            "Gemini returned an invalid response."
        );
    }

    if (!response.ok) {
        // Remove an invalid or rejected key so it can be entered again.
        if (
            response.status === 400 ||
            response.status === 401 ||
            response.status === 403
        ) {
            sessionStorage.removeItem("GEMINI_API_KEY");
        }

        throw new Error(
            data?.error?.message ||
            "Gemini could not generate an answer."
        );
    }

    const answer = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!answer) {
        throw new Error(
            "Gemini returned an empty answer. Please try again."
        );
    }

    return answer;
}


// ============================================================
// 9. CHAT FORM SUBMIT
// ============================================================

if (chatForm) {
    chatForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearStatusMessage();

        const subject = subjectInput?.value.trim() || "";
        const question = chatInput?.value.trim() || "";

        if (!subject) {
            showStatusMessage("Please enter the subject.");
            subjectInput?.focus();
            return;
        }

        if (!question) {
            showStatusMessage("Please enter your question.");
            chatInput?.focus();
            return;
        }

        // Display the student's question
        addMessage(question, "user");

        // Clear the input
        chatInput.value = "";

        const askButton = chatForm.querySelector(
            'button[type="submit"]'
        );

        if (askButton) {
            askButton.disabled = true;
            askButton.textContent = "Thinking...";
        }

        if (voiceButton) {
            voiceButton.disabled = true;
        }

        try {
            // Generate an answer using Gemini
            const answer = await generateGeminiAnswer(
                subject,
                question
            );

            // Display the answer
            addMessage(answer, "ai");

            // Save the question and answer
            saveChatHistory(
                subject,
                question,
                answer
            );

            // Save the subject
            saveChatTopic(subject);

            // Read the answer aloud
            speakAnswer(answer);

            clearStatusMessage();

        } catch (error) {
            console.error("Chat Error:", error);

            addMessage(
                "Sorry, I could not generate an answer. " +
                error.message,
                "ai"
            );

        } finally {
            if (askButton) {
                askButton.disabled = false;
                askButton.textContent = "Ask";
            }

            if (voiceButton) {
                voiceButton.disabled = false;
            }
        }
    });
}


// ============================================================
// 10. SPEAK AI ANSWER
// ============================================================

function speakAnswer(answer) {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(answer);

    speech.lang = "en-US";
    speech.rate = 0.8;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}


// ============================================================
// 11. VOICE INPUT
// ============================================================

let recognition = null;

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    // Voice input started
    recognition.onstart = function () {
        if (voiceStatus) {
            voiceStatus.textContent = "Listening...";
        }

        if (voiceButton) {
            voiceButton.classList.add("listening");
        }
    };

    // Receive the spoken question
    recognition.onresult = function (event) {
        const transcript =
            event.results[0][0].transcript;

        if (chatInput) {
            chatInput.value = transcript;
        }

        if (voiceStatus) {
            voiceStatus.textContent =
                "Voice input received.";
        }
    };

    // Handle voice recognition errors
    recognition.onerror = function (event) {
        console.error(
            "Voice recognition error:",
            event.error
        );

        if (voiceStatus) {
            voiceStatus.textContent =
                "Voice input failed. Please try again.";
        }
    };

    // Voice input ended
    recognition.onend = function () {
        if (voiceButton) {
            voiceButton.classList.remove("listening");
        }
    };

    // Start listening when the voice button is clicked
    if (voiceButton) {
        voiceButton.addEventListener("click", function () {
            try {
                recognition.start();
            } catch (error) {
                console.log(
                    "Voice recognition is already running."
                );
            }
        });
    }

} else {
    if (voiceButton) {
        voiceButton.disabled = true;
        voiceButton.title =
            "Voice input is not supported in this browser.";
    }

    if (voiceStatus) {
        voiceStatus.textContent =
            "Voice input is not supported in this browser.";
    }
}