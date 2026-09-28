const chatForm = document.getElementById("chatForm");

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


const API_URL = "http://localhost:8000";


const userData =
    localStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
}

const user =
    JSON.parse(userData);

const userId =
    user.id;


const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;


// =========================================
// VOICE RECOGNITION
// =========================================

if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.lang =
        "en-US";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;


    recognition.onstart = function () {

        voiceButton.classList.add(
            "listening"
        );

        voiceStatus.textContent =
            "Listening... Speak your question.";

    };


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0].transcript;

            chatInput.value =
                transcript;

            voiceStatus.textContent =
                "Question received. Click Ask.";

            voiceButton.classList.remove(
                "listening"
            );

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Voice recognition error:",
                event.error
            );

            voiceStatus.textContent =
                "Unable to understand your voice.";

            voiceButton.classList.remove(
                "listening"
            );

        };


    recognition.onend =
        function () {

            voiceButton.classList.remove(
                "listening"
            );

        };

} else {

    voiceButton.disabled =
        true;

    voiceStatus.textContent =
        "Voice input is not supported in this browser.";

}


// =========================================
// VOICE BUTTON
// =========================================

voiceButton.addEventListener(
    "click",
    function () {

        if (!recognition) {
            return;
        }

        try {

            recognition.start();

        } catch (error) {

            console.error(error);

        }

    }
);


// =========================================
// CHAT FORM
// =========================================

chatForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const subject =
            subjectInput.value.trim();


        const question =
            chatInput.value.trim();


        if (!subject) {

            voiceStatus.textContent =
                "Please enter a subject.";

            subjectInput.focus();

            return;

        }


        if (!question) {

            voiceStatus.textContent =
                "Please enter a question.";

            chatInput.focus();

            return;

        }


        // Show student's question
        addMessage(
            "You",
            question,
            "user-message"
        );


        chatInput.value =
            "";


        // Show temporary AI message
        const aiMessage =
            addMessage(
                "AI Assistant",
                "Thinking...",
                "ai-message"
            );


        try {

            // =========================================
            // GET AI ANSWER
            // =========================================

            const response =
                await fetch(
                    `${API_URL}/chat/?user_id=${userId}`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            question:
                                question,

                            subject:
                                subject

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                aiMessage.textContent =
                    data.detail ||
                    "Unable to get an AI response.";

                return;

            }


            const answer =
                data.answer ||
                "No answer received.";


            aiMessage.textContent =
                answer;


            // =========================================
            // SPEAK AI ANSWER
            // =========================================

            speakAnswer(answer);


            voiceStatus.textContent =
                "Answer received.";

        }

        catch (error) {

            console.error(
                error
            );

            aiMessage.textContent =
                "Unable to connect to the server.";

        }


        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }
);


// =========================================
// ADD CHAT MESSAGE
// =========================================

function addMessage(
    sender,
    text,
    messageClass
) {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        `message ${messageClass}`;


    const title =
        document.createElement(
            "strong"
        );


    title.textContent =
        sender;


    const paragraph =
        document.createElement(
            "p"
        );


    paragraph.textContent =
        text;


    message.appendChild(
        title
    );


    message.appendChild(
        paragraph
    );


    chatMessages.appendChild(
        message
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    return paragraph;

}


// =========================================
// SPEAK AI ANSWER
// =========================================

function speakAnswer(
    answer
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