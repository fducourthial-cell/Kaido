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
    // 2. MOTEUR DE RECHERCHE DE MONUMENTS
    // ==========================================
    const searchInput = document.getElementById('search-destination');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const suggestionsTitle = document.getElementById('suggestions-title');
    const monumentsGrid = document.getElementById('monuments-grid');

    const destinationsData = {
        "ecosse": {
            name: "l'Écosse",
            monuments: [
                { title: "Château d'Édimbourg", desc: "Forteresse historique dominant la skyline de la capitale.", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600&auto=format&fit=crop" },
                { title: "L'Île de Skye", desc: "Des paysages volcaniques à couper le souffle et des côtes sauvages.", img: "https://images.unsplash.com/photo-1529139574466-a3e97f0510f2?q=80&w=600&auto=format&fit=crop" },
                { title: "Le Viaduc de Glenfinnan", desc: "Le célèbre pont ferroviaire emprunté par le Jacobite Train.", img: "https://images.unsplash.com/photo-1505832018828-53a2004e8210?q=80&w=600&auto=format&fit=crop" }
            ]
        },
        "japon": {
            name: "le Japon 🇯🇵",
            monuments: [
                { title: "Le Mont Fuji", desc: "Le volcan majestueux et l'emblème spirituel du pays.", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop" },
                { title: "Temple Fushimi Inari-taisha", desc: "Le célèbre sanctuaire de Kyoto aux milliers de Torii rouges.", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop" },
                { title: "Le Pavillon d'Or (Kinkaku-ji)", desc: "Magnifique temple zen entièrement recouvert de feuilles d'or pure.", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600&auto=format&fit=crop" }
            ]
        },
        "france": {
            name: "la France 🇫🇷",
            monuments: [
                { title: "La Tour Eiffel", desc: "La dame de fer incontournable située au cœur de Paris.", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop" },
                { title: "Le Mont-Saint-Michel", desc: "Une abbaye spectaculaire perchée sur un îlot rocheux au milieu des marées.", img: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=600&auto=format&fit=crop" },
                { title: "Le Château de Versailles", desc: "Le chef-d'œuvre de l'art français et le palais du Roi Soleil.", img: "https://images.unsplash.com/photo-1585642879100-34863f6fbdfc?q=80&w=600&auto=format&fit=crop" }
            ]
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (destinationsData[query]) {
                const data = destinationsData[query];
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
                if (query.length === 0) {
                    suggestionsContainer.style.display = 'none';
                }
            }
        });
    }
});
