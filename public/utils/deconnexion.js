const btndeconnecter = document.getElementById('btndeconnecter');
//DECONNEXION -------------------------------------------------------------------------------
if (btndeconnecter) {
    btndeconnecter.addEventListener('click', async () => {
        console.log(1)
        try {
            const res = await fetch('/api/logout', {
                method: 'POST',
            });

            if (res.ok) { //si la reponse est 200 dans /post logout
                window.location.href = '/';
            } else {
                alert("erreur de lors de la deconnexion");
            }
        } catch (error) {
            console.error("erreur lors de la deconnexion");
            alert("erreur de lors de la deconnexion");
        }
    })
}
