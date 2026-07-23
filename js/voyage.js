document.addEventListener('DOMContentLoaded', () => {
    // 1. Éléments du DOM
    const titleEl = document.getElementById('trip-title');
    const datesEl = document.getElementById('trip-dates');
    const bannerEl = document.getElementById('trip-banner');
    const itineraryContainer = document.getElementById('itinerary-container');
    const mapEl = document.getElementById('map');
    const previewEl = document.getElementById('activity-preview');
    const checklistItemsEl = document.getElementById('checklist-items');

    // 2. Chargement des données du voyage
    const activeTripData = localStorage.getItem('kaido_active_trip') || localStorage.getItem('currentTrip');

    if (!activeTripData) {
        if (titleEl) titleEl.textContent = "Aucun voyage sélectionné";
        if (datesEl) datesEl.textContent = "Retournez à l'accueil pour choisir un itinéraire.";
        return;
    }

    const trip = JSON.parse(activeTripData);

    // 3. Remplissage du Titre, Dates, Budget et Bannière
    if (titleEl) titleEl.textContent = trip.title || trip.destination || "Mon Voyage Kaido";
    if (datesEl) {
        let budgetText = trip.budget ? ` | 💶 Budget : ${trip.budget} €` : '';
        datesEl.textContent = `📅 ${trip.dates || ''}${budgetText}`;
    }
    
    if (bannerEl && trip.image) {
        bannerEl.style.backgroundImage = `url('${trip.image}')`;
    }

    // Visionneuse : Image par défaut du voyage
    if (previewEl && trip.image) {
        previewEl.innerHTML = `<img src="${trip.image}" alt="${trip.title}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    // 4. Rendu de l'Itinéraire
    if (itineraryContainer) {
        itineraryContainer.innerHTML = '';

        if (trip.itinerary && trip.itinerary.length > 0) {
            trip.itinerary.forEach((dayObj, dayIdx) => {
                const dayCard = document.createElement('div');
                dayCard.className = 'day-card';
                dayCard.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 1.5rem; margin-bottom: 1.5rem;';

                let stepsHTML = '';
                if (dayObj.steps && dayObj.steps.length > 0) {
                    stepsHTML = dayObj.steps.map((step, stepIdx) => {
                        let stepTitle = typeof step === 'string' ? step : (step.title || step.time || step.name || 'Étape');
                        let stepDesc = typeof step === 'object' ? (step.desc || step.description || '') : '';
                        let stepTime = (step.time && step.title) ? `<span style="color: var(--color-gold); font-weight: bold; margin-right: 8px;">${step.time}</span>` : '';
                        let stepImg = (typeof step === 'object' && step.image) ? step.image : (trip.image || '');

                        return `
                            <div class="step-item" data-img="${stepImg}" style="margin-top: 1rem; padding-left: 1rem; border-left: 2px solid var(--color-gold); cursor: pointer; transition: background 0.2s;">
                                <h4 style="color: var(--text-main); font-size: 1rem; font-weight: 600;">${stepTime}${stepTitle}</h4>
                                ${stepDesc ? `<p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">${stepDesc}</p>` : ''}
                            </div>
                        `;
                    }).join('');
                }

                dayCard.innerHTML = `
                    <h3 style="font-family: var(--font-serif); color: var(--color-gold); font-size: 1.25rem; font-weight: 400; margin-bottom: 0.5rem;">
                        ${dayObj.day} - <span style="font-size: 0.9rem; color: var(--text-muted); font-family: var(--font-kaido);">${dayObj.dateText || ''}</span>
                    </h3>
                    ${stepsHTML}
                `;

                itineraryContainer.appendChild(dayCard);
            });

            // Écouteur pour la visionneuse d'images au clic/survol des étapes
            const stepItems = itineraryContainer.querySelectorAll('.step-item');
            stepItems.forEach(item => {
                item.addEventListener('click', () => {
                    const imgUrl = item.getAttribute('data-img');
                    if (previewEl && imgUrl) {
                        previewEl.innerHTML = `<img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover; animation: fadeIn 0.3s ease;">`;
                    }
                });
            });
        }
    }

    // 5. Rendu de la Checklist
    if (checklistItemsEl && trip.checklist) {
        checklistItemsEl.innerHTML = '';
        trip.checklist.forEach((item, index) => {
            const itemText = typeof item === 'string' ? item : item.text;
            const isDone = typeof item === 'object' ? item.done : false;

            const div = document.createElement('div');
            div.className = 'checklist-item';
            div.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 0.8rem;';
            div.innerHTML = `
                <input type="checkbox" ${isDone ? 'checked' : ''} style="accent-color: var(--color-gold); cursor: pointer;">
                <span style="${isDone ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text-main);'}">${itemText}</span>
            `;

            // Sauvegarde de l'état de la case à cocher
            const checkbox = div.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                if (typeof item === 'object') {
                    item.done = e.target.checked;
                }
                const span = div.querySelector('span');
                if (e.target.checked) {
                    span.style.textDecoration = 'line-through';
                    span.style.color = 'var(--text-muted)';
                } else {
                    span.style.textDecoration = 'none';
                    span.style.color = 'var(--text-main)';
                }
                // Mise à jour du localStorage
                localStorage.setItem('kaido_active_trip', JSON.stringify(trip));
            });

            checklistItemsEl.appendChild(div);
        });
    }

    // 6. Initialisation de Google Maps
    if (mapEl && typeof google !== 'undefined' && google.maps) {
        const lat = parseFloat(trip.destinationLat || trip.lat || 64.1466);
        const lng = parseFloat(trip.destinationLng || trip.lng || -21.9426);

        const map = new google.maps.Map(mapEl, {
            center: { lat, lng },
            zoom: 10,
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
            title: trip.title || trip.destination
        });
    }
});
