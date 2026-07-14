document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-trip-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            // 💡 Bloque immédiatement le rechargement automatique de la page
            e.preventDefault();
            console.log("Formulaire intercepté, début de la génération...");

            // 1. Récupération sécurisée de la destination (champ masqué ou direct depuis le Web Component)
            let destination = document.getElementById('trip-destination').value;
            
            if (!destination) {
                const modernField = document.getElementById('trip-destination-modern');
                if (modernField && modernField.value) {
                    const placeValue = modernField.value;
                    destination = placeValue.displayName || placeValue.formattedAddress || placeValue.name || "";
                }
            }

            // Récupération des autres données du formulaire
            const departure = document.getElementById('trip-departure').value || 'Paris';
            const dateStart = document.getElementById('trip-date-start').value;
            const dateEnd = document.getElementById('trip-date-end').value;
            const budget = document.getElementById('trip-budget-input').value || 0;
            const desc = document.getElementById('trip-notes').value || '';

            // Validation de sécurité
            if (!destination || !dateStart || !dateEnd) {
                alert("Veuillez remplir au moins la destination et les dates de voyage.");
                return;
            }

            // Changement d'état visuel du bouton de soumission pendant les calculs
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "Calcul de l'itinéraire en cours...";
            submitBtn.disabled = true;

            // 2. Calcul du nombre de jours exact
            const start = new Date(dateStart);
            const end = new Date(dateEnd);
            const timeDiff = end.getTime() - start.getTime();
            const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 pour inclure le jour de départ

            if (totalDays <= 0) {
                alert("La date de retour doit être après la date de départ !");
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            // 3. Récupération des lieux emblématiques via Google Places API
            let spots = [];
            try {
                console.log(`Recherche des attractions majeures pour : ${destination}`);
                spots = await fetchTopPlacesSafe(destination);
            } catch (error) {
                console.warn("Google Places textSearch indisponible ou bloqué. Utilisation du plan de secours.", error);
                // Notre catalogue de secours pour que l'application fonctionne même hors-ligne
                spots = [
                    "Le centre historique et ses monuments incontournables",
                    "Le grand parc de la ville et ses espaces de détente",
                    "Le musée d'art et d'histoire locale",
                    "Le quartier animé et ses ruelles commerçantes",
                    "Le belvédère principal pour une vue panoramique",
                    "Le grand marché traditionnel local",
                    "Découverte de l'architecture typique du quartier historique"
                ];
            }

            // 4. Distribution des points d'intérêt dans l'itinéraire jour par jour
            const itinerary = generateItinerary(start, totalDays, spots);

            // 5. Génération de l'image de couverture automatique basée sur la destination (Unsplash)
            const image = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80`;
            const finalImage = destination ? `https://source.unsplash.com/featured/1200x600/?${encodeURIComponent(destination)}` : image;

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
                image: finalImage,
                itinerary: itinerary
            };

            // 7. Sauvegarde dans le LocalStorage de l'ordinateur
            const currentTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
            currentTrips.push(newTrip);
            localStorage.setItem('kaido_trips', JSON.stringify(currentTrips));

            // Définition comme voyage actif pour l'affichage immédiat sur voyage.html
            localStorage.setItem('kaido_active_trip', JSON.stringify(newTrip));

            console.log("Voyage créé avec succès ! Redirection vers voyage.html...");
            
            // Redirection directe vers la page de l'itinéraire détaillé
            window.location.href = 'voyage.html';
        });
    }
});

// ==========================================================================
// FONCTIONS STRATÉGIQUES (PLACES API & AGENCEMENT)
// ==========================================================================

/**
 * Interroge l'API Google Places pour extraire les lieux les plus populaires d'une ville
 */
function fetchTopPlacesSafe(destinationName) {
    return new Promise((resolve, reject) => {
        // Sécurité : Est-ce que l'API Google Maps est chargée en mémoire ?
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            reject("Google Maps JavaScript API n'est pas chargée.");
            return;
        }

        try {
            // On crée un nœud HTML temporaire requis pour instancier le service de recherche
            const tempDiv = document.createElement('div');
            const service = new google.maps.places.PlacesService(tempDiv);

            const request = {
                query: `attractions touristiques à ${destinationName}`,
                fields: ['name']
            };

            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    // On filtre et extrait les noms des 10 premiers résultats officiels de Google
                    const topSpots = results
                        .filter(place => place.name)
                        .slice(0, 10)
                        .map(place => place.name);
                    
                    if (topSpots.length > 0) {
                        resolve(topSpots);
                    } else {
                        reject("Aucun point d'intérêt trouvé par Google.");
                    }
                } else {
                    reject(`Statut de réponse invalide : ${status}`);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Organise et distribue la liste de lieux de façon harmonieuse (Matin / Après-midi)
 */
function generateItinerary(startDate, totalDays, spots) {
    const itinerary = [];
    let spotIndex = 0;

    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const daySteps = [];
        
        // Activité 1 : Le Matin (10h00)
        const spotMatin = spots[spotIndex % spots.length];
        daySteps.push({
            time: "10:00",
            activity: `Visite et exploration : ${spotMatin}`,
            location: spotMatin
        });
        spotIndex++;

        // Activité 2 : L'Après-midi (15h00)
        const spotAprem = spots[spotIndex % spots.length];
        daySteps.push({
            time: "15:00",
            activity: `Découverte incontournable : ${spotAprem}`,
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
 * Formate rapidement les dates JS au format de lecture européen (JJ/MM/AAAA)
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
