/* =========================================================
   AI STUDY ASSISTANT - CHAT
   GitHub Pages / Frontend Version
   ========================================================= */

const USER_KEY = "user";
const HISTORY_KEY = "study_assistant_chat_history";
const CHAT_TOPICS_KEY = "study_assistant_chat_topics";

/* =========================================================
   GET LOGGED-IN USER
   ========================================================= */

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

let user = {};

try {
    user = JSON.parse(userData || "{}");
} catch (error) {
    console.error("Invalid user data:", error);
    window.location.href = "login.html";
}

const userId =
    user.user_id ||
    user.id ||
    user.email ||
    "guest";


/* =========================================================
   GET HTML ELEMENTS
   ========================================================= */

const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");

const chatMessages =
    document.getElementById("chatMessages");

const subjectInput =
    document.getElementById("subjectInput");

const micButton =
    document.getElementById("voiceButton");

const voiceStatus =
    document.getElementById("voiceStatus");


/* =========================================================
   ADD MESSAGE TO CHAT
   ========================================================= */

function addMessage(text, sender) {

    if (!chatMessages) {
        return;
    }

    const message =
        document.createElement("div");

    message.className =
        sender === "user"
            ? "message user-message"
            : "message ai-message";

    message.textContent = text;

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =========================================================
   SAVE CHAT HISTORY
   ========================================================= */

function saveChatHistory(question, answer) {

    let history = [];

    try {

        history = JSON.parse(
            localStorage.getItem(HISTORY_KEY) || "[]"
        );

    } catch (error) {

        history = [];
    }

    if (!Array.isArray(history)) {
        history = [];
    }

    history.push({

        user_id: userId,

        question: question,

        answer: answer,

        date: new Date().toISOString()

    });

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


/* =========================================================
   SAVE CHAT TOPIC
   ========================================================= */

function saveChatTopic(subject, question) {

    let topics = [];

    try {

        topics = JSON.parse(
            localStorage.getItem(CHAT_TOPICS_KEY) || "[]"
        );

    } catch (error) {

        topics = [];
    }

    if (!Array.isArray(topics)) {
        topics = [];
    }

    topics.push({

        user_id: userId,

        subject: subject,

        topic: question,

        date: new Date().toISOString()

    });

    localStorage.setItem(
        CHAT_TOPICS_KEY,
        JSON.stringify(topics)
    );
}


/* =========================================================
   SPEAK ANSWER
   ========================================================= */

function speakAnswer(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 0.85;

    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}


/* =========================================================
   PYTHON ANSWERS
   ========================================================= */

function pythonAnswer(question) {

    const q = question.toLowerCase();


    if (
        q.includes("string") ||
        q.includes("strings")
    ) {

        return `1. A string is a sequence of characters written inside quotes.

2. Python supports single quotes and double quotes.

3. Example:

name = "Eramma"

4. Strings are commonly used to store names, messages, and text.

5. You can access individual characters using indexing.

Example:

name[0]

This returns the first character.`;
    }


    if (
        q.includes("variable") ||
        q.includes("variables")
    ) {

        return `1. A variable is a name used to store a value.

2. Python does not require you to declare the data type separately.

3. Example:

age = 21

4. Here, age is the variable and 21 is its value.

5. The value stored in a variable can be changed later.`;
    }


    if (
        q.includes("list") ||
        q.includes("lists")
    ) {

        return `1. A list is an ordered collection of items.

2. Lists are written using square brackets.

Example:

numbers = [10, 20, 30]

3. Lists can contain different data types.

4. Lists are mutable, which means their contents can be changed.

5. You can add, remove, or modify items in a list.`;
    }


    if (
        q.includes("tuple") ||
        q.includes("tuples")
    ) {

        return `1. A tuple is an ordered collection of items.

2. Tuples are usually written using parentheses.

Example:

data = (10, 20, 30)

3. Tuples are immutable.

4. This means their elements cannot normally be changed after creation.

5. Tuples are useful when the data should remain unchanged.`;
    }


    if (
        q.includes("dictionary") ||
        q.includes("dictionaries")
    ) {

        return `1. A dictionary stores data as key-value pairs.

2. Dictionaries are written using curly braces.

Example:

student = {"name": "Ravi", "age": 21}

3. The key is used to access its corresponding value.

4. Dictionaries are useful for representing structured information.

5. Values can be changed, added, or removed.`;
    }


    if (
        q.includes("function") ||
        q.includes("functions")
    ) {

        return `1. A function is a reusable block of code.

2. Functions are created using the def keyword.

Example:

def add(a, b):
    return a + b

3. Functions help avoid repeating the same code.

4. They can accept parameters.

5. They can return a result using return.`;
    }


    if (
        q.includes("loop") ||
        q.includes("loops") ||
        q.includes("for loop") ||
        q.includes("while loop")
    ) {

        return `1. A loop is used to execute a block of code repeatedly.

2. Python mainly provides for loops and while loops.

3. A for loop is commonly used when iterating through a sequence.

Example:

for i in range(5):
    print(i)

4. A while loop continues while its condition is true.

5. Loops reduce repeated code.`;
    }


    if (q.includes("inheritance")) {

        return `1. Inheritance allows one class to acquire properties and methods from another class.

2. The existing class is called the parent class.

3. The new class is called the child class.

Example:

class Animal:
    def speak(self):
        print("Animal sound")

class Dog(Animal):
    pass

4. Dog inherits the speak() method from Animal.

5. Inheritance improves code reuse.`;
    }


    if (q.includes("class")) {

        return `1. A class is a blueprint for creating objects.

2. It can contain attributes and methods.

Example:

class Student:
    def study(self):
        print("Studying")

3. The class describes what an object can contain and do.

4. Objects are created from classes.`;
    }


    if (q.includes("object")) {

        return `1. An object is an instance of a class.

2. A class defines the structure and behavior.

3. The object is the actual entity created from that class.

Example:

student1 = Student()

4. Here, student1 is an object of the Student class.`;
    }


    if (
        q.includes("exception") ||
        q.includes("error handling")
    ) {

        return `1. Exception handling is used to handle errors that occur while a program is running.

2. Python commonly uses try, except, else, and finally.

Example:

try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")

3. It prevents the program from stopping unexpectedly.

4. It allows you to provide a meaningful response when an error occurs.`;
    }


    if (
        q.includes("operator") ||
        q.includes("operators")
    ) {

        return `1. Operators are symbols used to perform operations on values.

2. Arithmetic operators perform calculations.

Examples:

+
-
*
/
%

3. Comparison operators compare values.

Examples:

>
<
==
!=

4. Logical operators combine conditions.

Examples:

and
or
not`;
    }


    if (q.includes("input")) {

        return `1. The input() function is used to receive information from the user.

Example:

name = input("Enter your name: ")

2. The entered value is normally returned as a string.

3. You can convert it to another type when required.

Example:

age = int(input("Enter age: "))`;
    }


    if (q.includes("print")) {

        return `1. The print() function displays information on the screen.

Example:

print("Hello")

2. It can display variables.

Example:

name = "Ravi"
print(name)

3. It can also display multiple values.

Example:

print("Age:", 21)`;
    }


    return null;
}


/* =========================================================
   JAVA ANSWERS
   ========================================================= */

function javaAnswer(question) {

    const q = question.toLowerCase();


    if (
        q.includes("what is java") ||
        q === "java" ||
        q.includes("define java") ||
        q.includes("java meaning")
    ) {

        return `1. Definition: Java is a high-level, object-oriented programming language used to build different types of applications.

2. Simple explanation: Java allows developers to write programs that can run on different platforms using the Java Virtual Machine.

3. Example: Java is widely used for web applications, enterprise applications, Android development, and software applications.

4. Java follows the principle "Write Once, Run Anywhere."`;
    }


    if (
        q.includes("features of java") ||
        q.includes("java features")
    ) {

        return `1. Java is object-oriented.

2. Java is platform independent.

3. Java is secure.

4. Java is robust and reliable.

5. Java supports multithreading.

6. Java provides automatic memory management.

7. Java follows the principle "Write Once, Run Anywhere."`;
    }


    if (
        q.includes("advantages of java") ||
        q.includes("java advantages")
    ) {

        return `1. Java is platform independent.

2. It supports object-oriented programming.

3. It provides security features.

4. It supports reusable code.

5. It has automatic memory management.

6. Java is widely used for developing different types of applications.`;
    }


    if (
        q.includes("jvm") ||
        q.includes("java virtual machine")
    ) {

        return `1. JVM stands for Java Virtual Machine.

2. JVM executes Java bytecode.

3. It converts bytecode into instructions that the computer can execute.

4. JVM allows Java programs to run on different operating systems.

5. JVM is an important part of Java's platform independence.`;
    }


    if (
        q.includes("jre") ||
        q.includes("java runtime environment")
    ) {

        return `1. JRE stands for Java Runtime Environment.

2. JRE provides the environment required to run Java applications.

3. It contains the JVM and required Java libraries.

4. JRE is mainly used for running Java programs.`;
    }


    if (
        q.includes("jdk") ||
        q.includes("java development kit")
    ) {

        return `1. JDK stands for Java Development Kit.

2. JDK is used to develop Java applications.

3. It contains development tools such as the Java compiler.

4. JDK includes the JRE and development tools.

5. Developers normally install the JDK to create Java programs.`;
    }


    if (
        q.includes("java class") ||
        q.includes("class in java")
    ) {

        return `1. A class in Java is a blueprint used to create objects.

2. A class can contain variables and methods.

Example:

class Student {
    String name;

    void study() {
        System.out.println("Studying");
    }
}

3. Objects can be created from the class.

4. Classes are an important part of object-oriented programming.`;
    }


    return null;
}


/* =========================================================
   SQL ANSWERS
   ========================================================= */

function sqlAnswer(question) {

    const q = question.toLowerCase();


    if (
        q.includes("select") ||
        q.includes("retrieve")
    ) {

        return `1. SELECT is used to retrieve data from a database table.

Example:

SELECT * FROM students;

2. The * means all columns.

3. You can select specific columns.

Example:

SELECT name, age
FROM students;

4. WHERE can be used to filter records.`;
    }


    if (q.includes("insert")) {

        return `1. INSERT is used to add new records to a table.

Example:

INSERT INTO students
(name, age)
VALUES
("Ravi", 21);

2. The column names identify where the values should be stored.

3. INSERT adds a new row to the table.`;
    }


    if (q.includes("update")) {

        return `1. UPDATE is used to modify existing records.

Example:

UPDATE students
SET age = 22
WHERE name = "Ravi";

2. SET specifies the new value.

3. WHERE identifies which records should be changed.

4. Without an appropriate WHERE condition, multiple rows may be modified.`;
    }


    if (q.includes("delete")) {

        return `1. DELETE is used to remove records from a table.

Example:

DELETE FROM students
WHERE id = 5;

2. WHERE identifies the record to remove.

3. Without WHERE, all records in the table can be deleted.`;
    }


    if (q.includes("primary key")) {

        return `1. A primary key uniquely identifies each record in a table.

2. Each primary-key value must be unique.

3. A primary key cannot contain NULL values.

4. Example:

CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

5. Here, id uniquely identifies each student.`;
    }


    if (q.includes("foreign key")) {

        return `1. A foreign key creates a relationship between tables.

2. It usually refers to the primary key of another table.

3. It helps maintain relationships between related records.

4. Example:

student_id INT,
FOREIGN KEY (student_id)
REFERENCES students(id)

5. This connects student_id with the students table.`;
    }


    return null;
}


/* =========================================================
   HTML ANSWERS
   ========================================================= */

function htmlAnswer(question) {

    const q = question.toLowerCase();


    if (
        q.includes("root element") ||
        q.includes("root tag")
    ) {

        return `1. The root element in HTML is the <html> element.

2. It is the top-level element of an HTML document.

3. All other HTML elements are placed inside the <html> element.

4. A basic HTML structure looks like this:

<html>
    <head>
        <title>My Page</title>
    </head>

    <body>
        <h1>Hello</h1>
    </body>
</html>

5. The <head> contains information about the webpage, while the <body> contains the visible webpage content.`;
    }


    if (
        q.includes("anchor") ||
        q.includes("href") ||
        q.includes("hyperlink")
    ) {

        return `1. The HTML anchor tag is used to create a hyperlink.

2. The anchor tag is written using <a>.

3. The href attribute specifies the destination.

Example:

<a href="https://example.com">
    Visit Website
</a>

4. When the user clicks the link, the browser opens the specified destination.

5. Anchor tags can also link to another page, section, email address, or file.`;
    }


    if (
        q.includes("form") ||
        q.includes("forms")
    ) {

        return `1. The HTML form element is used to collect user input.

2. Forms can contain inputs, labels, buttons, and other controls.

Example:

<form>
    <label>Name:</label>
    <input type="text">
    <button type="submit">Submit</button>
</form>

3. Forms are commonly used for login, registration, search, and data collection.`;
    }


    if (
        q.includes("tag") ||
        q.includes("tags")
    ) {

        return `1. HTML tags define the structure and meaning of webpage content.

2. Examples include:

<h1> for headings
<p> for paragraphs
<a> for links
<img> for images
<table> for tables

3. Most HTML elements have an opening tag and a closing tag.

4. Some elements, such as img, do not require a closing tag.`;
    }


    return null;
}


/* =========================================================
   CSS ANSWERS
   ========================================================= */

function cssAnswer(question) {

    const q = question.toLowerCase();


    if (
        q.includes("media quer") ||
        q.includes("responsive")
    ) {

        return `1. CSS media queries are used to apply different styles depending on screen or device conditions.

2. They are commonly used for responsive web design.

Example:

@media (max-width: 600px) {
    body {
        font-size: 14px;
    }
}

3. The styles inside the media query apply when the screen width is 600px or less.

4. Media queries help webpages work on desktops, tablets, and mobile devices.`;
    }


    if (
        q.includes("flexbox") ||
        q.includes("flex")
    ) {

        return `1. Flexbox is a CSS layout system.

2. It is mainly used to arrange elements in a row or column.

3. Example:

.container {
    display: flex;
}

4. justify-content controls alignment along the main axis.

5. align-items controls alignment along the cross axis.

6. Flexbox is useful for navigation bars, cards, and centered layouts.`;
    }


    if (q.includes("grid")) {

        return `1. CSS Grid is a layout system designed for rows and columns.

2. Example:

.container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

3. Grid is useful when you need two-dimensional layouts.

4. It is commonly used for page layouts, galleries, and card sections.`;
    }


    if (
        q.includes("margin") ||
        q.includes("padding")
    ) {

        return `1. Margin is the space outside an element.

2. Padding is the space inside an element between its content and border.

3. Example:

.box {
    margin: 20px;
    padding: 20px;
}

4. Margin creates space around the element.

5. Padding creates space inside the element.`;
    }


    return null;
}


/* =========================================================
   JAVASCRIPT ANSWERS
   ========================================================= */

function javascriptAnswer(question) {

    const q = question.toLowerCase();


    if (
        q.includes("variable") ||
        q.includes("let") ||
        q.includes("const") ||
        q.includes("var")
    ) {

        return `1. JavaScript variables store values.

2. let is used when the value may change.

Example:

let age = 21;

3. const is used when the variable should not be reassigned.

Example:

const pi = 3.14;

4. var is the older variable declaration keyword and is generally avoided in modern JavaScript when let or const is suitable.`;
    }


    if (
        q.includes("function") ||
        q.includes("functions")
    ) {

        return `1. A JavaScript function is a reusable block of code.

Example:

function add(a, b) {
    return a + b;
}

2. Functions can receive parameters.

3. They can return a result.

4. Functions help organize code and avoid repetition.`;
    }


    if (
        q.includes("array") ||
        q.includes("arrays")
    ) {

        return `1. An array stores multiple values in a single variable.

Example:

let numbers = [10, 20, 30];

2. Array indexing starts from 0.

3. numbers[0] returns 10.

4. JavaScript arrays can contain different types of values.

5. Common methods include push(), pop(), shift(), and unshift().`;
    }


    if (q.includes("dom")) {

        return `1. DOM stands for Document Object Model.

2. The DOM represents an HTML document as objects.

3. JavaScript can use the DOM to change webpage content, styles, and elements.

Example:

document.getElementById("title").textContent = "Hello";

4. DOM manipulation makes webpages interactive.`;
    }


    return null;
}


/* =========================================================
   OOPS ANSWERS
   ========================================================= */

function oopsAnswer(question) {

    const q = question.toLowerCase();


    if (q.includes("oops") || q.includes("oop")) {

        return `1. OOP stands for Object-Oriented Programming.

2. It is a programming paradigm based on objects and classes.

3. The main concepts of OOP are:

- Encapsulation
- Inheritance
- Polymorphism
- Abstraction

4. OOP helps organize programs into reusable and manageable components.`;
    }


    if (q.includes("encapsulation")) {

        return `1. Encapsulation means combining data and the methods that operate on that data inside a class.

2. It also involves controlling access to internal data.

3. Encapsulation helps protect data.

4. It keeps the implementation organized and improves maintainability.`;
    }


    if (q.includes("polymorphism")) {

        return `1. Polymorphism means that the same interface or method name can behave differently for different objects.

2. Different classes can provide their own implementation of the same method.

Example:

class Dog:
    def sound(self):
        print("Bark")

class Cat:
    def sound(self):
        print("Meow")

3. Both objects provide sound(), but their behavior is different.`;
    }


    if (q.includes("abstraction")) {

        return `1. Abstraction means hiding unnecessary implementation details and exposing only the important functionality.

2. It helps reduce complexity.

3. In Python, abstraction can be implemented using abstract base classes.

4. The user can focus on what an operation does rather than how it is internally implemented.`;
    }


    return null;
}


/* =========================================================
   GENERAL ANSWERS
   ========================================================= */

function generalAnswer(question, subject) {

    const q =
        question.toLowerCase().trim();

    const subjectText =
        subject
            ? subject.trim()
            : "";


    if (
        q.includes("hello") ||
        q.includes("hi") ||
        q.includes("hey")
    ) {

        return `Hello. I am your AI Study Assistant.

You can ask me questions about Python, Java, HTML, CSS, JavaScript, SQL, OOP, and other study topics.`;
    }


    if (
        q.includes("what is") ||
        q.includes("define") ||
        q.includes("meaning of") ||
        q.startsWith("explain")
    ) {

        const cleanedQuestion =
            question
                .replace(/what is/gi, "")
                .replace(/define/gi, "")
                .replace(/meaning of/gi, "")
                .replace(/explain/gi, "")
                .trim();

        return `1. ${cleanedQuestion} is a concept or topic that should be understood based on its definition and use.

2. To understand it correctly, focus on what it means, how it works, and where it is used.

3. Subject: ${subjectText || "General Study"}

4. Example:
Study the definition first, then look at a simple real-world or programming example.

5. If you want a more specific explanation, ask about its definition, working, advantages, disadvantages, or example.`;
    }


    if (
        q.includes("difference between") ||
        q.includes("difference of") ||
        q.includes(" vs ")
    ) {

        return `1. The two concepts are related but are used for different purposes.

2. The first concept should be understood by its definition and main use.

3. The second concept should be understood in the same way.

4. The important difference depends on their purpose, behavior, and usage.

5. Give me the two exact concepts if you want a direct point-by-point comparison.`;
    }


    if (
        q.startsWith("why") ||
        q.includes("why do we")
    ) {

        return `1. The reason depends on the purpose of the concept you are asking about.

2. In programming, a feature is usually introduced to make code easier to write, reuse, or understand.

3. Its exact benefit depends on the specific topic.

4. The best way to understand it is to connect the feature with a simple example.`;
    }


    if (q.startsWith("how")) {

        return `1. First identify the goal of the task.

2. Then divide the task into smaller steps.

3. Apply the appropriate concept or syntax.

4. Test the result with a simple example.

5. If you tell me the exact topic, I can explain the steps specifically for it.`;
    }


    return `I can answer study questions about Python, Java, HTML, CSS, JavaScript, SQL, OOP, and other academic topics.

Please include the exact topic or concept in your question so I can give you a relevant explanation.`;
}


/* =========================================================
   MAIN ANSWER ENGINE
   ========================================================= */

function generateStudyAnswer(question, subject) {

    const q =
        question.toLowerCase().trim();

    const subjectText =
        subject.toLowerCase().trim();

    let answer = null;


    /* JAVA */

    if (
        subjectText.includes("java") ||
        q.includes("java") ||
        q.includes("jvm") ||
        q.includes("jdk") ||
        q.includes("jre")
    ) {

        answer = javaAnswer(question);
    }


    /* PYTHON */

    if (!answer && (
        subjectText.includes("python") ||
        q.includes("python") ||
        q.includes("string") ||
        q.includes("variable") ||
        q.includes("list") ||
        q.includes("tuple") ||
        q.includes("dictionary") ||
        q.includes("loop") ||
        q.includes("inheritance") ||
        q.includes("exception") ||
        q.includes("operator") ||
        q.includes("input") ||
        q.includes("print")
    )) {

        answer = pythonAnswer(question);
    }


    /* SQL */

    if (!answer && (
        subjectText.includes("sql") ||
        subjectText.includes("mysql") ||
        q.includes("sql") ||
        q.includes("mysql") ||
        q.includes("primary key") ||
        q.includes("foreign key") ||
        q.includes("select") ||
        q.includes("insert") ||
        q.includes("update") ||
        q.includes("delete")
    )) {

        answer = sqlAnswer(question);
    }


    /* HTML */

    if (!answer && (
        subjectText.includes("html") ||
        q.includes("html") ||
        q.includes("anchor") ||
        q.includes("href") ||
        q.includes("hyperlink")
    )) {

        answer = htmlAnswer(question);
    }


    /* CSS */

    if (!answer && (
        subjectText.includes("css") ||
        q.includes("css") ||
        q.includes("media query") ||
        q.includes("responsive") ||
        q.includes("flexbox") ||
        q.includes("grid")
    )) {

        answer = cssAnswer(question);
    }


    /* JAVASCRIPT */

    if (!answer && (
        subjectText.includes("javascript") ||
        subjectText === "js" ||
        q.includes("javascript") ||
        q.includes("array") ||
        q.includes("dom") ||
        q.includes("let") ||
        q.includes("const")
    )) {

        answer = javascriptAnswer(question);
    }


    /* OOPS */

    if (!answer && (
        subjectText.includes("oops") ||
        subjectText.includes("oop") ||
        q.includes("oops") ||
        q.includes("oop") ||
        q.includes("encapsulation") ||
        q.includes("polymorphism") ||
        q.includes("abstraction")
    )) {

        answer = oopsAnswer(question);
    }


    /* GENERAL */

    if (!answer) {

        answer =
            generalAnswer(
                question,
                subject
            );
    }


    return answer;
}


/* =========================================================
   ASK QUESTION
   ========================================================= */

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const question =
                chatInput
                    ? chatInput.value.trim()
                    : "";


            const subject =
                subjectInput
                    ? subjectInput.value.trim()
                    : "";


            if (!subject) {

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "Please enter a subject.";
                }

                if (subjectInput) {
                    subjectInput.focus();
                }

                return;
            }


            if (!question) {

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "Please enter a question.";
                }

                if (chatInput) {
                    chatInput.focus();
                }

                return;
            }


            /* SHOW USER QUESTION */

            addMessage(
                `${subject}: ${question}`,
                "user"
            );


            /* CLEAR QUESTION ONLY */

            if (chatInput) {
                chatInput.value = "";
            }


            /* GENERATE ANSWER */

            const answer =
                generateStudyAnswer(
                    question,
                    subject
                );


            /* SHOW AI ANSWER */

            addMessage(
                answer,
                "ai"
            );


            /* SAVE HISTORY */

            saveChatHistory(
                question,
                answer
            );


            /* SAVE TOPIC */

            saveChatTopic(
                subject,
                question
            );


            /* VOICE STATUS */

            if (voiceStatus) {

                voiceStatus.textContent =
                    "Answer received.";
            }


            /* SPEAK ANSWER */

            speakAnswer(answer);
        }
    );
}


/* =========================================================
   VOICE INPUT
   ========================================================= */

if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
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


    if (micButton) {

        micButton.addEventListener(
            "click",
            function () {

                try {

                    recognition.start();

                    if (voiceStatus) {

                        voiceStatus.textContent =
                            "Listening...";
                    }

                } catch (error) {

                    console.log(
                        "Voice recognition is already running."
                    );
                }
            }
        );
    }


    recognition.onresult =
        function (event) {

            const transcript =
                event
                    .results[0][0]
                    .transcript;


            if (chatInput) {

                chatInput.value =
                    transcript;
            }


            if (voiceStatus) {

                voiceStatus.textContent =
                    "Voice input received. Press Ask.";
            }
        };


    recognition.onend =
        function () {

            if (
                voiceStatus &&
                voiceStatus.textContent ===
                    "Listening..."
            ) {

                voiceStatus.textContent =
                    "Listening stopped.";
            }
        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            if (voiceStatus) {

                if (
                    event.error ===
                    "not-allowed"
                ) {

                    voiceStatus.textContent =
                        "Microphone permission was denied.";

                } else {

                    voiceStatus.textContent =
                        "Voice input could not be used. Please try again.";
                }
            }
        };

} else {

    if (micButton) {

        micButton.disabled =
            true;

        micButton.title =
            "Voice input is not supported by this browser.";
    }


    if (voiceStatus) {

        voiceStatus.textContent =
            "Voice input is not supported by this browser.";
    }
}


/* =========================================================
   LOAD CHAT HISTORY
   ========================================================= */

function loadChatHistory() {

    let history = [];

    try {

        history = JSON.parse(
            localStorage.getItem(
                HISTORY_KEY
            ) || "[]"
        );

    } catch (error) {

        history = [];
    }


    if (!Array.isArray(history)) {
        return;
    }


    const userHistory =
        history.filter(
            item =>
                String(item.user_id) ===
                String(userId)
        );


    userHistory.forEach(
        function (item) {

            const savedQuestion =
                item.question || "";


            const savedAnswer =
                item.answer || "";


            addMessage(
                savedQuestion,
                "user"
            );


            addMessage(
                savedAnswer,
                "ai"
            );
        }
    );
}


/* =========================================================
   LOAD PREVIOUS CHAT
   ========================================================= */

loadChatHistory();