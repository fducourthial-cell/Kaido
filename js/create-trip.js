document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    // CATALOGUE DES ITINÉRAIRES TYPES (Le moteur piochera dedans)
    const itineraryTemplates = {
        "ecosse": [
            {
                dayNum: 1,
                title: "Arrivée & Découverte d'Édimbourg",
                steps: [
                    { time: "09:30", type: "flight", label: "Atterrissage à Édimbourg (EDI)", meta: "Vol direct. Récupération des bagages." },
                    { time: "10:30", type: "car", label: "Prise en charge véhicule — Arnold Clark", meta: "Briefing conduite à gauche et vérification des distances." },
                    { time: "14:00", type: "visit", label: "Visite du Château d'Édimbourg", meta: "Forteresse médiévale dominant la skyline de la vieille ville." },
                    { time: "19:00", type: "hotel", label: "Check-in : Apex Grassmarket Hotel", meta: "🔑 Réservation Booking validée. Vue sur le château." }
                ]
            },
            {
                dayNum: 2,
                title: "En route vers les Highlands via Glencoe",
                steps: [
                    { time: "08:30", type: "car", label: "Départ d'Édimbourg", meta: "🚗 2h30 de route magique vers le grand nord." },
                    { time: "11:00", type: "visit", label: "Arrêt Randonnée dans la Vallée de Glencoe", meta: "📍 Arrêt photo et marche au milieu des montagnes volcaniques." },
                    { time: "15:30", type: "visit", label: "Château d'Eilean Donan", meta: "Le château le plus célèbre d'Écosse, entouré par les lochs." },
                    { time: "18:30", type: "hotel", label: "Arrivée à Portree (Île de Skye)", meta: "🔑 Nuit en cottage Airbnb traditionnel." }
                ]
            },
            {
                dayNum: 3,
                title: "Exploration sauvage de l'Île de Skye",
                steps: [
                    { time: "09:00", type: "visit", label: "Randonnée du Old Man of Storr", meta: "🥾 Prévoir des vêtements imperméables. Durée : 2h." },
                    { time: "14:00", type: "visit", label: "Points de vue de Quiraing & Kilt Rock", meta: "Falaises spectaculaires plongeant dans l'océan." },
                    { time: "18:00", type: "visit", label: "Dégustation à la Distillerie Talisker", meta: "Découverte de la fabrication du whisky insulaire." }
                ]
            }
        ],
        "japon": [
            {
                dayNum: 1,
                title: "Immersion dans le Tokyo Moderne",
                steps: [
                    { time: "10:00", type: "flight", label: "Arrivée à l'Aéroport de Tokyo Haneda (HND)", meta: "Passage de l'immigration et récupération du Pocket Wi-Fi." },
                    { time: "14:00", type: "visit", label: "Exploration de Shibuya & Shibuya Sky", meta: "Vue panoramique sur le carrefour le plus célèbre du monde." },
                    { time: "19:30", type: "hotel", label: "Check-in : Hotel Gracery Shinjuku", meta: "🔑 Quartier animé. Proche de la gare." }
                ]
            },
            {
                dayNum: 2,
                title: "Tradition et Spiritualité à Asakusa",
                steps: [
                    { time: "09:30", type: "visit", label: "Temple Senso-ji", meta: "Le plus vieux temple bouddhiste de Tokyo, entrée par la porte Kaminarimon." },
                    { time: "14:00", type: "visit", label: "Ascension de la Tokyo Skytree", meta: "Plus haute tour du Japon pour une vue imprenable sur le Mont Fuji par temps clair." }
                ]
            },
            {
                dayNum: 3,
                title: "Excursion à Kyoto en Shinkansen",
                steps: [
                    { time: "08:00", type: "car", label: "Départ en Train à Grande Vitesse Shinkansen", meta: "🚄 Voyage d'environ 2h15 avec le JR Pass." },
                    { time: "11:00", type: "visit", label: "Sanctuaire Fushimi Inari-Taisha", meta: "Marche sous les milliers de Torii rouges grimpant dans la montagne." }
                ]
            }
        ]
    };

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('trip-title').value;
            const origin = document.getElementById('trip-origin').value;
            const destinationQuery = title.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const dateStart = document.getElementById('date-start').value;
            const dateEnd = document.getElementById('date-end').value;
            const image = document.getElementById('trip-image').value || 'image/hero.jpg';
            const desc = document.getElementById('trip-desc').value;

            // Calcul de la durée exacte du voyage
            const start = new Date(dateStart);
            const end = new Date(dateEnd);
            const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

            const options = { day: 'numeric', month: 'short' };
            const dispStart = start.toLocaleDateString('fr-FR', options);
            const dispEnd = end.toLocaleDateString('fr-FR', options);

            // ANALYSE DE LA DESTINATION POUR LE MOTEUR
            let generatedItinerary = [];
            // On cherche si un mot-clé correspond à notre catalogue (ex: si le titre contient "Écosse")
            let detectedKey = Object.keys(itineraryTemplates).find(key => destinationQuery.includes(key));

            if (detectedKey) {
                // On récupère le modèle, et on l'adapte à la durée choisie par l'utilisateur
                const template = itineraryTemplates[detectedKey];
                generatedItinerary = template.filter(day => day.dayNum <= diffDays);
            }

        // CALCUL DES ESTIMATIONS FINANCIÈRES AUTOMATIQUES
            let costFlight = 0;
            let costHotelPerNight = 0;
            let costCarPerDay = 0;

            // Paramétrage des coûts selon la destination détectée
            if (detectedKey === "ecosse") {
                costFlight = 150;
                costHotelPerNight = 110;
                costCarPerDay = 45;
            } else if (detectedKey === "japon") {
                costFlight = 750;
                costHotelPerNight = 95;
                costCarPerDay = 60;
            } else {
                // Valeurs par défaut pour une autre destination
                costFlight = 200;
                costHotelPerNight = 80;
                costCarPerDay = 40;
            }

            // Calcul totaux
            const totalFlight = costFlight;
            const totalHotel = costHotelPerNight * (diffDays - 1); // Nuits = jours - 1
            const totalCar = costCarPerDay * diffDays;
            const totalGlobal = totalFlight + totalHotel + totalCar;

            // Création du package complet du voyage avec la section budget
         // Création du package complet du voyage
            const newTrip = {
                id: Date.now(),
                title: title,
                origin: origin, // 👈 AJOUTÉ ICI
                dates: `${dispStart} au ${dispEnd} • ${diffDays} jours`,
                dateStart: dateStart, // Sauvegarde la date brute pour Google Flights
                dateEnd: dateEnd,     // Sauvegarde la date brute pour Google Flights
                image: image,
                desc: desc || `Un magnifique itinéraire automatique tracé par Kaido.`,
                itinerary: generatedItinerary,
                budget: {
                    vols: totalFlight,
                    hotels: totalHotel,
                    voiture: totalCar,
                    total: totalGlobal
                }
            };

            // Sauvegarde dans le localStorage
            const existingTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
            existingTrips.push(newTrip);
            localStorage.setItem('kaido_trips', JSON.stringify(existingTrips));

            // Redirection immédiate vers la page d'accueil
            window.location.href = 'index.html';
        });
    }
});
