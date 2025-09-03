document.getElementById("factureForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Récupérer les valeurs des champs
    const idUser = document.getElementById("clientId").value.trim();
    const montant = document.getElementById("montant").value.trim();
    const dateEmission = document.getElementById("dateEmission").value;
    const statut = document.getElementById("statut").value;

    // Vérification des champs obligatoires
    if (!idUser|| !montant || !dateEmission) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/factures", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idUser, montant, dateEmission, statut })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Erreur lors de la création de la facture.");
        }

        alert("Facture créée avec succès !");
        document.getElementById("factureForm").reset(); // Réinitialise le formulaire

    } catch (error) {
        console.error("Erreur:", error.message);
        alert("Une erreur est survenue : " + error.message);
    }
});