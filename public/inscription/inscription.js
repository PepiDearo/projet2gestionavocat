const btninscrire = document.getElementById('sinscrire');
const forminscription = document.getElementById("forminscription");

const modeSwitch = document.getElementById('modeSwitch');
const modeLabel = document.getElementById('modeLabel');
const titleElement = document.getElementById('title');
const sectionElement = document.getElementById('section')

//INSCRIPTION -------------------------------------------------------------------------------
if (forminscription) {
    forminscription.addEventListener("submit", function (event) {
        event.preventDefault();  //empeche la page de reload

        const email = document.getElementById("email").value;
        const utilisateur = document.getElementById("utilisateur").value;
        const password = document.getElementById("password").value;

        //check si tout est rempli (bulma le fait deja, mais au cas ou)
        if (!email || !utilisateur || !password) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        const isAvocat = modeSwitch.checked ? 1 : 0;
        const isClient = modeSwitch.checked ? 0 : 1;

        const data = {
            email,
            utilisateur,
            password,
            isClient,
            isAvocat
        };

        envoyerInfoServeur(data);  //envoyer data
    })
};

async function envoyerInfoServeur(data) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            window.location.href = '/connexion'; //si les credentiels sont insere dans la bdd correctement, send vers la page de connexion
        } else {
            alert("Erreur interne du serveur. Veuillez réessayer."); //erreur 500
        }
    }
    catch {
        console.error("erreur lors de l'inscription de l'utilisateur");
        alert("erreur lors de l'inscription de l'utilisateur");
    }
}

//const modeSwitch = document.getElementById('modeSwitch');

modeSwitch.addEventListener('change', () => {
    if (modeSwitch.checked) {
        titleElement.textContent = 'Inscription Avocat';
        sectionElement.style.backgroundColor = "#b8c1d1";
        sectionElement.style.border = "1px solid #a6aebc";
        btninscrire.classList.remove("button", "is-link");
        btninscrire.classList.add("button", "is-dark");
        sectionElement.classList.add("has-text-black")
        titleElement.classList.add("has-text-black")
        modeLabel.textContent = 'Inscription Avocat'
    } else {
        titleElement.textContent = 'Inscription Client';
        sectionElement.style.backgroundColor = "#122f66"
        sectionElement.style.border = "1px solid #2a4475";
        btninscrire.classList.remove("button", "is-dark");
        btninscrire.classList.add("button", "is-link");
        sectionElement.classList.remove("has-text-black")
        titleElement.classList.remove("has-text-black")
        modeLabel.textContent = 'Inscription Client'
    }
});
