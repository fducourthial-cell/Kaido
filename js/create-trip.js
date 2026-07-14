document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-trip-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Récupération des données saisies dans le formulaire
            const destination = document.getElementById('trip-destination').value;
            const departure = document.getElementById('trip-departure').value || 'Paris';
            const dateStart = document.getElementById('trip-date-start').value;
            const dateEnd = document.getElementById('trip-date-end').value;
            const budget = document.getElementById('trip-budget-input').value || 0;
            const desc = document.getElementById('trip-notes').value || '';

            if (!destination || !dateStart || !dateEnd) {
                alert("Veuillez remplir au moins la destination et les dates de voyage.");
                return;
            }

            // 2. Calcul du nombre de jours exact
            const start = new Date(dateStart);
            const end = new Date(dateEnd);
            const timeDiff = end.getTime() - start.getTime();
            const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 pour inclure le jour de départ

            if (totalDays <= 0) {
                alert("La date de retour doit être après la date de départ !");
                return;
            }

            // 3. Appel à Google Places pour récupérer les lieux incontournables
            let spots = [];
            try {
                spots = await fetchTopPlaces(destination);
            } catch (error) {
                console.error("Erreur lors de la récupération des lieux Google Places:", error);
                // Lieux de secours génériques si l'API échoue
                spots = ["Centre-ville historique", "Grand Parc de la ville", "Musée local", "Quartier typique", "Point de vue panoramique"];
            }

            // 4. Distribution des lieux dans l'itinéraire jour par jour
            const itinerary = generateItinerary(start, totalDays, spots);

            // 5. Génération de l'image de couverture automatique (Unsplash)
            const autoImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80`;
            const image = `https://source.unsplash.com/featured/1200x600/?${encodeURIComponent(destination)}`;

            // 6. Création de l'objet Voyage final
            const newTrip = {
                id: Date.now(),
                title: destination,
                departure: departure,
                dates: `${formatDate(start)} au ${formatDate(end)}`,
                dateStart: dateStart,
                dateEnd: dateEnd,
                budget: budget,
                desc: desc,
                image: image,
                itinerary: itinerary
            };

            // 7. Enregistrement dans le LocalStorage
            const currentTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
            currentTrips.push(newTrip);
            localStorage.setItem('kaido_trips', JSON.stringify(currentTrips));

            // Définir comme voyage actif pour redirection directe
            localStorage.setItem('kaido_active_trip', JSON.stringify(newTrip));

            // Redirection vers la page du voyage généré !
            window.location.href = 'voyage.html';
        });
    }
});

// ==========================================================================
// FONCTIONS UTILES (PLACES API & CALCULS)
// ==========================================================================

/**
 * Interroge Google Places pour trouver des points d'intérêt à destination
 */
function fetchTopPlaces(destinationName) {
    return new Promise((resolve, reject) => {
        // On crée un élément div temporaire requis par Google pour instancier le service
        const tempDiv = document.createElement('div');
        const service = new google.maps.places.PlacesService(tempDiv);

        // Requête de recherche textuelle axée sur le tourisme
        const request = {
            query: `attractions touristiques à ${destinationName}`,
            fields: ['name', 'rating', 'formatted_address'],
        };

        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                // On garde les 10 meilleurs résultats triés par note
                const topSpots = results
                    .filter(place => place.name)
                    .slice(0, 10)
                    .map(place => place.name);
                resolve(topSpots);
            } else {
                reject(status);
            }
        });
    });
}

/**
 * Répartit de manière équilibrée les points d'intérêts sur le nombre de jours
 */
function generateItinerary(startDate, totalDays, spots) {
    const itinerary = [];
    let spotIndex = 0;

    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        // Définition des activités du jour (Matin et Après-midi)
        const daySteps = [];
        
        // Activité 1 (Matin)
        const spotMatin = spots[spotIndex % spots.length] || "Exploration libre des environs";
        daySteps.push({
            time: "10:00",
            activity: `Découverte de : ${spotMatin}`,
            location: spotMatin
        });
        spotIndex++;

        // Activité 2 (Après-midi)
        const spotAprem = spots[spotIndex % spots.length] || "Balade dans les ruelles typiques";
        daySteps.push({
            time: "15:00",
            activity: `Visite guidée ou randonnée : ${spotAprem}`,
            location: spotAprem
        });
        spotIndex++;

        itinerary.push({
            day: `Jour ${i + 1}`,
            dateText: formatDate(currentDate),
            steps: daySteps
        });
    }

    return itinerary;
}

/**
 * Formatage rapide des dates au format FR (JJ/MM/AAAA)
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
