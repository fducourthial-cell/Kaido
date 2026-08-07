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

    // Bouton Exporter PDF (Mode Rouleau Ancien)
    const exportPdfBtn = document.getElementById('btn-export-pdf');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Bouton Clôturer l'aventure
    const completeBtn = document.getElementById('btn-complete-trip');
    if (completeBtn) {
        completeBtn.addEventListener('click', async () => {
            if (!window.activeTrip) return;
            window.activeTrip.status = 'completed';
            window.activeTrip.final_rank = window.activeTrip.final_rank || 'A';
            await window.saveTrip();
            alert("🎉 Félicitations ! Cette aventure est désormais officiellement bouclée et enregistrée dans votre Registre Kiroku.");
            window.location.href = "index.html";
        });
    }

    // --- GESTION DE LA MODALE "MODIFIER LE VOYAGE" ---
    const btnOpenEdit = document.getElementById('btn-open-edit');
    const btnCloseEdit = document.getElementById('btn-close-edit');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('edit-trip-form');

    if (btnOpenEdit && editModal) {
        // 1. Ouvrir la modale et pré-remplir les champs avec les données actuelles
        btnOpenEdit.addEventListener('click', () => {
            document.getElementById('edit-date-start').value = window.activeTrip.dateStart || '';
            document.getElementById('edit-date-end').value = window.activeTrip.dateEnd || '';
            document.getElementById('edit-budget').value = window.activeTrip.budget || '';
            document.getElementById('edit-desc').value = window.activeTrip.desc || '';
            
            editModal.style.display = 'block'; 
        });

        // 2. Fermer la modale au clic sur "Annuler"
        if (btnCloseEdit) {
            btnCloseEdit.addEventListener('click', () => {
                editModal.style.display = 'none';
            });
        }

        // Optionnel : Fermer la modale en cliquant à l'extérieur du bloc blanc
        window.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.style.display = 'none';
            }
        });

        // 3. Sauvegarder les nouvelles informations
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // Empêche le rechargement de la page
                
                // On met à jour l'objet global avec les nouvelles valeurs
                window.activeTrip.dateStart = document.getElementById('edit-date-start').value;
                window.activeTrip.dateEnd = document.getElementById('edit-date-end').value;
                window.activeTrip.budget = document.getElementById('edit-budget').value;
                window.activeTrip.desc = document.getElementById('edit-desc').value;

                // On sauvegarde (Supabase + LocalStorage) via ta fonction globale
                await window.saveTrip();

                // On met à jour l'affichage en direct sur la page
                if (typeof formatTripDuration === 'function') {
                    const datesElement = document.getElementById('trip-main-dates');
                    if (datesElement) {
                        datesElement.textContent = `📅 ${formatTripDuration(window.activeTrip.dateStart, window.activeTrip.dateEnd)}`;
                    }
                }
                
                // Fermeture de la modale
                editModal.style.display = 'none';
            });
        }
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

   // 1. Nettoyage de la destination (ne garde que la ville)
    const destClean = encodeURIComponent(destination.split(',')[0].trim());

            // 2. Construction des URLs de base
    let bookingUrl = `https://www.booking.com/searchresults.fr.html?ss=${destClean}`;
    let airbnbUrl = `https://www.airbnb.fr/s/${destClean}/homes`;
    let kayakCarUrl = `https://www.kayak.fr/cars/${destClean}`;
    let flightsUrl = `https://www.google.com/travel/flights?q=Vols+vers+${destClean}`;
    let gygUrl = `https://www.getyourguide.fr/s?q=${destClean}`;

            // 3. Ajout dynamique des dates si elles existent (Format: YYYY-MM-DD)
    if (window.activeTrip && window.activeTrip.dateStart && window.activeTrip.dateEnd) {
        bookingUrl += `&checkin=${window.activeTrip.dateStart}&checkout=${window.activeTrip.dateEnd}`;
        airbnbUrl += `?checkin=${window.activeTrip.dateStart}&checkout=${window.activeTrip.dateEnd}`;
        gygUrl += `&date_from=${window.activeTrip.dateStart}&date_to=${window.activeTrip.dateEnd}`;
    }

            // 4. Ciblage optimisé (une seule requête DOM par bouton)
    const btnBooking = document.getElementById('res-btn-booking');
    const btnAirbnb = document.getElementById('res-btn-airbnb');
    const btnCar = document.getElementById('res-btn-car');
    const btnFlights = document.getElementById('res-btn-flights');
    const btnGyg = document.getElementById('res-btn-gyg');

            // 5. Attribution des liens
    if (btnBooking) btnBooking.href = bookingUrl;
    if (btnAirbnb) btnAirbnb.href = airbnbUrl;
    if (btnCar) btnCar.href = kayakCarUrl;
    if (btnFlights) btnFlights.href = flightsUrl;
    if (btnGyg) btnGyg.href = gygUrl;

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

    // 7. Rendu ITINÉRAIRE (Drag & Drop actif + Recherche Google sur le lieu uniquement)
    let draggedStep = null;

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
                        
                        // Recherche Google ciblée uniquement sur le lieu
                        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(loc)}`;

                        stepsHTML += `
                            <div class="step-item" draggable="true" data-day="${dayIdx}" data-idx="${idx}" style="display:flex; align-items:center; gap:1rem; margin-top:0.8rem; background:rgba(255,255,255,0.02); padding:0.8rem; border-radius:6px; border:1px solid var(--border-color); cursor:grab; opacity: ${isDone ? '0.5' : '1'};">
                                <span style="color:var(--text-muted); cursor:grab;">⠿</span>
                                <input type="checkbox" class="step-done-checkbox" data-day="${dayIdx}" data-idx="${idx}" ${isDone ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--color-gold); cursor:pointer;">
                                <div style="flex: 1; cursor:pointer;" class="step-click-target">
                                    <div style="color:var(--text-main); font-weight:600; text-decoration: ${isDone ? 'line-through' : 'none'};">${actName}</div>
                                    <div style="color:var(--text-muted); font-size:0.8rem;">📍 ${loc}</div>
                                </div>
                                <a href="${googleSearchUrl}" target="_blank" class="step-google-link" style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); width: 32px; height: 32px; border-radius: 50%; color: var(--color-gold); text-decoration: none; display: flex; align-items: center; justify-content: center;">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style="width: 16px; height: 16px;">
                                </a>
                            </div>`;
                    });
                }

               block.innerHTML = `
                    <div class="day-header" style="display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem; margin-bottom: 0.5rem;">
                        <!-- On remplace day.day par notre fonction de formatage -->
                        <span style="background:var(--color-torii); color:white; padding:0.2rem 0.6rem; border-radius:4px; font-weight:bold; font-size:0.85rem;" class="day-map-trigger">
                            ${day.dateText ? formatCardDate(day.dateText) : day.day}
                        </span>
                        
                        <span style="color:var(--color-gold); font-size:0.8rem; margin-left: auto; cursor:pointer;" class="day-map-trigger">🗺️ Parcours du jour</span>
                    </div>
                    <div style="margin-top: 0.5rem;" class="day-steps-container">${stepsHTML}</div>`;

                // --- ÉCOUTEURS DRAG & DROP ---
                block.querySelectorAll('.step-item').forEach(stepEl => {
                    stepEl.addEventListener('dragstart', (e) => {
                        draggedStep = {
                            dayIdx: parseInt(stepEl.getAttribute('data-day')),
                            idx: parseInt(stepEl.getAttribute('data-idx'))
                        };
                        e.dataTransfer.effectAllowed = 'move';
                        setTimeout(() => stepEl.style.opacity = '0.4', 0);
                    });

                    stepEl.addEventListener('dragend', () => {
                        stepEl.style.opacity = '1';
                        draggedStep = null;
                    });

                    stepEl.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    });

                    stepEl.addEventListener('drop', async (e) => {
                        e.preventDefault();
                        if (!draggedStep) return;

                        const targetDayIdx = parseInt(stepEl.getAttribute('data-day'));
                        const targetIdx = parseInt(stepEl.getAttribute('data-idx'));

                        if (draggedStep.dayIdx === targetDayIdx) {
                            const steps = window.activeTrip.itinerary[targetDayIdx].steps;
                            const [movedItem] = steps.splice(draggedStep.idx, 1);
                            steps.splice(targetIdx, 0, movedItem);

                            await window.saveTrip();
                            renderItinerary();
                        }
                    });
                });

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

    // 10. Rendu des Notes de Réservation Personnelles
    const renderBookingNotes = () => {
        const listEl = document.getElementById('booking-notes-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        
        if (!window.activeTrip.bookingNotes || window.activeTrip.bookingNotes.length === 0) {
            listEl.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Aucune note de réservation.</span>`;
            return;
        }

        window.activeTrip.bookingNotes.forEach(note => {
            const row = document.createElement('div');
            row.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 0.6rem; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.85rem;`;
            
            let linkHTML = note.link ? `<a href="${note.link}" target="_blank" style="color: var(--color-gold); text-decoration: none; margin-right: 10px; font-weight: bold;">🔗 Lien</a>` : '';
            
            row.innerHTML = `
                <span style="color: var(--text-main); font-weight: 500; flex: 1;">${note.title}</span>
                <div style="display: flex; align-items: center;">
                    ${linkHTML}
                    <button class="btn-delete-booking" data-id="${note.id}" style="background: none; border: none; color: var(--color-torii); cursor: pointer; font-size: 0.8rem; font-weight: bold;">✖</button>
                </div>
            `;
            
            row.querySelector('.btn-delete-booking').addEventListener('click', async () => { 
                window.activeTrip.bookingNotes = window.activeTrip.bookingNotes.filter(n => String(n.id) !== String(note.id)); 
                await window.saveTrip(); 
                renderBookingNotes(); 
            });
            
            listEl.appendChild(row);
        });
    };

    renderBookingNotes();

    const bookingForm = document.getElementById('add-booking-note-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const titleInput = document.getElementById('booking-title-input'); 
            const linkInput = document.getElementById('booking-link-input');
            
            if (titleInput && titleInput.value.trim()) { 
                if (!window.activeTrip.bookingNotes) window.activeTrip.bookingNotes = [];
                
                window.activeTrip.bookingNotes.push({ 
                    id: Date.now(), 
                    title: titleInput.value.trim(), 
                    link: linkInput ? linkInput.value.trim() : '' 
                }); 
                
                await window.saveTrip(); 
                renderBookingNotes(); 
                
                titleInput.value = ''; 
                if (linkInput) linkInput.value = ''; 
            }
        });
    }

    // 11. ✨ NOUVEAU : Rendu du Transfert Aéroport
    if (window.activeTrip.airportTransfer) {
        const transferBox = document.getElementById('airport-transfer-container');
        const t = window.activeTrip.airportTransfer;
        
        if (transferBox && t.lineNumber) {
            transferBox.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">${(t.transportType || '').toLowerCase().includes('train') ? '🚆' : '🚌'}</span>
                    <div>
                        <div style="color: var(--color-gold); font-weight: bold; font-size: 1rem;">${t.lineNumber}</div>
                        <div style="color: var(--text-main); font-size: 0.85rem;">${t.transportType}</div>
                    </div>
                </div>
                <div style="border-top: 1px dashed var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">
                    💵 Coût estimé : <strong style="color: var(--text-main);">${t.priceEst || 'Non précisé'}</strong>
                </div>
            `;
        }
    }

    // Option Bonus : Configurer le bouton Google Maps pour le mode "Transport en commun"
    const btnTransit = document.getElementById('btn-google-transit');
    if (btnTransit && window.activeTrip.destination) {
        // Crée une recherche Google Maps avec "Aéroport" comme point de départ vers la ville, en forçant le mode transport en commun (dirflg=r)
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=Aéroport+${encodeURIComponent(window.activeTrip.destination)}&destination=Centre+ville+${encodeURIComponent(window.activeTrip.destination)}&travelmode=transit`;
        btnTransit.href = mapsUrl;
    }
});
