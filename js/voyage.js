let map;
let activeMarkers = []; // Tableau pour stocker tous les marqueurs affichés
let routePolyline = null; // Ligne reliant les activités du jour
let placesService = null;

// Initialisation de la carte basée en priorité sur les coordonnées GPS enregistrées
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
        routePolyline.setMap(null);
        routePolyline = null;
    }
}

// Affichage hybride de la journée : direct si lat/lng existent, fallback geocoder sinon
async function displayDayOnMap(steps, mainDestination) {
    clearMapOverlays();
    if (!steps || steps.length === 0 || !map) return;

    const bounds = new google.maps.LatLngBounds();
    const pathCoordinates = [];
    const geocoder = new google.maps.Geocoder();

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        let loc = null;

        // 1. Si on a déjà les coordonnées GPS
        if (step.lat && step.lng && !isNaN(step.lat) && !isNaN(step.lng)) {
            loc = { lat: parseFloat(step.lat), lng: parseFloat(step.lng) };
        } 
        // 2. Fallback par Géocodage si c'est un ancien voyage
        else {
            const query = step.location ? `${step.location}, ${mainDestination}` : `${step.activity || step.title}, ${mainDestination}`;
            await new Promise((resolve) => {
                geocoder.geocode({ address: query }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        loc = results[0].geometry.location;
                    }
                    resolve();
                });
            });
        }

        // Si la position est valide, création du marqueur
        if (loc) {
            bounds.extend(loc);
            pathCoordinates.push(loc);

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
                    scale: 13,
                    fillColor: "#D4AF37",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#FFFFFF"
                }
            });

            activeMarkers.push(marker);
        }
    }

    // Tracé de la ligne reliant les activités
    if (pathCoordinates.length > 1) {
        routePolyline = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: true,
            strokeColor: "#A63A2B", // Rouge Torii
            strokeOpacity: 0.9,
            strokeWeight: 4
        });
        routePolyline.setMap(map);
    }

    // Ajustement automatique du zoom et du centrage pour englober tout le trajet du jour
    if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        if (pathCoordinates.length === 1) {
            map.setZoom(14);
        }
    }
}

// Sélectionner une seule activité au clic individuel (avec aperçu image)
function selectActivityOnMap(step, addressQuery, mainDestination) {
    const actName = step ? (step.activity || step.title || 'Activité') : 'Activité';
    
    const previewBox = document.getElementById('activity-preview');
    const previewImg = document.getElementById('activity-img');
    const previewLoading = document.getElementById('activity-loading');
    const previewTitle = document.getElementById('activity-title');

    if (previewBox) previewBox.style.display = 'block';
    if (previewImg) previewImg.style.display = 'none';
    if (previewLoading) previewLoading.style.display = 'flex';
    if (previewTitle) previewTitle.textContent = `📍 ${actName}`;

    // Helper pour placer le marqueur
    const placeMarkerAt = (location) => {
        clearMapOverlays();
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: actName,
            animation: google.maps.Animation.DROP
        });
        activeMarkers.push(marker);
        map.panTo(location);
        map.setZoom(15);
    };

    // Placement du marqueur via lat/lng ou Geocoder de secours
    if (step && step.lat && step.lng && map) {
        placeMarkerAt({ lat: parseFloat(step.lat), lng: parseFloat(step.lng) });
    } else if (addressQuery && map) {
        const geocoder = new google.maps.Geocoder();
        const fullQuery = addressQuery.includes(mainDestination) ? addressQuery : `${addressQuery}, ${mainDestination}`;
        geocoder.geocode({ address: fullQuery }, (results, status) => {
            if (status === 'OK' && results[0]) {
                placeMarkerAt(results[0].geometry.location);
            }
        });
    }

    // Recherche de la photo d'illustration via Google Places
    if (placesService) {
        const query = `${actName}, ${addressQuery || mainDestination}`;
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

// --- FONCTION MÉTÉO (OPEN-METEO AVEC FALLBACK GÉOCODAGE AUTO & DATES DYNAMIQUES) ---
async function fetchAndRenderWeather(lat, lng, destinationName, startDate, endDate) {
    const container = document.getElementById('weather-container');
    const subtitle = document.getElementById('weather-subtitle');
    if (!container) return;

    // Géocodage de secours si pas de GPS enregistré
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
        0: '☀️ Ensoleillé',
        1: '🌤️ Peu nuageux',
        2: '⛅ Partiellement nuageux',
        3: '☁️ Couvert',
        45: '🌫️ Brouillard',
        51: '🌧️ Bruine légère',
        61: '🌧️ Pluie',
        71: '❄️ Neige',
        80: '🌦️ Averses',
        95: '🌩️ Orage'
    };

    try {
        let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

        // Vérification si les dates du voyage sont dans les 14 prochains jours
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
                item.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.02);
                    padding: 0.5rem 0.8rem;
                    border-radius: 6px;
                    border: 1px solid rgba(212, 175, 55, 0.1);
                    font-size: 0.85rem;
                `;

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

document.addEventListener('DOMContentLoaded', async () => {
    let activeTrip = JSON.parse(localStorage.getItem('kaido_active_trip')) || JSON.parse(localStorage.getItem('currentTrip'));
    const allTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];

    if (!activeTrip) {
        alert("Aucun voyage sélectionné.");
        window.location.href = "index.html";
        return;
    }

    // --- DÉCODAGE SYSTÉMATIQUE DE SUPABASE ---
    if (typeof activeTrip.itinerary === 'string') {
        try {
            activeTrip.itinerary = JSON.parse(activeTrip.itinerary);
        } catch (e) {
            console.error("Erreur de conversion de l'itinéraire :", e);
        }
    }

    if (typeof activeTrip.checklist === 'string') {
        try {
            activeTrip.checklist = JSON.parse(activeTrip.checklist);
        } catch (e) {
            console.error("Erreur de conversion de la checklist :", e);
        }
    }

    // DÉCODAGE DES DÉPENSES
    if (typeof activeTrip.expenses === 'string') {
        try {
            activeTrip.expenses = JSON.parse(activeTrip.expenses);
        } catch (e) {
            console.error("Erreur de conversion des dépenses :", e);
            activeTrip.expenses = [];
        }
    }

    if (!activeTrip.checklist) {
        activeTrip.checklist = [
            { id: 1, text: "Passeport / Carte d'identité", done: false },
            { id: 2, text: "Billets de réservation", done: false }
        ];
    }

    // INITIALISATION DU TABLEAU DE DÉPENSES S'IL EST VIDE
    if (!activeTrip.expenses) {
        activeTrip.expenses = [];
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
                    itinerary: activeTrip.itinerary,
                    expenses: activeTrip.expenses || []
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

    // Budget global estimé
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

    // Initialisation Carte & Météo
    initGoogleMap(destination, activeTrip.destinationLat, activeTrip.destinationLng);
    fetchAndRenderWeather(activeTrip.destinationLat, activeTrip.destinationLng, destination, activeTrip.dateStart, activeTrip.dateEnd);

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
                    day.steps.forEach((step, idx) => {
                        const loc = step.location || destination;
                        const actName = step.activity || step.title || step.name || 'Étape';
                        const timeStr = step.time || '--:--';

                        stepsHTML += `
                            <div class="step-item" data-idx="${idx}" style="display:flex; gap:1rem; margin-top:0.8rem; background:rgba(255,255,255,0.02); padding:0.8rem; border-radius:6px; border:1px solid transparent; cursor:pointer;">
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

                // CLIC SUR LA JOURNÉE
                block.querySelector('.day-header').addEventListener('click', () => {
                    displayDayOnMap(day.steps, destination);
                });

                // CLIC SUR UNE ACTIVITÉ
                block.querySelectorAll('.step-item').forEach((itemEl) => {
                    itemEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active-step'));
                        itemEl.classList.add('active-step');

                        const stepIndex = parseInt(itemEl.getAttribute('data-idx'));
                        const stepData = day.steps[stepIndex];
                        selectActivityOnMap(stepData, stepData ? stepData.location : destination, destination);
                    });
                });

                daysContainer.appendChild(block);
            });
        }
    }

    // --- RENDU SUIVI DES DÉPENSES RÉELLES ---
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
                row.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.02);
                    padding: 0.4rem 0.6rem;
                    border-radius: 4px;
                    border: 1px solid rgba(212, 175, 55, 0.1);
                    font-size: 0.82rem;
                `;

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

    // Formulaire d'ajout de dépense
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

    // --- EXPORT PDF ---
    const exportBtn = document.getElementById('btn-export-pdf');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (typeof html2pdf === 'undefined') {
                alert("La bibliothèque d'exportation PDF est en cours de chargement.");
                return;
            }

            const elementsToHide = document.querySelectorAll('header, .edit-modal, #btn-open-edit, #btn-export-pdf, .checklist-form, .btn-delete-task, #btn-google-flights, #add-expense-form, .btn-delete-expense');
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
                exportBtn.textContent = originalText;
            }).catch(err => {
                console.error("Erreur lors de la génération du PDF :", err);
                elementsToHide.forEach(el => el.style.display = '');
                exportBtn.textContent = originalText;
            });
        });
    }
});
