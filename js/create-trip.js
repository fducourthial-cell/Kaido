document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-trip-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("🚀 Formulaire soumis, début du traitement...");

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : "Concevoir mon itinéraire";

            try {
                // 1. EXTRACTION ULTRA-BLINDÉE DE LA DESTINATION (TXT PROPRE)
                let destinationText = "";

                const modernField = document.getElementById('trip-destination-modern');
                if (modernField) {
                    if (typeof modernField.value === 'string' && modernField.value.trim() !== '') {
                        destinationText = modernField.value;
                    } else if (typeof modernField.value === 'object' && modernField.value !== null) {
                        destinationText = modernField.value.displayName || modernField.value.formattedAddress || modernField.value.name || "";
                    }
                    
                    if (!destinationText) {
                        const innerInput = modernField.shadowRoot ? modernField.shadowRoot.querySelector('input') : modernField.querySelector('input');
                        if (innerInput && innerInput.value) {
                            destinationText = innerInput.value;
                        }
                    }
                }

                if (!destinationText) {
                    const backupInput = document.getElementById('trip-destination');
                    if (backupInput) destinationText = backupInput.value;
                }

                const cleanDestination = String(destinationText).trim();

                if (!cleanDestination) {
                    alert("Veuillez sélectionner ou saisir une destination de voyage.");
                    return;
                }

                console.log("📍 Destination textuelle extraite :", cleanDestination);

                // 2. EXTRACTION ULTRA-BLINDÉE DE LA VILLE DE DÉPART
                let departureText = "";

                const departureModernField = document.getElementById('trip-departure-modern');
                if (departureModernField) {
                    if (typeof departureModernField.value === 'string' && departureModernField.value.trim() !== '') {
                        departureText = departureModernField.value;
                    } else if (typeof departureModernField.value === 'object' && departureModernField.value !== null) {
                        departureText = departureModernField.value.displayName || departureModernField.value.formattedAddress || departureModernField.value.name || "";
                    }
                    
                    if (!departureText) {
                        const innerDepInput = departureModernField.shadowRoot ? departureModernField.shadowRoot.querySelector('input') : departureModernField.querySelector('input');
                        if (innerDepInput && innerDepInput.value) {
                            departureText = innerDepInput.value;
                        }
                    }
                }

                if (!departureText) {
                    const backupDepInput = document.getElementById('trip-departure');
                    if (backupDepInput) departureText = backupDepInput.value;
                }

                const departure = String(departureText || 'Paris').trim();
                console.log("🛫 Ville de départ extraite :", departure);

                // 3. LECTURE DES AUTRES CHAMPS
                const dateStart = document.getElementById('trip-date-start').value;
                const dateEnd = document.getElementById('trip-date-end').value;
                
                const budgetInput = document.getElementById('trip-budget-input');
                const budget = budgetInput ? budgetInput.value : 0;
                
                const notesInput = document.getElementById('trip-notes');
                const desc = notesInput ? notesInput.value : '';

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

                // 4. RECHERCHE DES LIEUX À VISITER AVEC COORDONNÉES GPS
                let spots = [];
                try {
                    spots = await fetchTopPlacesSafe(cleanDestination);
                } catch (placesError) {
                    console.warn("Google Places indisponible. Utilisation de la liste de secours.", placesError);
                    spots = [
                        { name: "Le centre historique et ses monuments incontournables", lat: null, lng: null },
                        { name: "Le grand parc de la ville et ses espaces de détente", lat: null, lng: null },
                        { name: "Le musée d'art et d'histoire locale", lat: null, lng: null },
                        { name: "Le quartier animé et ses ruelles commerçantes", lat: null, lng: null },
                        { name: "Le belvédère principal pour une vue panoramique", lat: null, lng: null },
                        { name: "Le grand marché traditionnel local", lat: null, lng: null }
                    ];
                }

                const itinerary = generateItinerary(start, totalDays, spots);

                // Coordonnées de la destination principale pour le centrage de la carte
                const mainLat = (spots.length > 0 && spots[0].lat) ? spots[0].lat : null;
                const mainLng = (spots.length > 0 && spots[0].lng) ? spots[0].lng : null;
                
                // 5. RÉCUPÉRATION DE L'IMAGE PEXELS
                console.log("🖼️ Appel Pexels pour :", cleanDestination);
                const finalImage = await fetchPexelsImage(cleanDestination);
                console.log("✅ Image retenue :", finalImage);

                // 6. ENREGISTREMENT DU VOYAGE (AVEC LAT ET LNG)
                const newTrip = {
                    id: Date.now(),
                    title: cleanDestination,
                    destination: cleanDestination,
                    destinationLat: mainLat,
                    destinationLng: mainLng,
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

                console.log("💾 Redirection vers la page du voyage...");
                window.location.href = 'voyage.html';

            } catch (error) {
                console.error("❌ Erreur durant la création :", error);
                alert("Une erreur est survenue : " + error.message);
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});

// INTERROGATION DE L'API PEXELS AVEC TA CLÉ
async function fetchPexelsImage(cityName) {
    const PEXELS_API_KEY = 'BpsLfTN2eMhAXARbFKs0oVPAMhjaIiOIQEN1YlxRpbB0LuJ2XMMYgQpi';
    try {
        let cleanCity = String(cityName)
            .split(',')[0]
            .split('–')[0]
            .split('-')[0]
            .trim();

        console.log("🔍 Mot-clé exact envoyé à Pexels :", cleanCity);

        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanCity)}&per_page=1`;

        const response = await fetch(url, {
            headers: { Authorization: PEXELS_API_KEY }
        });

        if (!response.ok) throw new Error(`Pexels HTTP ${response.status}`);

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            console.log("📸 Image spécifique trouvée sur Pexels pour", cleanCity);
            return data.photos[0].src.landscape;
        } else {
            console.warn("⚠️ Pexels n'a rien trouvé pour", cleanCity);
        }
    } catch (error) {
        console.warn("⚠️ Erreur lors de la récupération Pexels :", error);
    }

    return 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1200';
}

// EXTRACTION DES LIEUX AVEC NOMS + COORDONNÉES GPS (LAT / LNG)
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
                fields: ['name', 'geometry']
            };

            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    const topSpots = results
                        .filter(place => place.name && place.geometry && place.geometry.location)
                        .slice(0, 10)
                        .map(place => ({
                            name: place.name,
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        }));

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

// GÉNÉRATION D'ITINÉRAIRE INTÉGRANT LAT ET LNG À CHAQUE ÉTAPE
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
            activity: `Visite et exploration : ${spotMatin.name}`,
            location: spotMatin.name,
            lat: spotMatin.lat,
            lng: spotMatin.lng
        });
        spotIndex++;

        const spotAprem = spots[spotIndex % spots.length];
        daySteps.push({
            time: "15:00",
            activity: `Découverte incontournable : ${spotAprem.name}`,
            location: spotAprem.name,
            lat: spotAprem.lat,
            lng: spotArem?.lng || spotAprem.lng
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
