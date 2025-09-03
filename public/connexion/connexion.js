const btnconnecter = document.getElementById('btnconnecter');
const formConnexion = document.getElementById("formConnexion");

//CONNEXION ---------------------------------------------------------------------------------
async function connexion(login) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(login),
        });

        if (response.ok) {
            window.location.href = '/main' //si ocnnexion reussie, send vers main,html
        }
        else if (response.status === 401) {
            alert("Nom d'utilisateur ou mot de passe incorrect."); //erreur 401
        }
        else {
            alert("Erreur interne du serveur. Veuillez réessayer."); //erreur 500
        }
    }
    catch {
        console.error("erreur lors de la connexion");
        alert('la connexion a echoue');
    }
}

if (formConnexion) {
    formConnexion.addEventListener("submit", function (event) {
        event.preventDefault();  //empeche la page de reload

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        //check si tout est rempli (bulma le fait deja, mais au cas ou)
        if (!email || !password) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        const login = {
            email,
            password
        };
        connexion(login);  //envoyer data
    })
};
