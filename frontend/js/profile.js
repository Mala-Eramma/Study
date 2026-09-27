const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileUserId =
    document.getElementById("profileUserId");

const logoutButton =
    document.getElementById("logoutButton");

const logoutProfileButton =
    document.getElementById("logoutProfileButton");


const userData =
    localStorage.getItem("user");


if (!userData) {

    window.location.href = "login.html";

} else {

    const user =
        JSON.parse(userData);

    profileName.textContent =
        user.name || "Not available";

    profileEmail.textContent =
        user.email || "Not available";

    profileUserId.textContent =
        user.user_id || "Not available";
}


function logout() {

    localStorage.removeItem("user");

    window.location.href = "login.html";
}


logoutButton.addEventListener(
    "click",
    logout
);


logoutProfileButton.addEventListener(
    "click",
    logout
);