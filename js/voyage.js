let map;
let activeMarker = null;
let placesService = null;

// INITIALISATION DYNAMIQUE DE LA CARTE SUR LA DESTINATION ACTIVE
function initGoogleMap(destinationName) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof google === 'undefined' || !google.maps) return;

    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: destinationName }, (results, status) => {
        let initialPos = { lat: 35.6762, lng: 139.6503 }; // Fallback Tokyo

        if (status === 'OK' && results[0]) {
            initialPos = results[0].geometry.location;
        }

        map = new google.maps.Map(mapContainer, {
            zoom: 11,
            center: initialPos,
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            ]
        });

        // Marqueur initial de la destination
        activeMarker = new google.maps.Marker({
            position: initialPos,
            map: map,
            title: destinationName
        });

        placesService = new google.maps.places.PlacesService(map);
    });
}

function buildFallbackImage(activityName) {
    const initial = (activityName || '?').trim().charAt(0).toUpperCase();
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#A63A2B"/>
                    <stop offset="100%" stop-color="#0D0B09"/>
                </linearGradient>
            </defs>
            <rect width="600" height="400" fill="url(#g)"/>
            <text x="50%" y="52%" font-family="Georgia, serif" font-size="120" fill="#D4AF37" fill-opacity="0.35" text-anchor="middle" dominant-baseline="middle">${initial}</text>
        </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// FONCTION DE MISE À JOUR DE LA CARTE & PHOTO AU CLIC SUR UNE ACTIVITÉ
function selectActivityOnMap(addressQuery, activityName) {
    if (!addressQuery && !activityName) return;

    const previewBox = document.getElementById('activity-preview');
    const previewImg = document.getElementById('activity-img');
    const previewLoading = document.getElementById('activity-loading');
    const previewTitle = document.getElementById('activity-title');

    if (previewBox) previewBox.style.display = 'block';
    if (previewImg) previewImg.style.display = 'none';
    if (previewLoading) previewLoading.style.display = 'flex';
    if (previewTitle) previewTitle.textContent = `📍 ${activityName}`;

    // 1. Mise à jour de l'image via Google Places
    if (placesService) {
        const query = `${activityName}, ${addressQuery}`;
        placesService.findPlaceFromQuery(
            { query: query, fields: ['photos', 'name', 'geometry'] },
            (results, status) => {
                if (previewLoading) previewLoading.style.display = 'none';

                if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                    const place = results[0];

                    // Si Places trouve la position exacte, on recentre direct
                    if (place.geometry && place.geometry.location && map) {
                        updateMapMarker(place.geometry.location, activityName);
                    }

                    if (previewImg) {
                        if (place.photos && place.photos.length > 0) {
                            previewImg.src = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
                        } else {
                            previewImg.src = buildFallbackImage(activityName);
                        }
                        previewImg.style.display = 'block';
                    }
                } else {
                    // Fallback par adresse si le nom exact échoue
                    geocodeAddressAndCenter(addressQuery, activityName);
                    if (previewImg) {
                        previewImg.src = buildFallbackImage(activityName);
                        previewImg.style.display = 'block';
                    }
                }
            }
        );
    } else {
        geocodeAddressAndCenter(addressQuery, activityName);
        if (previewLoading) previewLoading.style.display = 'none';
        if (previewImg) {
            previewImg.src = buildFallbackImage(activityName);
            previewImg.style.display = 'block';
        }
    }
}

// Recentrer la carte et déplacer le marqueur
function updateMapMarker(location, title) {
    if (!map || typeof google === 'undefined' || !google.maps) return;
    map.panTo(location);
    map.setZoom(14);

    if (activeMarker) activeMarker.setMap(null);

    activeMarker = new google.maps.Marker({
        position: location,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP
    });
}

function geocodeAddressAndCenter(addressQuery, title) {
    if (!map || typeof google === 'undefined' || !google.maps || !addressQuery) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: addressQuery }, (results, status) => {
        if (status === 'OK' && results[0]) {
            updateMapMarker(results[0].geometry.location, title);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    let activeTrip = JSON.parse(localStorage.getItem('kaido_active_trip')) || JSON.parse(localStorage.getItem('currentTrip'));
    const allTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];

    if (!activeTrip) {
        alert("Aucun voyage sélectionné.");
        window.location.href = "index.html";
        return;
    }

    if (!activeTrip.checklist) {
        activeTrip.checklist = [
            { id: 1, text: "Passeport / Carte d'identité", done: false },
            { id: 2, text: "Billets de réservation", done: false }
        ];
    }

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
                console.warn("Sauvegarde locale uniquement.");
            }
        }
    }

    // Infos du voyage
    const destination = activeTrip.destination || activeTrip.title || "Japon";
    const titleEl = document.getElementById('trip-main-title');
    const datesEl = document.getElementById('trip-main-dates');
    const descEl = document.getElementById('trip-main-desc');
    const coverEl = document.getElementById('trip-cover');

    if (titleEl) titleEl.textContent = destination;
    if (datesEl) datesEl.textContent = `📅 ${activeTrip.dates || ''}`;
    if (descEl) descEl.textContent = activeTrip.desc || "Aucune note ajoutée pour ce voyage.";

    if (coverEl && activeTrip.image) {
        coverEl.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.85)), url('${activeTrip.image}')`;
    }

    // Budget
    let totalB = parseFloat(activeTrip.budget) || 0;
    let daysCount = (activeTrip.itinerary && activeTrip.itinerary.length) ? activeTrip.itinerary.length : 3;
    if (totalB <= 0) totalB = daysCount * 150 + 200;

    const flights = Math.round(totalB * 0.30);
    const hotel = Math.round(totalB * 0.40);
    const rest = totalB - (flights + hotel);

    const totalEl = document.getElementById('trip-budget-total');
    const flightsEl = document.getElementById('budget-flights');
    const hotelEl = document.getElementById('budget-hotel');
    const restEl = document.getElementById('budget-rest');

    if (totalEl) totalEl.textContent = `${totalB} €`;
    if (flightsEl) flightsEl.textContent = `${flights} €`;
    if (hotelEl) hotelEl.textContent = `${hotel} €`;
    if (restEl) restEl.textContent = `${rest} €`;

    // Google Flights Link
    const flightBtn = document.getElementById('btn-google-flights');
    if (flightBtn) {
        const dep = activeTrip.departure ? encodeURIComponent(activeTrip.departure.split(',')[0].trim()) : 'Lyon';
        const dest = encodeURIComponent(destination.split(',')[0].trim());
        flightBtn.href = `https://www.google.com/travel/flights?q=Vols%20de%20${dep}%20%C3%A0%20${dest}`;
    }

    // Initialisation de la carte
    initGoogleMap(destination);

    // Rendu de l'itinéraire
    const daysContainer = document.getElementById('itinerary-days-container');
    if (daysContainer) {
        daysContainer.innerHTML = '';

        if (activeTrip.itinerary && activeTrip.itinerary.length > 0) {
            activeTrip.itinerary.forEach((day) => {
                const block = document.createElement('div');
                block.className = 'day-block-card';
                block.style.cssText = `
                    background-color: #14110E;
                    border: 1px solid rgba(212, 175, 55, 0.15);
                    border-radius: 8px;
                    padding: 1.2rem;
                    margin-bottom: 1.5rem;
                `;

                let stepsHTML = '';
                if (day.steps) {
                    day.steps.forEach((step) => {
                        const loc = step.location || destination;
                        const actName = step.activity || step.title || step.name || 'Étape';
                        const timeStr = step.time || '--:--';

                        stepsHTML += `
                            <div class="step-item" data-location="${loc}" data-activity="${actName}" style="display:flex; gap:1rem; margin-top:0.8rem; background:rgba(255,255,255,0.02); padding:0.8rem; border-radius:6px; border:1px solid transparent;">
                                <span style="color:#D4AF37; font-weight:bold; font-size:0.85rem; min-width:50px;">${timeStr}</span>
                                <div>
                                    <div style="color:#F4EFEA; font-weight:600;">${actName}</div>
                                    <div style="color:#8E847A; font-size:0.8rem;">📍 ${loc}</div>
                                </div>
                            </div>
                        `;
                    });
                }

                block.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(212,175,55,0.15); padding-bottom:0.5rem;">
                        <span style="background:#A63A2B; color:white; padding:0.2rem 0.6rem; border-radius:4px; font-weight:bold; font-size:0.85rem;">${day.day}</span>
                        <span style="color:#F4EFEA; font-weight:500;">${day.dateText || ''}</span>
                    </div>
                    <div>${stepsHTML}</div>
                `;

                block.querySelectorAll('.step-item').forEach(itemEl => {
                    itemEl.addEventListener('click', () => {
                        document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active-step'));
                        itemEl.classList.add('active-step');

                        const locQuery = itemEl.getAttribute('data-location');
                        const actName = itemEl.getAttribute('data-activity');
                        selectActivityOnMap(locQuery, actName);
                    });
                });

                daysContainer.appendChild(block);
            });
        }
    }

    // Rendu Checklist
    function renderChecklist() {
        const container = document.getElementById('checklist-container');
        if (!container) return;
        container.innerHTML = '';
        activeTrip.checklist.forEach(item => {
            const li = document.createElement('li');
            li.className = `checklist-item ${item.done ? 'completed' : ''}`;
            li.innerHTML = `
                <label>
                    <input type="checkbox" data-id="${item.id}" ${item.done ? 'checked' : ''}>
                    <span>${item.text}</span>
                </label>
                <button class="btn-delete-task" data-id="${item.id}">✖</button>
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

            container.appendChild(li);
        });
    }
    renderChecklist();

    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('new-task-input');
            if (input && input.value.trim()) {
                activeTrip.checklist.push({ id: Date.now(), text: input.value.trim(), done: false });
                await saveTrip();
                renderChecklist();
                input.value = '';
            }
        });
    }

    // Gestion de la Modale
    const modal = document.getElementById('editModal');
    const openBtn = document.getElementById('btn-open-edit');
    const closeBtn = document.getElementById('btn-close-edit');
    const editForm = document.getElementById('edit-trip-form');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            document.getElementById('edit-date-start').value = activeTrip.dateStart || '';
            document.getElementById('edit-date-end').value = activeTrip.dateEnd || '';
            document.getElementById('edit-budget').value = activeTrip.budget || 0;
            document.getElementById('edit-desc').value = activeTrip.desc || '';
            modal.style.display = 'flex';
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (editForm && modal) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            activeTrip.dateStart = document.getElementById('edit-date-start').value;
            activeTrip.dateEnd = document.getElementById('edit-date-end').value;
            activeTrip.budget = document.getElementById('edit-budget').value;
            activeTrip.desc = document.getElementById('edit-desc').value;
            
            await saveTrip();
            modal.style.display = 'none';
            location.reload();
        });
    }
});
