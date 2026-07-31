// Dictionnaire des traductions statiques
const translations = {
    fr: {
        // Le français sert de base, pas besoin de tout redéfinir si on ne trouve pas
    },
    en: {
        "Projet Kiroku": "Kiroku Project",
        "Changer de thème": "Change theme",
        "Langue": "Language",
        "Tracer une nouvelle route": "Map a new route",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "Kaido's intelligence designs your custom travel diary.",
        "La Destination": "The Destination",
        "Le Calendrier": "The Calendar",
        "Budget Max estimé (Optionnel)": "Estimated Max Budget (Optional)",
        "Vos Envies": "Your Preferences",
        "📝 Notes, mode de transport & activités souhaitées": "📝 Notes, transport & desired activities",
        "Concevoir mon itinéraire sur-mesure": "Design my custom itinerary",
        "Mes futurs voyages": "My future trips",
        "VOIR L'ITINÉRAIRE": "VIEW ITINERARY",
        "Itinéraire": "Itinerary",
        "Budget": "Budget",
        "Infos": "Info",
        "Carte": "Map",
        "Liens": "Links",
        "🗂️ Documents": "🗂️ Documents",
        "Galerie": "Gallery",
        "🔗 Partager": "🔗 Share",
        "📄 Exporter PDF": "📄 Export PDF",
        "⚙️ Modifier": "⚙️ Edit",
        "🏁 Clôturer": "🏁 Complete",
        "📍 Carte interactive": "📍 Interactive map",
        "Budget & Estimation": "Budget & Estimation",
        "💸 Dépenses Partagées": "💸 Shared Expenses",
        "📸 Galerie Collaborative": "📸 Collaborative Gallery",
        "🎒 Check-list de voyage": "🎒 Travel Checklist",
        "🌤️ Météo prévue": "🌤️ Weather Forecast",
        "✈️ Liens de réservation & Partenaires": "✈️ Booking Links & Partners",
        "🗂️ Portefeuille Documentaire": "🗂️ Document Wallet",
        "Modifier le voyage": "Edit trip",
        "Annuler": "Cancel",
        "Sauvegarder": "Save",
        "Votre palmarès, vos rangs et l'historique de vos aventures.": "Your records, ranks, and adventure history.",
        "Rang Actuel du Voyageur": "Current Traveler Rank",
        "Voyages planifiés": "Planned trips",
        "Aventures bouclées": "Completed adventures",
        "Taux de complétion": "Completion rate",
        "Volume Financier": "Financial Volume",
        "📜 Registre des Rangs par Voyage": "📜 Trip Rank Registry",
        "🏅 Titres & Succès du Voyageur": "🏅 Traveler Titles & Achievements",
        "Ex: Paris, Édimbourg, Lyon...": "Ex: Paris, Edinburgh, London...",
        "Ex: Écosse, Tokyo, Islande...": "Ex: Scotland, Tokyo, Iceland..."
    },
    es: {
        "Projet Kiroku": "Proyecto Kiroku",
        "Changer de thème": "Cambiar tema",
        "Langue": "Idioma",
        "Tracer une nouvelle route": "Trazar una nueva ruta",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "La inteligencia de Kaido diseña tu diario de viaje a medida.",
        "La Destination": "La Destinación",
        "Le Calendrier": "El Calendario",
        "Budget Max estimé (Optionnel)": "Presupuesto Máximo (Opcional)",
        "Vos Envies": "Tus Preferencias",
        "📝 Notes, mode de transport & activités souhaitées": "📝 Notas, transporte y actividades deseadas",
        "Concevoir mon itinéraire sur-mesure": "Diseñar mi itinerario a medida",
        "Mes futurs voyages": "Mis futuros viajes",
        "VOIR L'ITINÉRAIRE": "VER ITINERARIO",
        "Itinéraire": "Itinerario",
        "Budget": "Presupuesto",
        "Infos": "Info",
        "Carte": "Mapa",
        "Liens": "Enlaces",
        "🗂️ Documents": "🗂️ Documentos",
        "Galerie": "Galería",
        "🔗 Partager": "🔗 Compartir",
        "📄 Exporter PDF": "📄 Exportar PDF",
        "⚙️ Modifier": "⚙️ Editar",
        "🏁 Clôturer": "🏁 Finalizar",
        "📍 Carte interactive": "📍 Mapa interactivo",
        "Budget & Estimation": "Presupuesto y Estimación",
        "💸 Dépenses Partagées": "💸 Gastos Compartidos",
        "📸 Galerie Collaborative": "📸 Galería Colaborativa",
        "🎒 Check-list de voyage": "🎒 Lista de viaje",
        "🌤️ Météo prévue": "🌤️ Previsión del tiempo",
        "✈️ Liens de réservation & Partenaires": "✈️ Enlaces de reserva y socios",
        "🗂️ Portefeuille Documentaire": "🗂️ Cartera de Documentos",
        "Modifier le voyage": "Editar viaje",
        "Annuler": "Cancelar",
        "Sauvegarder": "Guardar",
        "Votre palmarès, vos rangs et l'historique de vos aventures.": "Tus récords, rangos e historial de aventuras.",
        "Rang Actuel du Voyageur": "Rango Actual del Viajero",
        "Voyages planifiés": "Viajes planeados",
        "Aventures bouclées": "Aventuras completadas",
        "Taux de complétion": "Tasa de finalización",
        "Volume Financier": "Volumen Financiero",
        "📜 Registre des Rangs par Voyage": "📜 Registro de Rangos por Viaje",
        "🏅 Titres & Succès du Voyageur": "🏅 Títulos y Logros del Viajero",
        "Ex: Paris, Édimbourg, Lyon...": "Ej: Madrid, París, Roma...",
        "Ex: Écosse, Tokyo, Islande...": "Ej: Escocia, Tokio, Islandia..."
    },
    it: {
        "Projet Kiroku": "Progetto Kiroku",
        "Changer de thème": "Cambia tema",
        "Langue": "Lingua",
        "Tracer une nouvelle route": "Traccia una nuova rotta",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "L'intelligenza di Kaido progetta il tuo diario di viaggio su misura.",
        "La Destination": "La Destinazione",
        "Le Calendrier": "Il Calendario",
        "Budget Max estimé (Optionnel)": "Budget Massimo (Opzionale)",
        "Vos Envies": "Le tue preferenze",
        "📝 Notes, mode de transport & activités souhaitées": "📝 Note, trasporti e attività",
        "Concevoir mon itinéraire sur-mesure": "Progetta il mio itinerario",
        "Mes futurs voyages": "I miei viaggi futuri",
        "VOIR L'ITINÉRAIRE": "VEDI ITINERARIO",
        "Itinéraire": "Itinerario",
        "Budget": "Budget",
        "Infos": "Info",
        "Carte": "Mappa",
        "Liens": "Link",
        "🗂️ Documents": "🗂️ Documenti",
        "Galerie": "Galleria",
        "🔗 Partager": "🔗 Condividi",
        "📄 Exporter PDF": "📄 Esporta PDF",
        "⚙️ Modifier": "⚙️ Modifica",
        "🏁 Clôturer": "🏁 Concludi",
        "📍 Carte interactive": "📍 Mappa interattiva",
        "Budget & Estimation": "Budget e Stima",
        "💸 Dépenses Partagées": "💸 Spese Condivise",
        "📸 Galerie Collaborative": "📸 Galleria Collaborativa",
        "🎒 Check-list de voyage": "🎒 Lista di viaggio",
        "🌤️ Météo prévue": "🌤️ Previsioni meteo",
        "✈️ Liens de réservation & Partenaires": "✈️ Link di prenotazione",
        "🗂️ Portefeuille Documentaire": "🗂️ Portafoglio Documenti",
        "Modifier le voyage": "Modifica viaggio",
        "Annuler": "Annulla",
        "Sauvegarder": "Salva",
        "Votre palmarès, vos rangs et l'historique de vos aventures.": "I tuoi record, gradi e cronologia delle avventure.",
        "Rang Actuel du Voyageur": "Grado Attuale del Viaggiatore",
        "Voyages planifiés": "Viaggi pianificati",
        "Aventures bouclées": "Avventure completate",
        "Taux de complétion": "Tasso di completamento",
        "Volume Financier": "Volume Finanziario",
        "📜 Registre des Rangs par Voyage": "📜 Registro dei Gradi",
        "🏅 Titres & Succès du Voyageur": "🏅 Titoli e Obiettivi",
        "Ex: Paris, Édimbourg, Lyon...": "Es: Roma, Parigi, Milano...",
        "Ex: Écosse, Tokyo, Islande...": "Es: Scozia, Tokyo, Islanda..."
    },
    de: {
        "Projet Kiroku": "Kiroku-Projekt",
        "Changer de thème": "Thema wechseln",
        "Langue": "Sprache",
        "Tracer une nouvelle route": "Eine neue Route planen",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "Kaidos Intelligenz entwirft dein maßgeschneidertes Reisetagebuch.",
        "La Destination": "Das Reiseziel",
        "Le Calendrier": "Der Kalender",
        "Budget Max estimé (Optionnel)": "Geschätztes Max-Budget (Optional)",
        "Vos Envies": "Deine Wünsche",
        "📝 Notes, mode de transport & activités souhaitées": "📝 Notizen, Transport & Aktivitäten",
        "Concevoir mon itinéraire sur-mesure": "Reiseroute entwerfen",
        "Mes futurs voyages": "Meine zukünftigen Reisen",
        "VOIR L'ITINÉRAIRE": "REISEROUTE ANSEHEN",
        "Itinéraire": "Reiseroute",
        "Budget": "Budget",
        "Infos": "Info",
        "Carte": "Karte",
        "Liens": "Links",
        "🗂️ Documents": "🗂️ Dokumente",
        "Galerie": "Galerie",
        "🔗 Partager": "🔗 Teilen",
        "📄 Exporter PDF": "📄 PDF exportieren",
        "⚙️ Modifier": "⚙️ Bearbeiten",
        "🏁 Clôturer": "🏁 Abschließen",
        "📍 Carte interactive": "📍 Interaktive Karte",
        "Budget & Estimation": "Budget & Schätzung",
        "💸 Dépenses Partagées": "💸 Geteilte Ausgaben",
        "📸 Galerie Collaborative": "📸 Gemeinsame Galerie",
        "🎒 Check-list de voyage": "🎒 Checkliste",
        "🌤️ Météo prévue": "🌤️ Wettervorhersage",
        "✈️ Liens de réservation & Partenaires": "✈️ Buchungslinks",
        "🗂️ Portefeuille Documentaire": "🗂️ Dokumentenmappe",
        "Modifier le voyage": "Reise bearbeiten",
        "Annuler": "Abbrechen",
        "Sauvegarder": "Speichern",
        "Votre palmarès, vos rangs et l'historique de vos aventures.": "Deine Rekorde, Ränge und Abenteuer.",
        "Rang Actuel du Voyageur": "Aktueller Rang",
        "Voyages planifiés": "Geplante Reisen",
        "Aventures bouclées": "Abgeschlossene Abenteuer",
        "Taux de complétion": "Abschlussrate",
        "Volume Financier": "Finanzielles Volumen",
        "📜 Registre des Rangs par Voyage": "📜 Rangregister",
        "🏅 Titres & Succès du Voyageur": "🏅 Titel & Erfolge",
        "Ex: Paris, Édimbourg, Lyon...": "Bsp: Berlin, Paris, München...",
        "Ex: Écosse, Tokyo, Islande...": "Bsp: Schottland, Tokio, Island..."
    },
    ja: {
        "Projet Kiroku": "キロクプロジェクト",
        "Changer de thème": "テーマ変更",
        "Langue": "言語",
        "Tracer une nouvelle route": "新しいルートを描く",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "KaidoのAIがあなただけの旅行記をデザインします。",
        "La Destination": "目的地",
        "Le Calendrier": "カレンダー",
        "Budget Max estimé (Optionnel)": "最大予算 (任意)",
        "Vos Envies": "ご希望",
        "📝 Notes, mode de transport & activités souhaitées": "📝 メモ、交通手段、ご希望のアクティビティ",
        "Concevoir mon itinéraire sur-mesure": "カスタム旅程を作成する",
        "Mes futurs voyages": "これからの旅行",
        "VOIR L'ITINÉRAIRE": "旅程を見る",
        "Itinéraire": "旅程",
        "Budget": "予算",
        "Infos": "情報",
        "Carte": "地図",
        "Liens": "リンク",
        "🗂️ Documents": "🗂️ ドキュメント",
        "Galerie": "ギャラリー",
        "🔗 Partager": "🔗 共有",
        "📄 Exporter PDF": "📄 PDF出力",
        "⚙️ Modifier": "⚙️ 編集",
        "🏁 Clôturer": "🏁 完了",
        "📍 Carte interactive": "📍 インタラクティブマップ",
        "Budget & Estimation": "予算と見積もり",
        "💸 Dépenses Partagées": "💸 割り勘",
        "📸 Galerie Collaborative": "📸 共有ギャラリー",
        "🎒 Check-list de voyage": "🎒 持ち物リスト",
        "🌤️ Météo prévue": "🌤️ 天気予報",
        "✈️ Liens de réservation & Partenaires": "✈️ 予約リンク",
        "🗂️ Portefeuille Documentaire": "🗂️ ドキュメントウォレット",
        "Modifier le voyage": "旅行を編集",
        "Annuler": "キャンセル",
        "Sauvegarder": "保存",
        "Votre palmarès, vos rangs et l'historique de vos aventures.": "あなたの記録、ランク、そして冒険の歴史。",
        "Rang Actuel du Voyageur": "現在のトラベラーランク",
        "Voyages planifiés": "計画された旅行",
        "Aventures bouclées": "完了した冒険",
        "Taux de complétion": "完了率",
        "Volume Financier": "総予算",
        "📜 Registre des Rangs par Voyage": "📜 ランク履歴",
        "🏅 Titres & Succès du Voyageur": "🏅 称号と実績",
        "Ex: Paris, Édimbourg, Lyon...": "例：東京、パリ、ロンドン...",
        "Ex: Écosse, Tokyo, Islande...": "例：北海道、京都、アイスランド..."
    }
};

// Fonction principale pour appliquer la traduction
function applyGlobalLanguage(lang) {
    const dict = translations[lang] || translations['fr'];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        // Sauvegarde la clé en français lors du premier passage
        let key = el.getAttribute('data-i18n-key');
        if (!key) {
            // Si c'est un input/textarea on prend le placeholder, sinon le texte
            key = el.placeholder ? el.placeholder.trim() : el.textContent.trim();
            el.setAttribute('data-i18n-key', key);
        }

        // Si la traduction existe dans le dictionnaire pour cette langue
        if (dict[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'GMP-PLACE-AUTOCOMPLETE') {
                el.placeholder = dict[key];
            } else {
                el.textContent = dict[key];
            }
        } else if (lang === 'fr') {
            // Restaure le français original si on repasse en FR
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'GMP-PLACE-AUTOCOMPLETE') {
                el.placeholder = key;
            } else {
                el.textContent = key;
            }
        }
    });
}

// Fonction appelée par les boutons du menu HTML
window.changeLanguage = function(lang) {
    localStorage.setItem('kaido_global_lang', lang);
    applyGlobalLanguage(lang);
};

// Application automatique au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('kaido_global_lang') || 'fr';
    applyGlobalLanguage(savedLang);
});
