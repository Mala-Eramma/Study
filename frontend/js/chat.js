const chatForm = document.getElementById("chatForm");
const subjectInput = document.getElementById("subjectInput");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const voiceButton = document.getElementById("voiceButton");
const voiceStatus = document.getElementById("voiceStatus");


/* =========================================
   USER
========================================= */

const userData =
    localStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);


/* =========================================
   GET USER ID
========================================= */

const userId =
    user.user_id ||
    user.id ||
    (user.user && (
        user.user.id ||
        user.user.user_id
    ));


/* =========================================
   HISTORY KEY
========================================= */

const HISTORY_KEY =
    "study_assistant_chat_history";


/* =========================================
   VOICE RECOGNITION
========================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

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

            voiceButton.classList.add(
                "listening"
            );

            voiceStatus.textContent = "";
        };


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0]
                    .transcript
                    .trim();

            chatInput.value =
                transcript;

            voiceStatus.textContent = "";

            voiceButton.classList.remove(
                "listening"
            );

            chatInput.focus();
        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );

            voiceStatus.textContent = "";

            voiceButton.classList.remove(
                "listening"
            );
        };


    recognition.onend =
        function () {

            voiceButton.classList.remove(
                "listening"
            );

            voiceStatus.textContent = "";
        };

} else {

    voiceButton.disabled = true;

    voiceStatus.textContent = "";
}


/* =========================================
   MICROPHONE BUTTON
========================================= */

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


/* =========================================
   ASK / CHAT
========================================= */

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


        /* USER MESSAGE */

        addMessage(
            "You",
            question,
            "user-message"
        );


        chatInput.value = "";


        /* GENERATE ANSWER */

        const answer =
            generateStudyAnswer(
                subject,
                question
            );


        /* AI MESSAGE */

        addMessage(
            "AI Assistant",
            answer,
            "ai-message"
        );


        /* SAVE HISTORY */

        saveChatHistory(
            subject,
            question,
            answer
        );


        /* SPEAK ANSWER */

        speakAnswer(answer);


        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }
);


/* =========================================
   GENERATE STUDY ANSWER
========================================= */

function generateStudyAnswer(
    subject,
    question
) {

    const text =
        question
            .toLowerCase()
            .trim();


    const topic =
        subject
            .toLowerCase()
            .trim();


    /* =====================================
       PYTHON
    ===================================== */

    if (
        topic.includes("python")
    ) {


        if (
            text.includes("string") ||
            text.includes("strings")
        ) {

            return (
                "1. Definition\n" +
                "A string is a sequence of characters used to store text.\n\n" +

                "2. Simple explanation\n" +
                "Strings can contain letters, numbers, spaces, and special characters.\n\n" +

                "3. Example\n" +
                "name = \"Eramma\"\n\n" +

                "4. Important point\n" +
                "Strings are written inside single quotes or double quotes."
            );
        }


        if (
            text.includes("variable") ||
            text.includes("variables")
        ) {

            return (
                "1. Definition\n" +
                "A variable is a name used to store a value.\n\n" +

                "2. Simple explanation\n" +
                "The value stored in a variable can be changed during program execution.\n\n" +

                "3. Example\n" +
                "name = \"Eramma\"\n" +
                "age = 22"
            );
        }


        if (
            text.includes("list") ||
            text.includes("lists")
        ) {

            return (
                "1. Definition\n" +
                "A list is an ordered collection of multiple values.\n\n" +

                "2. Simple explanation\n" +
                "Lists can store different types of data and can be changed after creation.\n\n" +

                "3. Example\n" +
                "numbers = [10, 20, 30]\n\n" +

                "4. Important point\n" +
                "Lists use square brackets."
            );
        }


        if (
            text.includes("tuple") ||
            text.includes("tuples")
        ) {

            return (
                "1. Definition\n" +
                "A tuple is an ordered collection of values.\n\n" +

                "2. Simple explanation\n" +
                "A tuple cannot normally be changed after it is created.\n\n" +

                "3. Example\n" +
                "numbers = (10, 20, 30)\n\n" +

                "4. Important point\n" +
                "Tuples use parentheses."
            );
        }


        if (
            text.includes("dictionary") ||
            text.includes("dictionaries")
        ) {

            return (
                "1. Definition\n" +
                "A dictionary stores data as key-value pairs.\n\n" +

                "2. Simple explanation\n" +
                "Each key is used to access its corresponding value.\n\n" +

                "3. Example\n" +
                "student = {\"name\": \"Eramma\", \"age\": 22}\n\n" +

                "4. Important point\n" +
                "Dictionaries use curly braces."
            );
        }


        if (
            text.includes("function") ||
            text.includes("functions")
        ) {

            return (
                "1. Definition\n" +
                "A function is a reusable block of code that performs a specific task.\n\n" +

                "2. Simple explanation\n" +
                "Functions help divide a program into smaller and reusable parts.\n\n" +

                "3. Example\n" +
                "def greet():\n" +
                "    print(\"Hello\")"
            );
        }


        if (
            text.includes("loop") ||
            text.includes("loops") ||
            text.includes("for loop") ||
            text.includes("while loop")
        ) {

            return (
                "1. Definition\n" +
                "A loop is used to execute a block of code repeatedly.\n\n" +

                "2. Types\n" +
                "Python mainly provides for loops and while loops.\n\n" +

                "3. Example\n" +
                "for i in range(5):\n" +
                "    print(i)\n\n" +

                "4. Use\n" +
                "Loops are useful when the same operation must be performed multiple times."
            );
        }


        if (
            text.includes("if statement") ||
            text.includes("conditional") ||
            text.includes("condition")
        ) {

            return (
                "1. Definition\n" +
                "An if statement is used to execute code when a condition is true.\n\n" +

                "2. Example\n" +
                "age = 20\n\n" +
                "if age >= 18:\n" +
                "    print(\"Adult\")\n\n" +

                "3. Use\n" +
                "Conditional statements help a program make decisions."
            );
        }


        if (
            text.includes("class") ||
            text.includes("classes") ||
            text.includes("object") ||
            text.includes("objects")
        ) {

            return (
                "1. Definition\n" +
                "A class is a blueprint used to create objects.\n\n" +

                "2. Simple explanation\n" +
                "An object is an instance of a class.\n\n" +

                "3. Example\n" +
                "class Student:\n" +
                "    pass\n\n" +

                "4. Important point\n" +
                "Classes are an important part of object-oriented programming."
            );
        }


        if (
            text.includes("inheritance")
        ) {

            return (
                "1. Definition\n" +
                "Inheritance allows one class to use properties and methods of another class.\n\n" +

                "2. Simple explanation\n" +
                "It helps reuse existing code.\n\n" +

                "3. Example\n" +
                "class Dog(Animal):\n" +
                "    pass\n\n" +

                "4. Important point\n" +
                "The child class can inherit features from the parent class."
            );
        }


        if (
            text.includes("exception") ||
            text.includes("try except") ||
            text.includes("error handling")
        ) {

            return (
                "1. Definition\n" +
                "Exception handling is used to handle runtime errors safely.\n\n" +

                "2. Main keywords\n" +
                "Python uses try, except, else, and finally.\n\n" +

                "3. Example\n" +
                "try:\n" +
                "    print(10 / 0)\n" +
                "except ZeroDivisionError:\n" +
                "    print(\"Cannot divide by zero\")"
            );
        }


        if (
            text.includes("operator") ||
            text.includes("operators")
        ) {

            return (
                "1. Definition\n" +
                "Operators are symbols or keywords used to perform operations on values.\n\n" +

                "2. Examples\n" +
                "Arithmetic: +, -, *, /\n" +
                "Comparison: ==, !=, >, <\n" +
                "Logical: and, or, not\n\n" +

                "3. Example\n" +
                "result = 10 + 5"
            );
        }


        if (
            text.includes("input")
        ) {

            return (
                "1. Definition\n" +
                "The input() function is used to receive data from the user.\n\n" +

                "2. Example\n" +
                "name = input(\"Enter your name: \")\n\n" +

                "3. Important point\n" +
                "The value returned by input() is normally a string."
            );
        }


        if (
            text.includes("print")
        ) {

            return (
                "1. Definition\n" +
                "The print() function is used to display information on the screen.\n\n" +

                "2. Example\n" +
                "print(\"Hello World\")\n\n" +

                "3. Use\n" +
                "It is commonly used to display output and check program results."
            );
        }
    }


    /* =====================================
       SQL
    ===================================== */

    if (
        topic.includes("sql") ||
        topic.includes("mysql")
    ) {

        if (
            text.includes("select")
        ) {

            return (
                "1. Definition\n" +
                "SELECT is used to retrieve data from a database table.\n\n" +

                "2. Example\n" +
                "SELECT * FROM students;\n\n" +

                "3. Explanation\n" +
                "The query retrieves all columns from the students table."
            );
        }


        if (
            text.includes("insert")
        ) {

            return (
                "1. Definition\n" +
                "INSERT is used to add new records to a table.\n\n" +

                "2. Example\n" +
                "INSERT INTO students (name, age)\n" +
                "VALUES ('Eramma', 22);"
            );
        }


        if (
            text.includes("update")
        ) {

            return (
                "1. Definition\n" +
                "UPDATE is used to modify existing records.\n\n" +

                "2. Example\n" +
                "UPDATE students\n" +
                "SET age = 23\n" +
                "WHERE name = 'Eramma';\n\n" +

                "3. Important point\n" +
                "Use WHERE carefully to avoid updating unwanted rows."
            );
        }


        if (
            text.includes("delete")
        ) {

            return (
                "1. Definition\n" +
                "DELETE is used to remove records from a table.\n\n" +

                "2. Example\n" +
                "DELETE FROM students\n" +
                "WHERE id = 1;\n\n" +

                "3. Important point\n" +
                "The WHERE condition determines which rows are removed."
            );
        }


        if (
            text.includes("primary key")
        ) {

            return (
                "1. Definition\n" +
                "A primary key uniquely identifies each record in a table.\n\n" +

                "2. Important points\n" +
                "A primary key must contain unique values.\n" +
                "It cannot contain NULL values.\n\n" +

                "3. Example\n" +
                "student_id INT PRIMARY KEY"
            );
        }


        if (
            text.includes("foreign key")
        ) {

            return (
                "1. Definition\n" +
                "A foreign key connects a column in one table to a primary key in another table.\n\n" +

                "2. Use\n" +
                "It helps establish relationships between tables.\n\n" +

                "3. Example\n" +
                "student_id INT REFERENCES students(id)"
            );
        }
    }


    /* =====================================
       HTML
    ===================================== */

    if (
        topic.includes("html")
    ) {

        if (
            text.includes("tag") ||
            text.includes("tags")
        ) {

            return (
                "1. Definition\n" +
                "An HTML tag defines the structure or meaning of content on a web page.\n\n" +

                "2. Example\n" +
                "<h1>Hello</h1>\n\n" +

                "3. Explanation\n" +
                "The h1 tag is commonly used for a main heading."
            );
        }


        if (
            text.includes("form")
        ) {

            return (
                "1. Definition\n" +
                "An HTML form is used to collect information from users.\n\n" +

                "2. Common elements\n" +
                "input, label, textarea, select, and button.\n\n" +

                "3. Example\n" +
                "<form>\n" +
                "    <input type=\"text\">\n" +
                "</form>"
            );
        }


        if (
            text.includes("link") ||
            text.includes("anchor")
        ) {

            return (
                "1. Definition\n" +
                "The anchor tag is used to create links in HTML.\n\n" +

                "2. Example\n" +
                "<a href=\"https://example.com\">Visit</a>\n\n" +

                "3. Important attribute\n" +
                "The href attribute specifies the destination."
            );
        }
    }


    /* =====================================
       CSS
    ===================================== */

    if (
        topic.includes("css")
    ) {

        if (
            text.includes("flexbox") ||
            text.includes("flex")
        ) {

            return (
                "1. Definition\n" +
                "Flexbox is a CSS layout system used to arrange elements in rows or columns.\n\n" +

                "2. Example\n" +
                "display: flex;\n\n" +

                "3. Common properties\n" +
                "justify-content controls the main-axis alignment.\n" +
                "align-items controls the cross-axis alignment."
            );
        }


        if (
            text.includes("grid")
        ) {

            return (
                "1. Definition\n" +
                "CSS Grid is a layout system for arranging elements in rows and columns.\n\n" +

                "2. Example\n" +
                "display: grid;\n" +
                "grid-template-columns: 1fr 1fr;\n\n" +

                "3. Use\n" +
                "Grid is useful for two-dimensional layouts."
            );
        }


        if (
            text.includes("media query") ||
            text.includes("media queries") ||
            text.includes("responsive")
        ) {

            return (
                "1. Definition\n" +
                "A media query allows CSS styles to change based on screen or device conditions.\n\n" +

                "2. Example\n" +
                "@media (max-width: 600px) {\n" +
                "    body {\n" +
                "        background: lightblue;\n" +
                "    }\n" +
                "}\n\n" +

                "3. Use\n" +
                "Media queries are commonly used to create responsive websites."
            );
        }
    }


    /* =====================================
       JAVASCRIPT
    ===================================== */

    if (
        topic.includes("javascript") ||
        topic === "js"
    ) {

        if (
            text.includes("variable") ||
            text.includes("variables")
        ) {

            return (
                "1. Definition\n" +
                "A JavaScript variable stores a value that can be used in a program.\n\n" +

                "2. Keywords\n" +
                "JavaScript commonly uses let, const, and var.\n\n" +

                "3. Example\n" +
                "let name = \"Eramma\";"
            );
        }


        if (
            text.includes("function") ||
            text.includes("functions")
        ) {

            return (
                "1. Definition\n" +
                "A JavaScript function is a reusable block of code.\n\n" +

                "2. Example\n" +
                "function greet() {\n" +
                "    console.log(\"Hello\");\n" +
                "}\n\n" +

                "3. Use\n" +
                "Functions help organize and reuse JavaScript code."
            );
        }


        if (
            text.includes("array") ||
            text.includes("arrays")
        ) {

            return (
                "1. Definition\n" +
                "An array stores multiple values in a single variable.\n\n" +

                "2. Example\n" +
                "let numbers = [10, 20, 30];\n\n" +

                "3. Important point\n" +
                "Array elements are accessed using indexes."
            );
        }
    }


    /* =====================================
       GENERAL STUDY QUESTIONS
    ===================================== */

    if (
        text.includes("definition")
    ) {

        return (
            "1. Definition\n" +
            "The question asks about the meaning or definition of " +
            subject + ".\n\n" +

            "2. Explanation\n" +
            "A definition explains what a concept is and what it is used for.\n\n" +

            "3. Study tip\n" +
            "Learn the meaning first, then understand it with a simple example."
        );
    }


    if (
        text.includes("example") ||
        text.includes("give an example")
    ) {

        return (
            "1. Explanation\n" +
            "An example shows how a concept is used in a real situation or program.\n\n" +

            "2. How to study\n" +
            "First understand the concept, then connect it with a small example.\n\n" +

            "3. Your topic\n" +
            subject
        );
    }


    if (
        text.includes("difference between") ||
        text.includes("difference")
    ) {

        return (
            "1. Meaning\n" +
            "A difference question asks you to compare two or more concepts.\n\n" +

            "2. How to compare\n" +
            "Compare their definition, purpose, syntax, features, and usage.\n\n" +

            "3. Your question\n" +
            question
        );
    }


    if (
        text.includes("what is") ||
        text.startsWith("define ") ||
        text.startsWith("explain ")
    ) {

        return (
            "1. Meaning\n" +
            "This is a concept-based question from " +
            subject + ".\n\n" +

            "2. Explanation\n" +
            "The concept should be understood by its definition, purpose, and practical usage.\n\n" +

            "3. Question asked\n" +
            question + "\n\n" +

            "4. Study tip\n" +
            "Connect the definition with one simple example to remember it easily."
        );
    }


    /* =====================================
       DEFAULT
    ===================================== */

    return (
        "1. Your question\n" +
        question + "\n\n" +

        "2. Topic\n" +
        subject + "\n\n" +

        "3. Explanation\n" +
        "This question is related to " +
        subject +
        ". Break the topic into definition, purpose, and example to understand it clearly."
    );
}


/* =========================================
   SAVE CHAT HISTORY
========================================= */

function saveChatHistory(
    subject,
    question,
    answer
) {

    try {

        let history = [];

        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        HISTORY_KEY
                    ) || "[]"
                );

        } catch (error) {

            history = [];
        }


        if (!Array.isArray(history)) {

            history = [];
        }


        const historyItem = {

            id:
                Date.now().toString(),

            user_id:
                userId,

            subject:
                subject,

            question:
                question,

            answer:
                answer,

            created_at:
                Date.now()
        };


        history.push(
            historyItem
        );


        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(
                history
            )
        );


    } catch (error) {

        console.error(
            "Unable to save chat history:",
            error
        );
    }
}


/* =========================================
   ADD MESSAGE
========================================= */

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


/* =========================================
   SPEAK AI ANSWER
========================================= */

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