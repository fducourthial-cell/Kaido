document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.dashboard-grid');
    
    // ==========================================
    // 1. AFFICHAGE DES VOYAGES ENREGISTRÉS
    // ==========================================
    if (grid) {
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
                    <a href="voyage.html" class="btn" style="width: 100%; text-align: center;">Ouvrir l'itinéraire</a>
                </div>
            `;
            grid.insertBefore(card, grid.lastElementChild);
        });
    }

    // ==========================================
    // 2. MOTEUR DE RECHERCHE DE MONUMENTS
    // ==========================================
    const searchInput = document.getElementById('search-destination');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const suggestionsTitle = document.getElementById('suggestions-title');
    const monumentsGrid = document.getElementById('monuments-grid');

    // Base de données des monuments incontournables (Tu pourras l'agrandir !)
    const destinationsData = {
        "ecosse": {
            name: "l'Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿",
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
            // Nettoyer la saisie de l'utilisateur (minuscules, sans espaces superflus)
            const query = e.target.value.toLowerCase().trim()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Retire les accents de la recherche (ex: Écosse devient ecosse)

            if (destinationsData[query]) {
                const data = destinationsData[query];
                suggestionsTitle.innerHTML = `🏛️ Les 3 plus grands incontournables pour ${data.name}`;
                monumentsGrid.innerHTML = ''; // On vide les anciennes cartes

                // On génère les 3 cartes
                data.monuments.forEach(monument => {
                    const monCard = document.createElement('div');
                    monCard.className = 'trip-card'; // Réutilise le design premium existant
                    monCard.innerHTML = `
                        <div class="trip-banner" style="background-image: url('${monument.img}'); height: 160px;"></div>
                        <div style="padding: 1.2rem;">
                            <h4 style="color: var(--primary-color); margin-bottom: 0.3rem;">${monument.title}</h4>
                            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.4;">${monument.desc}</p>
                        </div>
                    `;
                    monumentsGrid.appendChild(monCard);
                });

                suggestionsContainer.style.display = 'block'; // On affiche la zone
            } else {
                // Si la recherche ne correspond pas ou est vide, on cache la zone
                if (query.length === 0) {
                    suggestionsContainer.style.display = 'none';
                }
            }
        });
    }
});
