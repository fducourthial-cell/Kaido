let map;
let activeMarkers = []; // Tableau pour stocker tous les marqueurs affichés
let routePolyline = null; // Objet pour stocker le tracé de la route ou les lignes
let placesService = null;

// Styles personnalisés pour la carte Google Maps selon le thème actif
const mapStyles = {
    dark: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
    ],
    papyrus: [
        { elementType: "geometry", stylers: [{ color: "#F2EBD9" }] }, // Ton blanc cassé / parchemin des cartes
        { elementType: "labels.text.stroke", stylers: [{ color: "#FCF8F2" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#6B5E52" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#8C6D23" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#E4D8C3" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#D1C2A5" }] }
    ]
};

// Initialisation de la carte basée en priorité sur les coordonnées GPS enregistrées et le thème
function initGoogleMap(destinationName, lat, lng) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof google === 'undefined' || !google.maps) return;

    let initialPos = { lat: 48.8566, lng: 2.3522 }; // Fallback Paris

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        initialPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    // Récupération dynamique du thème actuel
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const activeStyle = mapStyles[currentTheme] || mapStyles.dark;

    map = new google.maps.Map(mapContainer, {
        zoom: 12,
        center: initialPos,
        disableDefaultUI: true,
        zoomControl: true,
        styles: activeStyle
    });

    placesService = new google.maps.places.PlacesService(map);

    // Si aucune coordonnée GPS n'était stockée, fallback géocodage unique
    if (!lat || !lng) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: destinationName }, (results, status) => {
            if (status === 'OK' && results[0]) {
                map.setCenter(results[0].geometry.location);
            }
        });
    }
}

// Nettoyer les marqueurs et lignes de la carte
function clearMapOverlays() {
    activeMarkers.forEach(m => m.setMap(null));
    activeMarkers = [];
    if (routePolyline) {
        if (typeof routePolyline.setMap === 'function') {
            routePolyline.setMap(null);
        } else if (typeof routePolyline.setDirections === 'function') {
            routePolyline.setMap(null);
        }
        routePolyline = null;
    }
}

// Affichage du tracé routier Rouge Torii et des marqueurs numérotés Or personnalisés
async function displayDayOnMap(steps, mainDestination) {
    clearMapOverlays();
    if (!steps || steps.length === 0 || !map) return;

    const geocoder = new google.maps.Geocoder();
    const resolvedWaypoints = [];

    // 1. Résolution de toutes les coordonnées des étapes
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        let loc = null;

        if (step.lat && step.lng && !isNaN(step.lat) && !isNaN(step.lng)) {
            loc = new google.maps.LatLng(parseFloat(step.lat), parseFloat(step.lng));
        } else {
            const rawLocation = step.location || step.activity || step.title;
            const query = rawLocation.toLowerCase().includes(mainDestination.toLowerCase()) 
                ? rawLocation 
                : `${rawLocation}, ${mainDestination}`;

            await new Promise((resolve) => {
                geocoder.geocode({ address: query }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        loc = results[0].geometry.location;
                    }
                    resolve();
                });
            });
        }

        if (loc) {
            resolvedWaypoints.push({ location: loc, stepInfo: step, index: i });
        }
    }

    if (resolvedWaypoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    resolvedWaypoints.forEach(wp => bounds.extend(wp.location));

    // Si une seule étape, simple marqueur numéroté "1" en Or
    if (resolvedWaypoints.length === 1) {
        const singleLoc = resolvedWaypoints[0].location;
        const marker = new google.maps.Marker({
            position: singleLoc,
            map: map,
            title: `1. ${resolvedWaypoints[0].stepInfo.activity || resolvedWaypoints[0].stepInfo.title}`,
            label: {
                text: "1",
                color: "#0D0B09",
                fontWeight: "bold",
                fontSize: "12px"
            },
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: "#D4AF37", // Or Kaido
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#FFFFFF"
            }
        });
        activeMarkers.push(marker);
        map.setCenter(singleLoc);
        map.setZoom(14);
        return;
    }

    // 2. Tracé de la route (Rouge Torii) sans les marqueurs par défaut
    const origin = resolvedWaypoints[0].location;
    const destination = resolvedWaypoints[resolvedWaypoints.length - 1].location;
    
    const waypoints = resolvedWaypoints.slice(1, resolvedWaypoints.length - 1).map(wp => ({
        location: wp.location,
        stopover: true
    }));

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // SUPPRIME LES ÉPINGLES GOOGLE PAR DÉFAUT (Fini les doublons !)
        preserveViewport: false,
        polylineOptions: {
            strokeColor: "#A63A2B", // Rouge Torii
            strokeWeight: 5,
            strokeOpacity: 0.9
        }
    });

    routePolyline = directionsRenderer;

    directionsService.route({
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: false, // FALSE POUR RESPECTER STRICTEMENT L'ORDRE 1 -> 2 -> 3
        travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);

            // 3. Ajout manuel de nos beaux marqueurs numérotés en Or (1, 2, 3...)
            resolvedWaypoints.forEach((wp) => {
                const marker = new google.maps.Marker({
                    position: wp.location,
                    map: map,
                    title: `${wp.index + 1}. ${wp.stepInfo.activity || wp.stepInfo.title}`,
                    label: {
                        text: `${wp.index + 1}`,
                        color: "#0D0B09", // Texte sombre pour un contraste parfait sur l'or
                        fontWeight: "bold",
                        fontSize: "12px"
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 14,
                        fillColor: "#D4AF37", // Or Kaido
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF"
                    }
                });
                activeMarkers.push(marker);
            });

        } else {
            console.warn("Impossible de tracer l'itinéraire routier :", status);
            // Fallback si le tracé route échoue
            resolvedWaypoints.forEach((wp) => {
                const marker = new google.maps.Marker({
                    position: wp.location,
                    map: map,
                    title: `${wp.index + 1}. ${wp.stepInfo.activity || wp.stepInfo.title}`,
                    label: { text: `${wp.index + 1}`, color: "#0D0B09", fontWeight: "bold", fontSize: "12px" },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 14,
                        fillColor: "#D4AF37",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF"
                    }
                });
                activeMarkers.push(marker);
            });
        }
    });

    if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
    }
}

// Sélectionner une seule activité au clic individuel
function selectActivityOnMap(step, addressQuery, mainDestination) {
    const actName = step ? (step.activity || step.title || 'Activité') : 'Activité';
    const locationName = step ? (step.location || addressQuery || mainDestination) : (addressQuery || mainDestination);
    
    const previewBox = document.getElementById('activity-preview');
    const previewImg = document.getElementById('activity-img');
    const previewLoading = document.getElementById('activity-loading');
    const previewTitle = document.getElementById('activity-title');

    if (previewBox) previewBox.style.display = 'block';
    if (previewImg) previewImg.style.display = 'none';
    if (previewLoading) previewLoading.style.display = 'flex';
    if (previewTitle) previewTitle.textContent = `📍 ${actName}`;

    const placeMarkerAt = (location) => {
        clearMapOverlays();
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: actName,
            animation: google.maps.Animation.DROP,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: "#D4AF37", // Or Kaido
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#FFFFFF"
            }
        });
        activeMarkers.push(marker);
        map.panTo(location);
        map.setZoom(13);
    };

    if (step && step.lat && step.lng && !isNaN(step.lat) && !isNaN(step.lng) && map) {
        placeMarkerAt({ lat: parseFloat(step.lat), lng: parseFloat(step.lng) });
    } else if (map) {
        const geocoder = new google.maps.Geocoder();
        let cleanQuery = locationName;
        if (!cleanQuery.toLowerCase().includes(mainDestination.toLowerCase())) {
            cleanQuery = `${locationName}, ${mainDestination}`;
        }

        geocoder.geocode({ address: cleanQuery }, (results, status) => {
            if (status === 'OK' && results[0]) {
                placeMarkerAt(results[0].geometry.location);
            } else {
                const fallbackQuery = `${actName}, ${mainDestination}`;
                geocoder.geocode({ address: fallbackQuery }, (resFallback, statusFallback) => {
                    if (statusFallback === 'OK' && resFallback[0]) {
                        placeMarkerAt(resFallback[0].geometry.location);
                    }
                });
            }
        });
    }

    if (placesService) {
        const query = `${actName}, ${locationName}`;
        placesService.findPlaceFromQuery(
            { query: query, fields: ['photos'] },
            (results, status) => {
                if (previewLoading) previewLoading.style.display = 'none';

                if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                    const place = results[0];
                    if (previewImg && place.photos && place.photos.length > 0) {
                        previewImg.src = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
                        previewImg.style.display = 'block';
                    }
                }
            }
        );
    }
}

// --- FONCTION MÉTÉO ---
async function fetchAndRenderWeather(lat, lng, destinationName, startDate, endDate) {
    const container = document.getElementById('weather-container');
    const subtitle = document.getElementById('weather-subtitle');
    if (!container) return;

    if ((!lat || !lng) && typeof google !== 'undefined' && google.maps) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: destinationName }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const autoLat = results[0].geometry.location.lat();
                const autoLng = results[0].geometry.location.lng();
                fetchAndRenderWeather(autoLat, autoLng, destinationName, startDate, endDate);
            } else {
                container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Météo indisponible pour cette destination.</span>`;
            }
        });
        return;
    }

    const weatherCodes = {
        0: '☀️ Ensoleillé', 1: '🌤️ Peu nuageux', 2: '⛅ Partiellement nuageux', 3: '☁️ Couvert',
        45: '🌫️ Brouillard', 51: '🌧️ Bruine légère', 61: '🌧️ Pluie', 71: '❄️ Neige', 80: '🌦️ Averses', 95: '🌩️ Orage'
    };

    try {
        let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const today = new Date();
            const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 14) {
                url += `&start_date=${startDate}&end_date=${endDate}`;
            }
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.daily) {
            container.innerHTML = '';
            const daysLimit = Math.min(data.daily.time.length, 5);
            for (let i = 0; i < daysLimit; i++) {
                const dateRaw = data.daily.time[i];
                const dateFormatted = new Date(dateRaw).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                const code = data.daily.weathercode[i];
                const weatherText = weatherCodes[code] || '⛅ Variable';
                const tempMax = Math.round(data.daily.temperature_2m_max[i]);
                const tempMin = Math.round(data.daily.temperature_2m_min[i]);

                const item = document.createElement('div');
                item.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 0.5rem 0.8rem; border-radius: 6px; border: 1px solid rgba(212, 175, 55, 0.1); font-size: 0.85rem;`;
                item.innerHTML = `
                    <span style="color: var(--text-main); font-weight: 500; text-transform: capitalize;">${dateFormatted}</span>
                    <span>${weatherText}</span>
                    <span style="color: var(--color-gold); font-weight: 600;">${tempMin}° / ${tempMax}°C</span>
                `;
                container.appendChild(item);
            }
            if (subtitle) subtitle.textContent = "Prévisions en direct (Open-Meteo)";
        }
    } catch (err) {
        console.warn("Impossible de charger la météo :", err);
        container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Météo indisponible.</span>`;
    }
}

// Fonction de calcul des temps et distances entre les étapes (via DirectionsService)
async function calculateTravelTimesForTrip(itinerary, mainDestination) {
    if (typeof google === 'undefined' || !google.maps || !google.maps.DirectionsService) return;

    const directionsService = new google.maps.DirectionsService();

    for (let dayIdx = 0; dayIdx < itinerary.length; dayIdx++) {
        const day = itinerary[dayIdx];
        if (!day.steps || day.steps.length < 2) continue;

        for (let idx = 0; idx < day.steps.length - 1; idx++) {
            const currentStep = day.steps[idx];
            const nextStep = day.steps[idx + 1];

            const origin = currentStep.location ? `${currentStep.location}, ${mainDestination}` : (currentStep.activity || mainDestination);
            const destinationLoc = nextStep.location ? `${nextStep.location}, ${mainDestination}` : (nextStep.activity || mainDestination);

            const infoEl = document.getElementById(`travel-info-${dayIdx}-${idx}`);
            if (!infoEl) continue;

            directionsService.route({
                origin: origin,
                destination: destinationLoc,
                travelMode: google.maps.TravelMode.DRIVING,
            }, (response, status) => {
                if (status === 'OK' && response.routes[0] && response.routes[0].legs[0]) {
                    const leg = response.routes[0].legs[0];
                    const distance = leg.distance.text;
                    const duration = leg.duration.text;
                    infoEl.innerHTML = `<span style="opacity: 0.8;">🚗 ${duration} (${distance})</span>`;
                } else {
                    infoEl.innerHTML = `<span style="opacity: 0.5; font-style: italic;">🚗 Trajet non estimé</span>`;
                }
            });
        }
    }
}

// Fonction d'optimisation locale d'une journée
async function optimizeDayRoute(dayIdx) {
    let activeTrip = JSON.parse(localStorage.getItem('kaido_active_trip'));
    if (!activeTrip || !activeTrip.itinerary || !activeTrip.itinerary[dayIdx]) return;

    const day = activeTrip.itinerary[dayIdx];
    if (!day.steps || day.steps.length <= 1) {
        alert("Pas assez d'étapes à optimiser pour cette journée.");
        return;
    }

    // Tri chronologique intelligent basé sur les horaires des étapes
    day.steps.sort((a, b) => {
        const timeA = (a.time && a.time !== '--:--') ? a.time : "99:99";
        const timeB = (b.time && b.time !== '--:--') ? b.time : "99:99";
        return timeA.localeCompare(timeB);
    });

    localStorage.setItem('kaido_active_trip', JSON.stringify(activeTrip));
    
    // Met aussi à jour dans kaido_trips global
    const allTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
    const idx = allTrips.findIndex(t => String(t.id) === String(activeTrip.id));
    if (idx !== -1) {
        allTrips[idx] = activeTrip;
        localStorage.setItem('kaido_trips', JSON.stringify(allTrips));
    }

    // Synchronisation Supabase si disponible
    if (typeof supabase !== 'undefined' && window.supabaseClient) {
        try {
            await window.supabaseClient.from('trips').update({
                itinerary: activeTrip.itinerary
            }).eq('id', activeTrip.id);
        } catch (e) {
            console.warn("Mise à jour Cloud ignorée, sauvegarde locale active.");
        }
    }

    location.reload();
}

document.addEventListener('DOMContentLoaded', async () => {
    let activeTrip = JSON.parse(localStorage.getItem('kaido_active_trip')) || JSON.parse(localStorage.getItem('currentTrip'));
    const allTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];

    if (!activeTrip) {
        alert("Aucun voyage sélectionné.");
        window.location.href = "index.html";
        return;
    }

    if (typeof activeTrip.itinerary === 'string') {
        try { activeTrip.itinerary = JSON.parse(activeTrip.itinerary); } catch (e) { console.error(e); }
    }
    if (typeof activeTrip.checklist === 'string') {
        try { activeTrip.checklist = JSON.parse(activeTrip.checklist); } catch (e) { console.error(e); }
    }
    if (typeof activeTrip.expenses === 'string') {
        try { activeTrip.expenses = JSON.parse(activeTrip.expenses); } catch (e) { activeTrip.expenses = []; }
    }
    if (typeof activeTrip.budgetDetails === 'string') {
        try { activeTrip.budgetDetails = JSON.parse(activeTrip.budgetDetails); } catch (e) {}
    }

    if (!activeTrip.checklist) {
        activeTrip.checklist = [
            { id: 1, text: "Passeport / Carte d'identité", done: false },
            { id: 2, text: "Billets de réservation", done: false }
        ];
    }
    if (!activeTrip.expenses) activeTrip.expenses = [];
    if (!activeTrip.bookingNotes) activeTrip.bookingNotes = [];

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
                    itinerary: activeTrip.itinerary,
                    expenses: activeTrip.expenses || [],
                    booking_notes: activeTrip.bookingNotes || []
                }).eq('id', activeTrip.id);
            } catch (e) {
                console.warn("Sauvegarde locale uniquement.");
            }
        }
    }

    const destination = activeTrip.destination || activeTrip.title || "Destination";
    const titleEl = document.getElementById('trip-main-title');
    const datesEl = document.getElementById('trip-main-dates');
    const descEl = document.getElementById('trip-main-desc');

    if (titleEl) titleEl.textContent = destination;
    if (datesEl) datesEl.textContent = `📅 ${activeTrip.dates || ''}`;
    if (descEl) descEl.textContent = activeTrip.desc || "Aucune note ajoutée pour ce voyage.";

    // Injection propre de l'image de couverture (Hero Card)
    const coverImgEl = document.getElementById('trip-cover-img');
    if (coverImgEl && activeTrip.image) {
        coverImgEl.src = activeTrip.image;
    }

    let totalB = parseFloat(activeTrip.budget) || 0;
    let daysCount = (activeTrip.itinerary && activeTrip.itinerary.length) ? activeTrip.itinerary.length : 3;
    if (totalB <= 0) totalB = daysCount * 150 + 200;

    const flights = activeTrip.budgetDetails ? activeTrip.budgetDetails.flights : Math.round(totalB * 0.30);
    const hotel = activeTrip.budgetDetails ? activeTrip.budgetDetails.hotel : Math.round(totalB * 0.40);
    const rest = activeTrip.budgetDetails ? activeTrip.budgetDetails.rest : (totalB - (flights + hotel));

    if (document.getElementById('trip-budget-total')) document.getElementById('trip-budget-total').textContent = `${totalB} €`;
    if (document.getElementById('budget-flights')) document.getElementById('budget-flights').textContent = `${flights} €`;
    if (document.getElementById('budget-hotel')) document.getElementById('budget-hotel').textContent = `${hotel} €`;
    if (document.getElementById('budget-rest')) document.getElementById('budget-rest').textContent = `${rest} €`;

    // --- MODULE RÉSERVATIONS & LIENS DÉDIÉS ---
    const destinationClean = encodeURIComponent(destination.split(',')[0].trim());
    const checkIn = activeTrip.dateStart || '';
    const checkOut = activeTrip.dateEnd || '';

    const resFlight = document.getElementById('res-btn-flights');
    const resBooking = document.getElementById('res-btn-booking');
    const resAirbnb = document.getElementById('res-btn-airbnb');
    const resCar = document.getElementById('res-btn-car');
    const flightBtn = document.getElementById('btn-google-flights');

    const dep = activeTrip.departure ? encodeURIComponent(activeTrip.departure.split(',')[0].trim()) : 'Lyon';
    const flightUrl = `https://www.google.com/travel/flights?q=Vols%20de%20${dep}%20%C3%A0%20${destinationClean}`;

    if (flightBtn) flightBtn.href = flightUrl;
    if (resFlight) resFlight.href = flightUrl;

    if (resBooking) {
        let url = `https://www.booking.com/searchresults.fr.html?ss=${destinationClean}`;
        if (checkIn && checkOut) url += `&checkin=${checkIn}&checkout=${checkOut}`;
        resBooking.href = url;
    }
    if (resAirbnb) {
        let url = `https://www.airbnb.fr/s/${destinationClean}/homes`;
        if (checkIn && checkOut) url += `?checkin=${checkIn}&checkout=${checkOut}`;
        resAirbnb.href = url;
    }
    if (resCar) {
        resCar.href = `https://www.kayak.fr/cars/${destinationClean}/${checkIn}/${checkOut}`;
    }

    const renderBookingNotes = () => {
        const listContainer = document.getElementById('booking-notes-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        if (!activeTrip.bookingNotes || activeTrip.bookingNotes.length === 0) {
            listContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Aucune note ou référence de réservation enregistrée.</span>`;
            return;
        }

        activeTrip.bookingNotes.forEach(note => {
            const item = document.createElement('div');
            item.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 0.6rem 0.8rem; border-radius: 4px; border: 1px solid rgba(212,175,55,0.1); font-size: 0.85rem;`;
            
            let linkHTML = '';
            if (note.link) {
                linkHTML = `<a href="${note.link}" target="_blank" style="color: var(--color-gold); text-decoration: underline; margin-left: 10px; font-size: 0.8rem;">🔗 Ouvrir le lien</a>`;
            }

            item.innerHTML = `
                <div>
                    <strong style="color: var(--text-main);">${note.title}</strong>
                    ${linkHTML}
                </div>
                <button class="btn-delete-booking-note" data-id="${note.id}" style="background: none; border: none; color: var(--color-torii); cursor: pointer; font-size: 0.8rem;">✖</button>
            `;

            item.querySelector('.btn-delete-booking-note').addEventListener('click', async () => {
                activeTrip.bookingNotes = activeTrip.bookingNotes.filter(n => n.id !== note.id);
                await saveTrip();
                renderBookingNotes();
            });

            listContainer.appendChild(item);
        });
    };

    renderBookingNotes();

    const bookingNoteForm = document.getElementById('add-booking-note-form');
    if (bookingNoteForm) {
        bookingNoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('booking-title-input');
            const linkInput = document.getElementById('booking-link-input');

            if (titleInput && titleInput.value.trim()) {
                activeTrip.bookingNotes.push({
                    id: Date.now(),
                    title: titleInput.value.trim(),
                    link: linkInput ? linkInput.value.trim() : ''
                });
                await saveTrip();
                renderBookingNotes();
                titleInput.value = '';
                if (linkInput) linkInput.value = '';
            }
        });
    }

    initGoogleMap(destination, activeTrip.destinationLat, activeTrip.destinationLng);
    fetchAndRenderWeather(activeTrip.destinationLat, activeTrip.destinationLng, destination, activeTrip.dateStart, activeTrip.dateEnd);

    // Écouteur pour basculer le style de la carte Google Maps si on change de thème à la volée
    const themeToggleBtn = document.getElementById('global-theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            setTimeout(() => {
                const newTheme = document.body.getAttribute('data-theme') || 'dark';
                if (map && mapStyles[newTheme]) {
                    map.setOptions({ styles: mapStyles[newTheme] });
                }
            }, 50);
        });
    }

    // --- RENDU ITINÉRAIRE AVEC GLISSER-DÉPOSER & HORAIRES LIÉS AUX ÉTAPES ---
    const daysContainer = document.getElementById('itinerary-days-container');
    
    const renderItinerary = () => {
        if (!daysContainer) return;
        daysContainer.innerHTML = '';

        if (activeTrip.itinerary && activeTrip.itinerary.length > 0) {
            activeTrip.itinerary.forEach((day, dayIdx) => {
                const block = document.createElement('div');
                block.className = 'day-block-card';
                block.dataset.dayIdx = dayIdx;
                block.style.cssText = `
                    background-color: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1.2rem;
                    margin-bottom: 1.5rem;
                    transition: border-color 0.2s;
                `;

                block.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    block.style.borderColor = 'var(--color-gold)';
                });

                block.addEventListener('dragleave', () => {
                    block.style.borderColor = 'var(--border-color)';
                });

                block.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    block.style.borderColor = 'var(--border-color)';
                    
                    const sourceDayIdx = parseInt(e.dataTransfer.getData('text/sourceDay'));
                    const sourceStepIdx = parseInt(e.dataTransfer.getData('text/sourceStep'));
                    const targetDayIdx = dayIdx;

                    if (isNaN(sourceDayIdx) || isNaN(sourceStepIdx)) return;

                    const [movedStep] = activeTrip.itinerary[sourceDayIdx].steps.splice(sourceStepIdx, 1);
                    activeTrip.itinerary[targetDayIdx].steps.push(movedStep);

                    await saveTrip();
                    renderItinerary();
                });

                let stepsHTML = '';
                if (day.steps) {
                    day.steps.forEach((step, idx) => {
                        const loc = step.location || destination;
                        const actName = step.activity || step.title || step.name || 'Étape';
                        const timeStr = step.time || '--:--';

                        stepsHTML += `
                            <div class="step-item" draggable="true" data-day="${dayIdx}" data-idx="${idx}" style="display:flex; align-items:center; gap:1rem; margin-top:0.8rem; background:rgba(255,255,255,0.02); padding:0.8rem; border-radius:6px; border:1px solid var(--border-color); cursor:grab;">
                                <span style="color:var(--text-muted); font-size:1rem; cursor:grab;" title="Glisser pour déplacer">⠿</span>
                                <input type="time" class="step-time-input" data-day="${dayIdx}" data-idx="${idx}" value="${timeStr !== '--:--' ? timeStr : ''}" style="background:transparent; border:1px solid rgba(212,175,55,0.3); color:var(--color-gold); font-weight:bold; font-size:0.85rem; padding:0.2rem; border-radius:4px; cursor:pointer;" title="Modifier l'horaire">
                                <div style="flex: 1; cursor:pointer;" class="step-click-target">
                                    <div style="color:var(--text-main); font-weight:600;">${actName}</div>
                                    <div style="color:var(--text-muted); font-size:0.8rem;">📍 ${loc}</div>
                                </div>
                            </div>
                        `;

                        if (idx < day.steps.length - 1) {
                            stepsHTML += `
                                <div id="travel-info-${dayIdx}-${idx}" style="display: flex; align-items: center; gap: 6px; margin: 0.4rem 0 0.4rem 3.5rem; font-size: 0.75rem; color: var(--color-gold);">
                                    <span style="opacity: 0.7;">🚗 Calcul du trajet...</span>
                                </div>
                            `;
                        }
                    });
                }

                block.innerHTML = `
                    <div class="day-header" style="display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem; margin-bottom: 0.5rem;">
                        <span style="background:var(--color-torii); color:white; padding:0.2rem 0.6rem; border-radius:4px; font-weight:bold; font-size:0.85rem; cursor:pointer;" class="day-map-trigger">${day.day}</span>
                        <span style="color:var(--text-main); font-weight:500; cursor:pointer;" class="day-map-trigger">${day.dateText || ''}</span>
                        
                        <button class="btn-optimize-day" data-day-idx="${dayIdx}" style="background: rgba(212,175,55,0.1); border: 1px solid var(--color-gold); color: var(--color-gold); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer; margin-left: auto;" title="Réordonner logiquement les étapes">⚡ Optimiser</button>
                        
                        <span style="color:var(--color-gold); font-size:0.8rem; cursor:pointer;" class="day-map-trigger">📍 Carte</span>
                    </div>
                    <div style="margin-top: 0.5rem;">${stepsHTML}</div>
                `;

                block.querySelector('.btn-optimize-day').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const dIdx = parseInt(e.target.getAttribute('data-day-idx'));
                    await optimizeDayRoute(dIdx);
                });

                block.querySelectorAll('.step-time-input').forEach((timeInput) => {
                    timeInput.addEventListener('change', async (e) => {
                        const dIdx = parseInt(timeInput.getAttribute('data-day'));
                        const sIdx = parseInt(timeInput.getAttribute('data-idx'));
                        activeTrip.itinerary[dIdx].steps[sIdx].time = e.target.value;
                        await saveTrip();
                    });

                    timeInput.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                    });
                });

                block.querySelectorAll('.step-item').forEach((stepEl) => {
                    stepEl.addEventListener('dragstart', (e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData('text/sourceDay', stepEl.getAttribute('data-day'));
                        e.dataTransfer.setData('text/sourceStep', stepEl.getAttribute('data-idx'));
                        stepEl.style.opacity = '0.4';
                    });

                    stepEl.addEventListener('dragend', () => {
                        stepEl.style.opacity = '1';
                    });

                    stepEl.addEventListener('dragover', (e) => {
                        e.preventDefault();
                    });

                    stepEl.addEventListener('drop', async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        
                        const sourceDayIdx = parseInt(e.dataTransfer.getData('text/sourceDay'));
                        const sourceStepIdx = parseInt(e.dataTransfer.getData('text/sourceStep'));
                        const targetDayIdx = dayIdx;
                        const targetStepIdx = parseInt(stepEl.getAttribute('data-idx'));

                        if (isNaN(sourceDayIdx) || isNaN(sourceStepIdx) || isNaN(targetStepIdx)) return;

                        const [movedStep] = activeTrip.itinerary[sourceDayIdx].steps.splice(sourceStepIdx, 1);
                        activeTrip.itinerary[targetDayIdx].steps.splice(targetStepIdx, 0, movedStep);

                        await saveTrip();
                        renderItinerary();
                    });

                    stepEl.querySelector('.step-click-target').addEventListener('click', (e) => {
                        e.stopPropagation();
                        document.querySelectorAll('.step-item').forEach(s => s.style.borderColor = 'var(--border-color)');
                        stepEl.style.borderColor = 'var(--color-gold)';

                        const stepIndex = parseInt(stepEl.getAttribute('data-idx'));
                        const stepData = day.steps[stepIndex];
                        
                        if (window.innerWidth < 992) {
                            const mapTabBtn = document.querySelector('.tab-btn[data-tab="tab-map"]');
                            if (mapTabBtn) mapTabBtn.click();
                        }

                        setTimeout(() => {
                            if (map) google.maps.event.trigger(map, 'resize');
                            selectActivityOnMap(stepData, stepData ? stepData.location : destination, destination);
                        }, 100);
                    });
                });

                block.querySelectorAll('.day-map-trigger').forEach(trigger => {
                    trigger.addEventListener('click', () => {
                        if (window.innerWidth < 992) {
                            const mapTabBtn = document.querySelector('.tab-btn[data-tab="tab-map"]');
                            if (mapTabBtn) mapTabBtn.click();
                        }

                        setTimeout(() => {
                            if (map) google.maps.event.trigger(map, 'resize');
                            displayDayOnMap(day.steps, destination);
                        }, 100);
                    });
                });

                daysContainer.appendChild(block);
            });

            calculateTravelTimesForTrip(activeTrip.itinerary, destination);
        }
    };

    renderItinerary();

    // --- RENDU DÉPENSES ---
    const renderExpenses = () => {
        const listEl = document.getElementById('expenses-list');
        const totalSpentEl = document.getElementById('expenses-total-spent');
        const targetBudgetEl = document.getElementById('expenses-target-budget');
        const progressBar = document.getElementById('expenses-progress-bar');

        if (!listEl) return;

        const targetBudget = parseFloat(activeTrip.budget) || totalB;
        let totalSpent = 0;

        listEl.innerHTML = '';

        if (activeTrip.expenses.length === 0) {
            listEl.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Aucune dépense enregistrée.</span>`;
        } else {
            activeTrip.expenses.forEach(expense => {
                totalSpent += parseFloat(expense.amount) || 0;

                const row = document.createElement('div');
                row.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 0.4rem 0.6rem; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.82rem;`;

                row.innerHTML = `
                    <span style="color: var(--text-main); font-weight: 500;">${expense.title}</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <strong style="color: var(--color-gold);">${parseFloat(expense.amount).toFixed(2)} €</strong>
                        <button class="btn-delete-expense" data-id="${expense.id}" style="background: none; border: none; color: var(--color-torii); cursor: pointer; font-size: 0.75rem; opacity: 0.7;">✖</button>
                    </div>
                `;

                row.querySelector('.btn-delete-expense').addEventListener('click', async () => {
                    activeTrip.expenses = activeTrip.expenses.filter(e => String(e.id) !== String(expense.id));
                    await saveTrip();
                    renderExpenses();
                });

                listEl.appendChild(row);
            });
        }

        if (totalSpentEl) totalSpentEl.textContent = `${totalSpent.toFixed(2)} €`;
        if (targetBudgetEl) targetBudgetEl.textContent = `${targetBudget} €`;

        if (progressBar) {
            const percentage = Math.min(100, Math.round((totalSpent / targetBudget) * 100));
            progressBar.style.width = `${percentage}%`;
            progressBar.style.background = totalSpent > targetBudget ? '#A63A2B' : '#D4AF37';
        }
    };

    renderExpenses();

    const expenseForm = document.getElementById('add-expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('expense-title-input');
            const amountInput = document.getElementById('expense-amount-input');

            if (titleInput && amountInput && titleInput.value.trim() && amountInput.value) {
                activeTrip.expenses.push({
                    id: Date.now(),
                    title: titleInput.value.trim(),
                    amount: parseFloat(amountInput.value)
                });
                await saveTrip();
                renderExpenses();

                titleInput.value = '';
                amountInput.value = '';
            }
        });
    }

    // ==========================================
    // --- MODULE DÉPENSES PARTAGÉES (TRICOUNT) ---
    // ==========================================
    let currentParticipants = [];
    let currentSharedExpenses = [];
    const tripId = activeTrip.id;

    async function initTricountModule() {
        if (!tripId) return;
        await loadParticipants();
        await loadSharedExpenses();

        const addPartForm = document.getElementById('add-participant-form');
        if (addPartForm) {
            addPartForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('participant-name-input');
                const name = nameInput.value.trim();
                if (!name) return;

                const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
                if (!client) return;

                const { error } = await client.from('trip_participants').insert([{ trip_id: tripId, name }]);
                
                if (!error) {
                    nameInput.value = '';
                    await loadParticipants();
                } else {
                    console.error("Erreur ajout participant:", error);
                }
            });
        }

        const addSharedForm = document.getElementById('add-shared-expense-form');
        if (addSharedForm) {
            addSharedForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const title = document.getElementById('shared-title-input').value.trim();
                const amount = parseFloat(document.getElementById('shared-amount-input').value);
                const paid_by = document.getElementById('shared-paidby-select').value;

                const checkedBoxes = document.querySelectorAll('input[name="expense-split-participant"]:checked');
                const selectedParticipantIds = Array.from(checkedBoxes).map(cb => cb.value);

                if (!title || isNaN(amount) || !paid_by) return;
                if (selectedParticipantIds.length === 0) {
                    alert("Veuillez sélectionner au moins une personne pour répartir la dépense.");
                    return;
                }

                const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
                if (!client) return;
                
                const { data: expenseData, error: expenseError } = await client
                    .from('trip_expenses')
                    .insert([{ trip_id: tripId, title, amount, paid_by }])
                    .select()
                    .single();

                if (expenseError) {
                    console.error("Erreur ajout dépense partagée:", expenseError);
                    return;
                }

                const splits = selectedParticipantIds.map(participantId => ({
                    expense_id: expenseData.id,
                    participant_id: participantId
                }));

                await client.from('trip_expense_splits').insert(splits);

                document.getElementById('shared-title-input').value = '';
                document.getElementById('shared-amount-input').value = '';
                document.querySelectorAll('input[name="expense-split-participant"]').forEach(cb => cb.checked = true);

                await loadSharedExpenses();
            });
        }
    }

    async function loadParticipants() {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;

        const { data, error } = await client
            .from('trip_participants')
            .select('*')
            .eq('trip_id', tripId);

        if (!error) {
            currentParticipants = data || [];
            renderParticipantsUI();
            updatePaidByDropdown();
            calculateSettlements();
        }
    }

    async function loadSharedExpenses() {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;

        const { data, error } = await client
            .from('trip_expenses')
            .select('*, trip_expense_splits(*)')
            .eq('trip_id', tripId);

        if (!error) {
            currentSharedExpenses = data || [];
            renderSharedExpensesUI();
            calculateSettlements();
        }
    }

    function renderParticipantsUI() {
        const container = document.getElementById('participants-tags');
        if (!container) return;

        if (currentParticipants.length === 0) {
            container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">Aucun participant enregistré.</span>';
            return;
        }

        container.innerHTML = currentParticipants.map(p => `
            <span style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--color-gold); color: var(--color-gold); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
                ${p.name}
                <span onclick="window.deleteParticipant('${p.id}')" style="cursor: pointer; font-weight: bold; margin-left: 2px;" title="Supprimer">&times;</span>
            </span>
        `).join('');
    }

    function updatePaidByDropdown() {
        const select = document.getElementById('shared-paidby-select');
        if (!select) return;

        select.innerHTML = '<option value="">Payé par...</option>' + currentParticipants.map(p => `
            <option value="${p.id}">${p.name}</option>
        `).join('');

        const checkboxesContainer = document.getElementById('shared-splits-checkboxes');
        if (checkboxesContainer) {
            if (currentParticipants.length === 0) {
                checkboxesContainer.innerHTML = '<span style="color: var(--text-muted); font-style: italic;">Ajoutez des participants d\'abord.</span>';
                return;
            }
            checkboxesContainer.innerHTML = currentParticipants.map(p => `
                <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
                    <input type="checkbox" name="expense-split-participant" value="${p.id}" checked style="accent-color: var(--color-gold);">
                    ${p.name}
                </label>
            `).join('');
        }
    }

    function renderSharedExpensesUI() {
        const container = document.getElementById('shared-expenses-list');
        if (!container) return;

        if (currentSharedExpenses.length === 0) {
            container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">Aucune dépense partagée enregistrée.</span>';
            return;
        }

        container.innerHTML = currentSharedExpenses.map(exp => {
            const payer = currentParticipants.find(p => p.id === exp.paid_by);
            const payerName = payer ? payer.name : 'Inconnu';
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-dark); padding: 0.5rem 0.8rem; border-radius: 4px; font-size: 0.85rem; border: 1px solid var(--border-color);">
                    <div>
                        <strong style="color: var(--text-main);">${exp.title}</strong>
                        <div style="color: var(--text-muted); font-size: 0.75rem;">Payé par ${payerName}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--color-gold); font-weight: 600;">${Number(exp.amount).toFixed(2)} €</span>
                        <button onclick="window.deleteSharedExpense('${exp.id}')" style="background: none; border: none; color: var(--color-torii); cursor: pointer; font-size: 0.9rem;" title="Supprimer">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function calculateSettlements() {
        const resultsContainer = document.getElementById('settlement-results');
        if (!resultsContainer) return;

        if (currentParticipants.length === 0 || currentSharedExpenses.length === 0) {
            resultsContainer.innerHTML = '<span style="color: var(--text-muted);">Ajoutez des participants et des dépenses pour calculer les remboursements.</span>';
            return;
        }

        const balances = {};
        currentParticipants.forEach(p => balances[p.id] = { name: p.name, net: 0 });

        currentSharedExpenses.forEach(exp => {
            const amount = Number(exp.amount);
            const splits = exp.trip_expense_splits || [];
            if (splits.length === 0) return;

            const sharePerPerson = amount / splits.length;

            if (balances[exp.paid_by]) {
                balances[exp.paid_by].net += amount;
            }

            splits.forEach(split => {
                if (balances[split.participant_id]) {
                    balances[split.participant_id].net -= sharePerPerson;
                }
            });
        });

        let debtors = [];
        let creditors = [];

        Object.keys(balances).forEach(id => {
            const b = balances[id];
            if (b.net < -0.01) debtors.push({ id, name: b.name, amount: -b.net, originalId: id });
            else if (b.net > 0.01) creditors.push({ id, name: b.name, amount: b.net, originalId: id });
        });

        let transactions = [];
        let dIndex = 0;
        let cIndex = 0;

        while (dIndex < debtors.length && cIndex < creditors.length) {
            let debtor = debtors[dIndex];
            let creditor = creditors[cIndex];

            let paidAmount = Math.min(debtor.amount, creditor.amount);
            
            transactions.push(`
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 0.4rem 0.6rem; border-radius: 4px; margin-bottom: 0.3rem; border: 1px solid var(--border-color);">
                    <span>${debtor.name} doit <strong>${paidAmount.toFixed(2)} €</strong> à ${creditor.name}</span>
                    <button onclick="window.settleDebt('${debtor.originalId}', '${creditor.originalId}', ${paidAmount}, '${debtor.name} rembourse ${creditor.name}')" style="background: var(--color-gold); color: var(--bg-dark); border: none; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.75rem;">Régler</button>
                </div>
            `);

            debtor.amount -= paidAmount;
            creditor.amount -= paidAmount;

            if (debtor.amount < 0.01) dIndex++;
            if (creditor.amount < 0.01) cIndex++;
        }

        if (transactions.length === 0) {
            resultsContainer.innerHTML = '<span style="color: #4ade80;">✨ Tout le monde est quittes, les comptes sont à l\'équilibre !</span>';
        } else {
            resultsContainer.innerHTML = transactions.join('');
        }
    }

    window.settleDebt = async function(debtorId, creditorId, amount, title) {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;

        const { data: expenseData, error: expenseError } = await client
            .from('trip_expenses')
            .insert([{ trip_id: tripId, title: title, amount: amount, paid_by: debtorId }])
            .select()
            .single();

        if (expenseError) {
            console.error("Erreur lors du règlement de la dette:", expenseError);
            return;
        }

        await client.from('trip_expense_splits').insert([{
            expense_id: expenseData.id,
            participant_id: creditorId
        }]);

        await loadSharedExpenses();
    };

    window.deleteParticipant = async function(id) {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;
        await client.from('trip_participants').delete().eq('id', id);
        await loadParticipants();
    };

    window.deleteSharedExpense = async function(id) {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;
        await client.from('trip_expenses').delete().eq('id', id);
        await loadSharedExpenses();
    };

    initTricountModule();

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

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const mapCardBox = document.querySelector('.map-card');
    const itineraryMapCol = document.querySelector('.itinerary-map-col');
    const tabMapContainer = document.getElementById('tab-map');

    const handleResponsiveMapPlacement = () => {
        if (!mapCardBox) return;

        if (window.innerWidth < 992) {
            if (tabMapContainer && !tabMapContainer.contains(mapCardBox)) {
                tabMapContainer.appendChild(mapCardBox);
            }
        } else {
            if (itineraryMapCol && !itineraryMapCol.contains(mapCardBox)) {
                itineraryMapCol.appendChild(mapCardBox);
            }
        }
    };

    handleResponsiveMapPlacement();
    window.addEventListener('resize', handleResponsiveMapPlacement);

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTabId = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === targetTabId) {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });

            if ((targetTabId === 'tab-map' || targetTabId === 'tab-itinerary') && map) {
                setTimeout(() => {
                    google.maps.event.trigger(map, 'resize');
                }, 100);
            }
        });
    });

    const exportBtn = document.getElementById('btn-export-pdf');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (typeof html2pdf === 'undefined') {
                alert("La bibliothèque d'exportation PDF est en cours de chargement.");
                return;
            }

            tabContents.forEach(el => el.style.display = 'block');

            const elementsToHide = document.querySelectorAll('header, .edit-modal, #btn-open-edit, #btn-export-pdf, .checklist-form, .btn-delete-task, #btn-google-flights, #add-expense-form, .btn-delete-expense, .trip-nav-tabs');
            elementsToHide.forEach(el => el.style.display = 'none');

            const element = document.querySelector('main.container');
            const fileName = `Kaido_Itineraire_${(activeTrip.destination || 'Voyage').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

            const opt = {
                margin:       [0.4, 0.4, 0.4, 0.4],
                filename:     fileName,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            const originalText = exportBtn.textContent;
            exportBtn.textContent = "⏳ Génération...";

            html2pdf().set(opt).from(element).save().then(() => {
                elementsToHide.forEach(el => el.style.display = '');
                const activeBtn = document.querySelector('.tab-btn.active');
                if (activeBtn) activeBtn.click();
                exportBtn.textContent = originalText;
            }).catch(err => {
                console.error("Erreur lors de la génération du PDF :", err);
                elementsToHide.forEach(el => el.style.display = '');
                const activeBtn = document.querySelector('.tab-btn.active');
                if (activeBtn) activeBtn.click();
                exportBtn.textContent = originalText;
            });
        });
    }
});
