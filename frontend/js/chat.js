const CHAT_HISTORY_KEY = "study_assistant_chat_history";
const USER_KEY = "user";

const chatForm = document.getElementById("chatForm");
const questionInput = document.getElementById("question");
const chatMessages = document.getElementById("chatMessages");

const voiceButton = document.getElementById("voiceButton");
const voiceStatus = document.getElementById("voiceStatus");

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);
const userId = user.user_id || user.id || user.email;

function getChatHistory() {
    const history = JSON.parse(
        localStorage.getItem(CHAT_HISTORY_KEY) || "[]"
    );

    return history.filter(
        item => String(item.user_id) === String(userId)
    );
}

function saveChatHistory(question, answer) {
    const history = JSON.parse(
        localStorage.getItem(CHAT_HISTORY_KEY) || "[]"
    );

    history.push({
        id: Date.now(),
        user_id: userId,
        question: question,
        answer: answer,
        created_at: new Date().toISOString()
    });

    localStorage.setItem(
        CHAT_HISTORY_KEY,
        JSON.stringify(history)
    );
}

function addMessage(text, type) {
    if (!chatMessages) {
        return;
    }

    const message = document.createElement("div");

    message.className = `chat-message ${type}`;
    message.textContent = text;

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}

function generateAnswer(question) {
    const text = question.toLowerCase().trim();

    if (!text) {
        return "Please enter a question.";
    }

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {
        return "Hello. I am your AI Study Assistant. Ask me a study question.";
    }

    if (
        text.includes("what is") ||
        text.includes("define")
    ) {
        const topic = question
            .replace(/what is|define/gi, "")
            .trim();

        return `Definition: ${topic}

Simple explanation: This topic can be understood by learning its basic meaning, important features, and practical examples.

Example: Try connecting the topic with a simple real-world situation.`;
    }

    if (text.includes("python")) {
        return `1. Python is a high-level programming language.
2. It is widely used for web development, automation, data science, and AI.
3. Python has simple and readable syntax.
4. Example: print("Hello World")`;
    }

    if (text.includes("html")) {
        return `1. HTML stands for HyperText Markup Language.
2. HTML is used to create the structure of web pages.
3. HTML uses elements and tags.
4. Example: <h1>Hello</h1>`;
    }

    if (text.includes("css")) {
        return `1. CSS stands for Cascading Style Sheets.
2. CSS is used to style HTML elements.
3. CSS controls colors, sizes, spacing, layouts, and animations.
4. Example: color: blue;`;
    }

    if (text.includes("javascript")) {
        return `1. JavaScript is a programming language used to make web pages interactive.
2. It can respond to user actions.
3. It can change HTML and CSS dynamically.
4. Example: alert("Hello");`;
    }

    if (
        text.includes("explain") ||
        text.includes("how") ||
        text.includes("why")
    ) {
        return `1. Understand the basic concept.
2. Break the question into smaller parts.
3. Learn each part with a simple example.
4. Practice the concept with a few questions.`;
    }

    return `1. Identify the main concept in your question.
2. Break the concept into smaller parts.
3. Learn each part with an example.
4. Practice the concept to improve your understanding.`;
}

function speakText(text) {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 0.8;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}

function sendQuestion(shouldSpeak = false) {
    const question =
        questionInput
            ? questionInput.value.trim()
            : "";

    if (!question) {
        return;
    }

    addMessage(
        question,
        "user"
    );

    const answer =
        generateAnswer(question);

    addMessage(
        answer,
        "assistant"
    );

    saveChatHistory(
        question,
        answer
    );

    if (shouldSpeak) {
        speakText(answer);
    }

    questionInput.value = "";

    if (questionInput) {
        questionInput.focus();
    }
}

if (chatForm) {
    chatForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            sendQuestion(false);
        }
    );
}

let recognition = null;
let isListening = false;

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

    recognition.onstart =
        function () {

            isListening = true;

            if (voiceStatus) {
                voiceStatus.textContent =
                    "Listening...";
            }

            if (voiceButton) {
                voiceButton.textContent =
                    "🎤 Listening...";
            }
        };

    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0].transcript;

            if (questionInput) {
                questionInput.value =
                    transcript;
            }

            if (voiceStatus) {
                voiceStatus.textContent =
                    "Voice captured.";
            }

            sendQuestion(true);
        };

    recognition.onerror =
        function () {

            if (voiceStatus) {
                voiceStatus.textContent =
                    "Could not hear you. Please try again.";
            }
        };

    recognition.onend =
        function () {

            isListening = false;

            if (voiceButton) {
                voiceButton.textContent =
                    "🎤 Voice";
            }
        };

    if (voiceButton) {

        voiceButton.addEventListener(
            "click",
            function () {

                if (isListening) {
                    recognition.stop();
                    return;
                }

                if (voiceStatus) {
                    voiceStatus.textContent =
                        "Starting microphone...";
                }

                try {
                    recognition.start();
                } catch (error) {
                    if (voiceStatus) {
                        voiceStatus.textContent =
                            "Please allow microphone access and try again.";
                    }
                }
            }
        );
    }

} else {

    if (voiceButton) {
        voiceButton.disabled = true;
        voiceButton.textContent =
            "Voice Not Supported";
    }

    if (voiceStatus) {
        voiceStatus.textContent =
            "Voice recognition is not supported by this browser.";
    }
}

function loadRecentChat() {

    if (!chatMessages) {
        return;
    }

    const history =
        getChatHistory();

    history
        .slice(-10)
        .forEach(item => {

            addMessage(
                item.question,
                "user"
            );

            addMessage(
                item.answer,
                "assistant"
            );
        });
}

loadRecentChat();