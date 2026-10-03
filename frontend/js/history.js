
const chatHistory = document.getElementById("chatHistory");

/* =========================================
   GET LOGGED-IN USER
========================================= */

const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
} else {
    let user = null;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error("Unable to read user data:", error);
        window.location.href = "login.html";
    }

    if (user) {
        const userId =
            user.user_id ??
            user.id ??
            user.user?.id ??
            user.user?.user_id;

        const HISTORY_KEY = "study_assistant_chat_history";

        /* =========================================
           GET CHAT HISTORY
        ========================================= */

        function getChatHistory() {
            let history = [];

            try {
                history = JSON.parse(
                    localStorage.getItem(HISTORY_KEY) || "[]"
                );
            } catch (error) {
                console.error("History read error:", error);
                history = [];
            }

            if (!Array.isArray(history)) {
                history = [];
            }

            // Preserve each entry's actual position in storage.
            return history
                .map(function (item, index) {
                    return {
                        ...item,
                        __storageIndex: index
                    };
                })
                .filter(function (item) {
                    return String(item.user_id) === String(userId);
                });
        }

        /* =========================================
           LOAD CHAT HISTORY
        ========================================= */

        function loadChatHistory() {
            if (!chatHistory) {
                console.error("Chat history container not found.");
                return;
            }

            const history = getChatHistory();

            chatHistory.innerHTML = "";

            if (history.length === 0) {
                chatHistory.innerHTML =
                    "<p>No chat history available yet.</p>";
                return;
            }

            // Show newest conversation first.
            history.sort(function (a, b) {
                const dateA = Date.parse(a.created_at || "") || 0;
                const dateB = Date.parse(b.created_at || "") || 0;

                if (dateA !== dateB) {
                    return dateB - dateA;
                }

                // For matching or missing dates, use storage order.
                return b.__storageIndex - a.__storageIndex;
            });

            history.forEach(function (item) {
                const card = document.createElement("div");
                card.className = "dashboard-card";

                /* QUESTION */

                const question = document.createElement("h2");
                question.textContent =
                    "Question: " + (item.question || "");

                /* ANSWER */

                const answer = document.createElement("p");
                answer.textContent =
                    "AI Answer: " + (item.answer || "");

                /* DATE */

                const date = document.createElement("small");

                if (item.created_at) {
                    const parsedDate = new Date(item.created_at);

                    date.textContent =
                        !Number.isNaN(parsedDate.getTime())
                            ? "Date: " + parsedDate.toLocaleString()
                            : "Date: Not available";
                } else {
                    date.textContent = "Date: Not available";
                }

                /* DELETE BUTTON */

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.className = "delete-history-button";

                deleteButton.addEventListener("click", function () {
                    showDeleteConfirmation(card, item);
                });

                /* ADD ELEMENTS TO CARD */

                card.appendChild(question);
                card.appendChild(answer);
                card.appendChild(date);
                card.appendChild(deleteButton);

                chatHistory.appendChild(card);
            });
        }

        /* =========================================
           DELETE CONFIRMATION
        ========================================= */

        function showDeleteConfirmation(card, historyItem) {
            const oldConfirmation = card.querySelector(
                ".delete-confirmation"
            );

            if (oldConfirmation) {
                oldConfirmation.remove();
                return;
            }

            const confirmation = document.createElement("div");
            confirmation.className = "delete-confirmation";
            confirmation.textContent =
                "Are you sure you want to delete this chat?";

            confirmation.style.marginTop = "15px";
            confirmation.style.marginBottom = "10px";
            confirmation.style.padding = "12px";
            confirmation.style.backgroundColor = "#eaf4ff";
            confirmation.style.color = "black";
            confirmation.style.borderRadius = "8px";
            confirmation.style.fontSize = "15px";
            confirmation.style.fontWeight = "600";

            /* YES, DELETE BUTTON */

            const yesButton = document.createElement("button");
            yesButton.textContent = "Yes, Delete";
            yesButton.style.marginRight = "10px";
            yesButton.style.padding = "8px 15px";
            yesButton.style.backgroundColor = "darkblue";
            yesButton.style.color = "white";
            yesButton.style.border = "none";
            yesButton.style.borderRadius = "6px";
            yesButton.style.cursor = "pointer";

            yesButton.addEventListener("click", function () {
                deleteHistory(card, historyItem);
            });

            /* CANCEL BUTTON */

            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancel";
            cancelButton.style.padding = "8px 15px";
            cancelButton.style.backgroundColor = "gray";
            cancelButton.style.color = "white";
            cancelButton.style.border = "none";
            cancelButton.style.borderRadius = "6px";
            cancelButton.style.cursor = "pointer";

            cancelButton.addEventListener("click", function () {
                confirmation.remove();
            });

            confirmation.appendChild(document.createElement("br"));
            confirmation.appendChild(yesButton);
            confirmation.appendChild(cancelButton);

            card.appendChild(confirmation);
        }

        /* =========================================
           DELETE ONLY THE SELECTED CHAT
        ========================================= */

        function deleteHistory(card, historyItem) {
            try {
                let history = JSON.parse(
                    localStorage.getItem(HISTORY_KEY) || "[]"
                );

                if (!Array.isArray(history)) {
                    history = [];
                }

                const index = historyItem.__storageIndex;

                // Check that the selected entry still exists.
                if (
                    !Number.isInteger(index) ||
                    index < 0 ||
                    index >= history.length
                ) {
                    showMessage(
                        card,
                        "Chat not found. Please refresh the page.",
                        "error"
                    );
                    return;
                }

                const savedItem = history[index];

                // Verify the selected entry belongs to this user.
                if (
                    String(savedItem.user_id) !== String(userId) ||
                    savedItem.question !== historyItem.question ||
                    savedItem.answer !== historyItem.answer ||
                    savedItem.created_at !== historyItem.created_at
                ) {
                    showMessage(
                        card,
                        "History has changed. Please refresh the page.",
                        "error"
                    );
                    return;
                }

                // Remove exactly one item at its storage position.
                history.splice(index, 1);

                localStorage.setItem(
                    HISTORY_KEY,
                    JSON.stringify(history)
                );

                // Reload immediately so remaining items get fresh positions.
                loadChatHistory();

            } catch (error) {
                console.error("Delete history error:", error);

                showMessage(
                    card,
                    "Unable to delete chat history.",
                    "error"
                );
            }
        }

        /* =========================================
           SHOW SUCCESS OR ERROR MESSAGE
        ========================================= */

        function showMessage(card, messageText, messageType) {
            const oldMessage = card.querySelector(".history-message");

            if (oldMessage) {
                oldMessage.remove();
            }

            const message = document.createElement("p");
            message.className = "history-message";
            message.textContent = messageText;

            message.style.marginTop = "15px";
            message.style.padding = "10px";
            message.style.borderRadius = "8px";
            message.style.fontWeight = "600";

            if (messageType === "success") {
                message.style.backgroundColor = "#d4edda";
                message.style.color = "#155724";
            } else {
                message.style.backgroundColor = "#f8d7da";
                message.style.color = "#721c24";
            }

            card.appendChild(message);
        }

        /* =========================================
           START
        ========================================= */

        loadChatHistory();
    }
}