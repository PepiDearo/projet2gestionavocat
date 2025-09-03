document.addEventListener('DOMContentLoaded', () => {
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const sessionCookie = getCookie('session');

    if (sessionCookie) {
        try {

            const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
            const isAdmin = sessionData.isAdmin;

            const adminButtons = document.querySelectorAll('[type="btnadmin"]'); //trouver tout les btn  type = btnadmin
            // console.log(sessionData)
            // console.log(adminButtons)

            if (adminButtons.length === 0) {
                console.warn('Aucun bouton administrateur trouvé dans le DOM.');
            }
            adminButtons.forEach((button) => {
                if (isAdmin === 1) {
                    button.style.display = 'inline'; // monter si admin
                } else if (isAdmin === 0){
                    button.style.display = 'none'; // Hide si pas admin
                }
            });

        } catch (error) {
            console.error('Erreur lors de la lecture du cookie de session :', error);
        }
    } else {
        console.warn('Aucun cookie de session trouvé. Les boutons administrateurs seront cachés.');
        const adminButtons = document.querySelectorAll('.btnadmin');
        adminButtons.forEach((button) => {
            button.style.display = 'none'; 
        });
    }
});
