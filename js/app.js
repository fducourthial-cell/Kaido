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
                card.innerHTML = `
                    <div class="trip-banner" style="background-image: url('${trip.image || 'image/hero.jpg'}');"></div>
                    <div class="trip-details">
                        <div>
                            <h3>${trip.title}</h3>
                            <p class="trip-meta">📅 ${trip.dates}</p>
                            <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.95rem;">${trip.desc}</p>
                        </div>
                        <div style="display: flex; gap: 1rem; align-items: center; marginTop: auto;">
                            <a href="voyage.html" class="btn" style="flex: 1; text-align: center; padding: 0.6rem 1rem;">Ouvrir</a>
                            <button class="btn-delete" data-id="${trip.id}">Supprimer</button>
                        </div>
                    </div>
                `;
                
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
                    const tripId = parseInt(e.target.getAttribute('data-id'));
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
            renderTrips(); // Relance instantanément le rendu propre de l'écran
        };

        // Premier appel pour afficher les voyages existants au chargement de la page
        renderTrips();
    }
});
