// =========================================
// AI STUDY ASSISTANT - MATERIALS
// GitHub Pages compatible version
// =========================================


// =========================================
// DOM ELEMENTS
// =========================================

const uploadForm =
    document.getElementById("uploadForm");

const materialFile =
    document.getElementById("materialFile");

const materialsList =
    document.getElementById("materialsList");

const materialContent =
    document.getElementById("materialContent");

const aiSummaryContent =
    document.getElementById("aiSummaryContent");

let downloadSummaryButton =
    document.getElementById(
        "downloadSummaryButton"
    );


// =========================================
// INDEXED DB
// =========================================

const DB_NAME =
    "AIStudyAssistantMaterialsDB";

const DB_VERSION = 1;

const STORE_NAME =
    "materials";

let currentSummaryText = "";

let db = null;


// =========================================
// OPEN DATABASE
// =========================================

function openDatabase() {

    return new Promise(
        function (resolve, reject) {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                function (event) {

                    const database =
                        event.target.result;


                    if (
                        !database.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        database.createObjectStore(
                            STORE_NAME,
                            {
                                keyPath: "id"
                            }
                        );

                    }

                };


            request.onsuccess =
                function (event) {

                    db =
                        event.target.result;

                    resolve(db);

                };


            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// =========================================
// SAVE MATERIAL
// =========================================

function saveMaterial(material) {

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            store.put(material);


            transaction.oncomplete =
                function () {

                    resolve();

                };


            transaction.onerror =
                function () {

                    reject(
                        transaction.error
                    );

                };


            transaction.onabort =
                function () {

                    reject(
                        transaction.error ||
                        new Error(
                            "Material save transaction was aborted."
                        )
                    );

                };

        }
    );

}


// =========================================
// GET ALL MATERIALS
// =========================================

function getAllMaterials() {

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
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

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// =========================================
// GET SINGLE MATERIAL
// =========================================

function getMaterial(id) {

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.get(id);


            request.onsuccess =
                function () {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// =========================================
// DELETE MATERIAL
// =========================================

function deleteMaterialFromDB(id) {

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.delete(id);


            request.onsuccess =
                function () {

                    resolve();

                };


            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


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
            document.createElement(
                "p"
            );


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
// FORMAT FILE SIZE
// =========================================

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1)
            + " KB"
        );

    }


    return (
        (bytes / (1024 * 1024)).toFixed(1)
        + " MB"
    );

}


// =========================================
// LOAD MATERIALS
// =========================================

async function loadMaterials() {

    try {

        const materials =
            await getAllMaterials();


        materialsList.innerHTML =
            "";


        if (
            !materials ||
            materials.length === 0
        ) {

            materialsList.innerHTML = `
                <div class="empty-materials">

                    <p>
                        No study materials uploaded yet.
                    </p>

                </div>
            `;

            return;

        }


        materials.sort(
            function (a, b) {

                return b.createdAt - a.createdAt;

            }
        );


        materials.forEach(
            function (material) {

                addMaterialToPage(
                    material
                );

            }
        );

    }

    catch (error) {

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
        document.createElement(
            "div"
        );


    materialItem.className =
        "material-item";


    const content =
        document.createElement(
            "div"
        );


    const heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        material.filename;


    const description =
        document.createElement(
            "p"
        );


    description.textContent =
        "Saved material · "
        + formatFileSize(
            material.size
        );


    content.appendChild(
        heading
    );


    content.appendChild(
        description
    );


    const buttonContainer =
        document.createElement(
            "div"
        );


    buttonContainer.className =
        "material-buttons";


    // =====================================
    // VIEW BUTTON
    // =====================================

    const viewButton =
        document.createElement(
            "button"
        );


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
    // SUMMARY BUTTON
    // =====================================

    const summaryButton =
        document.createElement(
            "button"
        );


    summaryButton.type =
        "button";


    summaryButton.textContent =
        "Summary";


    summaryButton.addEventListener(
        "click",
        function () {

            generateSummary(
                material,
                summaryButton
            );

        }
    );


    // =====================================
    // DELETE BUTTON
    // =====================================

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.textContent =
        "Delete";


    deleteButton.className =
        "delete-material-button";


    deleteButton.addEventListener(
        "click",
        async function () {

            const confirmed =
                window.confirm(
                    "Delete this study material?"
                );


            if (!confirmed) {

                return;

            }


            try {

                await deleteMaterialFromDB(
                    material.id
                );


                await loadMaterials();


                materialContent.style.display =
                    "none";

            }

            catch (error) {

                console.error(
                    "Delete error:",
                    error
                );


                showMessage(
                    "Unable to delete material.",
                    "error"
                );

            }

        }
    );


    buttonContainer.appendChild(
        viewButton
    );


    buttonContainer.appendChild(
        summaryButton
    );


    buttonContainer.appendChild(
        deleteButton
    );


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
// VIEW MATERIAL
// =========================================

function viewMaterial(
    material
) {

    try {

        const blob =
            new Blob(
                [material.data],
                {
                    type:
                        material.type
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        window.open(
            url,
            "_blank"
        );


        setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            60000
        );

    }

    catch (error) {

        console.error(
            "View material error:",
            error
        );


        showMessage(
            "Unable to open material.",
            "error"
        );

    }

}


// =========================================
// READ TEXT FILE
// =========================================

async function readTextFile(
    material
) {

    const blob =
        new Blob(
            [material.data],
            {
                type:
                    material.type ||
                    "text/plain"
            }
        );


    return await blob.text();

}


// =========================================
// LOAD PDF.JS
// =========================================

function loadPdfJs() {

    return new Promise(
        function (resolve, reject) {

            if (
                window.pdfjsLib
            ) {

                resolve(
                    window.pdfjsLib
                );

                return;

            }


            const existingScript =
                document.querySelector(
                    'script[src*="pdf.min.js"]'
                );


            if (existingScript) {

                existingScript.onload =
                    function () {

                        if (
                            window.pdfjsLib
                        ) {

                            window.pdfjsLib
                                .GlobalWorkerOptions
                                .workerSrc =
                                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


                            resolve(
                                window.pdfjsLib
                            );

                        }

                        else {

                            reject(
                                new Error(
                                    "PDF.js loaded but pdfjsLib is unavailable."
                                )
                            );

                        }

                    };


                existingScript.onerror =
                    function () {

                        reject(
                            new Error(
                                "Unable to load PDF.js."
                            )
                        );

                    };


                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";


            script.onload =
                function () {

                    if (
                        !window.pdfjsLib
                    ) {

                        reject(
                            new Error(
                                "PDF.js did not load."
                            )
                        );

                        return;

                    }


                    window.pdfjsLib
                        .GlobalWorkerOptions
                        .workerSrc =
                        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


                    resolve(
                        window.pdfjsLib
                    );

                };


            script.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to load PDF reader."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


// =========================================
// READ PDF FILE
// =========================================

async function readPdfFile(
    material
) {

    const pdfjsLib =
        await loadPdfJs();


    if (!pdfjsLib) {

        throw new Error(
            "PDF.js is not available."
        );

    }


    const arrayBuffer =
        material.data;


    const pdfData =
        new Uint8Array(
            arrayBuffer
        );


    const loadingTask =
        pdfjsLib.getDocument(
            {
                data: pdfData
            }
        );


    const pdf =
        await loadingTask.promise;


    let fullText =
        "";


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
                    function (item) {

                        return item.str;

                    }
                )
                .join(" ");


        fullText +=
            pageText +
            "\n";

    }


    return fullText;

}


// =========================================
// EXTRACT MATERIAL TEXT
// =========================================

async function extractMaterialText(
    material
) {

    const fileName =
        material.filename.toLowerCase();


    if (
        fileName.endsWith(".txt")
    ) {

        return await readTextFile(
            material
        );

    }


    if (
        fileName.endsWith(".pdf")
    ) {

        return await readPdfFile(
            material
        );

    }


    throw new Error(
        "Only PDF and TXT files are supported."
    );

}


// =========================================
// CLEAN TEXT
// =========================================

function cleanSourceText(
    text
) {

    return text
        .replace(/\r/g, " ")
        .replace(/\t/g, " ")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


// =========================================
// REMOVE MARKDOWN
// =========================================

function removeMarkdown(
    text
) {

    return text
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/`/g, "")
        .replace(/^#+\s*/gm, "")
        .replace(/^[-*•]\s*/gm, "")
        .trim();

}


// =========================================
// SPLIT INTO SENTENCES
// =========================================

function splitSentences(
    text
) {

    return text
        .split(
            /(?<=[.!?])\s+/
        )
        .map(
            function (sentence) {

                return sentence.trim();

            }
        )
        .filter(
            function (sentence) {

                return sentence.length > 0;

            }
        );

}


// =========================================
// CREATE GENERAL POINTS
// =========================================

function createGeneralPoints(
    text
) {

    const cleaned =
        removeMarkdown(
            cleanSourceText(
                text
            )
        );


    const sentences =
        splitSentences(
            cleaned
        );


    const points = [];


    let currentPoint =
        "";


    sentences.forEach(
        function (sentence) {

            if (
                sentence.length < 180 &&
                currentPoint.length < 180
            ) {

                if (currentPoint) {

                    currentPoint +=
                        " " +
                        sentence;

                }

                else {

                    currentPoint =
                        sentence;

                }

            }

            else {

                if (currentPoint) {

                    points.push(
                        currentPoint
                    );

                }

                currentPoint =
                    sentence;

            }

        }
    );


    if (currentPoint) {

        points.push(
            currentPoint
        );

    }


    return points;

}


// =========================================
// CREATE OOPS POINTS
// =========================================

function createOOPPoints(
    text
) {

    const cleaned =
        removeMarkdown(
            cleanSourceText(
                text
            )
        );


    const sentences =
        splitSentences(
            cleaned
        );


    const points = [];


    const keywords = [
        "object oriented",
        "alan kay",
        "paradigm",
        "advantages",
        "reusability",
        "maintainability",
        "readability",
        "scalability",
        "encapsulation",
        "inheritance",
        "polymorphism",
        "abstraction",
        "class",
        "object",
        "instance method",
        "self",
        "__init__"
    ];


    const used =
        new Set();


    keywords.forEach(
        function (keyword) {

            const sentence =
                sentences.find(
                    function (item) {

                        return (
                            item
                                .toLowerCase()
                                .includes(
                                    keyword
                                ) &&
                            !used.has(item)
                        );

                    }
                );


            if (sentence) {

                points.push(
                    sentence
                );


                used.add(
                    sentence
                );

            }

        }
    );


    sentences.forEach(
        function (sentence) {

            if (
                points.length >= 20
            ) {

                return;

            }


            if (
                !used.has(sentence)
            ) {

                points.push(
                    sentence
                );


                used.add(
                    sentence
                );

            }

        }
    );


    return points;

}


// =========================================
// CREATE SUMMARY POINTS
// =========================================

function createSummaryPoints(
    text,
    fileName
) {

    const combined =
        (
            fileName +
            " " +
            text
        ).toLowerCase();


    if (
        combined.includes("oops") ||
        combined.includes(
            "object oriented"
        )
    ) {

        return createOOPPoints(
            text
        );

    }


    return createGeneralPoints(
        text
    );

}


// =========================================
// DISPLAY SUMMARY
// =========================================

function displaySummary(
    points,
    fileName
) {

    materialContent.style.display =
        "block";


    aiSummaryContent.innerHTML =
        "";


    currentSummaryText =
        "";


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        fileName;


    title.style.marginBottom =
        "15px";


    aiSummaryContent.appendChild(
        title
    );


    const orderedList =
        document.createElement(
            "ol"
        );


    orderedList.style.paddingLeft =
        "25px";


    orderedList.style.lineHeight =
        "1.7";


    points.forEach(
        function (point) {

            const listItem =
                document.createElement(
                    "li"
                );


            listItem.textContent =
                point;


            listItem.style.marginBottom =
                "10px";


            orderedList.appendChild(
                listItem
            );


            currentSummaryText +=
                point +
                "\n";

        }
    );


    aiSummaryContent.appendChild(
        orderedList
    );


    currentSummaryText =
        currentSummaryText.trim();


    showDownloadButton();

}


// =========================================
// SHOW DOWNLOAD BUTTON
// =========================================

function showDownloadButton() {

    if (
        !downloadSummaryButton
    ) {

        downloadSummaryButton =
            document.createElement(
                "button"
            );


        downloadSummaryButton.type =
            "button";


        downloadSummaryButton.id =
            "downloadSummaryButton";


        downloadSummaryButton.textContent =
            "Download AI Summary";


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


    downloadSummaryButton.onclick =
        downloadAISummary;


    downloadSummaryButton.style.display =
        "block";

}


// =========================================
// DOWNLOAD AI SUMMARY
// =========================================

function downloadAISummary() {

    if (
        !currentSummaryText
    ) {

        return;

    }


    const fileContent =
        "AI STUDY ASSISTANT\n\n" +
        "AI SUMMARY\n\n" +
        currentSummaryText;


    const blob =
        new Blob(
            [fileContent],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "AI_Summary.txt";


    link.style.display =
        "none";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        100
    );

}


// =========================================
// GENERATE SUMMARY
// =========================================

async function generateSummary(
    material,
    summaryButton
) {

    try {

        summaryButton.disabled =
            true;


        summaryButton.textContent =
            "Reading...";


        materialContent.style.display =
            "block";


        aiSummaryContent.innerHTML =
            "<p>Preparing summary...</p>";


        const text =
            await extractMaterialText(
                material
            );


        if (
            !text ||
            !text.trim()
        ) {

            throw new Error(
                "No readable text was found in this material."
            );

        }


        summaryButton.textContent =
            "Creating Summary...";


        const points =
            createSummaryPoints(
                text,
                material.filename
            );


        if (
            points.length === 0
        ) {

            throw new Error(
                "Unable to create summary points."
            );

        }


        displaySummary(
            points,
            material.filename
        );


        summaryButton.textContent =
            "Summary";

    }

    catch (error) {

        console.error(
            "Summary error:",
            error
        );


        materialContent.style.display =
            "block";


        aiSummaryContent.innerHTML =
            "";


        const errorMessage =
            document.createElement(
                "p"
            );


        errorMessage.style.color =
            "red";


        errorMessage.textContent =
            "Unable to create summary. " +
            error.message;


        aiSummaryContent.appendChild(
            errorMessage
        );

    }

    finally {

        summaryButton.disabled =
            false;


        summaryButton.textContent =
            "Summary";

    }

}


// =========================================
// UPLOAD FORM
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


        const allowedTypes = [
            "application/pdf",
            "text/plain"
        ];


        const fileName =
            file.name.toLowerCase();


        const validExtension =
            fileName.endsWith(".pdf") ||
            fileName.endsWith(".txt");


        if (
            !allowedTypes.includes(
                file.type
            ) &&
            !validExtension
        ) {

            showMessage(
                "Please upload a PDF or TXT file.",
                "error"
            );

            return;

        }


        try {

            const arrayBuffer =
                await file.arrayBuffer();


            const material = {

                id:
                    Date.now().toString(),

                filename:
                    file.name,

                size:
                    file.size,

                type:
                    file.type ||
                    "application/octet-stream",

                data:
                    arrayBuffer,

                createdAt:
                    Date.now()

            };


            await saveMaterial(
                material
            );


            uploadForm.reset();


            showMessage(
                "Material saved successfully."
            );


            /*
             * Add the saved material directly
             * so it does not disappear from the page.
             */
            addMaterialToPage(
                material
            );

        }

        catch (error) {

            console.error(
                "Upload error:",
                error
            );


            showMessage(
                "Unable to save material.",
                "error"
            );

        }

    }
);


// =========================================
// INITIALIZE
// =========================================

async function initializeMaterialsPage() {

    try {

        await openDatabase();

        await loadMaterials();

    }

    catch (error) {

        console.error(
            "Initialization error:",
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
// START
// =========================================

initializeMaterialsPage();