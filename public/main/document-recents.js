const documents = document.getElementById("documents-list");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/files");
        const docs = await response.json();

        if (response.ok) {
            docs.slice(0, 2).map(doc => {
                const card = document.createElement("div");
                card.classList.add("selected-file", "active");

                const tailleKo = (doc.size / 1024).toFixed(2);
                const date = new Date(doc.date).toLocaleString();
                const extension = doc.name.split('.').pop().toLowerCase();

                let icone = "fas fa-file";
                if (["pdf"].includes(extension)) icone = "fas fa-file-pdf";
                else if (["doc", "docx"].includes(extension)) icone = "fas fa-file-word";
                else if (["xls", "xlsx"].includes(extension)) icone = "fas fa-file-excel";
                else if (["png", "jpg", "jpeg"].includes(extension)) icone = "fas fa-file-image";
                else if (["zip", "rar"].includes(extension)) icone = "fas fa-file-archive";
                else if (["exe"].includes(extension)) icone = "fas fa-file-code";

                card.innerHTML = `
                        <div class="file-info">
                            <i class="${icone} file-icon"></i>
                            <div class="file-details">
                                <div class="file-name">
                                    <a href="${doc.path}" download title="${doc.name}">${doc.name}</a>
                                </div>
                                <div class="file-size">${tailleKo} KB – ${date}</div>
                            </div>
                        </div>
                    `;
                card.addEventListener('click', () => {
                    window.location.href = "/documents"
                })
                documents.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Erreur lors du chargement des documents récents :", error);
    }
});


