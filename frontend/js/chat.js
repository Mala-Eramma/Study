const chatForm = document.getElementById("chatForm");
const subjectInput = document.getElementById("subjectInput");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const voiceButton = document.getElementById("voiceButton");
const voiceStatus = document.getElementById("voiceStatus");


/* =========================
   USER
========================= */

const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);


/* =========================
   VOICE RECOGNITION
========================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;


    recognition.onstart = function () {

        voiceButton.classList.add("listening");

        voiceStatus.textContent = "";
    };


    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript.trim();

        chatInput.value = transcript;

        voiceStatus.textContent = "";

        voiceButton.classList.remove("listening");

        chatInput.focus();
    };


    recognition.onerror = function (event) {

        console.error(
            "Speech recognition error:",
            event.error
        );

        voiceStatus.textContent = "";

        voiceButton.classList.remove("listening");
    };


    recognition.onend = function () {

        voiceButton.classList.remove("listening");

        voiceStatus.textContent = "";
    };

} else {

    voiceButton.disabled = true;

    voiceStatus.textContent = "";
}


/* =========================
   MICROPHONE BUTTON
========================= */

voiceButton.addEventListener(
    "click",
    function (event) {

        event.preventDefault();
        event.stopPropagation();

        if (!recognition) {
            return;
        }

        try {

            recognition.start();

        } catch (error) {

            console.error(
                "Microphone error:",
                error
            );
        }
    }
);


/* =========================
   ASK / CHAT
========================= */

chatForm.addEventListener(
    "submit",
    function (event) {

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


        addMessage(
            "You",
            question,
            "user-message"
        );


        chatInput.value = "";


        const answer =
            generateStudyAnswer(
                subject,
                question
            );


        addMessage(
            "AI Assistant",
            answer,
            "ai-message"
        );


        speakAnswer(answer);


        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }
);


/* =========================
   STUDY ANSWER
========================= */

function generateStudyAnswer(
    subject,
    question
) {

    const text =
        question.toLowerCase().trim();


    if (
        text.includes("string") &&
        subject.toLowerCase().includes("python")
    ) {

        return (
            "1. Definition\n" +
            "A string is a sequence of characters used to represent text.\n\n" +

            "2. Simple explanation\n" +
            "Strings can contain letters, numbers, spaces, and symbols.\n\n" +

            "3. Example\n" +
            "name = \"Hello\""
        );
    }


    if (
        text.includes("variable") &&
        subject.toLowerCase().includes("python")
    ) {

        return (
            "1. Definition\n" +
            "A variable is a name used to store a value.\n\n" +

            "2. Simple explanation\n" +
            "The value stored in a variable can be changed during a program.\n\n" +

            "3. Example\n" +
            "name = \"Eramma\""
        );
    }


    if (
        text.includes("list") &&
        subject.toLowerCase().includes("python")
    ) {

        return (
            "1. Definition\n" +
            "A list is an ordered collection of items in Python.\n\n" +

            "2. Simple explanation\n" +
            "A list can store multiple values in one variable.\n\n" +

            "3. Example\n" +
            "numbers = [10, 20, 30]"
        );
    }


    if (
        text.includes("tuple") &&
        subject.toLowerCase().includes("python")
    ) {

        return (
            "1. Definition\n" +
            "A tuple is an ordered collection of items that cannot be changed after creation.\n\n" +

            "2. Example\n" +
            "numbers = (10, 20, 30)"
        );
    }


    if (
        text.includes("dictionary") &&
        subject.toLowerCase().includes("python")
    ) {

        return (
            "1. Definition\n" +
            "A dictionary stores data as key-value pairs.\n\n" +

            "2. Example\n" +
            "student = {\"name\": \"Eramma\", \"age\": 22}"
        );
    }


    if (
        text.includes("function") &&
        subject.toLowerCase().includes("python")
    ) {

        return (
            "1. Definition\n" +
            "A function is a reusable block of code that performs a specific task.\n\n" +

            "2. Example\n" +
            "def greet():\n" +
            "    print(\"Hello\")"
        );
    }


    return (
        "1. Your question\n" +
        question + "\n\n" +

        "2. Answer\n" +
        "This topic needs a more specific explanation.\n\n" +

        "3. Tip\n" +
        "Try asking about a definition, example, or basic concept."
    );
}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(
    sender,
    text,
    messageClass
) {

    const message =
        document.createElement("div");

    message.className =
        `message ${messageClass}`;


    const title =
        document.createElement("strong");

    title.textContent =
        sender;


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        text;


    message.appendChild(title);

    message.appendChild(paragraph);

    chatMessages.appendChild(message);


    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    return paragraph;
}


/* =========================
   SPEAK AI ANSWER
========================= */

function speakAnswer(answer) {

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
            answer
        );


    speech.lang =
        "en-US";

    speech.rate =
        0.9;

    speech.pitch =
        1;


    window.speechSynthesis.speak(
        speech
    );
}