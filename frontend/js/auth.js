document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // REGISTER
    // =========================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const message = document.getElementById("registerMessage");

            if (!name || !email || !password || !confirmPassword) {
                message.textContent = "Please fill in all fields.";
                message.style.color = "red";
                return;
            }

            if (password !== confirmPassword) {
                message.textContent = "Passwords do not match.";
                message.style.color = "red";
                return;
            }

            if (password.length < 6) {
                message.textContent =
                    "Password must contain at least 6 characters.";
                message.style.color = "red";
                return;
            }

            let users = JSON.parse(
                localStorage.getItem("study_assistant_users")
            ) || [];

            const existingUser = users.find(
                user => user.email === email
            );

            if (existingUser) {
                message.textContent = "Email already registered.";
                message.style.color = "red";
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
                "study_assistant_users",
                JSON.stringify(users)
            );

            message.textContent = "Registration successful.";
            message.style.color = "green";

            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        });
    }


    // =========================
    // LOGIN
    // =========================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        let loginMessage = document.getElementById("loginMessage");

        if (!loginMessage) {
            loginMessage = document.createElement("p");
            loginMessage.id = "loginMessage";
            loginMessage.style.marginTop = "10px";

            loginForm.appendChild(loginMessage);
        }

        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email =
                document.getElementById("email").value.trim().toLowerCase();

            const password =
                document.getElementById("password").value;

            const users = JSON.parse(
                localStorage.getItem("study_assistant_users")
            ) || [];

            const user = users.find(
                item =>
                    item.email === email &&
                    item.password === password
            );

            if (!user) {
                loginMessage.textContent =
                    "Invalid email or password.";
                loginMessage.style.color = "red";
                return;
            }

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            localStorage.setItem(
                "user_id",
                user.id
            );

            localStorage.setItem(
                "user_name",
                user.name
            );

            localStorage.setItem(
                "user_email",
                user.email
            );

            loginMessage.textContent = "Login successful.";
            loginMessage.style.color = "green";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);
        });
    }

});