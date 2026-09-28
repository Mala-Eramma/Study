const USER_KEY = "user";
const HISTORY_KEY = "study_assistant_chat_history";
const CHAT_TOPICS_KEY = "study_assistant_chat_topics";

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);
const userId = user.user_id || user.id || user.email;

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const subjectInput = document.getElementById("subject");
const micButton = document.getElementById("micButton");


function addMessage(text, sender) {
    const message = document.createElement("div");

    message.className =
        sender === "user"
            ? "message user-message"
            : "message ai-message";

    message.textContent = text;

    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function saveChatHistory(question, answer) {
    let history = [];

    try {
        history = JSON.parse(
            localStorage.getItem(HISTORY_KEY) || "[]"
        );
    } catch {
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


function saveChatTopic(question) {
    let topics = [];

    try {
        topics = JSON.parse(
            localStorage.getItem(CHAT_TOPICS_KEY) || "[]"
        );
    } catch {
        topics = [];
    }

    if (!Array.isArray(topics)) {
        topics = [];
    }

    topics.push({
        user_id: userId,
        topic: question,
        date: new Date().toISOString()
    });

    localStorage.setItem(
        CHAT_TOPICS_KEY,
        JSON.stringify(topics)
    );
}


function speakAnswer(text) {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 0.85;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}


/* ---------------- PYTHON ---------------- */

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

    if (
        q.includes("inheritance")
    ) {
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

    if (
        q.includes("class")
    ) {
        return `1. A class is a blueprint for creating objects.

2. It can contain attributes and methods.

Example:

class Student:
    def study(self):
        print("Studying")

3. The class describes what an object can contain and do.

4. Objects are created from classes.`;
    }

    if (
        q.includes("object")
    ) {
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

4. It also allows you to provide a meaningful response when an error occurs.`;
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

    if (
        q.includes("input")
    ) {
        return `1. The input() function is used to receive information from the user.

Example:

name = input("Enter your name: ")

2. The entered value is normally returned as a string.

3. You can convert it to another type when required.

Example:

age = int(input("Enter age: "))`;
    }

    if (
        q.includes("print")
    ) {
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


/* ---------------- SQL ---------------- */

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

5. This connects the student_id value with the students table.`;
    }

    return null;
}


/* ---------------- HTML ---------------- */

function htmlAnswer(question) {

    const q = question.toLowerCase();

    if (
        q.includes("root element") ||
        q.includes("root element in html") ||
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

5. The <head> contains information about the webpage, while the <body> contains the visible webpage content.

6. Therefore, <html> is called the root element of an HTML document.`;
    }

    if (
        q.includes("anchor") ||
        q.includes("link") ||
        q.includes("href")
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


/* ---------------- CSS ---------------- */

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

    if (
        q.includes("grid")
    ) {
        return `1. CSS Grid is a layout system designed for rows and columns.

2. Example:

.container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

3. Grid is useful when you need two-dimensional layouts.

4. It is commonly used for page layouts, galleries, and card sections.`;
    }

    return null;
}


/* ---------------- JAVASCRIPT ---------------- */

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

    return null;
}


/* ---------------- OOPS ---------------- */

function oopsAnswer(question) {

    const q = question.toLowerCase();

    if (
        q.includes("encapsulation")
    ) {
        return `1. Encapsulation means combining data and the methods that operate on that data inside a class.

2. It also involves controlling access to the internal data.

3. In Python, naming conventions and properties can be used to control access.

4. Encapsulation helps protect data and keeps the implementation organized.`;
    }

    if (
        q.includes("polymorphism")
    ) {
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

    if (
        q.includes("abstraction")
    ) {
        return `1. Abstraction means hiding unnecessary implementation details and exposing only the important functionality.

2. It helps reduce complexity.

3. In Python, abstraction can be implemented using abstract base classes.

4. The user of a class can focus on what an operation does rather than how it is internally implemented.`;
    }

    return null;
}


/* ---------------- GENERAL QUESTIONS ---------------- */

function generalAnswer(question) {

    const q = question.toLowerCase();

    if (
        q.includes("what is") ||
        q.includes("define") ||
        q.includes("meaning of") ||
        q.startsWith("explain")
    ) {
        const cleanedQuestion = question
            .replace(/what is/gi, "")
            .replace(/define/gi, "")
            .replace(/meaning of/gi, "")
            .replace(/explain/gi, "")
            .trim();

        return `1. ${cleanedQuestion} is a concept or topic that should be understood based on its definition and use.

2. To understand it correctly, focus on what it means, how it works, and where it is used.

3. Example:
Study the definition first, then look at a simple real-world or programming example.

4. If you want a more specific explanation, ask about its definition, working, advantages, disadvantages, or example.`;
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

2. In programming, a feature is usually introduced to make code easier to write, reuse, maintain, maintain, or understand.

3. Its exact benefit depends on the specific topic.

4. The best way to understand it is to connect the feature with a simple example.`;
    }

    if (
        q.startsWith("how")
    ) {
        return `1. First identify the goal of the task.

2. Then divide the task into smaller steps.

3. Apply the appropriate concept or syntax.

4. Test the result with a simple example.

5. If you tell me the exact topic, I can explain the steps specifically for it.`;
    }

    return `I can answer study questions about Python, HTML, CSS, JavaScript, SQL, OOP, and other academic topics.

Please include the exact topic or concept in your question so I can give you a relevant explanation.`;
}


/* ---------------- MAIN ANSWER ENGINE ---------------- */

function generateStudyAnswer(question) {

    const q = question.toLowerCase();

    let answer = null;

    if (
        q.includes("python") ||
        q.includes("string") ||
        q.includes("variable") ||
        q.includes("list") ||
        q.includes("tuple") ||
        q.includes("dictionary") ||
        q.includes("function") ||
        q.includes("loop") ||
        q.includes("inheritance") ||
        q.includes("class") ||
        q.includes("object") ||
        q.includes("exception") ||
        q.includes("operator") ||
        q.includes("input") ||
        q.includes("print")
    ) {
        answer = pythonAnswer(question);
    }

    if (!answer && (
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

    if (!answer && (
        q.includes("html") ||
        q.includes("anchor") ||
        q.includes("href") ||
        q.includes("form") ||
        q.includes("tag")
    )) {
        answer = htmlAnswer(question);
    }

    if (!answer && (
        q.includes("css") ||
        q.includes("media query") ||
        q.includes("responsive") ||
        q.includes("flexbox") ||
        q.includes("grid")
    )) {
        answer = cssAnswer(question);
    }

    if (!answer && (
        q.includes("javascript") ||
        q.includes("array") ||
        q.includes("let") ||
        q.includes("const")
    )) {
        answer = javascriptAnswer(question);
    }

    if (!answer && (
        q.includes("oops") ||
        q.includes("encapsulation") ||
        q.includes("polymorphism") ||
        q.includes("abstraction")
    )) {
        answer = oopsAnswer(question);
    }

    if (!answer) {
        answer = generalAnswer(question);
    }

    return answer;
}


/* ---------------- ASK QUESTION ---------------- */

chatForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const question = chatInput.value.trim();

    if (!question) {
        return;
    }

    addMessage(question, "user");

    chatInput.value = "";

    const answer = generateStudyAnswer(question);

    addMessage(answer, "ai");

    saveChatHistory(question, answer);
    saveChatTopic(question);

    speakAnswer(answer);
});


/* ---------------- VOICE INPUT ---------------- */

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    micButton.addEventListener("click", function () {

        recognition.start();

    });

    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        chatInput.value = transcript;

    };

    recognition.onerror = function (event) {

        console.error(
            "Speech recognition error:",
            event.error
        );

    };

} else {

    if (micButton) {
        micButton.disabled = true;
    }

}


/* ---------------- LOAD HISTORY ---------------- */

function loadChatHistory() {

    let history = [];

    try {
        history = JSON.parse(
            localStorage.getItem(HISTORY_KEY) || "[]"
        );
    } catch {
        history = [];
    }

    if (!Array.isArray(history)) {
        return;
    }

    const userHistory = history.filter(item =>
        String(item.user_id) === String(userId)
    );

    userHistory.forEach(item => {

        addMessage(
            item.question,
            "user"
        );

        addMessage(
            item.answer,
            "ai"
        );

    });
}


loadChatHistory();