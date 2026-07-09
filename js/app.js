document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.dashboard-grid');
    
    // ==========================================
    // 1. AFFICHAGE & SUPPRESSION DES VOYAGES
    // ==========================================
    if (grid) {
        // Fonction pour charger et afficher les voyages
        const renderTrips = () => {
            // On supprime d'abord toutes les cartes existantes sauf la dernière (le slot pointillé)
            const cards = grid.querySelectorAll('.trip-card');
            cards.forEach(card => {
                if (!card.hasAttribute('style') || !card.style.border.includes('dashed')) {
                    card.remove();
                }
            });

            const customTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];

            customTrips.forEach(trip => {
                const card = document.createElement('article');
                card.className = 'trip-card';
                card.innerHTML = `
                    <div class="trip-banner" style="background-image: url('${trip.image}');"></div>
                    <div class="trip-details">
                        <h3>${trip.title}</h3>
                        <p class="trip-meta">📅 ${trip.dates}</p>
                        <p style="margin-bottom: 2rem; color: var(--text-muted);">${trip.desc}</p>
                        
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <a href="voyage.html" class="btn" style="flex: 1; text-align: center; padding: 0.6rem 1rem;">Ouvrir</a>
                            <button class="btn-delete" data-id="${trip.id}">Supprimer</button>
                        </div>
                    </div>
                `;
                grid.insertBefore(card, grid.lastElementChild);
            });

            // Écouter les clics sur les boutons Supprimer
            const deleteButtons = grid.querySelectorAll('.btn-delete');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const tripId = parseInt(e.target.getAttribute('data-id'));
                    
                    if (confirm("Êtes-vous sûr de vouloir supprimer cet itinéraire de Kaido ?")) {
                        deleteTrip(tripId);
                    }
                });
            });
        };

        // Fonction logique pour retirer le voyage du LocalStorage
        const deleteTrip = (id) => {
            let customTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
            // On filtre pour garder tous les voyages SAUF celui qu'on veut supprimer
            customTrips = customTrips.filter(trip => trip.id !== id);
            localStorage.setItem('kaido_trips', JSON.stringify(customTrips));
            
            // On rafraîchit l'affichage
            renderTrips();
        };

        // Premier lancement de l'affichage
        renderTrips();
    }

    // ==========================================
    // 2. MOTEUR DE RECHERCHE CONNECTÉ À GOOGLE PLACES
    // ==========================================
    if (searchInput) {
        // On initialise l'autocomplétion Google sur notre input
        // (types: ['(regions)'] permet de cibler les villes, régions et pays)
        const autocomplete = new google.maps.places.Autocomplete(searchInput, {
            types: ['(regions)']
        });

        // On écoute le moment où l'utilisateur clique sur une suggestion Google
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.name) return;

            // On extrait le nom de la destination (ex: "Écosse" ou "Paris")
            const destinationName = place.name.toLowerCase().trim()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            // RECHERCHE DANS NOTRE CATALOGUE DE MONUMENTS
            // Si la ville/pays sélectionné est dans notre catalogue (ecosse, japon, france...)
            if (destinationsData[destinationName]) {
                const data = destinationsData[destinationName];
                suggestionsTitle.innerHTML = `🏛️ Les 3 plus grands incontournables pour ${data.name}`;
                monumentsGrid.innerHTML = '';

                data.monuments.forEach(monument => {
                    const monCard = document.createElement('div');
                    monCard.className = 'trip-card';
                    monCard.innerHTML = `
                        <div class="trip-banner" style="background-image: url('${monument.img}'); height: 160px;"></div>
                        <div style="padding: 1.2rem;">
                            <h4 style="color: var(--primary-color); margin-bottom: 0.3rem;">${monument.title}</h4>
                            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.4;">${monument.desc}</p>
                        </div>
                    `;
                    monumentsGrid.appendChild(monCard);
                });

                suggestionsContainer.style.display = 'block';
            } else {
                // Si Google connaît l'endroit mais qu'on n'a pas encore écrit les 3 monuments dans notre code,
                // on affiche un joli message neutre ou on masque.
                suggestionsTitle.innerHTML = `🏛️ Cap sur ${place.name} ! (Monuments bientôt disponibles)`;
                monumentsGrid.innerHTML = '';
                suggestionsContainer.style.display = 'block';
            }
        });
    }
