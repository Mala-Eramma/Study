/* =========================================================
   AI STUDY ASSISTANT
   GITHUB PAGES AUTHENTICATION
========================================================= */

const USERS_KEY = "study_assistant_users";
const CURRENT_USER_KEY = "user";


/* =========================================================
   REGISTER FORM
========================================================= */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const fullName =
                document.getElementById("fullName")
                    .value
                    .trim();

            const email =
                document.getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document.getElementById("password")
                    .value;

            const confirmPassword =
                document.getElementById("confirmPassword")
                    .value;

            const message =
                document.getElementById("message");


            /* =========================
               VALIDATION
            ========================= */

            if (
                !fullName ||
                !email ||
                !password ||
                !confirmPassword
            ) {

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


            /* =========================
               GET EXISTING USERS
            ========================= */

            const users =
                getUsers();


            /* =========================
               CHECK DUPLICATE EMAIL
            ========================= */

            const existingUser =
                users.find(
                    function (user) {

                        return user.email === email;

                    }
                );


            if (existingUser) {

                showMessage(
                    message,
                    "Email already registered. Please login.",
                    "error"
                );

                return;
            }


            /* =========================
               CREATE USER
            ========================= */

            const newUser = {

                id:
                    Date.now(),

                name:
                    fullName,

                email:
                    email,

                password:
                    password
            };


            users.push(
                newUser
            );


            /* =========================
               SAVE USER
            ========================= */

            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(users)
            );


            /* =========================
               SUCCESS
            ========================= */

            showMessage(
                message,
                "Registration successful.",
                "success"
            );


            registerForm.reset();


            /* =========================
               GO TO LOGIN
            ========================= */

            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1000
            );
        }
    );
}


/* =========================================================
   LOGIN FORM
========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const email =
                document.getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document.getElementById("password")
                    .value;

            const message =
                document.getElementById("message");


            /* =========================
               VALIDATION
            ========================= */

            if (!email || !password) {

                showMessage(
                    message,
                    "Please enter email and password.",
                    "error"
                );

                return;
            }


            /* =========================
               GET USERS
            ========================= */

            const users =
                getUsers();


            /* =========================
               FIND USER
            ========================= */

            const user =
                users.find(
                    function (item) {

                        return (
                            item.email === email &&
                            item.password === password
                        );

                    }
                );


            /* =========================
               INVALID LOGIN
            ========================= */

            if (!user) {

                showMessage(
                    message,
                    "Invalid email or password.",
                    "error"
                );

                return;
            }


            /* =========================
               CREATE LOGIN SESSION
            ========================= */

            const loggedInUser = {

                user_id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email
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


            /* =========================
               SUCCESS MESSAGE
            ========================= */

            showMessage(
                message,
                "Login successful.",
                "success"
            );


            /* =========================
               GO TO DASHBOARD
            ========================= */

            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                700
            );
        }
    );
}


/* =========================================================
   GET USERS
========================================================= */

function getUsers() {

    try {

        const savedUsers =
            localStorage.getItem(
                USERS_KEY
            );


        if (!savedUsers) {
            return [];
        }


        const users =
            JSON.parse(
                savedUsers
            );


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

function showMessage(
    element,
    text,
    type
) {

    if (!element) {
        return;
    }


    element.textContent =
        text;

    element.style.display =
        "block";


    if (type === "success") {

        element.style.color =
            "green";

    } else {

        element.style.color =
            "red";
    }
}