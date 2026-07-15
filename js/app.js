document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.dashboard-grid');
    
    // ==========================================================================
    // 1. AFFICHAGE & SUPPRESSION DES VOYAGES DYNAMIQUES
    // ==========================================================================
    if (grid) {
        const renderTrips = () => {
            // On nettoie les anciennes cartes dynamiques pour éviter les doublons au rafraîchissement
            const dynamicCards = grid.querySelectorAll('.dynamic-trip');
            dynamicCards.forEach(card => card.remove());

            // Récupération des voyages stockés dans le navigateur
            const customTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];

            // On cible la zone de création fixe pour insérer les voyages juste avant
            const createZone = grid.querySelector('.create-trip-zone');

            customTrips.forEach(trip => {
                const card = document.createElement('article');
                card.className = 'trip-card dynamic-trip'; // Classe repère pour le nettoyage
                
                // Reprise stricte de ton HTML fonctionnel + ajout du bouton poubelle inline
                card.innerHTML = `
                    <div class="trip-banner" style="background-image: url('${trip.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'}');"></div>
                    <div class="trip-details">
                        <div>
                            <h3>${trip.title || 'Mon Voyage'}</h3>
                            <p class="trip-meta">📅 ${trip.dates}</p>
                            ${trip.desc ? `<p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.95rem;">${trip.desc}</p>` : ''}
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                            <span style="color: #D4AF37; font-weight: bold; font-size: 1.1rem;">${trip.budget ? trip.budget : '0'} €</span>
                            
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <button class="btn-delete" data-id="${trip.id}" style="background: none; border: none; color: #A63A2B; cursor: pointer; font-size: 1.1rem; padding: 5px; transition: transform 0.2s;" title="Supprimer">🗑️</button>
                                <a href="voyage.html" class="btn-view" data-id="${trip.id}" style="color: #8E847A; text-decoration: none; font-size: 0.85rem; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase;">VOIR L'ITINÉRAIRE →</a>
                            </div>
                        </div>
                    </div>
                `;

                // Écouteur pour définir le voyage actif au clic sur le lien "Voir l'itinéraire"
                const viewLink = card.querySelector('.btn-view');
                if (viewLink) {
                    viewLink.addEventListener('click', () => {
                        localStorage.setItem('currentTrip', JSON.stringify(trip));
                        localStorage.setItem('kaido_active_trip', JSON.stringify(trip));
                    });
                }
                
                if (createZone) {
                    grid.insertBefore(card, createZone);
                } else {
                    grid.appendChild(card);
                }
            });

            // Réactivation des écouteurs de clics sur les boutons Supprimer
            const deleteButtons = grid.querySelectorAll('.btn-delete');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const tripId = parseInt(button.getAttribute('data-id'));
                    if (confirm("Êtes-vous sûr de vouloir supprimer cet itinéraire de Kaido ?")) {
                        deleteTrip(tripId);
                    }
                });
                
                // Petit effet au survol de la corbeille
                button.addEventListener('mouseenter', () => button.style.transform = 'scale(1.2)');
                button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');
            });
        };

        // Fonction de suppression d'un voyage du LocalStorage
        const deleteTrip = (id) => {
            let customTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
            customTrips = customTrips.filter(trip => trip.id !== id);
            localStorage.setItem('kaido_trips', JSON.stringify(customTrips));
            
            const activeTrip = JSON.parse(localStorage.getItem('kaido_active_trip'));
            if (activeTrip && activeTrip.id === id) {
                localStorage.removeItem('kaido_active_trip');
                localStorage.removeItem('currentTrip');
            }
            
            renderTrips();
        };

        renderTrips();
    }
});
