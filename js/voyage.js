// --- VARIABLES GLOBALES POUR LES SOUS-MODULES ---
window.activeTrip = null;
window.allTrips = [];
window.saveTrip = async function() {
    const idx = window.allTrips.findIndex(t => String(t.id) === String(window.activeTrip.id));
    if (idx !== -1) window.allTrips[idx] = window.activeTrip;
    localStorage.setItem('kaido_trips', JSON.stringify(window.allTrips));
    localStorage.setItem('kaido_active_trip', JSON.stringify(window.activeTrip));

    if (typeof supabase !== 'undefined') {
        try {
            const { error: updateError } = await supabase.from('trips').update({
                date_start: window.activeTrip.dateStart,
                date_end: window.activeTrip.dateEnd,
                budget: window.activeTrip.budget,
                desc_text: window.activeTrip.desc,
                checklist: window.activeTrip.checklist,
                itinerary: window.activeTrip.itinerary,
                expenses: window.activeTrip.expenses || [],
                booking_notes: window.activeTrip.bookingNotes || [],
                documents: window.activeTrip.documents || [],
                gallery: window.activeTrip.gallery || []
            }).eq('id', window.activeTrip.id);

            if (updateError) {
                console.error("❌ Erreur Supabase lors de la sauvegarde :", updateError.message);
            } else {
                console.log("✅ Sauvegarde Supabase réussie pour la galerie !");
            }
        } catch (e) { 
            console.warn("⚠️ Exception attrapée pendant la sauvegarde Supabase:", e); 
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialisation du voyage actif
    window.activeTrip = JSON.parse(localStorage.getItem('kaido_active_trip')) || JSON.parse(localStorage.getItem('currentTrip'));
    window.allTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];

    if (!window.activeTrip) {
        alert("Aucun voyage sélectionné.");
        window.location.href = "index.html";
        return;
    }

    // Parsing sécurisé des données
    ['itinerary', 'checklist', 'expenses', 'budgetDetails', 'documents', 'gallery'].forEach(key => {
        if (typeof window.activeTrip[key] === 'string') {
            try { window.activeTrip[key] = JSON.parse(window.activeTrip[key]); } catch (e) { window.activeTrip[key] = key === 'budgetDetails' ? null : []; }
        }
    });
    if (!window.activeTrip.documents) window.activeTrip.documents = [];
    if (!window.activeTrip.expenses) window.activeTrip.expenses = [];
    if (!window.activeTrip.bookingNotes) window.activeTrip.bookingNotes = [];
    if (!window.activeTrip.gallery) window.activeTrip.gallery = []; 
    if (!window.activeTrip.checklist) window.activeTrip.checklist = [
        { id: 1, text: "Passeport / Carte d'identité", done: false },
        { id: 2, text: "Billets de réservation", done: false }
    ];

    // 2. Lancement des sous-modules
    if (typeof initTricountModule === 'function') initTricountModule(window.activeTrip.id);
    if (typeof initDocumentsModule === 'function') initDocumentsModule();
    if (typeof initGalleryModule === 'function') initGalleryModule();

    // 3. Bouton Partager
    const shareBtn = document.getElementById('btn-share-trip');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (!window.activeTrip || !window.activeTrip.id) return alert("Erreur : Impossible d'identifier ce voyage.");
            try {
                const { data: tripData, error: fetchError } = await supabase.from('trips').select('share_token').eq('id', window.activeTrip.id).single();
                if (fetchError) throw fetchError;

                let token = tripData.share_token;
                if (!token) {
                    token = crypto.randomUUID();
                    const { error: updateError } = await supabase.from('trips').update({ share_token: token }).eq('id', window.activeTrip.id);
                    if (updateError) throw updateError;
                }

                const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
                await navigator.clipboard.writeText(`${baseUrl}/voyage-public.html?token=${token}`);

                const originalText = shareBtn.textContent;
                shareBtn.textContent = "✅ Lien copié !"; shareBtn.style.color = "#2ecc71";
                setTimeout(() => { shareBtn.textContent = originalText; shareBtn.style.color = "var(--color-gold)"; }, 3000);
            } catch (err) { alert("Une erreur est survenue lors de la création du lien de partage."); }
        });
    }
    // Bouton Clôturer l'aventure
    const completeBtn = document.getElementById('btn-complete-trip');
    if (completeBtn) {
        completeBtn.addEventListener('click', async () => {
            if (!window.activeTrip) return;
            window.activeTrip.status = 'completed';
            window.activeTrip.final_rank = window.activeTrip.final_rank || 'A'; // Attribue un rang par défaut si non défini
            await window.saveTrip();
            alert("🎉 Félicitations ! Cette aventure est désormais officiellement bouclée et enregistrée dans votre Registre Kiroku.");
            window.location.href = "index.html";
        });
    }

    // 4. Remplissage des données d'en-tête et Budget
    const destination = window.activeTrip.destination || window.activeTrip.title || "Destination";
    if (document.getElementById('trip-main-title')) document.getElementById('trip-main-title').textContent = destination;
    if (document.getElementById('trip-main-dates')) document.getElementById('trip-main-dates').textContent = `📅 ${window.activeTrip.dates || ''}`;
    if (document.getElementById('trip-main-desc')) document.getElementById('trip-main-desc').textContent = window.activeTrip.desc || "Aucune note ajoutée pour ce voyage.";
    if (document.getElementById('trip-cover-img') && window.activeTrip.image) document.getElementById('trip-cover-img').src = window.activeTrip.image;

    let totalB = parseFloat(window.activeTrip.budget) || ((window.activeTrip.itinerary?.length || 3) * 150 + 200);
    const flights = window.activeTrip.budgetDetails ? window.activeTrip.budgetDetails.flights : Math.round(totalB * 0.30);
    const hotel = window.activeTrip.budgetDetails ? window.activeTrip.budgetDetails.hotel : Math.round(totalB * 0.40);
    const rest = window.activeTrip.budgetDetails ? window.activeTrip.budgetDetails.rest : (totalB - (flights + hotel));

    if (document.getElementById('trip-budget-total')) document.getElementById('trip-budget-total').textContent = `${totalB} €`;
    if (document.getElementById('budget-flights')) document.getElementById('budget-flights').textContent = `${flights} €`;
    if (document.getElementById('budget-hotel')) document.getElementById('budget-hotel').textContent = `${hotel} €`;
    if (document.getElementById('budget-rest')) document.getElementById('budget-rest').textContent = `${rest} €`;

    // Liens de Réservation dynamiques
    const destClean = encodeURIComponent(destination.split(',')[0].trim());
    if (document.getElementById('res-btn-booking')) document.getElementById('res-btn-booking').href = `https://www.booking.com/searchresults.fr.html?ss=${destClean}`;
    if (document.getElementById('res-btn-airbnb')) document.getElementById('res-btn-airbnb').href = `https://www.airbnb.fr/s/${destClean}/homes`;
    if (document.getElementById('res-btn-car')) document.getElementById('res-btn-car').href = `https://www.kayak.fr/cars/${destClean}`;

    // 5. Appels APIs externes (Cartes et Météo)
    if (typeof initGoogleMap === 'function') initGoogleMap(destination, window.activeTrip.destinationLat, window.activeTrip.destinationLng);
    if (typeof fetchAndRenderWeather === 'function') fetchAndRenderWeather(window.activeTrip.destinationLat, window.activeTrip.destinationLng, destination, window.activeTrip.dateStart, window.activeTrip.dateEnd);

    // 6. Navigation par onglets (Tabs)
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTabId = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('active')); btn.classList.add('active');
            tabContents.forEach(content => { content.style.display = content.id === targetTabId ? 'block' : 'none'; });
            if ((targetTabId === 'tab-map' || targetTabId === 'tab-itinerary') && typeof map !== 'undefined') {
                setTimeout(() => google.maps.event.trigger(map, 'resize'), 100);
            }
        });
    });

    // 7. Rendu ITINÉRAIRE
    const renderItinerary = () => {
        const daysContainer = document.getElementById('itinerary-days-container');
        if (!daysContainer) return;
        daysContainer.innerHTML = '';

        if (window.activeTrip.itinerary && window.activeTrip.itinerary.length > 0) {
            window.activeTrip.itinerary.forEach((day, dayIdx) => {
                const block = document.createElement('div');
                block.className = 'day-block-card'; block.dataset.dayIdx = dayIdx;
                block.style.cssText = `background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem;`;

                let stepsHTML = '';
                if (day.steps) {
                    day.steps.forEach((step, idx) => {
                        const loc = step.location || destination;
                        const actName = step.activity || step.title || step.name || 'Étape';
                        const isDone = step.done || false;
                        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${actName} ${loc}`)}`;

                        stepsHTML += `
                            <div class="step-item" draggable="true" data-day="${dayIdx}" data-idx="${idx}" style="display:flex; align-items:center; gap:1rem; margin-top:0.8rem; background:rgba(255,255,255,0.02); padding:0.8rem; border-radius:6px; border:1px solid var(--border-color); cursor:grab; opacity: ${isDone ? '0.5' : '1'};">
                                <span style="color:var(--text-muted);">⠿</span>
                                <input type="checkbox" class="step-done-checkbox" data-day="${dayIdx}" data-idx="${idx}" ${isDone ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--color-gold); cursor:pointer;">
                                <div style="flex: 1; cursor:pointer;" class="step-click-target">
                                    <div style="color:var(--text-main); font-weight:600; text-decoration: ${isDone ? 'line-through' : 'none'};">${actName}</div>
                                    <div style="color:var(--text-muted); font-size:0.8rem;">📍 ${loc}</div>
                                </div>
                                <a href="${googleSearchUrl}" target="_blank" class="step-google-link" style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); width: 32px; height: 32px; border-radius: 50%; color: var(--color-gold); text-decoration: none; display: flex; align-items: center; justify-content: center;">🌐</a>
                            </div>`;
                    });
                }

                block.innerHTML = `
                    <div class="day-header" style="display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem; margin-bottom: 0.5rem;">
                        <span style="background:var(--color-torii); color:white; padding:0.2rem 0.6rem; border-radius:4px; font-weight:bold; font-size:0.85rem;" class="day-map-trigger">${day.day}</span>
                        <span style="color:var(--text-main); font-weight:500;" class="day-map-trigger">${day.dateText || ''}</span>
                        <span style="color:var(--color-gold); font-size:0.8rem; margin-left: auto; cursor:pointer;" class="day-map-trigger">📍 Carte</span>
                    </div>
                    <div style="margin-top: 0.5rem;">${stepsHTML}</div>`;

                // Events Itinéraire (Checkbox & Map Select)
                block.querySelectorAll('.step-done-checkbox').forEach(cb => {
                    cb.addEventListener('change', async (e) => {
                        window.activeTrip.itinerary[cb.getAttribute('data-day')].steps[cb.getAttribute('data-idx')].done = e.target.checked;
                        await window.saveTrip(); renderItinerary();
                    });
                });
                block.querySelectorAll('.step-click-target').forEach((target, index) => {
                    target.addEventListener('click', () => {
                        const stepData = day.steps[index];
                        if (typeof selectActivityOnMap === 'function') selectActivityOnMap(stepData, stepData ? stepData.location : destination, destination);
                    });
                });
                block.querySelectorAll('.day-map-trigger').forEach(trigger => {
                    trigger.addEventListener('click', () => {
                        if (typeof displayDayOnMap === 'function') displayDayOnMap(day.steps, destination);
                    });
                });

                daysContainer.appendChild(block);
            });
        }
    };
    renderItinerary();

    // 8. Rendu Checklist Globale
    function renderChecklist() {
        const container = document.getElementById('checklist-container');
        if (!container) return;
        container.innerHTML = '';
        window.activeTrip.checklist.forEach(item => {
            const li = document.createElement('li');
            li.className = `checklist-item ${item.done ? 'completed' : ''}`;
            li.innerHTML = `<label><input type="checkbox" data-id="${item.id}" ${item.done ? 'checked' : ''}> <span>${item.text}</span></label>
                            <button class="btn-delete-task" data-id="${item.id}">✖</button>`;
            li.querySelector('input').addEventListener('change', async (e) => { item.done = e.target.checked; await window.saveTrip(); renderChecklist(); });
            li.querySelector('.btn-delete-task').addEventListener('click', async () => { window.activeTrip.checklist = window.activeTrip.checklist.filter(t => t.id !== item.id); await window.saveTrip(); renderChecklist(); });
            container.appendChild(li);
        });
    }
    renderChecklist();
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault(); const input = document.getElementById('new-task-input');
            if (input && input.value.trim()) { window.activeTrip.checklist.push({ id: Date.now(), text: input.value.trim(), done: false }); await window.saveTrip(); renderChecklist(); input.value = ''; }
        });
    }

    // 9. Rendu Dépenses Classiques & Gestion Jauge Budget Réel/Estimé
    const renderExpenses = () => {
        const listEl = document.getElementById('expenses-list');
        if (!listEl) return;
        let totalSpent = 0; listEl.innerHTML = '';
        if (window.activeTrip.expenses.length === 0) listEl.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Aucune dépense.</span>`;
        else {
            window.activeTrip.expenses.forEach(expense => {
                totalSpent += parseFloat(expense.amount) || 0;
                const row = document.createElement('div');
                row.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 0.4rem 0.6rem; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.82rem;`;
                row.innerHTML = `<span style="color: var(--text-main); font-weight: 500;">${expense.title}</span><div style="display: flex; align-items: center; gap: 8px;"><strong style="color: var(--color-gold);">${parseFloat(expense.amount).toFixed(2)} €</strong><button class="btn-delete-expense" data-id="${expense.id}" style="background: none; border: none; color: var(--color-torii); cursor: pointer; font-size: 0.75rem;">✖</button></div>`;
                row.querySelector('.btn-delete-expense').addEventListener('click', async () => { window.activeTrip.expenses = window.activeTrip.expenses.filter(e => String(e.id) !== String(expense.id)); await window.saveTrip(); renderExpenses(); });
                listEl.appendChild(row);
            });
        }

        const estimatedBudget = parseFloat(window.activeTrip.budget) || totalB;
        if (document.getElementById('expenses-total-spent')) document.getElementById('expenses-total-spent').textContent = `${totalSpent.toFixed(2)} €`;
        if (document.getElementById('expenses-target-budget')) document.getElementById('expenses-target-budget').textContent = `${estimatedBudget.toLocaleString()} €`;
        
        const progressBar = document.getElementById('expenses-progress-bar');
        const statusText = document.getElementById('budget-status-text');
        
        if (progressBar) {
            let percentage = estimatedBudget > 0 ? Math.round((totalSpent / estimatedBudget) * 100) : 0;
            progressBar.style.width = `${Math.min(percentage, 100)}%`;

            if (totalSpent > estimatedBudget && estimatedBudget > 0) {
                progressBar.style.backgroundColor = 'var(--color-torii)';
                if (statusText) {
                    statusText.textContent = `⚠️ Dépassement de ${(totalSpent - estimatedBudget).toFixed(2)} € !`;
                    statusText.style.color = 'var(--color-torii)';
                }
            } else {
                progressBar.style.backgroundColor = 'var(--color-gold)';
                if (statusText) {
                    statusText.textContent = `${percentage}% du budget consommé`;
                    statusText.style.color = 'var(--text-muted)';
                }
            }
        }
    };
    renderExpenses();
    const expenseForm = document.getElementById('add-expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault(); const title = document.getElementById('expense-title-input'); const amount = document.getElementById('expense-amount-input');
            if (title && amount && title.value.trim() && amount.value) { window.activeTrip.expenses.push({ id: Date.now(), title: title.value.trim(), amount: parseFloat(amount.value) }); await window.saveTrip(); renderExpenses(); title.value = ''; amount.value = ''; }
        });
    }
});
