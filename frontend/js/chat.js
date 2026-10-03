
 // ============================================================
 // AI STUDY ASSISTANT - CHAT
 // Render Backend + Chat History + Voice Input + Voice Output
 // ============================================================


// ============================================================
// 1. STORAGE KEYS AND BACKEND URL
// ============================================================

const USER_KEY = "user";
const HISTORY_KEY = "study_assistant_chat_history";
const CHAT_TOPICS_KEY = "study_assistant_chat_topics";
const API_URL = "https://study-i3wy.onrender.com";


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

const userId = user?.user_id ?? user?.id ?? null;


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
// 6. SAVE CHAT HISTORY LOCALLY
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
// 7. SAVE CHAT TOPICS LOCALLY
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
// 8. GENERATE AI ANSWER THROUGH RENDER BACKEND
// ============================================================

async function generateGeminiAnswer(subject, question) {
    if (
        userId === null ||
        userId === undefined ||
        !/^\d+$/.test(String(userId))
    ) {
        throw new Error(
            "Your login information does not contain a numeric user ID. Please log out and log in again."
        );
    }

    let response;

    try {
        response = await fetch(
            `${API_URL}/chat/?user_id=${encodeURIComponent(userId)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    subject: subject,
                    question: question
                })
            }
        );
    } catch (error) {
        console.error("Backend connection error:", error);

        throw new Error(
            "Could not connect to the AI server. Please check your internet connection and try again."
        );
    }

    let data;

    try {
        data = await response.json();
    } catch (error) {
        throw new Error(
            "The AI server returned an invalid response. Please try again."
        );
    }

    if (!response.ok) {
        console.error("Backend error:", data);

        const detail = Array.isArray(data?.detail)
            ? data.detail
                .map((item) => item.msg || "Invalid request")
                .join(", ")
            : data?.detail;

        throw new Error(
            detail ||
            `The AI server returned an error (${response.status}).`
        );
    }

    const answer =
        typeof data?.answer === "string"
            ? data.answer.trim()
            : "";

    if (!answer) {
        throw new Error(
            "The AI server returned an empty answer. Please try again."
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
            // Generate an answer through the Render backend
            const answer = await generateGeminiAnswer(
                subject,
                question
            );

            // Display the AI answer
            addMessage(answer, "ai");

            // Save the question and answer locally
            saveChatHistory(
                subject,
                question,
                answer
            );

            // Save the subject locally
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