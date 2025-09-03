const userListDiv = document.getElementById("user-list");
const btnmodifier = document.getElementById("btnmodifier");
const popup2 = document.getElementById('popup2');
const btnfermerpopup2 = document.getElementById('btnfermerpopup2');
const formmodifierutilisateur = document.getElementById('formmodifierutilisateur');

let currentUserId = null;

document.addEventListener("DOMContentLoaded", function () {
    fetch('/api/utilisateurs')
        .then(response => response.json())
        .then(utilisateurs => {
            if (utilisateurs.length > 0) {
                let userHtml = '';
                utilisateurs.forEach(user => {
                    userHtml += `
                    <div class="box" style="position: relative; padding-top: 2.5rem;" data-id="${user.idUser}">
                        <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 8px;">
                            <button class="btnmod" class="button is-small is-light" title="Modifier">
                                <span class="icon is-small">
                                    <i class="fas fa-edit"></i>
                                </span>
                            </button>
                            <button class="btnsupprimer" class="button is-small is-light" title="Supprimer">
                                <span class="icon is-small">
                                    <i class="fas fa-trash"></i>
                                </span>
                            </button>
                        </div>
                
                        <p id="email"><strong>Email:</strong> ${user.adresseCourriel}</p>
                        <p id="user"><strong>Username:</strong> ${user.username}</p>
                        <p id="mdp"><strong>Mot de passe:</strong> ${user.motDePasse}</p>
                        <p><strong>Client?:</strong> ${user.isClient ? 'Oui' : 'Non'}</p>
                        <p><strong>Avocat?:</strong> ${user.isAvocat ? 'Oui' : 'Non'}</p>
                        <p><strong>Admin?:</strong> ${user.isAdmin ? 'Oui' : 'Non'}</p>
                    </div>
                    `;
                });
                userListDiv.innerHTML = userHtml;

                // Suppression
                document.querySelectorAll(".btnsupprimer").forEach(btnsupprimer => {
                    btnsupprimer.addEventListener('click', async function () {
                        try {
                            const id = btnsupprimer.parentElement.parentElement.dataset.id;
                            const response = await fetch(`/api/utilisateurs/${id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (response.ok) {
                                alert("Client supprimé avec succès !");
                                window.location.reload();
                            } else {
                                alert("Erreur lors de la suppression du client.");
                            }
                        } catch (error) {
                            console.error("Erreur lors de la suppression :", error);
                        }
                    });
                });

                // Modification
                document.querySelectorAll(".btnmod").forEach(btnmod => {
                    btnmod.addEventListener('click', function () {
                        const box = btnmod.closest('.box');
                        const id = box.dataset.id;
                        currentUserId = id;

                        const email = box.querySelector("#email").innerText.replace("Email: ", "").trim();
                        const nom = box.querySelector("#user").innerText.replace("Username: ", "").trim();
                        const mdp = box.querySelector("#mdp").innerText.replace("Mot de passe: ", "").trim();

                        const isClient = box.innerHTML.includes("Client?: Oui");
                        const isAvocat = box.innerHTML.includes("Avocat?: Oui");
                        const isAdmin = box.innerHTML.includes("Admin?: Oui");

                        document.getElementById("adresseCourriel").value = email;
                        document.getElementById("username").value = nom;
                        document.getElementById("motDePasse").value = mdp;

                        if (isClient) document.querySelector('input[name="role"][value="client"]').checked = true;
                        else if (isAvocat) document.querySelector('input[name="role"][value="avocat"]').checked = true;
                        else if (isAdmin) document.querySelector('input[name="role"][value="admin"]').checked = true;

                        popup2.classList.add('is-active');
                    });
                });

            } else {
                userListDiv.innerHTML = `
                    <div class="header">
                        <h1 class="title">Aucun utilisateur trouvé</h1>
                        <button class="button is-dark" onclick="window.location.href='/main';">Revenir</button>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
            userListDiv.innerHTML = "<p>Erreur lors de la récupération des utilisateurs.</p>";
        });
});

// Afficher popup2
btnmodifier.addEventListener('click', function () {
    currentUserId = null; // Ajout d’un nouvel utilisateur
    popup2.classList.add('is-active');
});

// Fermer popup2
btnfermerpopup2.addEventListener('click', function () {
    popup2.classList.remove('is-active');
});

// Fermer popup2 par clic sur background
popup2.querySelector('.modal-background').addEventListener('click', function () {
    popup2.classList.remove('is-active');
});

// Soumission du formulaire
formmodifierutilisateur.addEventListener('submit', function (event) {
    event.preventDefault();

    const adresseCourriel = document.getElementById("adresseCourriel").value;
    const username = document.getElementById("username").value;
    const motDePasse = document.getElementById("motDePasse").value;
    const role = document.querySelector('input[name="role"]:checked');

    let isClient = 0, isAvocat = 0, isAdmin = 0;
    if (role) {
        if (role.value === 'client') isClient = 1;
        else if (role.value === 'avocat') isAvocat = 1;
        else if (role.value === 'admin') isAdmin = 1;
    }

    const data = {
        adresseCourriel,
        username,
        motDePasse,
        isClient,
        isAvocat,
        isAdmin
    };

    const url = currentUserId ? `/api/utilisateurs/${currentUserId}` : '/api/utilisateurs';
    const method = currentUserId ? 'PUT' : 'POST';

    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                popup2.classList.remove('is-active');
                formmodifierutilisateur.reset();
                currentUserId = null;

                return fetch('/api/utilisateurs')
                    .then(res => res.json())
                    .then(utilisateurs => {
                        let userHtml = '';
                        utilisateurs.forEach(user => {
                            userHtml += `
                            <div class="box">
                                <p><strong>Email:</strong> ${user.adresseCourriel}</p>
                                <p><strong>Username:</strong> ${user.username}</p>
                                <p><strong>Mot de passe:</strong> ${user.motDePasse}</p>
                                <p><strong>Client:</strong> ${user.isClient ? 'Oui' : 'Non'}</p>
                                <p><strong>Avocat:</strong> ${user.isAvocat ? 'Oui' : 'Non'}</p>
                                <p><strong>Admin:</strong> ${user.isAdmin ? 'Oui' : 'Non'}</p>
                            </div>
                        `;
                        });
                        userListDiv.innerHTML = userHtml;
                        window.location.reload();
                    });
            } else {
                alert("Erreur lors de l'ajout/modification de l'utilisateur.");
            }
        })
        .catch(error => {
            console.error("Erreur :", error);
            alert("Une erreur est survenue.");
        });
});
