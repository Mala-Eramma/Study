const API_URL = "http://localhost:8000";

const chatHistory =
    document.getElementById("chatHistory");


// =========================================
// GET LOGGED-IN USER
// =========================================

const userData =
    localStorage.getItem("user");

if (!userData) {

    window.location.href =
        "login.html";

} else {

    const user =
        JSON.parse(userData);

    const userId =
        user.user.id;


    // =========================================
    // LOAD CHAT HISTORY
    // =========================================

    async function loadChatHistory() {

        try {

            const response =
                await fetch(
                    `${API_URL}/chat/history?user_id=${userId}`
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load chat history."
                );

            }


            const history =
                await response.json();


            console.log(
                "Chat history:",
                history
            );


            if (!Array.isArray(history) ||
                history.length === 0) {

                chatHistory.innerHTML =
                    "<p>No chat history available yet.";

                return;

            }


            chatHistory.innerHTML =
                "";


            history.forEach(
                function (item) {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "dashboard-card";


                    const question =
                        document.createElement(
                            "h2"
                        );

                    question.textContent =
                        "Question: " +
                        item.question;


                    const answer =
                        document.createElement(
                            "p"
                        );

                    answer.textContent =
                        "AI Answer: " +
                        item.answer;


                    const date =
                        document.createElement(
                            "small"
                        );

                    if (item.created_at) {

                        date.textContent =
                            "Date: " +
                            new Date(
                                item.created_at
                            ).toLocaleString();

                    } else {

                        date.textContent =
                            "Date: Not available";

                    }


                    // =========================================
                    // DELETE BUTTON
                    // =========================================

                    const deleteButton =
                        document.createElement(
                            "button"
                        );

                    deleteButton.textContent =
                        "Delete";

                    deleteButton.className =
                        "delete-history-button";


                    deleteButton.addEventListener(
                        "click",
                        function () {

                            showDeleteConfirmation(
                                card,
                                item.id,
                                userId
                            );

                        }
                    );


                    card.appendChild(
                        question
                    );

                    card.appendChild(
                        answer
                    );

                    card.appendChild(
                        date
                    );

                    card.appendChild(
                        deleteButton
                    );


                    chatHistory.appendChild(
                        card
                    );

                }
            );

        }

        catch (error) {

            console.error(
                "Chat history error:",
                error
            );

            chatHistory.innerHTML =
                "<p>Unable to load chat history.</p>";

        }

    }


    // =========================================
    // SHOW DELETE CONFIRMATION
    // =========================================

    function showDeleteConfirmation(
        card,
        historyId,
        userId
    ) {

        const oldConfirmation =
            card.querySelector(
                ".delete-confirmation"
            );

        if (oldConfirmation) {

            oldConfirmation.remove();

        }


        const confirmation =
            document.createElement(
                "div"
            );


        confirmation.className =
            "delete-confirmation";


        confirmation.textContent =
            "Are you sure you want to delete this chat?";


        confirmation.style.marginTop =
            "15px";

        confirmation.style.marginBottom =
            "10px";

        confirmation.style.padding =
            "12px";

        confirmation.style.backgroundColor =
            "#eaf4ff";

        confirmation.style.color =
            "black";

        confirmation.style.borderRadius =
            "8px";

        confirmation.style.fontSize =
            "15px";

        confirmation.style.fontWeight =
            "600";


        // =========================================
        // YES BUTTON
        // =========================================

        const yesButton =
            document.createElement(
                "button"
            );


        yesButton.textContent =
            "Yes, Delete";


        yesButton.style.marginRight =
            "10px";

        yesButton.style.padding =
            "8px 15px";

        yesButton.style.backgroundColor =
            "darkblue";

        yesButton.style.color =
            "white";

        yesButton.style.border =
            "none";

        yesButton.style.borderRadius =
            "6px";

        yesButton.style.cursor =
            "pointer";


        yesButton.addEventListener(
            "click",
            function () {

                deleteHistory(
                    card,
                    historyId,
                    userId
                );

            }
        );


        // =========================================
        // CANCEL BUTTON
        // =========================================

        const cancelButton =
            document.createElement(
                "button"
            );


        cancelButton.textContent =
            "Cancel";


        cancelButton.style.padding =
            "8px 15px";

        cancelButton.style.backgroundColor =
            "gray";

        cancelButton.style.color =
            "white";

        cancelButton.style.border =
            "none";

        cancelButton.style.borderRadius =
            "6px";

        cancelButton.style.cursor =
            "pointer";


        cancelButton.addEventListener(
            "click",
            function () {

                confirmation.remove();

            }
        );


        confirmation.appendChild(
            document.createElement(
                "br"
            )
        );


        confirmation.appendChild(
            yesButton
        );


        confirmation.appendChild(
            cancelButton
        );


        card.appendChild(
            confirmation
        );

    }


    // =========================================
    // DELETE CHAT HISTORY
    // =========================================

    async function deleteHistory(
        card,
        historyId,
        userId
    ) {

        try {

            const response =
                await fetch(
                    `${API_URL}/chat/history/${historyId}?user_id=${userId}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                showMessage(
                    card,
                    "Unable to delete chat history.",
                    "error"
                );

                return;

            }


            showMessage(
                card,
                data.message ||
                "Chat deleted successfully.",
                "success"
            );


            setTimeout(
                function () {

                    loadChatHistory();

                },
                800
            );

        }

        catch (error) {

            console.error(
                "Delete history error:",
                error
            );


            showMessage(
                card,
                "Unable to connect to the server.",
                "error"
            );

        }

    }


    // =========================================
    // SHOW PAGE MESSAGE
    // =========================================

    function showMessage(
        card,
        messageText,
        messageType
    ) {

        const oldMessage =
            card.querySelector(
                ".history-message"
            );

        if (oldMessage) {

            oldMessage.remove();

        }


        const message =
            document.createElement(
                "p"
            );


        message.className =
            "history-message";


        message.textContent =
            messageText;


        message.style.marginTop =
            "15px";

        message.style.padding =
            "10px";

        message.style.borderRadius =
            "8px";

        message.style.fontWeight =
            "600";


        if (messageType === "success") {

            message.style.backgroundColor =
                "#d4edda";

            message.style.color =
                "#155724";

        } else {

            message.style.backgroundColor =
                "#f8d7da";

            message.style.color =
                "#721c24";

        }


        card.appendChild(
            message
        );

    }


    // =========================================
    // START
    // =========================================

    loadChatHistory();

}