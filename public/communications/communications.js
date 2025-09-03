function confirmationDelete(message = "Email supprimé avec succès !") {
    const confirmation = document.getElementById('confirmation');
    confirmation.textContent = message;
    confirmation.style.display = 'block';
    setTimeout(() => {
        confirmation.style.display = 'none';
    }, 3000);
    pageAffiche=1;
    getunepage();
}
function confirmationEnvoye(message = "Email envoyé avec succès !") {
    const confirmation = document.getElementById('confirmation');
    confirmation.textContent = message;
    confirmation.style.display = 'block';
    setTimeout(() => {
        confirmation.style.display = 'none';
    }, 3000);
    pageAffiche=1;
    getunepage();
}

let totalPages = 1;
let pageAffiche = 1;
const avant = document.getElementById('avant');
const apres = document.getElementById('apres');
const container = document.getElementById("emails");
const cherche = document.getElementById("cherche");

async function getunepage() {
    try {
        let response = await fetch(`/emails?page=${pageAffiche}&q=${cherche.value ?? ""}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const emails = await response.json();
        totalPages = emails.totalPages;
        afficher(emails);
    } catch (error) {
        alert(error);
    }
}

function afficher(emails) {
    container.innerHTML = ``;
    console.log(emails, totalPages);
    emails.communications.forEach(email => {
        const emailElement = document.createElement('div');
        emailElement.className = 'email';
        emailElement.dataset.id = email.idCommunication;

        emailElement.innerHTML = `
            <input type="checkbox" class="email-checkbox" onchange="toggleDeleteButton()"/>
            <div class="from">${email.user}</div>
            <div class="subject">${email.sujet}</div>
            <div class="preview">${email.message}</div>
            <button class="delete-btn" onclick="deleteEmail(this)">🗑</button>
        `;

        container.appendChild(emailElement);
    });
    
    if (pageAffiche >= totalPages) {
        apres.style.display = "none";
    } else {
        apres.style.display = "block";
    }
    if (pageAffiche <= 1) {
        avant.style.display = "none";
    } else {
        avant.style.display = "block";
    }
    selectAllCheckbox.checked=false;
}

async function chargerEmailsEtPagination() {
	try {
        getunepage();
        
        cherche.addEventListener('keydown', async(event) => {
            if (event.key === 'Enter') {
                pageAffiche = 1;
                getunepage();
            }
        });

		avant.addEventListener("click", async () => {
			if (pageAffiche > 1) {
				pageAffiche--;
				getunepage();
			}
		});

		apres.addEventListener("click", async () => {
			if (pageAffiche < totalPages) {
				pageAffiche++;
				getunepage();
			}
		});

        document.getElementById("refresh").addEventListener("click", async () => {
			getunepage();
		});

        document.getElementById("delete-selected-btn").addEventListener("click", async () => {
            deleteSelected();
		});
	} catch (err) {
		console.error('Erreur lors du chargement des emails :', err);
	}
}

window.addEventListener('DOMContentLoaded', chargerEmailsEtPagination);

const selectAllCheckbox = document.getElementById('select-all');
selectAllCheckbox.addEventListener('change', () => {
    const emailCheckboxes = document.querySelectorAll('.email-checkbox');
    emailCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    toggleDeleteButton();
});

async function deleteEmail(btn) {
    const emailDiv = btn.closest('.email');
    const emailId = emailDiv.dataset.id;

    try {
        const response = await fetch(`/emails/${emailId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            emailDiv.remove();
            confirmationDelete();
            toggleDeleteButton();
        }
    } catch (err) {
        console.error("Erreur lors de la suppression :", err);
    }
}

function toggleDeleteButton() {
    const anyChecked = document.querySelectorAll('.email-checkbox:checked').length > 0;
    const deleteBtn = document.getElementById('delete-selected-btn');
    deleteBtn.style.display = anyChecked ? 'inline-block' : 'none';
}

async function deleteSelected() {
    const checkboxes = document.querySelectorAll('.email-checkbox:checked');
    for (const cb of checkboxes) {
        const emailDiv = cb.closest('.email');
        const emailId = emailDiv.dataset.id;

        try {
            const response = await fetch(`/emails/${emailId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                emailDiv.remove();
                confirmationDelete();
            }
        } catch (err) {
            console.error("Erreur lors de la suppression multiple :", err);
        }
    }
    toggleDeleteButton();
}


const modal = document.getElementById('messageModal');
const openPopup = document.getElementById('composer');
const closePopup = document.getElementById('closeModalBtn');
const messageForm = document.getElementById('messageForm');

openPopup.onclick = function () {
    modal.style.display = 'block';
}

closePopup.onclick = function () {
    modal.style.display = 'none';
}

window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

messageForm.onsubmit = function (event) {
    event.preventDefault();

    const receveur = document.getElementById('recipient').value;
    const sujet = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const data = {
        receveur,
        sujet,
        message
    }

    modal.style.display = 'none';
}

if (messageForm) {
    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const receveur = document.getElementById('recipient').value;
        const sujet = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
    
        if (!receveur || !sujet || !message) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        const data = {
            receveur,
            sujet,
            message,
        }
    
        await sendMessage(data);
        modal.style.display = 'none';
    })
}


async function sendMessage(data) {
    try {
        const response = await fetch('/api/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            confirmationEnvoye();
        }
    } catch (error) {
        alert("erreur lors de l'envoi de l'email");
    }
};