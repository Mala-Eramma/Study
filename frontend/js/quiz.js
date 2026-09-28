/* =========================================================
   AI STUDY ASSISTANT - GITHUB PAGES QUIZ
   Frontend-only version
========================================================= */

const generateQuizButton =
    document.getElementById("generateQuiz");

const quizSubject =
    document.getElementById("quizSubject");

const questionCount =
    document.getElementById("questionCount");

const quizArea =
    document.getElementById("quizArea");

const quizMessage =
    document.getElementById("quizMessage");

let currentQuiz = [];

let currentQuizType = "mcq";

let quizSubmitted = false;


/* =========================================================
   QUESTION BANK
========================================================= */

const questionBank = {

    python: [
        {
            question: "Which keyword is used to define a function in Python?",
            options: ["function", "def", "func", "define"],
            answer: "def"
        },
        {
            question: "Which data type is used to store True or False?",
            options: ["int", "str", "bool", "float"],
            answer: "bool"
        },
        {
            question: "Which symbol is used for comments in Python?",
            options: ["//", "#", "/*", "--"],
            answer: "#"
        },
        {
            question: "Which method adds an item to the end of a list?",
            options: ["add()", "insert()", "append()", "push()"],
            answer: "append()"
        },
        {
            question: "Which collection stores key-value pairs?",
            options: ["List", "Tuple", "Dictionary", "Set"],
            answer: "Dictionary"
        },
        {
            question: "Which function is used to get input from a user?",
            options: ["get()", "input()", "read()", "scan()"],
            answer: "input()"
        },
        {
            question: "Which operator is used for exponentiation in Python?",
            options: ["^", "**", "//", "%%"],
            answer: "**"
        },
        {
            question: "Which keyword is used to create a class?",
            options: ["object", "class", "struct", "new"],
            answer: "class"
        },
        {
            question: "Which function returns the length of a sequence?",
            options: ["length()", "size()", "len()", "count()"],
            answer: "len()"
        },
        {
            question: "Which keyword is used to handle exceptions?",
            options: ["catch", "error", "try", "exceptonly"],
            answer: "try"
        }
    ],

    html: [
        {
            question: "What does HTML stand for?",
            options: [
                "Hyper Text Markup Language",
                "High Text Machine Language",
                "Hyperlink Text Management Language",
                "Home Tool Markup Language"
            ],
            answer: "Hyper Text Markup Language"
        },
        {
            question: "Which tag creates the largest heading?",
            options: ["<h6>", "<head>", "<h1>", "<heading>"],
            answer: "<h1>"
        },
        {
            question: "Which tag creates a hyperlink?",
            options: ["<link>", "<a>", "<href>", "<url>"],
            answer: "<a>"
        },
        {
            question: "Which tag is used to display an image?",
            options: ["<image>", "<picture>", "<img>", "<src>"],
            answer: "<img>"
        },
        {
            question: "Which tag creates a paragraph?",
            options: ["<para>", "<p>", "<text>", "<paragraph>"],
            answer: "<p>"
        },
        {
            question: "Which attribute specifies an image source?",
            options: ["href", "src", "link", "source"],
            answer: "src"
        },
        {
            question: "Which tag creates an unordered list?",
            options: ["<ol>", "<ul>", "<list>", "<li>"],
            answer: "<ul>"
        },
        {
            question: "Which tag creates a table row?",
            options: ["<td>", "<th>", "<tr>", "<row>"],
            answer: "<tr>"
        },
        {
            question: "Which declaration specifies HTML5?",
            options: [
                "<html5>",
                "<!DOCTYPE html>",
                "<doctype5>",
                "<HTML5>"
            ],
            answer: "<!DOCTYPE html>"
        },
        {
            question: "Which tag contains the visible page content?",
            options: ["<head>", "<body>", "<mainpage>", "<content>"],
            answer: "<body>"
        }
    ],

    css: [
        {
            question: "What does CSS stand for?",
            options: [
                "Computer Style Sheets",
                "Cascading Style Sheets",
                "Creative Style System",
                "Colorful Style Sheets"
            ],
            answer: "Cascading Style Sheets"
        },
        {
            question: "Which property changes text color?",
            options: ["font-color", "text-color", "color", "foreground"],
            answer: "color"
        },
        {
            question: "Which property changes the background color?",
            options: ["background-color", "bgcolor", "color-background", "background"],
            answer: "background-color"
        },
        {
            question: "Which property changes font size?",
            options: ["font-size", "text-size", "size", "font-height"],
            answer: "font-size"
        },
        {
            question: "Which property makes text bold?",
            options: ["font-style", "font-weight", "text-bold", "bold"],
            answer: "font-weight"
        },
        {
            question: "Which property controls the space inside an element?",
            options: ["margin", "padding", "spacing", "inside-space"],
            answer: "padding"
        },
        {
            question: "Which property controls the space outside an element?",
            options: ["padding", "margin", "border-space", "outside"],
            answer: "margin"
        },
        {
            question: "Which CSS property creates rounded corners?",
            options: ["corner-radius", "border-radius", "round-border", "radius"],
            answer: "border-radius"
        },
        {
            question: "Which property is commonly used to create a flex container?",
            options: ["display", "position", "flex", "layout"],
            answer: "display"
        },
        {
            question: "Which value of display enables Flexbox?",
            options: ["display: flex", "display: box", "display: layout", "display: gridbox"],
            answer: "display: flex"
        }
    ],

    javascript: [
        {
            question: "Which keyword declares a block-scoped variable?",
            options: ["var", "let", "define", "variable"],
            answer: "let"
        },
        {
            question: "Which keyword declares a constant?",
            options: ["constant", "const", "fixed", "static"],
            answer: "const"
        },
        {
            question: "Which function prints information to the browser console?",
            options: ["print()", "console.log()", "write()", "display()"],
            answer: "console.log()"
        },
        {
            question: "Which symbol is used for strict equality?",
            options: ["=", "==", "===", "!="],
            answer: "==="
        },
        {
            question: "Which method adds an item to the end of an array?",
            options: ["append()", "add()", "push()", "insert()"],
            answer: "push()"
        },
        {
            question: "Which method removes the last item from an array?",
            options: ["remove()", "pop()", "delete()", "last()"],
            answer: "pop()"
        },
        {
            question: "Which object represents the current HTML document?",
            options: ["window", "page", "document", "html"],
            answer: "document"
        },
        {
            question: "Which method selects an element by its ID?",
            options: [
                "getElementById()",
                "getById()",
                "selectId()",
                "findId()"
            ],
            answer: "getElementById()"
        },
        {
            question: "Which keyword is used to define an asynchronous function?",
            options: ["async", "await", "promise", "future"],
            answer: "async"
        },
        {
            question: "Which keyword waits for a Promise?",
            options: ["wait", "async", "await", "pause"],
            answer: "await"
        }
    ],

    sql: [
        {
            question: "Which SQL command retrieves data from a table?",
            options: ["GET", "SELECT", "FETCHALL", "READ"],
            answer: "SELECT"
        },
        {
            question: "Which SQL command adds new records?",
            options: ["ADD", "INSERT", "CREATE", "PUT"],
            answer: "INSERT"
        },
        {
            question: "Which SQL command modifies existing records?",
            options: ["CHANGE", "MODIFY", "UPDATE", "ALTER"],
            answer: "UPDATE"
        },
        {
            question: "Which SQL command removes records?",
            options: ["REMOVE", "DELETE", "DROP ROW", "CLEAR"],
            answer: "DELETE"
        },
        {
            question: "Which clause filters rows?",
            options: ["FILTER", "WHERE", "HAVINGONLY", "CHECK"],
            answer: "WHERE"
        },
        {
            question: "Which keyword removes duplicate results?",
            options: ["UNIQUE", "DISTINCT", "ONLY", "SINGLE"],
            answer: "DISTINCT"
        },
        {
            question: "Which function counts rows?",
            options: ["TOTAL()", "COUNT()", "ROWS()", "NUMBER()"],
            answer: "COUNT()"
        },
        {
            question: "Which clause groups rows with the same values?",
            options: ["GROUP BY", "ORDER BY", "COLLECT BY", "MERGE BY"],
            answer: "GROUP BY"
        },
        {
            question: "Which clause sorts query results?",
            options: ["SORT BY", "ORDER BY", "ARRANGE BY", "SORT"],
            answer: "ORDER BY"
        },
        {
            question: "Which constraint uniquely identifies a row?",
            options: ["FOREIGN KEY", "PRIMARY KEY", "UNIQUE ROW", "IDENTIFIER"],
            answer: "PRIMARY KEY"
        }
    ],

    general: [
        {
            question: "What is the main purpose of an operating system?",
            options: [
                "Manage computer resources",
                "Create only documents",
                "Design websites",
                "Store only images"
            ],
            answer: "Manage computer resources"
        },
        {
            question: "Which device is commonly used to enter text?",
            options: ["Monitor", "Keyboard", "Speaker", "Projector"],
            answer: "Keyboard"
        },
        {
            question: "Which unit is commonly used for computer memory?",
            options: ["Byte", "Meter", "Liter", "Volt"],
            answer: "Byte"
        },
        {
            question: "What does CPU stand for?",
            options: [
                "Central Processing Unit",
                "Computer Personal Unit",
                "Central Program Utility",
                "Computer Processing User"
            ],
            answer: "Central Processing Unit"
        },
        {
            question: "What does URL stand for?",
            options: [
                "Uniform Resource Locator",
                "Universal Reference Link",
                "User Resource Location",
                "Uniform Routing Language"
            ],
            answer: "Uniform Resource Locator"
        },
        {
            question: "Which language is primarily used to style web pages?",
            options: ["Python", "CSS", "SQL", "Java"],
            answer: "CSS"
        },
        {
            question: "Which language is used to structure web pages?",
            options: ["HTML", "SQL", "Python", "C++"],
            answer: "HTML"
        },
        {
            question: "Which language is commonly used to add interactivity to web pages?",
            options: ["CSS", "HTML", "JavaScript", "SQL"],
            answer: "JavaScript"
        },
        {
            question: "Which technology is used to store structured relational data?",
            options: ["SQL databases", "CSS", "HTML", "JPEG"],
            answer: "SQL databases"
        },
        {
            question: "Which data structure follows First In, First Out?",
            options: ["Stack", "Queue", "Tree", "Graph"],
            answer: "Queue"
        }
    ]
};


/* =========================================================
   FIND SUBJECT
========================================================= */

function getQuestionBank(subject) {

    const value =
        subject
            .toLowerCase()
            .trim();

    if (
        value.includes("python")
    ) {
        return questionBank.python;
    }

    if (
        value.includes("html")
    ) {
        return questionBank.html;
    }

    if (
        value.includes("css")
    ) {
        return questionBank.css;
    }

    if (
        value.includes("javascript") ||
        value === "js"
    ) {
        return questionBank.javascript;
    }

    if (
        value.includes("sql") ||
        value.includes("mysql") ||
        value.includes("database")
    ) {
        return questionBank.sql;
    }

    return questionBank.general;
}


/* =========================================================
   SHUFFLE
========================================================= */

function shuffleArray(array) {

    const copiedArray =
        [...array];

    for (
        let i = copiedArray.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            copiedArray[i],
            copiedArray[j]
        ] = [
            copiedArray[j],
            copiedArray[i]
        ];
    }

    return copiedArray;
}


/* =========================================================
   GENERATE QUIZ
========================================================= */

generateQuizButton.addEventListener(
    "click",
    generateQuiz
);


function generateQuiz() {

    const subject =
        quizSubject.value.trim();

    const count =
        Number(questionCount.value);

    const selectedType =
        document.querySelector(
            'input[name="quizType"]:checked'
        );


    if (!subject) {

        quizMessage.textContent =
            "Please enter a subject.";

        quizMessage.style.color =
            "red";

        return;
    }


    if (!selectedType) {

        quizMessage.textContent =
            "Please select a quiz type.";

        quizMessage.style.color =
            "red";

        return;
    }


    currentQuizType =
        selectedType.value;

    quizSubmitted =
        false;


    const bank =
        getQuestionBank(subject);


    if (!bank || bank.length === 0) {

        quizMessage.textContent =
            "No questions are available.";

        quizMessage.style.color =
            "red";

        return;
    }


    const shuffledQuestions =
        shuffleArray(bank);


    const selectedQuestions =
        shuffledQuestions.slice(
            0,
            Math.min(
                count,
                shuffledQuestions.length
            )
        );


    currentQuiz =
        selectedQuestions.map(
            (question) => {

                return {
                    question:
                        question.question,

                    options:
                        shuffleArray(
                            question.options
                        ),

                    answer:
                        question.answer
                };

            }
        );


    quizMessage.textContent =
        "Quiz generated successfully.";

    quizMessage.style.color =
        "green";


    displayQuiz();
}


/* =========================================================
   DISPLAY QUIZ
========================================================= */

function displayQuiz() {

    quizArea.innerHTML =
        "";


    currentQuiz.forEach(
        (item, index) => {

            const questionContainer =
                document.createElement(
                    "div"
                );


            questionContainer.className =
                "quiz-question";


            const questionTitle =
                document.createElement(
                    "h3"
                );


            questionTitle.textContent =
                `${index + 1}. ${item.question}`;


            questionContainer.appendChild(
                questionTitle
            );


            /* =========================
               MCQ
            ========================= */

            if (
                currentQuizType === "mcq"
            ) {

                item.options.forEach(
                    (option) => {

                        const label =
                            document.createElement(
                                "label"
                            );


                        label.className =
                            "quiz-option";


                        const radio =
                            document.createElement(
                                "input"
                            );


                        radio.type =
                            "radio";


                        radio.name =
                            `question-${index}`;


                        radio.value =
                            option;


                        label.appendChild(
                            radio
                        );


                        label.appendChild(
                            document.createTextNode(
                                ` ${option}`
                            )
                        );


                        questionContainer.appendChild(
                            label
                        );

                    }
                );

            }


            /* =========================
               WRITTEN ANSWER
            ========================= */

            else {

                const answerInput =
                    document.createElement(
                        "input"
                    );


                answerInput.type =
                    "text";


                answerInput.className =
                    "written-answer";


                answerInput.id =
                    `answer-${index}`;


                answerInput.placeholder =
                    "Write your answer";


                questionContainer.appendChild(
                    answerInput
                );

            }


            quizArea.appendChild(
                questionContainer
            );

        }
    );


    /* =========================
       SUBMIT BUTTON
    ========================= */

    const submitButton =
        document.createElement(
            "button"
        );


    submitButton.type =
        "button";


    submitButton.className =
        "submit-quiz";


    submitButton.textContent =
        "Submit Quiz";


    submitButton.addEventListener(
        "click",
        submitQuiz
    );


    quizArea.appendChild(
        submitButton
    );
}


/* =========================================================
   SUBMIT QUIZ
========================================================= */

function submitQuiz() {

    if (quizSubmitted) {

        return;
    }


    quizSubmitted =
        true;


    let score =
        0;


    const questionContainers =
        document.querySelectorAll(
            ".quiz-question"
        );


    currentQuiz.forEach(
        (item, index) => {

            let userAnswer =
                "";


            /* =========================
               GET ANSWER
            ========================= */

            if (
                currentQuizType === "mcq"
            ) {

                const selected =
                    document.querySelector(
                        `input[name="question-${index}"]:checked`
                    );


                if (selected) {

                    userAnswer =
                        selected.value;

                }

            }

            else {

                const input =
                    document.getElementById(
                        `answer-${index}`
                    );


                if (input) {

                    userAnswer =
                        input.value.trim();

                }

            }


            const questionContainer =
                questionContainers[index];


            if (!questionContainer) {

                return;
            }


            const correctAnswer =
                String(
                    item.answer
                ).trim();


            const normalizedUserAnswer =
                userAnswer
                    .toLowerCase();


            const normalizedCorrectAnswer =
                correctAnswer
                    .toLowerCase();


            const isCorrect =
                normalizedUserAnswer !== "" &&
                normalizedUserAnswer ===
                    normalizedCorrectAnswer;


            if (isCorrect) {

                score++;

            }


            /* =========================
               MCQ COLORS
            ========================= */

            if (
                currentQuizType === "mcq"
            ) {

                const options =
                    questionContainer.querySelectorAll(
                        ".quiz-option"
                    );


                options.forEach(
                    (optionLabel) => {

                        const radio =
                            optionLabel.querySelector(
                                'input[type="radio"]'
                            );


                        if (!radio) {

                            return;
                        }


                        optionLabel.classList.remove(
                            "correct-answer",
                            "wrong-answer"
                        );


                        if (
                            radio.value
                                .trim()
                                .toLowerCase() ===
                            normalizedCorrectAnswer
                        ) {

                            optionLabel.classList.add(
                                "correct-answer"
                            );

                        }


                        if (
                            radio.checked &&
                            !isCorrect
                        ) {

                            optionLabel.classList.add(
                                "wrong-answer"
                            );

                        }


                        radio.disabled =
                            true;

                    }
                );

            }


            /* =========================
               WRITTEN ANSWER
            ========================= */

            else {

                const input =
                    document.getElementById(
                        `answer-${index}`
                    );


                if (input) {

                    input.disabled =
                        true;


                    if (isCorrect) {

                        input.classList.add(
                            "correct-answer"
                        );

                    }

                    else {

                        input.classList.add(
                            "wrong-answer"
                        );

                    }

                }

            }


            /* =========================
               CORRECT ANSWER TEXT
            ========================= */

            const answerDisplay =
                document.createElement(
                    "p"
                );


            answerDisplay.className =
                "correct-answer-text";


            answerDisplay.textContent =
                `Correct answer: ${correctAnswer}`;


            questionContainer.appendChild(
                answerDisplay
            );

        }
    );


    /* =========================
       RESULT
    ========================= */

    const total =
        currentQuiz.length;


    const percentage =
        total > 0
            ? Math.round(
                (score / total) * 100
            )
            : 0;


    const result =
        document.createElement(
            "div"
        );


    result.className =
        "quiz-result";


    result.innerHTML = `
        <h2>Quiz Completed</h2>
        <p>Score: ${score}/${total}</p>
        <p>Percentage: ${percentage}%</p>
    `;


    quizArea.appendChild(
        result
    );


    quizMessage.textContent =
        "Quiz completed successfully.";

    quizMessage.style.color =
        "green";


    const submitButton =
        document.querySelector(
            ".submit-quiz"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

    }

}


/* =========================================================
   INITIAL MESSAGE
========================================================= */

if (quizMessage) {

    quizMessage.textContent =
        "Enter a subject and generate your quiz.";

}