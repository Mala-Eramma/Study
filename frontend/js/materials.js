const uploadForm = document.getElementById("uploadForm");

const materialFile =
    document.getElementById("materialFile");

const materialsList =
    document.getElementById("materialsList");

const materialContent =
    document.getElementById("materialContent");

const aiSummaryContent =
    document.getElementById("aiSummaryContent");

const downloadSummaryButton =
    document.getElementById("downloadSummaryButton");

const API_URL = "http://localhost:8000";


// =========================================
// GET LOGGED-IN USER
// =========================================

const userData =
    localStorage.getItem("user");

if (!userData) {

    window.location.href =
        "login.html";

}

const user =
    JSON.parse(userData);

const userId =
    user.user.id;


// =========================================
// SHOW MESSAGE
// =========================================

function showMessage(
    message,
    type = "success"
) {

    let messageElement =
        document.getElementById(
            "materialMessage"
        );

    if (!messageElement) {

        messageElement =
            document.createElement("div");

        messageElement.id =
            "materialMessage";

        uploadForm.insertAdjacentElement(
            "afterend",
            messageElement
        );

    }

    messageElement.textContent =
        message;

    messageElement.style.marginTop =
        "15px";

    messageElement.style.padding =
        "10px";

    messageElement.style.textAlign =
        "center";

    messageElement.style.fontWeight =
        "600";

    messageElement.style.color =
        type === "error"
            ? "red"
            : "green";
}


// =========================================
// LOAD ALL MATERIALS
// =========================================

async function loadMaterials() {

    try {

        const response =
            await fetch(
                `${API_URL}/materials/?user_id=${userId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load materials."
            );

        }


        const materials =
            await response.json();


        materialsList.innerHTML =
            "";


        if (materials.length === 0) {

            materialsList.innerHTML = `
                <div class="empty-materials">
                    <p>
                        No study materials uploaded yet.
                    </p>
                </div>
            `;

            return;

        }


        materials.forEach(
            function (material) {

                addMaterialToPage(
                    material
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading materials:",
            error
        );


        materialsList.innerHTML = `
            <div class="empty-materials">
                <p>
                    Unable to load study materials.
                </p>
            </div>
        `;

    }

}


// =========================================
// ADD MATERIAL TO PAGE
// =========================================

function addMaterialToPage(
    material
) {

    const materialItem =
        document.createElement("div");

    materialItem.className =
        "material-item";


    const content =
        document.createElement("div");


    const heading =
        document.createElement("h3");

    heading.textContent =
        material.filename;


    const description =
        document.createElement("p");

    description.textContent =
        "Uploaded study material";


    content.appendChild(
        heading
    );

    content.appendChild(
        description
    );


    // =====================================
    // BUTTON CONTAINER
    // =====================================

    const buttonContainer =
        document.createElement("div");

    buttonContainer.className =
        "material-buttons";


    // =====================================
    // AI SUMMARY BUTTON
    // =====================================

    const summaryButton =
        document.createElement("button");

    summaryButton.type =
        "button";

    summaryButton.textContent =
        "AI Summary";


    summaryButton.addEventListener(
        "click",
        function () {

            generateSummary(
                material.id,
                summaryButton
            );

        }
    );


    // =====================================
    // VIEW BUTTON
    // =====================================

    const viewButton =
        document.createElement("button");

    viewButton.type =
        "button";

    viewButton.textContent =
        "View";


    viewButton.addEventListener(
        "click",
        function () {

            viewMaterial(
                material
            );

        }
    );


    // =====================================
    // DELETE BUTTON
    // =====================================

    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.textContent =
        "Delete";

    deleteButton.className =
        "delete-material-button";


    deleteButton.addEventListener(
        "click",
        function () {

            deleteMaterial(
                material.id
            );

        }
    );


    // =====================================
    // ADD BUTTONS
    // =====================================

    buttonContainer.appendChild(
        summaryButton
    );

    buttonContainer.appendChild(
        viewButton
    );

    buttonContainer.appendChild(
        deleteButton
    );


    // =====================================
    // ADD MATERIAL CARD
    // =====================================

    materialItem.appendChild(
        content
    );

    materialItem.appendChild(
        buttonContainer
    );

    materialsList.appendChild(
        materialItem
    );

}


// =========================================
// CLEAN AI SUMMARY
// =========================================

function cleanSummary(
    summary
) {

    let cleanedText =
        summary;


    cleanedText =
        cleanedText.replace(
            /\*\*/g,
            ""
        );


    cleanedText =
        cleanedText.replace(
            /`/g,
            ""
        );


    cleanedText =
        cleanedText.replace(
            /^\s*[-*]\s+/gm,
            ""
        );


    cleanedText =
        cleanedText.replace(
            /[ \t]+/g,
            " "
        );


    cleanedText =
        cleanedText.replace(
            /\n{2,}/g,
            "\n"
        );


    return cleanedText.trim();

}


// =========================================
// DISPLAY AI SUMMARY
// =========================================

function displaySummary(
    summary
) {

    aiSummaryContent.innerHTML =
        "";


    const cleanedSummary =
        cleanSummary(
            summary
        );


    const lines =
        cleanedSummary
            .split(/\r?\n/)
            .map(
                function (line) {

                    return line.trim();

                }
            )
            .filter(
                function (line) {

                    return line.length > 0;

                }
            );


    lines.forEach(
        function (line) {

            const point =
                document.createElement("p");

            point.textContent =
                line;

            aiSummaryContent.appendChild(
                point
            );

        }
    );


    if (downloadSummaryButton) {

        downloadSummaryButton.style.display =
            "block";

    }

}


// =========================================
// DOWNLOAD AI SUMMARY
// =========================================

if (downloadSummaryButton) {

    downloadSummaryButton.addEventListener(
        "click",
        function () {

            const summaryText =
                aiSummaryContent.innerText.trim();


            if (!summaryText) {

                return;

            }


            const fileContent =
                "AI STUDY ASSISTANT\n\n" +
                "AI SUMMARY\n\n" +
                summaryText;


            const blob =
                new Blob(
                    [fileContent],
                    {
                        type: "text/plain"
                    }
                );


            const downloadUrl =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href =
                downloadUrl;


            link.download =
                "AI_Summary.txt";


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                downloadUrl
            );

        }
    );

}


// =========================================
// GENERATE AI SUMMARY
// =========================================

async function generateSummary(
    materialId,
    summaryButton
) {

    if (
        materialContent.style.display ===
        "block"
    ) {

        materialContent.style.display =
            "none";

        aiSummaryContent.innerHTML =
            "";

        summaryButton.textContent =
            "AI Summary";


        if (downloadSummaryButton) {

            downloadSummaryButton.style.display =
                "none";

        }

        return;

    }


    materialContent.style.display =
        "block";

    aiSummaryContent.innerHTML =
        "";


    if (downloadSummaryButton) {

        downloadSummaryButton.style.display =
            "none";

    }


    const loadingMessage =
        document.createElement("p");

    loadingMessage.textContent =
        "Reading the complete file and generating AI summary...";

    aiSummaryContent.appendChild(
        loadingMessage
    );


    summaryButton.textContent =
        "Hide AI Summary";


    try {

        const response =
            await fetch(
                `${API_URL}/materials/summary/${materialId}?user_id=${userId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to generate summary."
            );

        }


        if (
            !data.summary ||
            data.summary.trim() === ""
        ) {

            aiSummaryContent.innerHTML = `
                <p>
                    No summary could be generated.
                </p>
            `;


            summaryButton.textContent =
                "AI Summary";


            return;

        }


        displaySummary(
            data.summary
        );


    } catch (error) {

        console.error(
            "Summary error:",
            error
        );


        aiSummaryContent.innerHTML = `
            <p>
                Unable to generate AI summary.
            </p>
        `;


        summaryButton.textContent =
            "AI Summary";


        if (downloadSummaryButton) {

            downloadSummaryButton.style.display =
                "none";

        }

    }

}


// =========================================
// VIEW MATERIAL
// =========================================

function viewMaterial(
    material
) {

    const fileUrl =
        `${API_URL}/materials/view/${material.id}?user_id=${userId}`;


    window.open(
        fileUrl,
        "_blank"
    );

}


// =========================================
// DELETE MATERIAL
// =========================================

async function deleteMaterial(
    materialId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this study material?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/materials/${materialId}?user_id=${userId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.detail ||
                "Unable to delete study material.",
                "error"
            );

            return;

        }


        showMessage(
            data.message,
            "success"
        );


        materialContent.style.display =
            "none";

        aiSummaryContent.innerHTML =
            "";


        if (downloadSummaryButton) {

            downloadSummaryButton.style.display =
                "none";

        }


        await loadMaterials();


    } catch (error) {

        console.error(
            "Delete material error:",
            error
        );


        showMessage(
            "Unable to connect to the server.",
            "error"
        );

    }

}


// =========================================
// UPLOAD MATERIAL
// =========================================

uploadForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const file =
            materialFile.files[0];


        if (!file) {

            showMessage(
                "Please select a file.",
                "error"
            );

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        try {

            const response =
                await fetch(
                    `${API_URL}/materials/upload?user_id=${userId}`,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                showMessage(
                    data.detail ||
                    "Unable to save material.",
                    "error"
                );

                return;

            }


            materialFile.value =
                "";


            materialContent.style.display =
                "none";

            aiSummaryContent.innerHTML =
                "";


            if (downloadSummaryButton) {

                downloadSummaryButton.style.display =
                    "none";

            }


            showMessage(
                "Study material saved successfully.",
                "success"
            );


            await loadMaterials();


        } catch (error) {

            console.error(
                "Upload error:",
                error
            );


            showMessage(
                "Unable to connect to the server.",
                "error"
            );

        }

    }
);


// =========================================
// HIDE SUMMARY INITIALLY
// =========================================

if (materialContent) {

    materialContent.style.display =
        "none";

}


if (downloadSummaryButton) {

    downloadSummaryButton.style.display =
        "none";

}


// =========================================
// LOAD MATERIALS WHEN PAGE OPENS
// =========================================

loadMaterials();