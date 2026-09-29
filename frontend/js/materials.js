const uploadForm = document.getElementById("uploadForm");

const materialFile =
    document.getElementById("materialFile");

const materialsList =
    document.getElementById("materialsList");

const materialContent =
    document.getElementById("materialContent");

const aiSummaryContent =
    document.getElementById("aiSummaryContent");


// =========================================
// DOWNLOAD SUMMARY BUTTON
// =========================================

let downloadSummaryButton =
    document.getElementById(
        "downloadSummaryButton"
    );


// =========================================
// CREATE DOWNLOAD BUTTON IF MISSING
// =========================================

if (
    !downloadSummaryButton &&
    materialContent &&
    aiSummaryContent
) {

    downloadSummaryButton =
        document.createElement("button");

    downloadSummaryButton.type =
        "button";

    downloadSummaryButton.id =
        "downloadSummaryButton";

    downloadSummaryButton.textContent =
        "Download AI Summary";

    downloadSummaryButton.style.display =
        "none";

    downloadSummaryButton.style.marginTop =
        "20px";

    downloadSummaryButton.style.padding =
        "12px 22px";

    downloadSummaryButton.style.backgroundColor =
        "darkblue";

    downloadSummaryButton.style.color =
        "white";

    downloadSummaryButton.style.border =
        "none";

    downloadSummaryButton.style.borderRadius =
        "8px";

    downloadSummaryButton.style.cursor =
        "pointer";

    downloadSummaryButton.style.fontSize =
        "15px";

    downloadSummaryButton.style.fontWeight =
        "600";

    materialContent.appendChild(
        downloadSummaryButton
    );
}


const API_URL =
    "http://127.0.0.1:8000";


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
                `${API_URL}/materials/`
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load materials."
            );
        }

        const materials =
            await response.json();

        /*
        Clear only the displayed list.
        The database records are NOT deleted.
        */

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


        /*
        Add EVERY material returned
        by the backend.
        */

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

function addMaterialToPage(material) {

    const materialItem =
        document.createElement("div");

    materialItem.className =
        "material-item";


    /*
    MATERIAL INFORMATION
    */

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


    /*
    =========================================
    BUTTON CONTAINER
    =========================================
    */

    const buttonContainer =
        document.createElement("div");

    buttonContainer.className =
        "material-buttons";


    /*
    =========================================
    AI SUMMARY BUTTON
    =========================================
    */

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


    /*
    =========================================
    VIEW BUTTON
    =========================================
    */

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


    /*
    =========================================
    DELETE BUTTON
    =========================================
    */

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


    /*
    =========================================
    ADD BUTTONS
    =========================================
    */

    buttonContainer.appendChild(
        summaryButton
    );

    buttonContainer.appendChild(
        viewButton
    );

    buttonContainer.appendChild(
        deleteButton
    );


    /*
    =========================================
    ADD MATERIAL CARD
    =========================================
    */

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

function cleanSummary(summary) {

    let cleanedText =
        summary;


    /*
    Remove bold Markdown
    */

    cleanedText =
        cleanedText.replace(
            /\*\*/g,
            ""
        );


    /*
    Remove inline code Markdown
    */

    cleanedText =
        cleanedText.replace(
            /`/g,
            ""
        );


    /*
    Convert bullet symbols into new lines
    */

    cleanedText =
        cleanedText.replace(
            /[•●▪◦]/g,
            "\n"
        );


    /*
    Convert arrow separators into new lines
    */

    cleanedText =
        cleanedText.replace(
            /➔|→/g,
            "\n"
        );


    /*
    Convert Markdown headings into new lines
    */

    cleanedText =
        cleanedText.replace(
            /\s*#{1,6}\s*/g,
            "\n"
        );


    /*
    Remove existing bullet markers
    */

    cleanedText =
        cleanedText.replace(
            /^\s*[-*]\s+/gm,
            ""
        );


    /*
    Remove existing number markers
    */

    cleanedText =
        cleanedText.replace(
            /^\s*\d+[\.\)]\s+/gm,
            ""
        );


    /*
    Add line breaks before common study sections
    */

    cleanedText =
        cleanedText.replace(
            /\s+(What is OOP|What is Oops|OOP advantages|Oops advantages|Features of Oops|Features of OOP|Principles of OOP|Class\s*:|Object\s*:|Instance Methods|Inheritance\s*:|Encapsulation\s*:|Polymorphism\s*:|Abstraction\s*:)/gi,
            "\n$1"
        );


    /*
    Add line breaks around feature tables
    */

    cleanedText =
        cleanedText.replace(
            /\s+(Feature\s+Description)/gi,
            "\n$1"
        );


    /*
    Clean repeated spaces
    */

    cleanedText =
        cleanedText.replace(
            /[ \t]+/g,
            " "
        );


    /*
    Clean repeated empty lines
    */

    cleanedText =
        cleanedText.replace(
            /\n{2,}/g,
            "\n"
        );


    return cleanedText.trim();
}


// =========================================
// BUILD SUMMARY POINTS
// =========================================

function buildSummaryPoints(
    summary
) {

    const cleanedSummary =
        cleanSummary(
            summary
        );


    let lines =
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


    /*
    If PDF/AI output comes as one very long line,
    split it into sentence-based points.
    */

    if (
        lines.length === 1 &&
        lines[0].length > 220
    ) {

        const text =
            lines[0];

        const sentenceParts =
            text
                .split(
                    /(?<=[.!?])\s+(?=[A-Z])/g
                )
                .map(
                    function (part) {

                        return part.trim();

                    }
                )
                .filter(
                    function (part) {

                        return part.length > 0;

                    }
                );


        if (
            sentenceParts.length > 1
        ) {

            lines =
                sentenceParts;

        }
    }


    /*
    Clean each point again
    */

    lines =
        lines
            .map(
                function (line) {

                    return line
                        .replace(
                            /^\s*[-*•●▪◦]\s*/,
                            ""
                        )
                        .replace(
                            /^\s*\d+[\.\)]\s*/,
                            ""
                        )
                        .trim();

                }
            )
            .filter(
                function (line) {

                    return line.length > 0;

                }
            );


    return lines;
}


// =========================================
// DISPLAY AI SUMMARY AS POINTS
// =========================================

function displaySummary(
    summary
) {

    aiSummaryContent.innerHTML =
        "";


    const points =
        buildSummaryPoints(
            summary
        );


    if (
        points.length === 0
    ) {

        aiSummaryContent.innerHTML = `
            <p>
                No summary could be generated.
            </p>
        `;

        if (downloadSummaryButton) {

            downloadSummaryButton.style.display =
                "none";
        }

        return;
    }


    /*
    Create numbered list
    */

    const orderedList =
        document.createElement("ol");

    orderedList.style.paddingLeft =
        "25px";

    orderedList.style.marginTop =
        "10px";


    points.forEach(
        function (pointText) {

            const listItem =
                document.createElement("li");

            listItem.textContent =
                pointText;

            listItem.style.marginBottom =
                "12px";

            listItem.style.lineHeight =
                "1.6";


            orderedList.appendChild(
                listItem
            );

        }
    );


    aiSummaryContent.appendChild(
        orderedList
    );


    /*
    Show download button
    */

    if (downloadSummaryButton) {

        downloadSummaryButton.style.display =
            "block";
    }
}


// =========================================
// DOWNLOAD AI SUMMARY
// =========================================

if (
    downloadSummaryButton
) {

    downloadSummaryButton.addEventListener(
        "click",
        function () {

            const summaryText =
                aiSummaryContent
                    .innerText
                    .trim();


            if (
                !summaryText
            ) {

                return;

            }


            const fileContent =
                "AI STUDY ASSISTANT\n\n" +
                "AI SUMMARY\n\n" +
                summaryText;


            const blob =
                new Blob(
                    [
                        fileContent
                    ],
                    {
                        type:
                            "text/plain"
                    }
                );


            const downloadUrl =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


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

    /*
    Hide summary if already open
    */

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


        if (
            downloadSummaryButton
        ) {

            downloadSummaryButton.style.display =
                "none";
        }

        return;
    }


    /*
    Show summary container
    */

    materialContent.style.display =
        "block";

    aiSummaryContent.innerHTML =
        "";


    /*
    Hide download button while loading
    */

    if (
        downloadSummaryButton
    ) {

        downloadSummaryButton.style.display =
            "none";
    }


    /*
    Loading message
    */

    const loadingMessage =
        document.createElement(
            "p"
        );

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
                `${API_URL}/materials/summary/${materialId}`
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

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


            if (
                downloadSummaryButton
            ) {

                downloadSummaryButton.style.display =
                    "none";
            }


            return;
        }


        /*
        Display point-wise summary
        */

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


        if (
            downloadSummaryButton
        ) {

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
        `${API_URL}/materials/view/${material.id}`;


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


    if (
        !confirmed
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/materials/${materialId}`,
                {
                    method:
                        "DELETE"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

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


        /*
        Close AI Summary
        */

        materialContent.style.display =
            "none";

        aiSummaryContent.innerHTML =
            "";


        /*
        Hide download button
        */

        if (
            downloadSummaryButton
        ) {

            downloadSummaryButton.style.display =
                "none";
        }


        /*
        Reload ALL remaining materials
        */

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


        if (
            !file
        ) {

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
                    `${API_URL}/materials/upload`,
                    {
                        method:
                            "POST",

                        body:
                            formData
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok
            ) {

                showMessage(
                    data.detail ||
                    "Unable to save material.",
                    "error"
                );

                return;
            }


            /*
            Clear file input
            */

            materialFile.value =
                "";


            /*
            Close currently opened summary
            */

            materialContent.style.display =
                "none";

            aiSummaryContent.innerHTML =
                "";


            /*
            Hide download button
            */

            if (
                downloadSummaryButton
            ) {

                downloadSummaryButton.style.display =
                    "none";
            }


            showMessage(
                "Study material saved successfully.",
                "success"
            );


            /*
            IMPORTANT:
            Reload ALL materials from database.

            This does NOT delete previous files.
            It displays old files + new file.
            */

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

if (
    materialContent
) {

    materialContent.style.display =
        "none";
}


if (
    downloadSummaryButton
) {

    downloadSummaryButton.style.display =
        "none";
}


// =========================================
// LOAD ALL MATERIALS WHEN PAGE OPENS
// =========================================

loadMaterials();