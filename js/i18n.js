// Dictionnaire multilingue global de l'interface du site
const globalTranslations = {
    fr: {
        navTitle: "Mes futurs voyages",
        newRoute: "Tracer une nouvelle route",
        itinerary: "Itinéraire",
        budget: "Budget",
        info: "Infos",
        map: "Carte",
        reservations: "🛎️ Réservations & Liens",
        notesTitle: "Notes de voyage",
        pdfBtn: "📄 Exporter en PDF",
        editBtn: "⚙️ Modifier"
    },
    en: {
        navTitle: "My Future Trips",
        newRoute: "Chart a New Route",
        itinerary: "Itinerary",
        budget: "Budget",
        info: "Info",
        map: "Map",
        reservations: "🛎️ Bookings & Links",
        notesTitle: "Travel Notes",
        pdfBtn: "📄 Export to PDF",
        editBtn: "⚙️ Edit"
    },
    es: {
        navTitle: "Mis futuros viajes",
        newRoute: "Trazar una nueva ruta",
        itinerary: "Itinerario",
        budget: "Presupuesto",
        info: "Info",
        map: "Mapa",
        reservations: "🛎️ Reservas y Enlaces",
        notesTitle: "Notas de viaje",
        pdfBtn: "📄 Exportar a PDF",
        editBtn: "⚙️ Editar"
    }
};

// Fonction globale d'application de la langue
function applyGlobalLanguage(lang) {
    localStorage.setItem('kaido_global_lang', lang);

    // Met à jour la valeur du select si présent sur la page
    const selector = document.getElementById('global-lang-selector');
    if (selector) selector.value = lang;

    // Traduit tous les éléments portant l'attribut data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (globalTranslations[lang] && globalTranslations[lang][key]) {
            el.textContent = globalTranslations[lang][key];
        }
    });
}

// Initialisation au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('kaido_global_lang') || 'fr';
    applyGlobalLanguage(savedLang);

    const selector = document.getElementById('global-lang-selector');
    if (selector) {
        selector.addEventListener('change', (e) => {
            applyGlobalLanguage(e.target.value);
        });
    }
});
