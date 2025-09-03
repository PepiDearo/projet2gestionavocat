const champFichier = document.getElementById('fileInput');
const boutonEnvoyer = document.getElementById('uploadButton');
const zoneDepot = document.getElementById('drop-area');
const divFichierSelectionne = document.getElementById('selected-file');
const listeFichiers = document.getElementById('fileList');
const historiqueVide = document.getElementById('emptyHistory');

let fichierSelectionne = null;

champFichier.addEventListener('change', traiterFichier);

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evenement => {
    zoneDepot.addEventListener(evenement, empecherDefaults, false);
});

function empecherDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(evenement => {
    zoneDepot.addEventListener(evenement, surligner, false);
});

['dragleave', 'drop'].forEach(evenement => {
    zoneDepot.addEventListener(evenement, retirerSurlignage, false);
});

function surligner() {
    zoneDepot.classList.add('drag-over');
}

function retirerSurlignage() {
    zoneDepot.classList.remove('drag-over');
}

zoneDepot.addEventListener('drop', gererDepot, false);

function gererDepot(e) {
    const dt = e.dataTransfer;
    const fichiers = dt.files;

    if (fichiers.length > 0) {
        traiterFichier({ target: { files: fichiers } });
    }
}

function traiterFichier(e) {
    fichierSelectionne = e.target.files[0];

    if (fichierSelectionne) {
        afficherInfosFichier(fichierSelectionne);
        boutonEnvoyer.disabled = false;
    }
}

function afficherInfosFichier(fichier) {
    const taille = (fichier.size / 1024).toFixed(2);
    const type = fichier.type || 'Unknown';
    const icone = obtenirIconeFichier(type);

    divFichierSelectionne.innerHTML = `
        <div class="file-info">
            <i class="${icone} file-icon"></i>
            <div class="file-details">
                <div class="file-name">${fichier.name}</div>
                <div class="file-size">${taille} KB</div>
            </div>
        </div>
        <button class="remove-file" id="removeFile">
            <i class="fas fa-times"></i>
        </button>
    `;

    divFichierSelectionne.classList.add('active');

    document.getElementById('removeFile').addEventListener('click', function() {
        reinitialiserFichier();
    });
}

function obtenirIconeFichier(type) {
    if (type.includes('image')) return 'fas fa-file-image';
    if (type.includes('pdf')) return 'fas fa-file-pdf';
    if (type.includes('word') || type.includes('document')) return 'fas fa-file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'fas fa-file-excel';
    if (type.includes('zip') || type.includes('compressed')) return 'fas fa-file-archive';
    return 'fas fa-file';
}

function reinitialiserFichier() {
    fichierSelectionne = null;
    divFichierSelectionne.innerHTML = '';
    divFichierSelectionne.classList.remove('active');
    champFichier.value = '';
    boutonEnvoyer.disabled = true;
}

boutonEnvoyer.addEventListener('click', function() {
    if (!fichierSelectionne) {
        alert('Veuillez sélectionner un fichier à envoyer !');
        return;
    }

    const formulaire = new FormData();
    formulaire.append('file', fichierSelectionne);

    const conteneurProgression = document.createElement('div');
    conteneurProgression.className = 'progress-container';
    conteneurProgression.innerHTML = '<div class="progress-bar" id="progressBar"></div>';
    divFichierSelectionne.appendChild(conteneurProgression);

    fetch('/upload', {
        method: 'POST',
        body: formulaire
    })
    .then(reponse => {
        if (!reponse.ok) {
            throw new Error('Erreur réseau');
        }
        return reponse.json();
    })
    .then(donnees => {
        const messageSucces = document.createElement('div');
        messageSucces.className = 'upload-status success';
        messageSucces.textContent = 'Fichier envoyé avec succès !';
        divFichierSelectionne.appendChild(messageSucces);

        // Extraire le nom du fichier depuis le chemin complet
        const filePath = donnees.file.path;
        const fileName = filePath.split('\\').pop().split('/').pop();

        // Construire l'URL correcte pour accéder au fichier
        const fileUrl = `/uploads/${fileName}`;

        // Ajouter à l'historique avec le bon chemin
        ajouterAHistorique({
            ...donnees.file,
            fileUrl: fileUrl
        });

        setTimeout(() => {
            reinitialiserFichier();

            const progressContainer = document.querySelector('.progress-container');
            if (progressContainer) progressContainer.remove();
            const uploadStatus = document.querySelector('.upload-status');
            if (uploadStatus) uploadStatus.remove();
        }, 3000);
    })
    .catch(erreur => {
        console.error('Erreur:', erreur);
        const messageErreur = document.createElement('div');
        messageErreur.className = 'upload-status error';
        messageErreur.textContent = "Erreur lors de l'envoi. Veuillez réessayer.";
        divFichierSelectionne.appendChild(messageErreur);

        // Supprimer la barre de progression en cas d'erreur
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) progressContainer.remove();
    });
});

function ajouterAHistorique(fichier) {
    if (historiqueVide) {
        historiqueVide.style.display = 'none';
    }

    const elementFichier = document.createElement('div');
    elementFichier.className = 'file-item';

    const maintenant = new Date();
    const dateStr = maintenant.toLocaleDateString();
    const heureStr = maintenant.toLocaleTimeString();

    // Utiliser l'URL correcte pour télécharger le fichier
    const fileUrl = fichier.fileUrl;

    // Extraire le nom du fichier à partir de l'URL pour l'affichage
    const displayName = fichier.originalname || fileUrl.split('/').pop();

    // Conserver le nom complet du fichier (avec timestamp) pour les opérations
    const fileName = fileUrl.split('/').pop();

    elementFichier.innerHTML = `
        <div class="file-info">
            <i class="${obtenirIconeFichier(fichier.mimeType)} file-icon"></i>
            <div class="file-details">
                <div class="file-name">${displayName}</div>
                <div class="file-size">${(fichier.size / 1024).toFixed(2)} KB</div>
                <div class="file-date">Téléversé le ${dateStr} à ${heureStr}</div>
            </div>
        </div>
        <div class="file-actions">
            <button class="download-btn" data-url="${fileUrl}">
                <i class="fas fa-download"></i>
            </button>
            <button class="delete-btn" data-filename="${fileName}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    listeFichiers.insertBefore(elementFichier, listeFichiers.firstChild);

    const boutonTelecharger = elementFichier.querySelector('.download-btn');
    boutonTelecharger.addEventListener('click', function() {
        window.open(this.dataset.url, '_blank');
    });

    const boutonSupprimer = elementFichier.querySelector('.delete-btn');
    boutonSupprimer.addEventListener('click', function() {
        const fileName = this.dataset.filename;

        // Supprimer le fichier et mettre à jour l'interface
        supprimerFichier({ name: fileName }, elementFichier);
    });
}

// Fonction pour supprimer un fichier
function supprimerFichier(fichier, elementFichier) {
    const fileName = fichier.name;

    console.log(`Suppression du fichier: ${fileName}`); // Log pour debug

    fetch(`/files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            // Supprimer l'élément de l'interface
            elementFichier.remove();

            // Afficher l'historique vide si plus aucun fichier
            if (listeFichiers.children.length === 0 ||
               (listeFichiers.children.length === 1 && listeFichiers.children[0].id === 'emptyHistory')) {
                historiqueVide.style.display = 'block';
            }
        } else {
            alert('Erreur lors de la suppression du fichier');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression du fichier');
    });
}

// Charger l'historique des fichiers au démarrage
function chargerHistoriqueFichiers() {
    fetch('/files')
    .then(response => response.json())
    .then(files => {
        if (files.length > 0) {
            historiqueVide.style.display = 'none';
            files.forEach(file => {
                // Utilisez le nom du fichier tel qu'il est stocké dans la base de données
                // pour la suppression et le téléchargement
                ajouterAHistorique({
                    originalname: getOriginalNameFromFileName(file.name), // Extraire le nom original pour l'affichage
                    size: file.size,
                    path: file.path,
                    mimeType: getMimeTypeFromFilename(file.name),
                    fileUrl: file.path
                });
            });
        } else {
            historiqueVide.style.display = 'block';  // Afficher "historique vide" si aucun fichier
        }
    })
    .catch(error => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        historiqueVide.style.display = 'block';  // Afficher "historique vide" en cas d'erreur
    });
}

// Fonction pour extraire le nom original d'un fichier à partir du nom avec timestamp
function getOriginalNameFromFileName(fileName) {
    // Exemple: "document_1618234567.pdf" -> "document.pdf"
    const parts = fileName.split('_');
    if (parts.length > 1) {
        // S'il y a un underscore, on suppose qu'il s'agit du format "nom_timestamp.ext"
        const extension = fileName.split('.').pop();
        return `${parts[0]}.${extension}`;
    }
    return fileName; // Retourne le nom complet si le format ne correspond pas
}

// Déterminer le type MIME à partir du nom de fichier
function getMimeTypeFromFilename(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'txt': 'text/plain',
        'zip': 'application/zip',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'exe': 'application/octet-stream'
    };

    return mimeTypes[extension] || 'application/octet-stream';
}

boutonEnvoyer.disabled = true;

document.addEventListener('DOMContentLoaded', function() {
    chargerHistoriqueFichiers();
});
