// Dictionnaire en mémoire des traductions dynamiques stockées en local
window.kaidoDynamicDict = JSON.parse(localStorage.getItem('kaido_dynamic_dict') || '{}');

// Endpoint de la fonction Netlify qui gère la traduction par l'IA
const TRANSLATE_ENDPOINT = '/.netlify/functions/translate-texts';

async function applyGlobalLanguage(lang) {
    localStorage.setItem('kaido_global_lang', lang);

    // Mettre à jour la valeur du select de langue s'il existe sur la page
    const selector = document.getElementById('global-lang-selector');
    if (selector) selector.value = lang;

    // Si c'est le français (langue d'origine), on restitue les textes d'origine
    if (lang === 'fr') {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            if (el.dataset.originalText) {
                const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
                if (isInput) el.placeholder = el.dataset.originalText;
                else el.textContent = el.dataset.originalText;
            }
        });
        return;
    }

    if (!window.kaidoDynamicDict[lang]) {
        window.kaidoDynamicDict[lang] = {};
    }

    // 1. Collecter tous les textes de la page possédant l'attribut [data-i18n]
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');
    const textsToTranslate = [];

    elementsToTranslate.forEach(el => {
        // Enregistrer le texte français d'origine la première fois
        if (!el.dataset.originalText) {
            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
            el.dataset.originalText = isInput ? (el.placeholder || '') : el.textContent.trim();
        }

        const originalText = el.dataset.originalText;
        if (originalText && !window.kaidoDynamicDict[lang][originalText]) {
            if (!textsToTranslate.includes(originalText)) {
                textsToTranslate.push(originalText);
            }
        }
    });

    // 2. S'il y a des textes inédits pour cette langue, on interroge l'IA
    if (textsToTranslate.length > 0) {
        try {
            const response = await fetch(TRANSLATE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetLang: lang,
                    texts: textsToTranslate
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.translations) {
                    Object.keys(data.translations).forEach(frText => {
                        window.kaidoDynamicDict[lang][frText] = data.translations[frText];
                    });
                    // Sauvegarde dans le cache local pour les prochaines visites
                    localStorage.setItem('kaido_dynamic_dict', JSON.stringify(window.kaidoDynamicDict));
                }
            }
        } catch (err) {
            console.warn("Mode hors-ligne ou erreur de traduction IA : utilisation du cache local.", err);
        }
    }

    // 3. Appliquer les traductions sur tous les éléments de la page
    elementsToTranslate.forEach(el => {
        const originalText = el.dataset.originalText;
        const translatedText = window.kaidoDynamicDict[lang][originalText];

        if (translatedText) {
            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
            if (isInput) {
                el.placeholder = translatedText;
            } else {
                el.textContent = translatedText;
            }
        }
    });
}

window.changeLanguage = function(lang) {
    applyGlobalLanguage(lang);
};

// Fonction de bascule du thème (Sombre / Papyrus) avec symboles japonais
function applyGlobalTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('kaido_theme', theme);

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

// Initialisation globale au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('kaido_global_lang') || 'fr';
    if (savedLang !== 'fr') {
        applyGlobalLanguage(savedLang);
    }

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
