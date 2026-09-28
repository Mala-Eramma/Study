const USER_KEY = "user";
const USERS_KEY = "study_assistant_users";

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileUserId = document.getElementById("profileUserId");

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(userData);

    let userId =
        user.user_id ||
        user.id ||
        "";

    // If the logged-in user object does not contain an ID,
    // find the registered user's ID using their email.
    if (!userId && user.email) {
        const users = JSON.parse(
            localStorage.getItem(USERS_KEY) || "[]"
        );

        const registeredUser = users.find(
            item =>
                String(item.email).toLowerCase() ===
                String(user.email).toLowerCase()
        );

        if (registeredUser) {
            userId =
                registeredUser.user_id ||
                registeredUser.id ||
                "";
        }
    }

    if (profileName) {
        profileName.textContent =
            user.name ||
            user.full_name ||
            "Not available";
    }

    if (profileEmail) {
        profileEmail.textContent =
            user.email ||
            "Not available";
    }

    if (profileUserId) {
        profileUserId.textContent =
            userId ||
            "Not available";
    }
}