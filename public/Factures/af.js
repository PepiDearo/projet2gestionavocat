ocument.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:3000/api/factures');
        const factures = await response.json();

        if (!response.ok) {
            throw new Error(factures.error || "Erreur lors de la récupération des factures");
        }

        const tableBody = document.getElementById('facturesTableBody');
        tableBody.innerHTML = ''; 

        factures.forEach(facture => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${facture.id}</td>
                <td>${facture.clientId}</td>
                <td>${facture.montant} $</td>
                <td>${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}</td>
                <td>
                    <span class="tag ${getStatusClass(facture.statut)}">
                        ${facture.statut}
                    </span>
                </td>
                <td>
                    <button class="button is-small is-info" onclick="voirFacture(${facture.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="button is-small is-warning" onclick="editerFacture(${facture.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="button is-small is-danger" onclick="supprimerFacture(${facture.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Erreur:", error.message);
        alert("Une erreur est survenue : " + error.message);
    }
});

function getStatusClass(statut) {
    switch(statut) {
        case 'Payée': return 'is-success';
        case 'Annulée': return 'is-danger';
        default: return 'is-warning';
    }
}

// Fonctions vide encore
function voirFacture(id) {
    console.log("Voir facture", id);
    //si on veut faire une page details genre
}

function editerFacture(id) {
    console.log("Éditer facture", id);
    //fonction pour modifier pas encore implémenter a rajouter pour modifier les bhy
}

async function supprimerFacture(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
        try {
            const response = await fetch(`http://localhost:3000/api/factures/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert("Facture supprimée avec succès");
                location.reload(); // Recharge la page pour actualiser la liste
            } else {
                throw new Error("Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Erreur:", error.message);
            alert("Erreur lors de la suppression : " + error.message);
        }
    }
}