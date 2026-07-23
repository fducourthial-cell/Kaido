// js/voyage.js - Logique d'affichage de la page voyage.html

document.addEventListener('DOMContentLoaded', () => {
    // 1. Récupération des éléments HTML de voyage.html
    const titleEl = document.getElementById('trip-title');
    const datesEl = document.getElementById('trip-dates');
    const bannerEl = document.getElementById('trip-banner');
    const itineraryContainer = document.getElementById('itinerary-container');
    const mapEl = document.getElementById('map');
    const previewEl = document.getElementById('activity-preview');

    // 2. Lecture du voyage actif sauvegardé dans le navigateur
    const activeTripData = localStorage.getItem('kaido_active_trip') || localStorage.getItem('currentTrip');

    if (!activeTripData) {
        if (titleEl) titleEl.textContent = "Aucun voyage sélectionné";
        if (datesEl) datesEl.textContent = "Retournez à l'accueil pour choisir un itinéraire.";
        return;
    }

    const trip = JSON.parse(activeTripData);

    // 3. Remplissage du Hero Banner (Titre, Dates, Image de fond)
    if (titleEl) titleEl.textContent = trip.title || trip.destination || "Mon Voyage Kaido";
    if (datesEl) datesEl.textContent = `📅 ${trip.dates || 'Dates non définies'}`;
    
    if (bannerEl && trip.image) {
        bannerEl.style.backgroundImage = `url('${trip.image}')`;
    }

    // 4. Affichage du programme / Itinéraire
    if (itineraryContainer) {
        itineraryContainer.innerHTML = ''; // Réinitialisation

        if (trip.itinerary && trip.itinerary.length > 0) {
            trip.itinerary.forEach((dayObj) => {
                const dayCard = document.createElement('div');
                dayCard.className = 'day-card';
                dayCard.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 1.5rem; margin-bottom: 1.5rem;';

                let stepsHTML = '';
                if (dayObj.steps && dayObj.steps.length > 0) {
                    stepsHTML = dayObj.steps.map(step => `
                        <div style="margin-top: 1rem; padding-left: 1rem; border-left: 2px solid var(--color-gold);">
                            <h4 style="color: var(--text-main); font-size: 1rem; font-weight: 600;">${step.title || step.time || 'Étape'}</h4>
                            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">${step.desc || step.description || ''}</p>
                        </div>
                    `).join('');
                }

                dayCard.innerHTML = `
                    <h3 style="font-family: var(--font-serif); color: var(--color-gold); font-size: 1.25rem; font-weight: 400; margin-bottom: 0.5rem;">
                        ${dayObj.day} - <span style="font-size: 0.9rem; color: var(--text-muted); font-family: var(--font-kaido);">${dayObj.dateText || ''}</span>
                    </h3>
                    ${stepsHTML}
                `;

                itineraryContainer.appendChild(dayCard);
            });
        } else if (trip.desc) {
            itineraryContainer.innerHTML = `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 1.5rem;">
                    <h3 style="font-family: var(--font-serif); color: var(--color-gold); margin-bottom: 0.5rem;">Description du séjour</h3>
                    <p style="color: var(--text-muted);">${trip.desc}</p>
                </div>
            `;
        }
    }

    // 5. Chargement de Google Maps si des coordonnées existent
    if (mapEl && typeof google !== 'undefined' && google.maps && (trip.destinationLat || trip.lat)) {
        const lat = parseFloat(trip.destinationLat || trip.lat);
        const lng = parseFloat(trip.destinationLng || trip.lng);

        const map = new google.maps.Map(mapEl, {
            center: { lat, lng },
            zoom: 11,
            styles: [
                { elementType: "geometry", stylers: [{ color: "#14110E" }] },
                { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#8E847A" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#0D0B09" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#0D0B09" }] }
            ]
        });

        new google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: trip.title
        });
    }
});
