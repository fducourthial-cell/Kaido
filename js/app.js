document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.dashboard-grid');
    
    if (grid) {
        // 1. Récupérer les voyages stockés
        const customTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];

        // 2. Générer le HTML pour chaque voyage créé par l'utilisateur
        customTrips.forEach(trip => {
            const card = document.createElement('article');
            card.className = 'trip-card';
            
            card.innerHTML = `
                <div class="trip-banner" style="background-image: url('${trip.image}');"></div>
                <div class="trip-details">
                    <h3>${trip.title}</h3>
                    <p class="trip-meta">📅 ${trip.dates}</p>
                    <p style="margin-bottom: 2rem; color: var(--text-muted);">${trip.desc}</p>
                    <a href="voyage.html" class="btn" style="width: 100%; text-align: center;">Ouvrir l'itinéraire</a>
                </div>
            `;
            
            // Insérer la nouvelle carte juste AVANT le bouton pointillé "Tracer une nouvelle route"
            grid.insertBefore(card, grid.lastElementChild);
        });
    }
});
