// Dictionnaire multilingue global de l'interface du site (Index + Voyage + Créer)
const globalTranslations = {
    fr: {
        // --- INDEX.HTML ---
        "navTitle": "Mes futurs voyages",
        "newRoute": "Tracer une nouvelle route",
        "btn_see_trip": "Voir l'itinéraire",
        "trip_status_completed": "Aventure bouclée",
        
        // --- CREER.HTML (Formulaire) ---
        "create_title": "Tracer une nouvelle route",
        "create_dest_label": "Où allez-vous ?",
        "create_dest_placeholder": "Ex: Kyoto, Japon...",
        "create_dates_label": "Dates du séjour",
        "create_budget_label": "Budget estimé (€)",
        "create_desc_label": "Notes & Envies",
        "create_desc_placeholder": "Ce que vous voulez absolument voir...",
        "create_submit_btn": "Créer le voyage",
        "create_cancel_btn": "Annuler",
        
        // --- VOYAGE.HTML (Onglets & Actions) ---
        "itinerary": "Itinéraire",
        "budget": "Budget",
        "info": "Infos",
        "map": "Carte",
        "reservations": "Liens",
        "tab_documents": "Documents",
        "tab_gallery": "Galerie",
        "pdfBtn": "📄 Exporter PDF",
        "editBtn": "⚙️ Modifier",
        "btn_share": "Partager",
        "btn_complete": "Clôturer",

        // --- VOYAGE.HTML (Titres des sections) ---
        "notesTitle": "Notes de voyage",
        "map_title": "Carte interactive",
        "budget_title": "Budget & Estimation",
        "expenses_title": "Budget & Dépenses Réelles",
        "checklist_title": "Check-list de voyage",
        "weather_title": "Météo prévue",
        "documents_title": "Portefeuille Documentaire",
        "gallery_title": "Galerie Collaborative"
    },
    en: {
        // --- INDEX.HTML ---
        "navTitle": "My Future Trips",
        "newRoute": "Chart a New Route",
        "btn_see_trip": "View Itinerary",
        "trip_status_completed": "Completed Adventure",
        
        // --- CREER.HTML (Formulaire) ---
        "create_title": "Chart a New Route",
        "create_dest_label": "Where are you going?",
        "create_dest_placeholder": "e.g., Kyoto, Japan...",
        "create_dates_label": "Travel Dates",
        "create_budget_label": "Estimated Budget (€)",
        "create_desc_label": "Notes & Desires",
        "create_desc_placeholder": "Things you absolutely want to see...",
        "create_submit_btn": "Create Trip",
        "create_cancel_btn": "Cancel",
        
        // --- VOYAGE.HTML (Onglets & Actions) ---
        "itinerary": "Itinerary",
        "budget": "Budget",
        "info": "Info",
        "map": "Map",
        "reservations": "Links",
        "tab_documents": "Documents",
        "tab_gallery": "Gallery",
        "pdfBtn": "📄 Export PDF",
        "editBtn": "⚙️ Edit",
        "btn_share": "Share",
        "btn_complete": "Complete",

        // --- VOYAGE.HTML (Titres des sections) ---
        "notesTitle": "Travel Notes",
        "map_title": "Interactive Map",
        "budget_title": "Budget & Estimation",
        "expenses_title": "Budget & Actual Expenses",
        "checklist_title": "Travel Checklist",
        "weather_title": "Weather Forecast",
        "documents_title": "Document Wallet",
        "gallery_title": "Collaborative Gallery"
    },
    es: {
        // --- INDEX.HTML ---
        "navTitle": "Mis próximos viajes",
        "newRoute": "Trazar una nueva ruta",
        "btn_see_trip": "Ver Itinerario",
        "trip_status_completed": "Aventura completada",
        
        // --- CREER.HTML (Formulario) ---
        "create_title": "Trazar una nueva ruta",
        "create_dest_label": "¿A dónde vas?",
        "create_dest_placeholder": "Ej: Kioto, Japón...",
        "create_dates_label": "Fechas del viaje",
        "create_budget_label": "Presupuesto estimado (€)",
        "create_desc_label": "Notas y Deseos",
        "create_desc_placeholder": "Lo que absolutamente quieres ver...",
        "create_submit_btn": "Crear Viaje",
        "create_cancel_btn": "Cancelar",
        
        // --- VOYAGE.HTML (Pestañas y Acciones) ---
        "itinerary": "Itinerario",
        "budget": "Presupuesto",
        "info": "Info",
        "map": "Mapa",
        "reservations": "Enlaces",
        "tab_documents": "Documentos",
        "tab_gallery": "Galería",
        "pdfBtn": "📄 Exportar PDF",
        "editBtn": "⚙️ Editar",
        "btn_share": "Compartir",
        "btn_complete": "Cerrar",

        // --- VOYAGE.HTML (Títulos de secciones) ---
        "notesTitle": "Notas de viaje",
        "map_title": "Mapa interactivo",
        "budget_title": "Presupuesto y Estimación",
        "expenses_title": "Presupuesto y Gastos Reales",
        "checklist_title": "Lista de Viaje",
        "weather_title": "Pronóstico del Tiempo",
        "documents_title": "Cartera de Documentos",
        "gallery_title": "Galería Colaborativa"
    }
};

// Fonction globale d'application de la langue
function applyGlobalLanguage(lang) {
    localStorage.setItem('kaido_global_lang', lang);

    // Met à jour la valeur du select classique (s'il existe)
    const selector = document.getElementById('global-lang-selector');
    if (selector) selector.value = lang;

    // Traduit tous les éléments portant l'attribut data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (globalTranslations[lang] && globalTranslations[lang][key]) {
            // Magie ici : on vérifie si c'est un champ de saisie pour changer le placeholder
            if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.hasAttribute('placeholder')) {
                el.placeholder = globalTranslations[lang][key];
            } else {
                el.textContent = globalTranslations[lang][key];
            }
        }
    });
}

// Fonction de bascule de langue (appelée par les nouveaux menus)
window.changeLanguage = function(lang) {
    applyGlobalLanguage(lang);
};

// Fonction globale d'application du thème (Sombre / Papyrus) avec symboles japonais
function applyGlobalTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('kaido_theme', theme);

    // Met à jour l'icône du bouton toggle avec les symboles
    const themeBtn = document.getElementById('global-theme-toggle');
    if (themeBtn) {
        if (theme === 'papyrus') {
            themeBtn.innerHTML = '<span style="font-size: 1.1rem;">🌙</span>';
            themeBtn.title = "Passer au thème sombre";
        } else {
            themeBtn.innerHTML = '<span style="font-size: 1.1rem;">☀️</span>';
            themeBtn.title = "Passer au thème papyrus";
        }
    }
}

// Initialisation au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialisation de la langue
    const savedLang = localStorage.getItem('kaido_global_lang') || 'fr';
    applyGlobalLanguage(savedLang);

    // Écouteur pour l'ancien menu déroulant select (si toujours présent)
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
