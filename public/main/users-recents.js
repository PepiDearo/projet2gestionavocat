const clients = document.getElementById("client-list");

function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const sessionCookie = getCookie("session");
        if (!sessionCookie) return;

        const session = JSON.parse(decodeURIComponent(sessionCookie));
        let endpoint = "/get-users"; // par défaut pour admin

        if (session.role === "Client") {
            endpoint = "/get-avocats";
        } else if (session.role === "Avocat") {
            endpoint = "/get-clients";
        }

        const titreElement = document.getElementById("titre-utilisateurs");

        if (session.isAdmin === 1) {
            titreElement.textContent = "Utilisateurs récents";
        } else if (session.role === "Client") {
            titreElement.textContent = "Avocats disponibles";
        } else if (session.role === "Avocat") {
            titreElement.textContent = "Clients disponibles";
        }

        const response = await fetch(endpoint);
        const utilisateurs = await response.json();

        if (response.ok) {
            utilisateurs.slice(0, 3).forEach(user => {
                const card = document.createElement("div");
                card.classList.add("selected-file", "active");

                let icone = "fa-solid fa-user";
                if (user.isAvocat === 1 && user.isClient === 0) {
                    icone = "fa-solid fa-user-tie";
                }

                card.innerHTML = `
                    <div class="file-info">
                        <i class="${icone} file-icon"></i>
                        <div class="file-details">
                            <div class="file-name"><span>${user.username}</span></div>
                            <div class="file-size">User ID: ${user.idUser} | Email: ${user.adresseCourriel}</div>
                        </div>
                    </div>
                `;
                card.addEventListener('click', () => {
                    window.location.href = "/utilisateurs";
                });
                clients.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs :", error);
    }
});
