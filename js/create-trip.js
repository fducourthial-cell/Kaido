document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-trip-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Formulaire intercepté, début de la génération...");

            // --- DEBUT DE LA RECUPERATION BLINDEE ---
            let destination = "";

            // 1. On cherche le composant moderne de Google
            const modernField = document.getElementById('trip-destination-modern');
            
            if (modernField) {
                // Option A : On tente de lire l'objet "value" officiel de Google si l'événement a fonctionné
                if (modernField.value) {
                    destination = modernField.value.displayName || modernField.value.formattedAddress || modernField.value.name || "";
                }
                
                // Option B (Infaillible) : Si l'objet de Google est vide, on va extraire DIRECTEMENT le texte tapé dans l'input physique
                if (!destination) {
                    const innerInput = modernField.shadowRoot ? modernField.shadowRoot.querySelector('input') : modernField.querySelector('input');
                    if (innerInput && innerInput.value) {
                        destination = innerInput.value;
                    }
                }
            }

            // Option C : Repli historique sur le champ caché
            if (!destination) {
                destination = document.getElementById('trip-destination').value;
            }
            
            console.log("📍 Destination détectée pour la soumission :", destination);
            // --- FIN DE LA RECUPERATION BLINDEE ---

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

            // Changement d'état visuel du bouton de soumission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "Calcul de l'itinéraire en cours...";
            submitBtn.disabled = true;

            // Calcul du nombre de jours exact
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

            // Récupération des lieux emblématiques (avec secours automatique)
            let spots = [];
            try {
                console.log(`Recherche des attractions majeures pour : ${destination}`);
                spots = await fetchTopPlacesSafe(destination);
            } catch (error) {
                console.warn("Google Places indisponible. Utilisation du plan de secours.", error);
                spots = [
                    "Le centre historique et ses monuments incontournables",
                    "Le grand parc de la ville et ses espaces de détente",
                    "Le musée d'art et d'histoire locale",
                    "Le quartier animé et ses ruelles commerçantes",
                    "Le belvédère principal pour une vue panoramique",
                    "Le grand marché traditionnel local"
                ];
            }

            // Distribution dans l'itinéraire jour par jour
            const itinerary = generateItinerary(start, totalDays, spots);

            // Génération de l'image de couverture automatique
            const finalImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80`;

            // Création de l'objet Voyage final
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

            // Sauvegarde dans le LocalStorage
            const currentTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
            currentTrips.push(newTrip);
            localStorage.setItem('kaido_trips', JSON.stringify(currentTrips));

            // Définition comme voyage actif
            localStorage.setItem('kaido_active_trip', JSON.stringify(newTrip));

            console.log("Voyage créé avec succès ! Redirection...");
            window.location.href = 'voyage.html';
        });
    }
});

// ==========================================================================
// FONCTIONS STRATÉGIQUES (PLACES API & AGENCEMENT)
// ==========================================================================

function fetchTopPlacesSafe(destinationName) {
    return new Promise((resolve, reject) => {
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            reject("Google Maps JavaScript API n'est pas chargée.");
            return;
        }

        try {
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

function generateItinerary(startDate, totalDays, spots) {
    const itinerary = [];
    let spotIndex = 0;

    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const daySteps = [];
        
        const spotMatin = spots[spotIndex % spots.length];
        daySteps.push({
            time: "10:00",
            activity: `Visite et exploration : ${spotMatin}`,
            location: spotMatin
        });
        spotIndex++;

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

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
