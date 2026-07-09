document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Empêche la page de se recharger bêtement

            // 1. Récupération des valeurs du formulaire
            const title = document.getElementById('trip-title').value;
            const dateStart = document.getElementById('date-start').value;
            const dateEnd = document.getElementById('date-end').value;
            const image = document.getElementById('trip-image').value || 'image/hero.jpg'; // Image par défaut si vide
            const desc = document.getElementById('trip-desc').value;

            // 2. Calculer le nombre de jours (rapide)
            const start = new Date(dateStart);
            const end = new Date(dateEnd);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            // 3. Formater les dates pour l'affichage (ex: 12 Mai)
            const options = { day: 'numeric', month: 'short' };
            const dispStart = start.toLocaleDateString('fr-FR', options);
            const dispEnd = end.toLocaleDateString('fr-FR', options);

            // 4. Créer l'objet Voyage
            const newTrip = {
                id: Date.now(), // Identifiant unique basé sur le temps
                title: title,
                dates: `${dispStart} au ${dispEnd} • ${diffDays} jours`,
                image: image,
                desc: desc || "Aucune description fournie."
            };

            // 5. Récupérer les voyages existants dans le localStorage, y ajouter le nouveau
            const existingTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
            existingTrips.push(newTrip);

            // 6. Sauvegarder le tout et rediriger vers l'accueil
            localStorage.setItem('kaido_trips', JSON.stringify(existingTrips));
            window.location.href = 'index.html';
        });
    }
});
