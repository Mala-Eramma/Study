/* =========================================================
   AI STUDY ASSISTANT
   MATERIALS - GITHUB PAGES VERSION
========================================================= */

const uploadForm = document.getElementById("uploadForm");
const materialFile = document.getElementById("materialFile");
const materialsList = document.getElementById("materialsList");
const materialContent = document.getElementById("materialContent");
const aiSummaryContent = document.getElementById("aiSummaryContent");
const downloadSummaryButton = document.getElementById(
    "downloadSummaryButton"
);


/* =========================================================
   USER
========================================================= */

const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);

const userId =
    user.user_id ||
    user.id ||
    user.email;


/* =========================================================
   INDEXED DB
========================================================= */

const DB_NAME = "AIStudyAssistantMaterials";
const DB_VERSION = 1;
const STORE_NAME = "materials";

let database = null;


/* =========================================================
   CURRENT SUMMARY
========================================================= */

let currentSummaryMaterial = null;
let currentSummaryPoints = [];


/* =========================================================
   OPEN DATABASE
========================================================= */

function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = function (event) {

            const db = event.target.result;

            if (
                !db.objectStoreNames.contains(
                    STORE_NAME
                )
            ) {

                const store =
                    db.createObjectStore(
                        STORE_NAME,
                        {
                            keyPath: "id"
                        }
                    );

                store.createIndex(
                    "userId",
                    "userId",
                    {
                        unique: false
                    }
                );
            }
        };

        request.onsuccess = function (event) {

            database =
                event.target.result;

            resolve(database);
        };

        request.onerror = function () {

            reject(
                new Error(
                    "Unable to open materials database."
                )
            );
        };
    });
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type = "success"
) {

    const oldMessage =
        document.querySelector(
            ".material-message"
        );

    if (oldMessage) {
        oldMessage.remove();
    }

    const messageBox =
        document.createElement("div");

    messageBox.className =
        "material-message";

    messageBox.textContent =
        message;

    messageBox.style.marginTop =
        "15px";

    messageBox.style.padding =
        "10px 15px";

    messageBox.style.borderRadius =
        "8px";

    messageBox.style.fontWeight =
        "600";

    if (type === "error") {

        messageBox.style.backgroundColor =
            "#ffe5e5";

        messageBox.style.color =
            "#b00020";

    } else {

        messageBox.style.backgroundColor =
            "#e5f7e5";

        messageBox.style.color =
            "#176b17";
    }

    uploadForm.parentNode.insertBefore(
        messageBox,
        uploadForm.nextSibling
    );

    setTimeout(
        function () {

            if (messageBox) {
                messageBox.remove();
            }

        },
        3000
    );
}


/* =========================================================
   SAVE MATERIAL METADATA
========================================================= */

function saveMaterialMetadata(material) {

    const existing =
        JSON.parse(
            localStorage.getItem(
                "study_assistant_materials"
            ) || "[]"
        );

    const index =
        existing.findIndex(
            item =>
                item.id === material.id
        );

    const metadata = {

        id: material.id,
        userId: material.userId,
        filename: material.filename,
        type: material.type,
        size: material.size,
        uploadedAt: material.uploadedAt
    };

    if (index >= 0) {

        existing[index] =
            metadata;

    } else {

        existing.push(
            metadata
        );
    }

    localStorage.setItem(
        "study_assistant_materials",
        JSON.stringify(existing)
    );
}


/* =========================================================
   REMOVE MATERIAL METADATA
========================================================= */

function removeMaterialMetadata(materialId) {

    const existing =
        JSON.parse(
            localStorage.getItem(
                "study_assistant_materials"
            ) || "[]"
        );

    const updated =
        existing.filter(
            item =>
                item.id !== materialId
        );

    localStorage.setItem(
        "study_assistant_materials",
        JSON.stringify(updated)
    );
}


/* =========================================================
   SAVE MATERIAL
========================================================= */

function saveMaterialToDatabase(material) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    [STORE_NAME],
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    STORE_NAME
                );

            const request =
                store.put(material);

            request.onsuccess =
                function () {

                    resolve();
                };

            request.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to save material."
                        )
                    );
                };
        }
    );
}


/* =========================================================
   GET MATERIALS
========================================================= */

function getMaterialsFromDatabase() {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    [STORE_NAME],
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    STORE_NAME
                );

            const request =
                store.getAll();

            request.onsuccess =
                function () {

                    const materials =
                        request.result.filter(
                            item =>
                                item.userId ===
                                userId
                        );

                    resolve(
                        materials
                    );
                };

            request.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to load materials."
                        )
                    );
                };
        }
    );
}


/* =========================================================
   GET SINGLE MATERIAL
========================================================= */

function getMaterialFromDatabase(materialId) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    [STORE_NAME],
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    STORE_NAME
                );

            const request =
                store.get(materialId);

            request.onsuccess =
                function () {

                    resolve(
                        request.result
                    );
                };

            request.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to open material."
                        )
                    );
                };
        }
    );
}


/* =========================================================
   DELETE MATERIAL
========================================================= */

function deleteMaterialFromDatabase(materialId) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    [STORE_NAME],
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    STORE_NAME
                );

            const request =
                store.delete(materialId);

            request.onsuccess =
                function () {

                    resolve();
                };

            request.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to delete material."
                        )
                    );
                };
        }
    );
}


/* =========================================================
   FILE SIZE
========================================================= */

function formatFileSize(bytes) {

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        bytes / (1024 * 1024)
    ).toFixed(1)} MB`;
}


/* =========================================================
   LOAD MATERIALS
========================================================= */

async function loadMaterials() {

    try {

        const materials =
            await getMaterialsFromDatabase();

        materialsList.innerHTML = "";

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
            material => {

                addMaterialToPage(
                    material
                );
            }
        );

    } catch (error) {

        console.error(error);

        materialsList.innerHTML = `
            <p>
                Unable to load materials.
            </p>
        `;
    }
}


/* =========================================================
   ADD MATERIAL TO PAGE
========================================================= */

function addMaterialToPage(material) {

    const materialBox =
        document.createElement("div");

    materialBox.className =
        "material-card";

    materialBox.innerHTML = `
        <h3>
            ${escapeHtml(
                material.filename
            )}
        </h3>

        <p>
            Saved material ·
            ${formatFileSize(
                material.size
            )}
        </p>

        <div class="material-actions">

            <button
                type="button"
                class="view-material-button"
            >
                View
            </button>

            <button
                type="button"
                class="summary-material-button"
            >
                AI Summary
            </button>

            <button
                type="button"
                class="delete-material-button"
            >
                Delete
            </button>

        </div>
    `;

    const viewButton =
        materialBox.querySelector(
            ".view-material-button"
        );

    const summaryButton =
        materialBox.querySelector(
            ".summary-material-button"
        );

    const deleteButton =
        materialBox.querySelector(
            ".delete-material-button"
        );

    viewButton.addEventListener(
        "click",
        function () {

            viewMaterial(material);
        }
    );

    summaryButton.addEventListener(
        "click",
        function () {

            showLocalSummary(
                material,
                summaryButton
            );
        }
    );

    deleteButton.addEventListener(
        "click",
        function () {

            deleteMaterial(
                material.id
            );
        }
    );

    materialsList.appendChild(
        materialBox
    );
}


/* =========================================================
   VIEW MATERIAL
========================================================= */

async function viewMaterial(material) {

    try {

        const storedMaterial =
            await getMaterialFromDatabase(
                material.id
            );

        if (
            !storedMaterial ||
            !storedMaterial.file
        ) {

            showMessage(
                "Material file not found.",
                "error"
            );

            return;
        }

        const fileUrl =
            URL.createObjectURL(
                storedMaterial.file
            );

        window.open(
            fileUrl,
            "_blank"
        );

        setTimeout(
            function () {

                URL.revokeObjectURL(
                    fileUrl
                );

            },
            5000
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to open material.",
            "error"
        );
    }
}


/* =========================================================
   CLEAN PDF TEXT
========================================================= */

function cleanPdfText(text) {

    return text
        .replace(/\r/g, " ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .replace(/➔/g, " ")
        .replace(/#/g, " ")
        .replace(/•/g, " ")
        .replace(/\*\//g, "")
        .replace(/\/\*/g, "")
        .replace(/__/g, "")
        .replace(/`/g, "")
        .trim();
}


/* =========================================================
   CREATE OOP SUMMARY
========================================================= */

function createOopSummary(text) {

    const lowerText =
        text.toLowerCase();

    const points = [];


    if (
        lowerText.includes("object oriented") ||
        lowerText.includes("oops")
    ) {

        points.push(
            "OOP (Object-Oriented Programming) is a programming paradigm that organizes data and the code that operates on that data into objects."
        );
    }


    if (
        lowerText.includes("alan kay")
    ) {

        points.push(
            "Alan Kay is one of the key people associated with the development of object-oriented programming concepts in the 1960s."
        );
    }


    if (
        lowerText.includes("programming paradigm") ||
        lowerText.includes("paradigm")
    ) {

        points.push(
            "A programming paradigm is a fundamental style or approach used to structure programs and solve programming problems."
        );
    }


    if (
        lowerText.includes("code reusability") ||
        lowerText.includes("reusability")
    ) {

        points.push(
            "Advantages of OOP include code reusability, improved maintainability, better readability, scalability, and data security through encapsulation."
        );
    }


    if (
        lowerText.includes("current object") ||
        lowerText.includes("constructor") ||
        lowerText.includes("__init__")
    ) {

        points.push(
            "In Python, self refers to the current object of a class and is commonly used in instance methods and the __init__ constructor."
        );

        points.push(
            "self is not a Python keyword; it is a conventional parameter name used to refer to the current object."
        );
    }


    if (
        lowerText.includes("class") &&
        lowerText.includes("blueprint")
    ) {

        points.push(
            "A class is a blueprint or template for creating objects. It defines the attributes and methods that describe an object's state and behavior."
        );
    }


    if (
        lowerText.includes("object") &&
        lowerText.includes("instance")
    ) {

        points.push(
            "An object is an instance of a class. It represents an entity with state (data or attributes) and behavior (methods or functions)."
        );
    }


    if (
        lowerText.includes("instance method")
    ) {

        points.push(
            "An instance method is a function defined inside a class that operates on objects or instances of that class."
        );
    }


    if (
        lowerText.includes("encapsulation")
    ) {

        points.push(
            "Encapsulation protects and controls access to internal data by combining data and methods inside a class."
        );
    }


    if (
        lowerText.includes("inheritance")
    ) {

        points.push(
            "Inheritance allows a class to reuse attributes and methods from another class."
        );
    }


    if (
        lowerText.includes("polymorphism")
    ) {

        points.push(
            "Polymorphism allows the same interface or operation to behave differently for different objects."
        );
    }


    if (
        lowerText.includes("abstraction")
    ) {

        points.push(
            "Abstraction hides unnecessary implementation details and shows only the essential features."
        );
    }


    if (points.length > 0) {

        return points;
    }

    return createGenericSummary(
        text
    );
}


/* =========================================================
   GENERIC SUMMARY
========================================================= */

function createGenericSummary(text) {

    const cleaned =
        cleanPdfText(text);

    if (!cleaned) {
        return [];
    }

    const points = [];

    const sentences =
        cleaned
            .split(
                /(?<=[.!?])\s+/
            )
            .map(
                sentence =>
                    sentence.trim()
            )
            .filter(
                sentence =>
                    sentence.length > 25
            );

    sentences.forEach(
        sentence => {

            if (
                !points.includes(
                    sentence
                )
            ) {

                points.push(
                    sentence
                );
            }
        }
    );


    if (points.length === 0) {

        const words =
            cleaned.split(" ");

        let currentPoint = "";

        words.forEach(
            word => {

                currentPoint +=
                    word + " ";

                if (
                    currentPoint.length >= 120
                ) {

                    points.push(
                        currentPoint.trim()
                    );

                    currentPoint = "";
                }
            }
        );

        if (
            currentPoint.trim()
        ) {

            points.push(
                currentPoint.trim()
            );
        }
    }

    return points.slice(
        0,
        20
    );
}


/* =========================================================
   CREATE SUMMARY POINTS
========================================================= */

function createSummaryPoints(text) {

    const cleanedText =
        cleanPdfText(text);

    if (!cleanedText) {
        return [];
    }

    const lowerText =
        cleanedText.toLowerCase();


    if (
        lowerText.includes("oops") ||
        lowerText.includes("object oriented programming") ||
        lowerText.includes("object-oriented programming")
    ) {

        return createOopSummary(
            cleanedText
        );
    }


    return createGenericSummary(
        cleanedText
    );
}


/* =========================================================
   DISPLAY SUMMARY
========================================================= */

function displaySummaryPoints(
    material,
    points
) {

    aiSummaryContent.innerHTML = "";

    const title =
        document.createElement("h3");

    title.textContent =
        material.filename;

    aiSummaryContent.appendChild(
        title
    );


    if (points.length === 0) {

        const message =
            document.createElement("p");

        message.textContent =
            "No readable summary points were found.";

        aiSummaryContent.appendChild(
            message
        );

        return;
    }


    const heading =
        document.createElement("h4");

    heading.textContent =
        "Key Points";

    heading.style.marginTop =
        "20px";

    aiSummaryContent.appendChild(
        heading
    );


    const list =
        document.createElement("ol");

    list.className =
        "ai-summary-points";

    list.style.paddingLeft =
        "25px";

    list.style.marginTop =
        "15px";


    points.forEach(
        point => {

            const listItem =
                document.createElement("li");

            listItem.textContent =
                point;

            listItem.style.marginBottom =
                "15px";

            listItem.style.lineHeight =
                "1.7";

            listItem.style.paddingLeft =
                "5px";

            list.appendChild(
                listItem
            );
        }
    );


    aiSummaryContent.appendChild(
        list
    );
}


/* =========================================================
   DOWNLOAD SUMMARY
========================================================= */

function downloadAISummary(
    material,
    points
) {

    if (
        !points ||
        points.length === 0
    ) {

        showMessage(
            "Generate the AI summary before downloading.",
            "error"
        );

        return;
    }


    let fileContent =
        "AI STUDY ASSISTANT\n\n";

    fileContent +=
        "AI SUMMARY\n\n";

    fileContent +=
        `Material: ${material.filename}\n\n`;


    points.forEach(
        (point, index) => {

            fileContent +=
                `${index + 1}. ${point}\n\n`;
        }
    );


    const blob =
        new Blob(
            [fileContent],
            {
                type:
                    "text/plain;charset=utf-8"
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


    const safeFilename =
        material.filename
            .replace(
                /\.pdf$/i,
                ""
            )
            .replace(
                /[^a-z0-9_-]/gi,
                "_"
            );


    link.download =
        `${safeFilename}_AI_Summary.txt`;


    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );


    setTimeout(
        function () {

            URL.revokeObjectURL(
                downloadUrl
            );

        },
        1000
    );
}


/* =========================================================
   SHOW DOWNLOAD BUTTON
========================================================= */

function showDownloadButton() {

    if (!downloadSummaryButton) {
        return;
    }

    downloadSummaryButton.style.display =
        "block";

    downloadSummaryButton.style.visibility =
        "visible";

    downloadSummaryButton.disabled =
        false;
}


/* =========================================================
   HIDE DOWNLOAD BUTTON
========================================================= */

function hideDownloadButton() {

    if (!downloadSummaryButton) {
        return;
    }

    downloadSummaryButton.style.display =
        "none";
}


/* =========================================================
   DOWNLOAD BUTTON EVENT
========================================================= */

if (downloadSummaryButton) {

    downloadSummaryButton.addEventListener(
        "click",
        function () {

            if (
                currentSummaryMaterial &&
                currentSummaryPoints.length > 0
            ) {

                downloadAISummary(
                    currentSummaryMaterial,
                    currentSummaryPoints
                );
            }
        }
    );
}


/* =========================================================
   SHOW LOCAL SUMMARY
========================================================= */

async function showLocalSummary(
    material,
    summaryButton
) {

    if (!materialContent) {
        return;
    }


    materialContent.style.display =
        "block";


    summaryButton.textContent =
        "Reading PDF...";

    summaryButton.disabled =
        true;


    hideDownloadButton();


    aiSummaryContent.innerHTML = `
        <h3>
            ${escapeHtml(
                material.filename
            )}
        </h3>

        <p>
            Reading the PDF content...
        </p>
    `;


    try {

        if (
            !material.file ||
            !(
                material.type ===
                "application/pdf" ||

                material.filename
                    .toLowerCase()
                    .endsWith(".pdf")
            )
        ) {

            throw new Error(
                "This file is not a PDF."
            );
        }


        /* =================================================
           LOAD PDF.JS
        ================================================= */

        const pdfjsLib =
            await import(
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs"
            );


        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";


        /* =================================================
           READ PDF
        ================================================= */

        const arrayBuffer =
            await material.file.arrayBuffer();


        const pdf =
            await pdfjsLib
                .getDocument({
                    data: arrayBuffer
                })
                .promise;


        let fullText = "";


        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            const page =
                await pdf.getPage(
                    pageNumber
                );


            const textContent =
                await page.getTextContent();


            const pageText =
                textContent.items
                    .map(
                        item =>
                            item.str
                    )
                    .join(" ");


            fullText +=
                pageText + " ";
        }


        fullText =
            fullText
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        /* =================================================
           CHECK TEXT
        ================================================= */

        if (!fullText) {

            aiSummaryContent.innerHTML = `
                <h3>
                    ${escapeHtml(
                        material.filename
                    )}
                </h3>

                <p>
                    This PDF does not contain readable text.
                    It may be a scanned document.
                </p>
            `;

            summaryButton.disabled =
                false;

            summaryButton.textContent =
                "AI Summary";

            return;
        }


        /* =================================================
           CREATE POINTS
        ================================================= */

        const points =
            createSummaryPoints(
                fullText
            );


        currentSummaryMaterial =
            material;

        currentSummaryPoints =
            points;


        /* =================================================
           DISPLAY POINTS
        ================================================= */

        displaySummaryPoints(
            material,
            points
        );


        /* =================================================
           SHOW DOWNLOAD BUTTON
        ================================================= */

        showDownloadButton();


        /* =================================================
           SUMMARY BUTTON STATE
        ================================================= */

        summaryButton.disabled =
            false;

        summaryButton.textContent =
            "Hide Summary";

    } catch (error) {

        console.error(
            "PDF summary error:",
            error
        );


        aiSummaryContent.innerHTML = `
            <h3>
                ${escapeHtml(
                    material.filename
                )}
            </h3>

            <p>
                Unable to read this PDF.
            </p>

            <p>
                ${escapeHtml(
                    error.message
                )}
            </p>
        `;


        summaryButton.disabled =
            false;

        summaryButton.textContent =
            "AI Summary";


        hideDownloadButton();
    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   DELETE MATERIAL
========================================================= */

async function deleteMaterial(
    materialId
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this material?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await deleteMaterialFromDatabase(
            materialId
        );


        removeMaterialMetadata(
            materialId
        );


        await loadMaterials();


        if (materialContent) {

            materialContent.style.display =
                "none";
        }


        hideDownloadButton();


        currentSummaryMaterial =
            null;

        currentSummaryPoints =
            [];


        showMessage(
            "Material deleted successfully."
        );


    } catch (error) {

        console.error(error);


        showMessage(
            "Unable to delete material.",
            "error"
        );
    }
}


/* =========================================================
   UPLOAD MATERIAL
========================================================= */

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


        try {

            const material = {

                id:
                    `${userId}_${Date.now()}`,

                userId:
                    userId,

                filename:
                    file.name,

                type:
                    file.type,

                size:
                    file.size,

                uploadedAt:
                    new Date().toISOString(),

                file:
                    file
            };


            await saveMaterialToDatabase(
                material
            );


            saveMaterialMetadata(
                material
            );


            uploadForm.reset();


            await loadMaterials();


            showMessage(
                "Material saved successfully."
            );


        } catch (error) {

            console.error(error);


            showMessage(
                "Unable to save material.",
                "error"
            );
        }
    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

if (materialContent) {

    materialContent.style.display =
        "none";
}

hideDownloadButton();


/* =========================================================
   START
========================================================= */

async function startMaterials() {

    try {

        await openDatabase();

        await loadMaterials();

    } catch (error) {

        console.error(
            "Materials startup error:",
            error
        );
    }
}


startMaterials();