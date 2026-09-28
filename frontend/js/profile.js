const USER_KEY = "user";

const profileName =
    document.getElementById(
        "profileName"
    );

const profileEmail =
    document.getElementById(
        "profileEmail"
    );

const profileUserId =
    document.getElementById(
        "profileUserId"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const logoutProfileButton =
    document.getElementById(
        "logoutProfileButton"
    );

const userData =
    localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
} else {
    const user =
        JSON.parse(userData);

    if (profileName) {
        profileName.textContent =
            user.name || "Not available";
    }

    if (profileEmail) {
        profileEmail.textContent =
            user.email || "Not available";
    }

    if (profileUserId) {
        profileUserId.textContent =
            user.user_id || "Not available";
    }
}

function logout() {
    localStorage.removeItem(USER_KEY);

    window.location.href =
        "login.html";
}

if (logoutButton) {
    logoutButton.addEventListener(
        "click",
        logout
    );
}

if (logoutProfileButton) {
    logoutProfileButton.addEventListener(
        "click",
        logout
    );
}