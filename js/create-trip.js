document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-trip-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("🚀 Formulaire soumis, début du traitement...");

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : "Concevoir mon itinéraire";

            try {
                let destination = "";
                const modernField = document.getElementById('trip-destination-modern');
                
                if (modernField) {
                    if (modernField.value) {
                        destination = modernField.value.displayName || modernField.value.formattedAddress || modernField.value.name || (typeof modernField.value === 'string' ? modernField.value : "");
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
                
                console.log("📍 Destination détectée :", destination);

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
                
                // 📸 APPEL PEXELS
                console.log("🖼️ Appel de l'API Pexels pour :", destination);
                const finalImage = await fetchPexelsImage(destination);
                console.log("✅ Image Pexels récupérée :", finalImage);

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
                    image: finalImage,
                    itinerary: itinerary
                };

                const currentTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
                currentTrips.push(newTrip);
                localStorage.setItem('kaido_trips', JSON.stringify(currentTrips));
                localStorage.setItem('kaido_active_trip', JSON.stringify(newTrip));

                console.log("💾 Voyage enregistré avec succès ! Redirection...");
                window.location.href = 'voyage.html';

            } catch (error) {
                console.error("❌ Erreur critique durant la soumission :", error);
                alert("Une erreur est survenue : " + error.message);
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});

// Interrogation sécurisée de l'API Pexels
async function fetchPexelsImage(cityName) {
    const PEXELS_API_KEY = 'BpsLfTN2eMhAXARbFKs0oVPAMhjaIiOIQEN1YlxRpbB0LuJ2XMMYgQpi';
    try {
        // Sécurisation au cas où cityName serait un objet ou contiendrait des virgules
        let searchQuery = cityName;
        if (typeof cityName === 'object' && cityName !== null) {
            searchQuery = cityName.displayName || cityName.formattedAddress || cityName.name || '';
        }
        
        const cleanCity = String(searchQuery).split(',')[0].trim();
        console.log("🔍 Recherche Pexels pour :", cleanCity);

        if (!cleanCity) throw new Error("Nom de ville vide pour Pexels");

        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanCity)}&per_page=1`, {
            headers: { Authorization: PEXELS_API_KEY }
        });

        if (!response.ok) throw new Error(`Pexels HTTP ${response.status}`);

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            console.log("📸 Image Pexels trouvée :", data.photos[0].src.landscape);
            return data.photos[0].src.landscape;
        }
    } catch (error) {
        console.warn("⚠️ Fallback activé :", error);
    }

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
