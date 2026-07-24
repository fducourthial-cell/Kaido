let map;
let activeMarkers = []; // Tableau pour stocker tous les marqueurs de la journée
let routePolyline = null; // Ligne reliant les activités
let placesService = null;

// Initialisation de la carte sur la destination exacte du voyage
function initGoogleMap(destinationName, lat, lng) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof google === 'undefined' || !google.maps) return;

    let initialPos = { lat: 48.8566, lng: 2.3522 }; // Fallback Paris
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        initialPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    map = new google.maps.Map(mapContainer, {
        zoom: 12,
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

    placesService = new google.maps.places.PlacesService(map);

    // Si aucune coordonnée GPS n'est fournie, géocoder le nom de la destination
    if (!lat || !lng) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: destinationName }, (results, status) => {
            if (status === 'OK' && results[0]) {
                map.setCenter(results[0].geometry.location);
            }
        });
    }
}

// Nettoyer la carte (marqueurs + ligne)
function clearMapOverlays() {
    activeMarkers.forEach(m => m.setMap(null));
    activeMarkers = [];
    if (routePolyline) {
        routePolyline.setMap(null);
        routePolyline = null;
    }
}

// Afficher toutes les étapes d'une journée et les relier entre elles
async function displayDayOnMap(steps, mainDestination) {
    clearMapOverlays();
    if (!steps || steps.length === 0 || !map) return;

    const geocoder = new google.maps.Geocoder();
    const bounds = new google.maps.LatLngBounds();
    const pathCoordinates = [];

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const locQuery = step.location ? `${step.location}, ${mainDestination}` : `${step.activity}, ${mainDestination}`;
        
        await new Promise((resolve) => {
            geocoder.geocode({ address: locQuery }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const loc = results[0].geometry.location;
                    bounds.extend(loc);
                    pathCoordinates.push(loc);

                    // Création du marqueur numéroté pour chaque étape
                    const marker = new google.maps.Marker({
                        position: loc,
                        map: map,
                        title: `${i + 1}. ${step.activity || step.title}`,
                        label: {
                            text: `${i + 1}`,
                            color: "#0D0B09",
                            fontWeight: "bold",
                            fontSize: "12px"
                        },
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 12,
                            fillColor: "#D4AF37",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#FFFFFF"
                        }
                    });

                    activeMarkers.push(marker);
                }
                resolve();
            });
        });
    }

    // Tracer la ligne entre les étapes s'il y a au moins 2 points
    if (pathCoordinates.length > 1) {
        routePolyline = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: true,
            strokeColor: "#A63A2B", // Rouge Torii Kaido
            strokeOpacity: 0.9,
            strokeWeight: 4
        });
        routePolyline.setMap(map);
    }

    // Ajuster le zoom pour englober tous les points de la journée
    if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        if (pathCoordinates.length === 1) {
            map.setZoom(14);
        }
    }
}

// Afficher une seule activité spécifique lors d'un clic individuel
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

    if (placesService) {
        const query = `${activityName}, ${addressQuery}`;
        placesService.findPlaceFromQuery(
            { query: query, fields: ['photos', 'name', 'geometry'] },
            (results, status) => {
                if (previewLoading) previewLoading.style.display = 'none';

                if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                    const place = results[0];
                    if (place.geometry && place.geometry.location && map) {
                        clearMapOverlays();
                        const marker = new google.maps.Marker({
                            position: place.geometry.location,
                            map: map,
                            title: activityName,
                            animation: google.maps.Animation.DROP
                        });
                        activeMarkers.push(marker);
                        map.panTo(place.geometry.location);
                        map.setZoom(15);
                    }

                    if (previewImg) {
                        if (place.photos && place.photos.length > 0) {
                            previewImg.src = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
                        }
                        previewImg.style.display = 'block';
                    }
                }
            }
        );
    }
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
    const destination = activeTrip.destination || activeTrip.title || "Destination";
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

    if (document.getElementById('trip-budget-total')) document.getElementById('trip-budget-total').textContent = `${totalB} €`;
    if (document.getElementById('budget-flights')) document.getElementById('budget-flights').textContent = `${flights} €`;
    if (document.getElementById('budget-hotel')) document.getElementById('budget-hotel').textContent = `${hotel} €`;
    if (document.getElementById('budget-rest')) document.getElementById('budget-rest').textContent = `${rest} €`;

    // Lien Google Flights
    const flightBtn = document.getElementById('btn-google-flights');
    if (flightBtn) {
        const dep = activeTrip.departure ? encodeURIComponent(activeTrip.departure.split(',')[0].trim()) : 'Lyon';
        const dest = encodeURIComponent(destination.split(',')[0].trim());
        flightBtn.href = `https://www.google.com/travel/flights?q=Vols%20de%20${dep}%20%C3%A0%20${dest}`;
    }

    // Initialisation exacte de la carte selon la destination du voyage créé
    initGoogleMap(destination, activeTrip.destinationLat, activeTrip.destinationLng);

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
                            <div class="step-item" data-location="${loc}" data-activity="${actName}" style="display:flex; gap:1rem; margin-top:0.8rem; background:rgba(255,255,255,0.02); padding:0.8rem; border-radius:6px; border:1px solid transparent; cursor:pointer;">
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
                    <div class="day-header" style="display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(212,175,55,0.15); padding-bottom:0.5rem; cursor:pointer;" title="Cliquez pour afficher l'itinéraire de la journée sur la carte">
                        <span style="background:#A63A2B; color:white; padding:0.2rem 0.6rem; border-radius:4px; font-weight:bold; font-size:0.85rem;">${day.day}</span>
                        <span style="color:#F4EFEA; font-weight:500;">${day.dateText || ''}</span>
                        <span style="margin-left:auto; color:#D4AF37; font-size:0.8rem;">📍 Voir la journée sur la carte</span>
                    </div>
                    <div>${stepsHTML}</div>
                `;

                // CLIC SUR LA JOURNÉE : Affiche toutes les étapes reliées entre elles
                block.querySelector('.day-header').addEventListener('click', () => {
                    displayDayOnMap(day.steps, destination);
                });

                // CLIC SUR UNEseule ACTIVITÉ
                block.querySelectorAll('.step-item').forEach(itemEl => {
                    itemEl.addEventListener('click', (e) => {
                        e.stopPropagation(); // Évite de déclencher le clic parent du jour
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

    // Modale d'édition
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
        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
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
