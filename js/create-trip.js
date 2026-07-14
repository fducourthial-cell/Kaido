document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-trip-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            // 💡 Bloque immédiatement le rechargement automatique de la page
            e.preventDefault();
            console.log("Formulaire intercepté, début de la génération...");

            // 1. RÉCUPÉRATION SÉCURISÉE DE LA DESTINATION (INFAILLIBLE)
            let destination = "";
            const modernField = document.getElementById('trip-destination-modern');
            
            if (modernField) {
                // Option A : Lecture de l'objet "value" officiel de Google si l'événement de sélection a fonctionné
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

            // Récupération des autres données du formulaire
            const departure = document.getElementById('trip-departure').value || 'Paris';
            const dateStart = document.getElementById('trip-date-start').value;
            const dateEnd = document.getElementById('trip-date-end').value;
            const budget = document.getElementById('trip-budget-input').value || 0;
            const desc = document.getElementById('trip-notes').value || '';

            // --- VÉRIFICATION GLOBALE DE SÉCURITÉ ---
            if (!destination) {
                alert("Veuillez sélectionner ou saisir une destination de voyage.");
                return;
            }

            if (!dateStart || !dateEnd) {
                alert("Veuillez renseigner les dates aller et retour.");
                return;
            }

            // Changement d'état visuel du bouton de soumission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : "Concevoir mon itinéraire";
            if (submitBtn) {
                submitBtn.textContent = "Calcul de l'itinéraire en cours...";
                submitBtn.disabled = true;
            }

            // --- CONVERSION ET CALCUL SÉCURISÉ DES DATES ---
            console.log("Dates brutes reçues du formulaire :", { dateStart, dateEnd });

            const start = new Date(dateStart);
            const end = new Date(dateEnd);

            // Vérification si les dates sont valides en mémoire
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                alert("Le format des dates sélectionnées n'est pas reconnu par le système.");
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
                return;
            }

            // Calcul du nombre de jours exact (ex: du 27 au 30 Juillet = 4 jours)
            const timeDiff = end.getTime() - start.getTime();
            const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

            console.log("Calcul de la durée de voyage effectué :", { totalDays });

            if (totalDays <= 0) {
                alert("La date de retour doit être égale ou postérieure à la date de départ !");
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
                return;
            }

            // 2. RÉCUPÉRATION DES LIEUX EMBLÉMATIQUES VIA GOOGLE PLACES API
            let spots = [];
            try {
                console.log(`Recherche des attractions majeures pour : ${destination}`);
                spots = await fetchTopPlacesSafe(destination);
            } catch (error) {
                console.warn("Google Places indisponible ou bloqué. Utilisation du plan de secours.", error);
                // Notre catalogue de secours pour que l'application fonctionne toujours
                spots = [
                    "Le centre historique et ses monuments incontournables",
                    "Le grand parc de la ville et ses espaces de détente",
                    "Le musée d'art et d'histoire locale",
                    "Le quartier animé et ses ruelles commerçantes",
                    "Le belvédère principal pour une vue panoramique",
                    "Le grand marché traditionnel local",
                    "Découverte de l'architecture typique de la région"
                ];
            }

            // 3. DISTRIBUTION DES POINTS D'INTÉRÊT DANS L'ITINÉRAIRE JOUR PAR JOUR
            const itinerary = generateItinerary(start, totalDays, spots);

            // 4. GÉNÉRATION DE L'IMAGE DE COUVERTURE AUTOMATIQUE (UNSPLASH)
            const defaultImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80`;
            const finalImage = destination ? `https://source.unsplash.com/featured/1200x600/?${encodeURIComponent(destination)}` : defaultImage;

            // 5. CRÉATION DE L'OBJET VOYAGE FINAL
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

            // 6. SAUVEGARDE DANS LE LOCALSTORAGE DE L'ORDINATEUR
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
// FONCTIONS SECONDAIRES (PLACES API & CALCULS)
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
