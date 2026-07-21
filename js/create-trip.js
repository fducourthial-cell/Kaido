document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-trip-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Formulaire intercepté, début de la génération...");

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : "Concevoir mon itinéraire";

            try {
                let destination = "";
                const modernField = document.getElementById('trip-destination-modern');
                
                if (modernField) {
                    if (modernField.value) {
                        destination = modernField.value.displayName || modernField.value.formattedAddress || modernField.value.name || "";
                    }
                    if (!destination) {
                        const innerInput = modernField.shadowRoot ? modernField.shadowRoot.querySelector('input') : modernField.querySelector('input');
                        if (innerInput && innerInput.value) {
                            destination = innerInput.value;
                        }
                    }
                }

                if (!destination) {
                    const backupInput = document.getElementById('trip-destination');
                    if (backupInput) destination = backupInput.value;
                }
                
                const departureInput = document.getElementById('trip-departure');
                const departure = departureInput ? departureInput.value : 'Paris';
                
                const dateStart = document.getElementById('trip-date-start').value;
                const dateEnd = document.getElementById('trip-date-end').value;
                
                const budgetInput = document.getElementById('trip-budget-input');
                const budget = budgetInput ? budgetInput.value : 0;
                
                const notesInput = document.getElementById('trip-notes');
                const desc = notesInput ? notesInput.value : '';

                if (!destination) {
                    alert("Veuillez sélectionner ou saisir une destination de voyage.");
                    return;
                }

                if (!dateStart || !dateEnd) {
                    alert("Veuillez renseigner les dates aller et retour.");
                    return;
                }

                if (submitBtn) {
                    submitBtn.textContent = "Calcul de l'itinéraire en cours...";
                    submitBtn.disabled = true;
                }

                const start = new Date(dateStart);
                const end = new Date(dateEnd);

                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    throw new Error("Le format des dates sélectionnées n'est pas valide.");
                }

                const timeDiff = end.getTime() - start.getTime();
                const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

                if (totalDays <= 0) {
                    alert("La date de retour doit être égale ou postérieure à la date de départ !");
                    if (submitBtn) {
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                    }
                    return;
                }

                let spots = [];
                try {
                    spots = await fetchTopPlacesSafe(destination);
                } catch (placesError) {
                    console.warn("Google Places indisponible. Utilisation de la liste de secours.", placesError);
                    spots = [
                        "Le centre historique et ses monuments incontournables",
                        "Le grand parc de la ville et ses espaces de détente",
                        "Le musée d'art et d'histoire locale",
                        "Le quartier animé et ses ruelles commerçantes",
                        "Le belvédère principal pour une vue panoramique",
                        "Le grand marché traditionnel local"
                    ];
                }

                const itinerary = generateItinerary(start, totalDays, spots);
                
                // 📸 100% Dynamique : Récupération de la vraie photo de destination via Pexels
                const finalImage = await fetchPexelsImage(destination);

                const newTrip = {
                    id: Date.now(),
                    title: destination,
                    destination: destination,
                    departure: departure,
                    dates: `${formatDate(start)} au ${formatDate(end)}`,
                    dateStart: dateStart,
                    dateEnd: dateEnd,
                    budget: budget,
                    desc: desc,
                    image: finalImage, // Enregistrement de l'URL spécifique
                    itinerary: itinerary
                };

                const currentTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
                currentTrips.push(newTrip);
                localStorage.setItem('kaido_trips', JSON.stringify(currentTrips));
                localStorage.setItem('kaido_active_trip', JSON.stringify(newTrip));

                window.location.href = 'voyage.html';

            } catch (error) {
                console.error("Erreur critique durant la soumission :", error);
                alert("Une erreur est survenue : " + error.message);
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});

// Interrogation de l'API Pexels avec ta clé
async function fetchPexelsImage(cityName) {
    const PEXELS_API_KEY = 'BpsLfTN2eMhAXARbFKs0oVPAMhjaIiOIQEN1YlxRpbB0LuJ2XMMYgQpi';
    try {
        const cleanCity = cityName.split(',')[0].trim();
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanCity)}&per_page=1`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });

        if (!response.ok) throw new Error('Erreur lors de la requête Pexels');

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.landscape;
        }
    } catch (error) {
        console.warn("Impossible de récupérer l'image Pexels :", error);
    }

    // Image de secours uniquement en cas d'échec réseau ou si Pexels n'a rien trouvé
    return 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1200';
}

function fetchTopPlacesSafe(destinationName) {
    return new Promise((resolve, reject) => {
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            reject("API Google Maps absente.");
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
                    const topSpots = results.filter(place => place.name).slice(0, 10).map(place => place.name);
                    if (topSpots.length > 0) resolve(topSpots);
                    else reject("Aucun lieu trouvé.");
                } else {
                    reject(`Statut API invalide : ${status}`);
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
