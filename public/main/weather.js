function chargerMeteo() {
    let ville = document.getElementById("ville").value;
    let id;

    if (ville === "Montreal,CA") {
        id = 6077243;
    } else if (ville === "Trois-Rivières,CA") {
        id = 6169141;
    } else if (ville === "Québec,CA") {
        id = 6325494;
    } else if (ville === "Ottawa,CA") {
        id = 6094817;
    } else if (ville === "Toronto,CA") {
        id = 6167865;
    } else if (ville === "Vancouver,CA") {
        id = 6173331;
    } else if (ville === "Edmonton,CA") {
        id = 5946768;
    } else if (ville === "San Francisco,US") {
        id = 5391959;
    } else if (ville === "New York City,US") {
        id = 5128581;
    } else if (ville === "Washington,US") {
        id = 5815135;
    }

    fetch(`http://api.openweathermap.org/data/2.5/forecast?id=${id}&appid=dd6b31219781727caee8f898b53d1f6e&units=metric`)
        .then(response => response.json())
        .then(data => {
            let temp = document.getElementById("temp");
            let tempmax = document.getElementById("temp_max");
            let tempmin = document.getElementById("temp_min");
            let sunrise = document.getElementById("sunrise");
            let sunset = document.getElementById("sunset");
            let icon = document.getElementById("icon");

            let donnees = data.list[0].main;
            let weather = data.list[0].weather[0].icon;

            temp.textContent = donnees.temp + "°C";
            tempmax.textContent = donnees.temp_max + "°C";
            tempmin.textContent = donnees.temp_min + "°C";

            let sunr = data.city.sunrise;
            let suns = data.city.sunset;

            var date1 = new Date(sunr * 1000);
            var date2 = new Date(suns * 1000);

            var formattedTime1 = `${date1.getHours().toString().padStart(2, "0")}:${date1.getMinutes().toString().padStart(2, "0")}:${date1.getSeconds().toString().padStart(2, "0")}`;
            var formattedTime2 = `${date2.getHours().toString().padStart(2, "0")}:${date2.getMinutes().toString().padStart(2, "0")}:${date2.getSeconds().toString().padStart(2, "0")}`;

            sunrise.textContent = formattedTime1;
            sunset.textContent = formattedTime2;
            icon.src = `https://openweathermap.org/img/wn/${weather}@2x.png`;
        });
}

// Charger au clic
document.addEventListener("click", chargerMeteo);

// Charger au chargement de la page
document.addEventListener("DOMContentLoaded", chargerMeteo);
