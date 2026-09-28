const USERS_KEY = "study_assistant_users";
const CURRENT_USER_KEY = "user";


/* =========================================================
   REGISTER
========================================================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();

        const email = document.getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password = document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("registerMessage");


        if (!name || !email || !password || !confirmPassword) {
            showMessage(
                message,
                "Please fill in all fields.",
                "error"
            );
            return;
        }


        if (password !== confirmPassword) {
            showMessage(
                message,
                "Passwords do not match.",
                "error"
            );
            return;
        }


        if (password.length < 6) {
            showMessage(
                message,
                "Password must contain at least 6 characters.",
                "error"
            );
            return;
        }


        const users = getUsers();


        const existingUser = users.find(function (user) {
            return user.email === email;
        });


        if (existingUser) {
            showMessage(
                message,
                "Email already registered. Please login.",
                "error"
            );
            return;
        }


        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password
        };


        users.push(newUser);


        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );


        showMessage(
            message,
            "Registration successful.",
            "success"
        );


        registerForm.reset();


        setTimeout(function () {

            window.location.href = "login.html";

        }, 1000);

    });
}


/* =========================================================
   LOGIN
========================================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const email = document.getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password = document.getElementById("password").value;


        let message = document.getElementById("loginMessage");


        if (!message) {

            message = document.createElement("p");

            message.id = "loginMessage";

            message.className = "register-message";

            loginForm.appendChild(message);
        }


        if (!email || !password) {

            showMessage(
                message,
                "Please enter email and password.",
                "error"
            );

            return;
        }


        const users = getUsers();


        const user = users.find(function (item) {

            return (
                item.email === email &&
                item.password === password
            );

        });


        if (!user) {

            showMessage(
                message,
                "Invalid email or password.",
                "error"
            );

            return;
        }


        const loggedInUser = {

            user_id: user.id,

            name: user.name,

            email: user.email

        };


        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(loggedInUser)
        );


        localStorage.setItem(
            "user_id",
            String(user.id)
        );


        localStorage.setItem(
            "user_name",
            user.name
        );


        localStorage.setItem(
            "user_email",
            user.email
        );


        showMessage(
            message,
            "Login successful.",
            "success"
        );


        setTimeout(function () {

            window.location.href = "dashboard.html";

        }, 700);

    });
}


/* =========================================================
   GET USERS
========================================================= */

function getUsers() {

    try {

        const savedUsers =
            localStorage.getItem(USERS_KEY);


        if (!savedUsers) {

            return [];

        }


        const users =
            JSON.parse(savedUsers);


        if (!Array.isArray(users)) {

            return [];

        }


        return users;

    } catch (error) {

        console.error(
            "Unable to read users:",
            error
        );

        return [];

    }
}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(element, text, type) {

    if (!element) {

        return;

    }


    element.textContent = text;

    element.style.display = "block";


    if (type === "success") {

        element.style.color = "green";

    } else {

        element.style.color = "red";

    }

}