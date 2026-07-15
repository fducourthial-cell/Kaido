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
                
                // Agencement fidèle à tes cartes avec intégration du bouton de suppression discret
                card.innerHTML = `
                    <div class="trip-banner" style="background-image: url('${trip.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'}');"></div>
                    <div class="trip-details">
                        <div>
                            <h3>${trip.title || 'Mon Voyage'}</h3>
                            <p class="trip-meta">📅 ${trip.dates}</p>
                            ${trip.desc ? `<p style="margin-bottom: 1rem; color: #8E847A; font-size: 0.9rem;">${trip.desc}</p>` : ''}
                        </div>
                        
                        <div class="trip-footer">
                            <span class="trip-budget">${trip.budget ? trip.budget : '0'} €</span>
                            <div class="trip-actions">
                                <button class="btn-delete" data-id="${trip.id}" title="Supprimer ce voyage">🗑️</button>
                                <a href="voyage.html" class="btn-view" data-id="${trip.id}">VOIR L'ITINÉRAIRE →</a>
                            </div>
                        </div>
                    </div>
                `;

                // Gestionnaire de clic spécifique pour définir le voyage actif quand on clique sur "Voir l'itinéraire"
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

            // Réactivation des écouteurs de clics sur les nouveaux boutons Supprimer
            const deleteButtons = grid.querySelectorAll('.btn-delete');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Évite de déclencher d'autres liens
                    const tripId = parseInt(button.getAttribute('data-id'));
                    if (confirm("Êtes-vous sûr de vouloir supprimer cet itinéraire de Kaido ?")) {
                        deleteTrip(tripId);
                    }
                });
            });
        };

        // Fonction de suppression d'un voyage du LocalStorage
        const deleteTrip = (id) => {
            let customTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
            customTrips = customTrips.filter(trip => trip.id !== id);
            localStorage.setItem('kaido_trips', JSON.stringify(customTrips));
            
            // Nettoyage optionnel du voyage actif s'il vient d'être supprimé
            const activeTrip = JSON.parse(localStorage.getItem('kaido_active_trip'));
            if (activeTrip && activeTrip.id === id) {
                localStorage.removeItem('kaido_active_trip');
                localStorage.removeItem('currentTrip');
            }
            
            renderTrips(); // Relance instantanément le rendu propre de l'écran
        };

        // Premier appel pour afficher les voyages existants au chargement de la page
        renderTrips();
    }
});
