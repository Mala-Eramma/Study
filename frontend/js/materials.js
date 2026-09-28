const DB_NAME = "AIStudyAssistantMaterials";
const DB_VERSION = 1;
const STORE_NAME = "materials";
const MATERIALS_KEY = "study_assistant_materials";

let db = null;

const materialInput =
    document.getElementById("materialInput");

const saveMaterialButton =
    document.getElementById("saveMaterialButton");

const materialsList =
    document.getElementById("materialsList");

const materialContent =
    document.getElementById("materialContent");

const aiSummaryContent =
    document.getElementById("aiSummaryContent");

const downloadSummaryButton =
    document.getElementById("downloadSummaryButton");


/* =========================
   OPEN INDEXED DB
========================= */

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = function (event) {
            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id"
                    }
                );
            }
        };

        request.onsuccess = function () {
            db = request.result;
            resolve(db);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}


/* =========================
   SAVE MATERIAL
========================= */

function saveMaterial(file) {
    return new Promise((resolve, reject) => {
        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const material = {
            id:
                Date.now().toString() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2),

            filename: file.name,

            type:
                file.type ||
                "application/octet-stream",

            size: file.size,

            file: file,

            createdAt:
                new Date().toISOString()
        };

        const request =
            store.put(material);

        request.onsuccess = function () {
            updateProgressMaterials();
            resolve(material);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}


/* =========================
   GET ALL MATERIALS
========================= */

function getAllMaterials() {
    return new Promise((resolve, reject) => {
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

        request.onsuccess = function () {
            resolve(
                request.result || []
            );
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}


/* =========================
   DELETE MATERIAL
========================= */

function deleteMaterial(id) {
    return new Promise((resolve, reject) => {
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

        request.onsuccess = function () {
            updateProgressMaterials();
            resolve();
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}


/* =========================
   FORMAT FILE SIZE
========================= */

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );
    }

    return (
        (bytes / (1024 * 1024)).toFixed(1) +
        " MB"
    );
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   LOAD PDF.JS
========================= */

let pdfjsPromise = null;

function loadPDFJS() {
    if (pdfjsPromise) {
        return pdfjsPromise;
    }

    pdfjsPromise = import(
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.min.mjs"
    );

    return pdfjsPromise;
}


/* =========================
   EXTRACT PDF TEXT
========================= */

async function extractPDFText(file) {
    const pdfjsLib =
        await loadPDFJS();

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.worker.min.mjs";

    const arrayBuffer =
        await file.arrayBuffer();

    const pdf =
        await pdfjsLib.getDocument({
            data: arrayBuffer
        }).promise;

    let completeText = "";

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
                .map(item => item.str)
                .join(" ");

        completeText +=
            pageText + "\n\n";
    }

    return completeText
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================
   CLEAN TEXT
========================= */

function cleanText(text) {
    return text
        .replace(/\s+/g, " ")
        .replace(
            /(\w)-\s+(\w)/g,
            "$1$2"
        )
        .trim();
}


/* =========================
   SPLIT INTO SENTENCES
========================= */

function splitSentences(text) {
    return text
        .match(
            /[^.!?]+[.!?]+/g
        ) || [];
}


/* =========================
   EXTRACTIVE SUMMARY
========================= */

function createSummary(text) {
    text = cleanText(text);

    if (!text) {
        return "";
    }

    const sentences =
        splitSentences(text)
            .map(sentence =>
                sentence.trim()
            )
            .filter(
                sentence =>
                    sentence.length > 35
            );

    if (sentences.length === 0) {
        return text.substring(
            0,
            1500
        );
    }

    const stopWords = new Set([
        "the",
        "and",
        "that",
        "this",
        "with",
        "from",
        "have",
        "has",
        "were",
        "was",
        "are",
        "for",
        "you",
        "your",
        "they",
        "their",
        "which",
        "will",
        "into",
        "about",
        "there",
        "these",
        "those",
        "than",
        "then",
        "also",
        "when",
        "where",
        "what",
        "how",
        "why",
        "can",
        "could",
        "would",
        "should",
        "been",
        "being",
        "not",
        "but",
        "its",
        "it",
        "is",
        "in",
        "on",
        "of",
        "to",
        "a",
        "an",
        "as",
        "by",
        "or",
        "be",
        "we",
        "our",
        "at"
    ]);

    const words =
        text
            .toLowerCase()
            .replace(
                /[^a-z0-9\s]/g,
                " "
            )
            .split(/\s+/)
            .filter(
                word =>
                    word.length > 2 &&
                    !stopWords.has(word)
            );

    const frequency = {};

    words.forEach(word => {
        frequency[word] =
            (frequency[word] || 0) + 1;
    });

    const scoredSentences =
        sentences.map(
            (sentence, index) => {

                const sentenceWords =
                    sentence
                        .toLowerCase()
                        .replace(
                            /[^a-z0-9\s]/g,
                            " "
                        )
                        .split(/\s+/);

                let score = 0;

                sentenceWords.forEach(
                    word => {
                        if (
                            frequency[word]
                        ) {
                            score +=
                                frequency[word];
                        }
                    }
                );

                if (
                    index <
                    Math.min(
                        5,
                        sentences.length
                    )
                ) {
                    score += 2;
                }

                if (
                    sentence.length > 250
                ) {
                    score -= 1;
                }

                return {
                    sentence,
                    score,
                    index
                };
            }
        );

    scoredSentences.sort(
        (a, b) =>
            b.score - a.score
    );

    const summaryCount =
        Math.min(
            8,
            scoredSentences.length
        );

    const selected =
        scoredSentences
            .slice(
                0,
                summaryCount
            )
            .sort(
                (a, b) =>
                    a.index - b.index
            );

    return selected
        .map(item =>
            item.sentence
        )
        .join(" ");
}


/* =========================
   DISPLAY SUMMARY
========================= */

async function showAISummary(
    material,
    summaryButton
) {
    if (!materialContent) {
        return;
    }

    materialContent.style.display =
        "block";

    summaryButton.disabled =
        true;

    summaryButton.textContent =
        "Creating Summary...";

    aiSummaryContent.innerHTML = `
        <p>
            Reading the PDF content...
        </p>
    `;

    try {
        if (
            !material.file ||
            !material.type.includes("pdf")
        ) {
            aiSummaryContent.innerHTML = `
                <h3>${escapeHtml(
                    material.filename
                )}</h3>

                <p>
                    AI summary is currently
                    available for PDF files.
                </p>
            `;

            summaryButton.disabled =
                false;

            summaryButton.textContent =
                "AI Summary";

            return;
        }

        const extractedText =
            await extractPDFText(
                material.file
            );

        if (!extractedText) {
            aiSummaryContent.innerHTML = `
                <h3>${escapeHtml(
                    material.filename
                )}</h3>

                <p>
                    No readable text was found
                    in this PDF.
                </p>

                <p>
                    If this is a scanned PDF,
                    it requires OCR to read
                    the text.
                </p>
            `;

            summaryButton.disabled =
                false;

            summaryButton.textContent =
                "AI Summary";

            return;
        }

        const summary =
            createSummary(
                extractedText
            );

        if (!summary) {
            throw new Error(
                "Unable to create summary."
            );
        }

        aiSummaryContent.innerHTML = `
            <h3>
                ${escapeHtml(
                    material.filename
                )}
            </h3>

            <h4>
                AI Summary
            </h4>

            <p>
                ${escapeHtml(
                    summary
                )}
            </p>

            <hr>

            <p>
                <strong>
                    Extracted content:
                </strong>
                ${extractedText.length.toLocaleString()}
                characters
            </p>
        `;

        summaryButton.textContent =
            "Hide Summary";

        summaryButton.disabled =
            false;

        summaryButton.dataset.summaryShown =
            "true";

        if (downloadSummaryButton) {
            downloadSummaryButton.style.display =
                "inline-block";

            downloadSummaryButton.onclick =
                function () {
                    downloadSummary(
                        material.filename,
                        summary
                    );
                };
        }

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
                Please refresh the page
                and try again.
            </p>
        `;

        summaryButton.disabled =
            false;

        summaryButton.textContent =
            "AI Summary";
    }
}


/* =========================
   HIDE SUMMARY
========================= */

function hideSummary(
    summaryButton
) {
    if (materialContent) {
        materialContent.style.display =
            "none";
    }

    summaryButton.textContent =
        "AI Summary";

    summaryButton.dataset.summaryShown =
        "false";

    if (downloadSummaryButton) {
        downloadSummaryButton.style.display =
            "none";
    }
}


/* =========================
   DOWNLOAD SUMMARY
========================= */

function downloadSummary(
    filename,
    summary
) {
    const text =
        "AI Study Assistant\n\n" +
        "Summary of: " +
        filename +
        "\n\n" +
        summary;

    const blob =
        new Blob(
            [text],
            {
                type:
                    "text/plain"
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

    link.href = url;

    link.download =
        filename.replace(
            /\.pdf$/i,
            ""
        ) +
        "_summary.txt";

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );
}


/* =========================
   DISPLAY MATERIALS
========================= */

async function displayMaterials() {
    const materials =
        await getAllMaterials();

    if (!materialsList) {
        return;
    }

    if (materials.length === 0) {
        materialsList.innerHTML = `
            <p>
                No study materials uploaded yet.
            </p>
        `;

        return;
    }

    materials.sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

    materialsList.innerHTML =
        materials
            .map(
                material => `
                    <div
                        class="material-card"
                        data-id="${escapeHtml(
                            material.id
                        )}"
                    >
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

                        <button
                            class="view-material"
                            data-id="${escapeHtml(
                                material.id
                            )}"
                        >
                            View
                        </button>

                        <button
                            class="summary-material"
                            data-id="${escapeHtml(
                                material.id
                            )}"
                        >
                            AI Summary
                        </button>

                        <button
                            class="delete-material"
                            data-id="${escapeHtml(
                                material.id
                            )}"
                        >
                            Delete
                        </button>
                    </div>
                `
            )
            .join("");

    attachMaterialEvents(
        materials
    );
}


/* =========================
   MATERIAL EVENTS
========================= */

function attachMaterialEvents(
    materials
) {
    document
        .querySelectorAll(
            ".view-material"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const material =
                        materials.find(
                            item =>
                                item.id ===
                                button.dataset.id
                        );

                    if (!material) {
                        return;
                    }

                    viewMaterial(
                        material
                    );
                }
            );
        });


    document
        .querySelectorAll(
            ".summary-material"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async function () {

                    const material =
                        materials.find(
                            item =>
                                item.id ===
                                button.dataset.id
                        );

                    if (!material) {
                        return;
                    }

                    if (
                        button.dataset
                            .summaryShown ===
                        "true"
                    ) {
                        hideSummary(
                            button
                        );

                        return;
                    }

                    await showAISummary(
                        material,
                        button
                    );
                }
            );
        });


    document
        .querySelectorAll(
            ".delete-material"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async function () {

                    const material =
                        materials.find(
                            item =>
                                item.id ===
                                button.dataset.id
                        );

                    if (!material) {
                        return;
                    }

                    const confirmed =
                        confirm(
                            "Delete this study material?"
                        );

                    if (!confirmed) {
                        return;
                    }

                    await deleteMaterial(
                        material.id
                    );

                    await displayMaterials();
                }
            );
        });
}


/* =========================
   VIEW MATERIAL
========================= */

function viewMaterial(
    material
) {
    if (!material.file) {
        return;
    }

    const url =
        URL.createObjectURL(
            material.file
        );

    window.open(
        url,
        "_blank"
    );
}


/* =========================
   PROGRESS CONNECTION
========================= */

function updateProgressMaterials() {
    getAllMaterials()
        .then(materials => {

            const metadata =
                materials.map(
                    material => ({
                        id:
                            material.id,

                        filename:
                            material.filename,

                        type:
                            material.type,

                        size:
                            material.size,

                        createdAt:
                            material.createdAt
                    })
                );

            localStorage.setItem(
                MATERIALS_KEY,
                JSON.stringify(
                    metadata
                )
            );
        })
        .catch(error => {
            console.error(
                "Progress update error:",
                error
            );
        });
}


/* =========================
   SAVE BUTTON
========================= */

if (saveMaterialButton) {

    saveMaterialButton.addEventListener(
        "click",
        async function () {

            if (
                !materialInput ||
                !materialInput.files ||
                materialInput.files.length === 0
            ) {
                alert(
                    "Please select a study material first."
                );

                return;
            }

            const file =
                materialInput.files[0];

            try {

                saveMaterialButton.disabled =
                    true;

                saveMaterialButton.textContent =
                    "Saving...";

                await saveMaterial(
                    file
                );

                materialInput.value =
                    "";

                await displayMaterials();

                alert(
                    "Study material saved successfully."
                );

            } catch (error) {

                console.error(
                    "Save material error:",
                    error
                );

                alert(
                    "Unable to save the study material."
                );

            } finally {

                saveMaterialButton.disabled =
                    false;

                saveMaterialButton.textContent =
                    "Save Material";
            }
        }
    );
}


/* =========================
   INITIALIZE
========================= */

async function initializeMaterials() {
    try {

        await openDatabase();

        await displayMaterials();

        updateProgressMaterials();

    } catch (error) {

        console.error(
            "Materials initialization error:",
            error
        );

        if (materialsList) {
            materialsList.innerHTML = `
                <p>
                    Unable to load study materials.
                </p>
            `;
        }
    }
}


initializeMaterials();