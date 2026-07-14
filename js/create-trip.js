document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-trip-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            // 💡 Bloque IMMÉDIATEMENT le rechargement automatique de la page
            e.preventDefault();
            console.log("Formulaire intercepté, début de la génération...");

            // 1. Récupération des données du formulaire
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

            // Changement d'état visuel du bouton pendant le calcul
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "Calcul de l'itinéraire en cours...";
            submitBtn.disabled = true;

            // 2. Calcul du nombre de jours exact
            const start = new Date(dateStart);
            const end = new Date(dateEnd);
            const timeDiff = end.getTime() - start.getTime();
            const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

            if (totalDays <= 0) {
                alert("La date de retour doit être après la date de départ !");
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            // 3. Récupération sécurisée des lieux emblématiques via Google Places
            let spots = [];
            try {
                console.log(`Recherche de lieux pour : ${destination}`);
                spots = await fetchTopPlacesSafe(destination);
            } catch (error) {
                console.warn("Google Places indisponible ou non chargé, utilisation des lieux par défaut.", error);
                // Lieux emblématiques de secours pour éviter que l'appli ne reste bloquée
                spots = [
                    "Le centre historique et ses monuments incontournables",
                    "Le grand parc de la ville et ses espaces verts",
                    "Le musée d'art et d'histoire local",
                    "Le quartier animé et ses ruelles commerçantes",
                    "Le belvédère pour une vue panoramique sur la région",
                    "Le marché local traditionnel",
                    "Une pause détente dans un café typique"
                ];
            }

            // 4. Distribution des lieux dans l'itinéraire jour par jour
            const itinerary = generateItinerary(start, totalDays, spots);

            // 5. Génération de l'image de couverture automatique (Unsplash)
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

            console.log("Voyage sauvegardé avec succès ! Redirection...");
            
            // Redirection vers la page du voyage généré !
            window.location.href = 'voyage.html';
        });
    }
});

// ==========================================================================
// FONCTIONS UTILES (PLACES API AVEC SÉCURITÉS)
// ==========================================================================

/**
 * Recherche des points d'intérêt de manière sécurisée en évitant les crashs
 */
function fetchTopPlacesSafe(destinationName) {
    return new Promise((resolve, reject) => {
        // Sécurité 1 : Vérifie si la bibliothèque Google Maps est bien chargée en mémoire
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            reject("Google Maps API n'est pas complètement chargée.");
            return;
        }

        try {
            // Création d'un élément temporaire en dehors du DOM pour l'API
            const tempDiv = document.createElement('div');
            const service = new google.maps.places.PlacesService(tempDiv);

            const request = {
                query: `attractions touristiques à ${destinationName}`,
                fields: ['name']
            };

            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    const topSpots = results
                        .filter(place => place.name)
                        .slice(0, 10)
                        .map(place => place.name);
                    
                    if (topSpots.length > 0) {
                        resolve(topSpots);
                    } else {
                        reject("Aucun lieu trouvé pour cette destination.");
                    }
                } else {
                    reject(`Erreur Google Places status : ${status}`);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Répartit les points d'intérêts sur le nombre de jours
 */
function generateItinerary(startDate, totalDays, spots) {
    const itinerary = [];
    let spotIndex = 0;

    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const daySteps = [];
        
        // Activité 1 (Matin)
        const spotMatin = spots[spotIndex % spots.length];
        daySteps.push({
            time: "10:00",
            activity: `Découverte de : ${spotMatin}`,
            location: spotMatin
        });
        spotIndex++;

        // Activité 2 (Après-midi)
        const spotAprem = spots[spotIndex % spots.length];
        daySteps.push({
            time: "15:00",
            activity: `Visite guidée ou balade : ${spotAprem}`,
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
