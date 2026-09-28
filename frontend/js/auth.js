/* =========================================================
   AI STUDY ASSISTANT
   FRONTEND-ONLY AUTHENTICATION
========================================================= */

const registerForm =
    document.getElementById("registerForm");

const loginForm =
    document.getElementById("loginForm");


/* =========================================================
   REGISTER
========================================================= */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const fullName =
                document.getElementById("fullName").value.trim();

            const email =
                document.getElementById("email").value.trim().toLowerCase();

            const password =
                document.getElementById("password").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const message =
                document.getElementById("message");


            if (!fullName || !email || !password || !confirmPassword) {

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


            const users =
                JSON.parse(
                    localStorage.getItem("studyUsers") || "[]"
                );


            const existingUser =
                users.find(
                    function (user) {
                        return user.email === email;
                    }
                );


            if (existingUser) {

                showMessage(
                    message,
                    "An account with this email already exists.",
                    "error"
                );

                return;
            }


            const newUser = {

                id:
                    Date.now(),

                full_name:
                    fullName,

                email:
                    email,

                password:
                    password
            };


            users.push(newUser);


            localStorage.setItem(
                "studyUsers",
                JSON.stringify(users)
            );


            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: newUser.id,
                    full_name: newUser.full_name,
                    email: newUser.email
                })
            );


            showMessage(
                message,
                "Registration successful.",
                "success"
            );


            registerForm.reset();


            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1200
            );
        }
    );
}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const email =
                document.getElementById("email").value.trim().toLowerCase();

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("message");


            const users =
                JSON.parse(
                    localStorage.getItem("studyUsers") || "[]"
                );


            const user =
                users.find(
                    function (item) {

                        return (
                            item.email === email
                            &&
                            item.password === password
                        );

                    }
                );


            if (!user) {

                showMessage(
                    message,
                    "Invalid email or password.",
                    "error"
                );

                return;
            }


            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email
                })
            );


            localStorage.setItem(
                "user_id",
                String(user.id)
            );

            localStorage.setItem(
                "user_name",
                user.full_name
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
   MESSAGE
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