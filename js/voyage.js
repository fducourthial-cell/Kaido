document.addEventListener('DOMContentLoaded', async () => {
    let allTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
    let activeTrip = JSON.parse(localStorage.getItem('kaido_active_trip')) || JSON.parse(localStorage.getItem('currentTrip'));

    const titleEl = document.getElementById('trip-title');
    const datesEl = document.getElementById('trip-dates');
    const descEl = document.getElementById('trip-main-desc');
    const coverEl = document.getElementById('trip-cover');
    const budgetValueEl = document.getElementById('budget-value');
    const flightBtn = document.getElementById('btn-google-flights');
    const daysContainer = document.getElementById('itinerary-days-container');
    const mapEl = document.getElementById('map');
    const previewEl = document.getElementById('activity-preview');
    const checklistList = document.getElementById('checklist-list');

    if (!activeTrip) {
        if (titleEl) titleEl.textContent = "Aucun voyage sélectionné";
        return;
    }

    const destination = activeTrip.destination || activeTrip.title || "Destination";

    // -------------------------------------------------------------
    // 1. SAUVEGARDE SYNCHRONISÉE (LOCAL & CLOUD SUPABASE)
    // -------------------------------------------------------------
    async function saveTrip() {
        const idx = allTrips.findIndex(t => String(t.id) === String(activeTrip.id));
        if (idx !== -1) allTrips[idx] = activeTrip;
        localStorage.setItem('kaido_trips', JSON.stringify(allTrips));
        localStorage.setItem('kaido_active_trip', JSON.stringify(activeTrip));

        if (typeof supabase !== 'undefined') {
            try {
                await supabase.from('trips').update({
                    date_start: activeTrip.dateStart,
                    date_end: activeTrip.dateEnd,
                    budget: activeTrip.budget,
                    desc_text: activeTrip.desc,
                    checklist: activeTrip.checklist,
                    itinerary: activeTrip.itinerary
                }).eq('id', activeTrip.id);
            } catch (e) {
                console.warn("Sauvegarde locale uniquement.", e);
            }
        }
    }

    // -------------------------------------------------------------
    // 2. HEADER & MÉTADONNÉES
    // -------------------------------------------------------------
    if (titleEl) titleEl.textContent = destination;
    if (datesEl) datesEl.textContent = `📅 ${activeTrip.dates || ''}`;
    if (descEl) descEl.textContent = activeTrip.desc || "Aucune note ajoutée pour ce voyage.";
    if (budgetValueEl) budgetValueEl.textContent = `${parseFloat(activeTrip.budget) || 0} €`;

    if (coverEl && activeTrip.image) {
        coverEl.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), url('${activeTrip.image}')`;
    }

    if (flightBtn) {
        const dep = encodeURIComponent((activeTrip.departure || 'Paris').trim());
        const dest = encodeURIComponent(destination.split(',')[0].trim());
        flightBtn.href = `https://www.google.com/travel/flights?q=Vols%20de%20${dep}%20%C3%A0%20${dest}`;
    }

    // -------------------------------------------------------------
    // 3. INITIALISATION CARTE & PLACES SERVICE
    // -------------------------------------------------------------
    let map = null;
    let mainMarker = null;
    let activityMarker = null;
    let placesService = null;

    const lat = activeTrip.destinationLat ? parseFloat(activeTrip.destinationLat) : null;
    const lng = activeTrip.destinationLng ? parseFloat(activeTrip.destinationLng) : null;

    if (mapEl && typeof google !== 'undefined' && google.maps) {
        const defaultCenter = (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : { lat: 48.8566, lng: 2.3522 };

        map = new google.maps.Map(mapEl, {
            center: defaultCenter,
            zoom: 11,
            styles: [
                { elementType: "geometry", stylers: [{ color: "#14110E" }] },
                { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#8E847A" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#0D0B09" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#0D0B09" }] }
            ]
        });

        mainMarker = new google.maps.Marker({
            position: defaultCenter,
            map: map,
            title: destination,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "#D4AF37",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#FFFFFF"
            }
        });

        placesService = new google.maps.places.PlacesService(map);
    }

    // Photo de couverture par défaut dans la visionneuse
    if (previewEl && activeTrip.image) {
        previewEl.innerHTML = `<img src="${activeTrip.image}" style="width:100%; height:100%; object-fit:cover; transition: opacity 0.3s ease;">`;
    }

    // -------------------------------------------------------------
    // 4. RENDU ITINÉRAIRE + INTERACTIONS CLIQUABLES (PHOTO + MAP)
    // -------------------------------------------------------------
    if (daysContainer && activeTrip.itinerary) {
        daysContainer.innerHTML = '';

        activeTrip.itinerary.forEach((dayObj) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 1.5rem; margin-bottom: 1.5rem;';

            let stepsHTML = '';
            if (dayObj.steps && dayObj.steps.length > 0) {
                stepsHTML = dayObj.steps.map((step) => {
                    let stepTitle = typeof step === 'string' ? step : (step.title || step.name || 'Étape');
                    let stepDesc = typeof step === 'object' ? (step.desc || step.description || '') : '';
                    let stepTime = (typeof step === 'object' && step.time) ? `<span style="color: var(--color-gold); font-weight: bold; margin-right: 8px;">${step.time}</span>` : '';
                    let stepImg = (typeof step === 'object' && step.image) ? step.image : '';

                    return `
                        <div class="step-item" data-title="${stepTitle}" data-img="${stepImg}" style="margin-top: 1rem; padding: 0.8rem 1rem; border-left: 3px solid var(--color-gold); background: rgba(255,255,255,0.02); border-radius: 0 4px 4px 0; cursor: pointer; transition: all 0.2s ease;">
                            <h4 style="color: var(--text-main); font-size: 0.98rem; font-weight: 600;">${stepTime}${stepTitle}</h4>
                            ${stepDesc ? `<p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.3rem;">${stepDesc}</p>` : ''}
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

            daysContainer.appendChild(dayCard);
        });

        // ÉCOUTEURS DE CLIC ET SURVOL SUR CHAQUE ACTIVITÉ
        const stepItems = daysContainer.querySelectorAll('.step-item');
        stepItems.forEach(item => {
            // Effet survol
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(212, 175, 55, 0.08)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(255,255,255,0.02)';
            });

            // Clic sur l'activité : recherche lieu, update image + centrage map
            item.addEventListener('click', () => {
                const title = item.getAttribute('data-title');
                const customImg = item.getAttribute('data-img');
                const query = `${title}, ${destination}`;

                // 1. Mise à jour visionneuse d'image
                if (customImg && previewEl) {
                    previewEl.innerHTML = `<img src="${customImg}" style="width:100%; height:100%; object-fit:cover;">`;
                }

                // 2. Recherche du lieu exact via Places API pour cibler la carte et récupérer la photo
                if (placesService && map) {
                    placesService.findPlaceFromQuery({
                        query: query,
                        fields: ['name', 'geometry', 'photos']
                    }, (results, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                            const place = results[0];
                            const location = place.geometry.location;

                            // Recentrer la carte avec zoom sur l'activité
                            map.panTo(location);
                            map.setZoom(14);

                            // Marqueur d'activité spécifique (Rouge Torii)
                            if (activityMarker) activityMarker.setMap(null);
                            activityMarker = new google.maps.Marker({
                                position: location,
                                map: map,
                                title: place.name || title,
                                animation: google.maps.Animation.DROP
                            });

                            // Si pas d'image custom fournie, utiliser la photo Google Place
                            if (!customImg && place.photos && place.photos.length > 0 && previewEl) {
                                const photoUrl = place.photos[0].getUrl({ maxWidth: 800, maxHeight: 500 });
                                previewEl.innerHTML = `<img src="${photoUrl}" style="width:100%; height:100%; object-fit:cover;">`;
                            }
                        }
                    });
                }
            });
        });
    }

    // -------------------------------------------------------------
    // 5. CHECKLIST & BAGAGES
    // -------------------------------------------------------------
    function renderChecklist() {
        if (!checklistList || !activeTrip.checklist) return;
        checklistList.innerHTML = '';

        activeTrip.checklist.forEach(item => {
            const li = document.createElement('li');
            li.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem;';
            li.innerHTML = `
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" ${item.done ? 'checked' : ''} style="accent-color: var(--color-gold);">
                    <span style="${item.done ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text-main);'}">${item.text}</span>
                </label>
                <button class="btn-delete-task" data-id="${item.id}" style="background:none; border:none; color: var(--color-torii); cursor:pointer;">✖</button>
            `;

            li.querySelector('input').addEventListener('change', async (e) => {
                item.done = e.target.checked;
                await saveTrip();
                renderChecklist();
            });

            li.querySelector('.btn-delete-task').addEventListener('click', async () => {
                activeTrip.checklist = activeTrip.checklist.filter(t => t.id !== item.id);
                await saveTrip();
                renderChecklist();
            });

            checklistList.appendChild(li);
        });
    }

    renderChecklist();

    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('new-task-input');
            if (input && input.value.trim()) {
                if (!activeTrip.checklist) activeTrip.checklist = [];
                activeTrip.checklist.push({ id: Date.now(), text: input.value.trim(), done: false });
                await saveTrip();
                renderChecklist();
                input.value = '';
            }
        });
    }
});
