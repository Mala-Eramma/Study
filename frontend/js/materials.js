const MATERIALS_KEY = "study_assistant_materials";
const USER_KEY = "user";

const userData = localStorage.getItem(USER_KEY);

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);
const userId = user.user_id;

const materialForm = document.getElementById("materialForm");
const materialList = document.getElementById("materialList");
const fileInput = document.getElementById("fileInput");

function getMaterials() {
    const materials = JSON.parse(
        localStorage.getItem(MATERIALS_KEY) || "[]"
    );

    return materials.filter(
        material =>
            String(material.user_id) === String(userId)
    );
}

function saveMaterials(materials) {
    const allMaterials = JSON.parse(
        localStorage.getItem(MATERIALS_KEY) || "[]"
    );

    const otherUsersMaterials = allMaterials.filter(
        material =>
            String(material.user_id) !== String(userId)
    );

    localStorage.setItem(
        MATERIALS_KEY,
        JSON.stringify([
            ...otherUsersMaterials,
            ...materials
        ])
    );
}

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createMaterialElement(material) {
    const container =
        document.createElement("div");

    container.className = "material-item";

    const title =
        document.createElement("h3");

    title.textContent =
        material.filename;

    const size =
        document.createElement("p");

    size.textContent =
        `Size: ${formatFileSize(material.size)}`;

    const date =
        document.createElement("p");

    date.textContent =
        `Added: ${new Date(
            material.created_at
        ).toLocaleString()}`;

    const viewButton =
        document.createElement("button");

    viewButton.textContent =
        "View";

    viewButton.addEventListener(
        "click",
        function () {
            viewMaterial(material.id);
        }
    );

    const deleteButton =
        document.createElement("button");

    deleteButton.textContent =
        "Delete";

    deleteButton.addEventListener(
        "click",
        function () {
            deleteMaterial(material.id);
        }
    );

    container.appendChild(title);
    container.appendChild(size);
    container.appendChild(date);
    container.appendChild(viewButton);
    container.appendChild(deleteButton);

    materialList.appendChild(container);
}

function loadMaterials() {
    if (!materialList) {
        return;
    }

    materialList.innerHTML = "";

    const materials = getMaterials();

    if (materials.length === 0) {
        const message =
            document.createElement("p");

        message.textContent =
            "No study materials uploaded yet.";

        materialList.appendChild(message);

        return;
    }

    materials
        .slice()
        .reverse()
        .forEach(material => {
            createMaterialElement(material);
        });
}

function viewMaterial(materialId) {
    const materials = getMaterials();

    const material = materials.find(
        item =>
            String(item.id) === String(materialId)
    );

    if (!material || !material.data) {
        return;
    }

    const byteCharacters =
        atob(material.data.split(",")[1]);

    const byteNumbers =
        new Array(byteCharacters.length);

    for (
        let i = 0;
        i < byteCharacters.length;
        i++
    ) {
        byteNumbers[i] =
            byteCharacters.charCodeAt(i);
    }

    const byteArray =
        new Uint8Array(byteNumbers);

    const blob =
        new Blob(
            [byteArray],
            {
                type: material.type
            }
        );

    const url =
        URL.createObjectURL(blob);

    window.open(url, "_blank");
}

function deleteMaterial(materialId) {
    const materials = getMaterials();

    const updatedMaterials =
        materials.filter(
            material =>
                String(material.id) !==
                String(materialId)
        );

    saveMaterials(updatedMaterials);

    loadMaterials();
}

if (materialForm && fileInput) {
    materialForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const file = fileInput.files[0];

            if (!file) {
                alert("Please select a file.");
                return;
            }

            const allowedTypes = [
                "application/pdf",
                "text/plain"
            ];

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {
                alert(
                    "Only PDF and TXT files are supported."
                );
                return;
            }

            const reader =
                new FileReader();

            reader.onload = function () {
                const materials =
                    getMaterials();

                materials.push({
                    id: Date.now(),
                    user_id: userId,
                    filename: file.name,
                    size: file.size,
                    type: file.type,
                    data: reader.result,
                    created_at:
                        new Date().toISOString()
                });

                saveMaterials(materials);

                fileInput.value = "";

                loadMaterials();
            };

            reader.readAsDataURL(file);
        }
    );
}

loadMaterials();