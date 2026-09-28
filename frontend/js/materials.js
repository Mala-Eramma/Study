/* =========================================================
   AI STUDY ASSISTANT
   MATERIALS - GITHUB PAGES VERSION
========================================================= */


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


const downloadSummaryButton =
    document.getElementById(
        "downloadSummaryButton"
    );


/* =========================================================
   USER
========================================================= */

const userData =
    localStorage.getItem("user");


if (!userData) {

    window.location.href =
        "login.html";
}


const user =
    JSON.parse(userData);


const userId =
    user.user_id ||
    user.id ||
    user.email;


/* =========================================================
   DATABASE
========================================================= */

const DB_NAME =
    "AIStudyAssistantMaterials";


const DB_VERSION =
    1;


const STORE_NAME =
    "materials";


let database = null;


/* =========================================================
   OPEN DATABASE
========================================================= */

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

                    const db =
                        event.target.result;


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
                            "user_id",
                            "user_id",
                            {
                                unique: false
                            }
                        );
                    }
                };


            request.onsuccess =
                function (event) {

                    database =
                        event.target.result;

                    resolve(database);
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


/* =========================================================
   MESSAGE
========================================================= */

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
                "div"
            );


        messageElement.id =
            "materialMessage";


        if (uploadForm) {

            uploadForm.insertAdjacentElement(
                "afterend",
                messageElement
            );
        }
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


/* =========================================================
   SAVE MATERIAL METADATA
   Used by Progress page
========================================================= */

function saveMaterialMetadata(
    material
) {

    let materials = [];


    try {

        materials =
            JSON.parse(
                localStorage.getItem(
                    "study_assistant_materials"
                ) || "[]"
            );


        if (!Array.isArray(materials)) {

            materials = [];
        }

    } catch (error) {

        materials = [];
    }


    const alreadyExists =
        materials.some(
            item =>
                String(item.id) ===
                String(material.id)
        );


    if (!alreadyExists) {

        materials.push({

            id:
                material.id,

            user_id:
                material.user_id,

            filename:
                material.filename,

            size:
                material.size,

            type:
                material.type,

            saved_at:
                material.saved_at
        });


        localStorage.setItem(
            "study_assistant_materials",
            JSON.stringify(
                materials
            )
        );
    }
}


/* =========================================================
   REMOVE MATERIAL METADATA
========================================================= */

function removeMaterialMetadata(
    materialId
) {

    let materials = [];


    try {

        materials =
            JSON.parse(
                localStorage.getItem(
                    "study_assistant_materials"
                ) || "[]"
            );

    } catch (error) {

        materials = [];
    }


    materials =
        materials.filter(
            item =>
                String(item.id) !==
                String(materialId)
        );


    localStorage.setItem(
        "study_assistant_materials",
        JSON.stringify(
            materials
        )
    );
}


/* =========================================================
   SAVE FILE TO INDEXEDDB
========================================================= */

function saveMaterialToDatabase(
    material
) {

    return new Promise(
        function (resolve, reject) {

            const transaction =
                database.transaction(
                    STORE_NAME,
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
                        request.error
                    );
                };
        }
    );
}


/* =========================================================
   GET ALL USER MATERIALS
========================================================= */

function getMaterialsFromDatabase() {

    return new Promise(
        function (resolve, reject) {

            const transaction =
                database.transaction(
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

                    const materials =
                        request.result
                            .filter(
                                material =>
                                    String(
                                        material.user_id
                                    ) ===
                                    String(
                                        userId
                                    )
                            );


                    resolve(
                        materials
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


/* =========================================================
   GET ONE MATERIAL
========================================================= */

function getMaterialFromDatabase(
    materialId
) {

    return new Promise(
        function (resolve, reject) {

            const transaction =
                database.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.get(
                    materialId
                );


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


/* =========================================================
   DELETE FROM INDEXEDDB
========================================================= */

function deleteMaterialFromDatabase(
    materialId
) {

    return new Promise(
        function (resolve, reject) {

            const transaction =
                database.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.delete(
                    materialId
                );


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


/* =========================================================
   FORMAT FILE SIZE
========================================================= */

function formatFileSize(
    bytes
) {

    if (bytes < 1024) {

        return `${bytes} B`;
    }


    if (bytes < 1024 * 1024) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }


    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}


/* =========================================================
   LOAD MATERIALS
========================================================= */

async function loadMaterials() {

    try {

        const materials =
            await getMaterialsFromDatabase();


        materialsList.innerHTML =
            "";


        if (
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

                return (
                    b.saved_at -
                    a.saved_at
                );
            }
        );


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


/* =========================================================
   ADD MATERIAL TO PAGE
========================================================= */

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
        `Saved material · ${formatFileSize(
            material.size
        )}`;


    content.appendChild(
        heading
    );


    content.appendChild(
        description
    );


    /* =====================================================
       BUTTON CONTAINER
    ===================================================== */

    const buttonContainer =
        document.createElement(
            "div"
        );


    buttonContainer.className =
        "material-buttons";


    /* =====================================================
       VIEW BUTTON
    ===================================================== */

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


    buttonContainer.appendChild(
        viewButton
    );


    /* =====================================================
       AI SUMMARY BUTTON
    ===================================================== */

    const summaryButton =
        document.createElement(
            "button"
        );


    summaryButton.type =
        "button";


    summaryButton.textContent =
        "AI Summary";


    summaryButton.addEventListener(
        "click",
        function () {

            showLocalSummary(
                material,
                summaryButton
            );
        }
    );


    buttonContainer.appendChild(
        summaryButton
    );


    /* =====================================================
       DELETE BUTTON
    ===================================================== */

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.textContent =
        "Delete";


    deleteButton.addEventListener(
        "click",
        function () {

            deleteMaterial(
                material.id
            );
        }
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


/* =========================================================
   VIEW MATERIAL
========================================================= */

async function viewMaterial(
    material
) {

    try {

        const savedMaterial =
            await getMaterialFromDatabase(
                material.id
            );


        if (!savedMaterial) {

            showMessage(
                "Material not found.",
                "error"
            );

            return;
        }


        const blob =
            savedMaterial.file;


        const fileUrl =
            URL.createObjectURL(
                blob
            );


        window.open(
            fileUrl,
            "_blank"
        );


    } catch (error) {

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


/* =========================================================
   LOCAL AI SUMMARY
========================================================= */

function showLocalSummary(
    material,
    summaryButton
) {

    if (!materialContent) {

        return;
    }


    materialContent.style.display =
        "block";


    if (downloadSummaryButton) {

        downloadSummaryButton.style.display =
            "none";
    }


    aiSummaryContent.innerHTML = `
        <h3>${escapeHtml(
            material.filename
        )}</h3>

        <p>
            This material has been saved successfully
            in your browser.
        </p>

        <p>
            File type:
            ${escapeHtml(
                material.type ||
                "Unknown"
            )}
        </p>

        <p>
            File size:
            ${formatFileSize(
                material.size
            )}
        </p>

        <p>
            You can use the View button to open
            the saved material.
        </p>
    `;


    summaryButton.textContent =
        "Hide Summary";


    summaryButton.onclick =
        function () {

            materialContent.style.display =
                "none";

            summaryButton.textContent =
                "AI Summary";

            summaryButton.onclick =
                function () {

                    showLocalSummary(
                        material,
                        summaryButton
                    );
                };
        };
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value || "";


    return div.innerHTML;
}


/* =========================================================
   DELETE MATERIAL
========================================================= */

async function deleteMaterial(
    materialId
) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this study material?"
        );


    if (!confirmed) {

        return;
    }


    try {

        await deleteMaterialFromDatabase(
            materialId
        );


        removeMaterialMetadata(
            materialId
        );


        materialContent.style.display =
            "none";


        aiSummaryContent.innerHTML =
            "";


        showMessage(
            "Study material deleted successfully.",
            "success"
        );


        await loadMaterials();


    } catch (error) {

        console.error(
            "Delete material error:",
            error
        );


        showMessage(
            "Unable to delete study material.",
            "error"
        );
    }
}


/* =========================================================
   UPLOAD / SAVE MATERIAL
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
                    `${userId}_${Date.now()}_${Math.random()
                        .toString(36)
                        .substring(2)}`,

                user_id:
                    userId,

                filename:
                    file.name,

                size:
                    file.size,

                type:
                    file.type,

                file:
                    file,

                saved_at:
                    Date.now()
            };


            await saveMaterialToDatabase(
                material
            );


            saveMaterialMetadata(
                material
            );


            materialFile.value =
                "";


            materialContent.style.display =
                "none";


            aiSummaryContent.innerHTML =
                "";


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


            await loadMaterials();


        } catch (error) {

            console.error(
                "Upload error:",
                error
            );


            showMessage(
                "Unable to save study material.",
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


if (downloadSummaryButton) {

    downloadSummaryButton.style.display =
        "none";
}


/* =========================================================
   START
========================================================= */

async function startMaterials() {

    try {

        await openDatabase();

        await loadMaterials();

    } catch (error) {

        console.error(
            "Materials database error:",
            error
        );


        showMessage(
            "Unable to open material storage.",
            "error"
        );
    }
}


startMaterials();