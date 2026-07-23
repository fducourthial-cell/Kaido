document.addEventListener('DOMContentLoaded', async () => {
    let allTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
    let activeTrip = JSON.parse(localStorage.getItem('kaido_active_trip')) || JSON.parse(localStorage.getItem('currentTrip'));

    if (!activeTrip) {
        document.getElementById('trip-title').textContent = "Aucun voyage sélectionné";
        return;
    }

    // 1. Sauvegarde unifiée LocalStorage + Supabase Cloud
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

    const destination = activeTrip.destination || activeTrip.title || "Destination";

    // 2. Mise à jour de l'en-tête (Titre, Dates, Couverture)
    const titleEl = document.getElementById('trip-title');
    const datesEl = document.getElementById('trip-dates');
    const descEl = document.getElementById('trip-main-desc');
    const coverEl = document.getElementById('trip-cover');

    if (titleEl) titleEl.textContent = destination;
    if (datesEl) datesEl.textContent = `📅 ${activeTrip.dates || ''}`;
    if (descEl) descEl.textContent = activeTrip.desc || "Aucune note ajoutée pour ce voyage.";

    if (coverEl && activeTrip.image) {
        coverEl.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), url('${activeTrip.image}')`;
    }

    // 3. Budget
    const budgetValueEl = document.getElementById('budget-value');
    if (budgetValueEl) {
        let totalB = parseFloat(activeTrip.budget) || 0;
        budgetValueEl.textContent = `${totalB} €`;
    }

    // 4. Lien Google Flights
    const flightBtn = document.getElementById('btn-google-flights');
    if (flightBtn) {
        const dep = encodeURIComponent((activeTrip.departure || 'Paris').trim());
        const dest = encodeURIComponent(destination.split(',')[0].trim());
        flightBtn.href = `https://www.google.com/travel/flights?q=Vols%20de%20${dep}%20%C3%A0%20${dest}`;
    }

    // 5. Initialisation Google Maps
    const lat = activeTrip.destinationLat ? parseFloat(activeTrip.destinationLat) : null;
    const lng = activeTrip.destinationLng ? parseFloat(activeTrip.destinationLng) : null;

    if (typeof google !== 'undefined' && google.maps && !isNaN(lat) && !isNaN(lng)) {
        const mapEl = document.getElementById('map');
        if (mapEl) {
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
                title: destination
            });
        }
    }

    // 6. Rendu des jours et étapes d'itinéraire avec visionneuse interactive
    const daysContainer = document.getElementById('itinerary-days-container');
    const previewEl = document.getElementById('activity-preview');

    if (previewEl && activeTrip.image) {
        previewEl.innerHTML = `<img src="${activeTrip.image}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    if (daysContainer && activeTrip.itinerary) {
        daysContainer.innerHTML = '';
        activeTrip.itinerary.forEach((dayObj) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 1.5rem; margin-bottom: 1.5rem;';

            let stepsHTML = '';
            if (dayObj.steps && dayObj.steps.length > 0) {
                stepsHTML = dayObj.steps.map(step => {
                    let stepTitle = typeof step === 'string' ? step : (step.title || step.time || step.name || 'Étape');
                    let stepDesc = typeof step === 'object' ? (step.desc || step.description || '') : '';
                    let stepTime = (step.time && step.title) ? `<span style="color: var(--color-gold); font-weight: bold; margin-right: 8px;">${step.time}</span>` : '';
                    let stepImg = (typeof step === 'object' && step.image) ? step.image : (activeTrip.image || '');

                    return `
                        <div class="step-item" data-img="${stepImg}" style="margin-top: 1rem; padding-left: 1rem; border-left: 2px solid var(--color-gold); cursor: pointer;">
                            <h4 style="color: var(--text-main); font-size: 1rem; font-weight: 600;">${stepTime}${stepTitle}</h4>
                            ${stepDesc ? `<p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">${stepDesc}</p>` : ''}
                        </div>
                    `;
                }).join('');
            }

            dayCard.innerHTML = `
                <h3 style="font-family: 'Playfair Display', serif; color: var(--color-gold); font-size: 1.25rem; font-weight: 400; margin-bottom: 0.5rem;">
                    ${dayObj.day} - <span style="font-size: 0.9rem; color: var(--text-muted);">${dayObj.dateText || ''}</span>
                </h3>
                ${stepsHTML}
            `;

            daysContainer.appendChild(dayCard);
        });

        // Interactive image preview on activity click
        const steps = daysContainer.querySelectorAll('.step-item');
        steps.forEach(s => {
            s.addEventListener('click', () => {
                const img = s.getAttribute('data-img');
                if (previewEl && img) {
                    previewEl.innerHTML = `<img src="${img}" style="width:100%; height:100%; object-fit:cover;">`;
                }
            });
        });
    }

    // 7. Rendu et gestion de la Checklist Bagages
    const checklistList = document.getElementById('checklist-list');
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

    // Formulaire d'ajout de tâche à la checklist
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

    // Formulaire d'édition du voyage
    const editForm = document.getElementById('edit-trip-form');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            activeTrip.dateStart = document.getElementById('edit-date-start').value;
            activeTrip.dateEnd = document.getElementById('edit-date-end').value;
            activeTrip.dates = `${activeTrip.dateStart} au ${activeTrip.dateEnd}`;
            activeTrip.budget = document.getElementById('edit-budget').value;
            activeTrip.desc = document.getElementById('edit-desc').value;

            await saveTrip();
            location.reload();
        });
    }
});
