const API_URL = "https://study-i3wy.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    function showMessage(element, message, isError = false) {
        element.textContent = message;
        element.style.color = isError ? "red" : "green";
    }

    async function sendRequest(endpoint, data) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "Request failed. Please try again."
            );
        }

        return result;
    }

    // REGISTER
    if (registerForm) {
        const message = document.getElementById("registerMessage");

        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                showMessage(message, "Passwords do not match.", true);
                return;
            }

            if (password.length < 6) {
                showMessage(message, "Password must contain at least 6 characters.", true);
                return;
            }

            try {
                showMessage(message, "Registering your account...");

                await sendRequest("/auth/register", {
                    name,
                    email,
                    password
                });

                showMessage(message, "Registration successful. Please log in.");
                registerForm.reset();

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            } catch (error) {
                showMessage(message, error.message, true);
            }
        });
    }

    // LOGIN
    if (loginForm) {
        let message = document.getElementById("loginMessage");

        if (!message) {
            message = document.createElement("p");
            message.id = "loginMessage";
            loginForm.appendChild(message);
        }

        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;

            try {
                showMessage(message, "Logging in...");

                const result = await sendRequest("/auth/login", {
                    email,
                    password
                });

                if (!result.user || !result.user.id) {
                    throw new Error("The server did not return a valid user ID.");
                }

                localStorage.setItem("user", JSON.stringify(result.user));
                localStorage.setItem("user_id", String(result.user.id));
                localStorage.setItem("user_name", result.user.name);
                localStorage.setItem("user_email", result.user.email);

                showMessage(message, "Login successful.");

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 500);
            } catch (error) {
                showMessage(message, error.message, true);
            }
        });
    }
});