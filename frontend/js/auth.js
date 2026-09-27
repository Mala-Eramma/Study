const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const API_URL = "http://127.0.0.1:8000";


/* =========================================================
   Login
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }


        try {

            const response = await fetch(
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


            const data = await response.json();


            if (!response.ok) {
                alert(data.detail || "Login failed.");
                return;
            }


            localStorage.setItem(
                "user",
                JSON.stringify(data)
            );


            window.location.href = "dashboard.html";

        } catch (error) {

            alert(
                "Unable to connect to the server."
            );

            console.error(error);
        }

    });

}

/* =========================================================
   Register
   ========================================================= */

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const registerMessage =
            document.getElementById("registerMessage");


        registerMessage.textContent = "";
        registerMessage.className =
            "register-message";


        if (!name || !email || !password || !confirmPassword) {

            registerMessage.textContent =
                "Please fill in all fields.";

            registerMessage.classList.add("error");

            return;
        }


        if (password !== confirmPassword) {

            registerMessage.textContent =
                "Passwords do not match.";

            registerMessage.classList.add("error");

            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                registerMessage.textContent =
                    data.detail || "Registration failed.";

                registerMessage.classList.add("error");

                return;
            }


            registerMessage.textContent =
                "Registration successful. You can now login.";

            registerMessage.classList.add("success");


            registerForm.reset();


        } catch (error) {

            registerMessage.textContent =
                "Unable to connect to the server.";

            registerMessage.classList.add("error");

            console.error(error);
        }

    });

}