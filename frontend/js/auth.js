/* =========================================================
   AI STUDY ASSISTANT
   BACKEND AUTHENTICATION
========================================================= */

const API_URL = "http://localhost:8000";

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
        async function (event) {

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


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                name: fullName,
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showMessage(
                        message,
                        data.detail || "Registration failed.",
                        "error"
                    );

                    return;
                }


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

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                showMessage(
                    message,
                    "Unable to connect to the server.",
                    "error"
                );
            }
        }
    );
}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("email").value.trim().toLowerCase();

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("message");


            if (!email || !password) {

                showMessage(
                    message,
                    "Please enter email and password.",
                    "error"
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showMessage(
                        message,
                        data.detail || "Invalid email or password.",
                        "error"
                    );

                    return;
                }


                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        user_id: data.user_id,
                        name: data.name,
                        email: data.email
                    })
                );


                localStorage.setItem(
                    "user_id",
                    String(data.user_id)
                );


                localStorage.setItem(
                    "user_name",
                    data.name
                );


                localStorage.setItem(
                    "user_email",
                    data.email
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

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                showMessage(
                    message,
                    "Unable to connect to the server.",
                    "error"
                );
            }
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