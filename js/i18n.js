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

// Fonction globale d'application du thème (Sombre / Papyrus) avec symboles japonais
function applyGlobalTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('kaido_theme', theme);

    // Met à jour l'icône du bouton toggle avec les symboles japonais
    const themeBtn = document.getElementById('global-theme-toggle');
    if (themeBtn) {
        if (theme === 'papyrus') {
            themeBtn.innerHTML = '<span style="font-size: 1.1rem;">🌙</span>';
            themeBtn.title = "Passer au thème sombre";
        } else {
            themeBtn.innerHTML = '<span style="font-size: 1.1rem;">📜</span>';
            themeBtn.title = "Passer au thème papyrus";
        }
    }
}

// Initialisation au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialisation de la langue
    const savedLang = localStorage.getItem('kaido_global_lang') || 'fr';
    applyGlobalLanguage(savedLang);

    const selector = document.getElementById('global-lang-selector');
    if (selector) {
        selector.addEventListener('change', (e) => {
            applyGlobalLanguage(e.target.value);
        });
    }

    // 2. Initialisation du thème (Sombre / Papyrus)
    const savedTheme = localStorage.getItem('kaido_theme') || 'dark';
    applyGlobalTheme(savedTheme);

    const themeToggleBtn = document.getElementById('global-theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'papyrus' : 'dark';
            applyGlobalTheme(newTheme);
        });
    }
});
