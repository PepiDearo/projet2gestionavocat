const profiluser = document.getElementById("prenom-user")
document.addEventListener('DOMContentLoaded', async () => {
    //afficher bonjour, prenom
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };


    const sessionCookie = getCookie('session');

    if (sessionCookie) {

        const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
        const prenom = sessionData.username;
        let role = sessionData.role;
        if (role === null || role === "null") {
            role = "admin";
        }

        // console.log(prenom);
        profiluser.textContent = 'Bonjour, ' + prenom + ". Vous êtes " + role;

    }
});
