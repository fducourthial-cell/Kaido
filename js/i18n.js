// Dictionnaire en mémoire des traductions dynamiques par session/cache
window.kaidoDynamicDict = JSON.parse(localStorage.getItem('kaido_dynamic_dict') || '{}');

// Endpoint de ton IA (tu peux utiliser ta fonction Netlify existante ou un prompt dédié)
const TRANSLATE_ENDPOINT = 'https://quiet-hamster-f904c2.netlify.app/.netlify/functions/translate-texts';

async function applyGlobalLanguage(lang) {
    localStorage.setItem('kaido_global_lang', lang);

    // Si c'est du français (langue d'origine du code), on remet les textes originaux ou on recharge
    if (lang === 'fr') {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            if (el.dataset.originalText) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = el.dataset.originalText;
                } else {
                    el.textContent = el.dataset.originalText;
                }
            }
        });
        return;
    }

    // 1. Vérifier si on a déjà le dictionnaire pour cette langue en cache
    if (!window.kaidoDynamicDict[lang]) {
        window.kaidoDynamicDict[lang] = {};
    }

    // 2. Collecter tous les textes de la page possédant l'attribut [data-i18n]
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');
    const textsToTranslate = [];

    elementsToTranslate.forEach(el => {
        // Sauvegarder le texte français d'origine si ce n'est pas déjà fait
        if (!el.dataset.originalText) {
            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
            el.dataset.originalText = isInput ? el.placeholder : el.textContent.trim();
        }

        const originalText = el.dataset.originalText;
        
        // Si on n'a pas encore la traduction de ce texte précis pour cette langue, on l'ajoute à la liste
        if (!window.kaidoDynamicDict[lang][originalText]) {
            if (!textsToTranslate.includes(originalText)) {
                textsToTranslate.push(originalText);
            }
        }
    });

    // 3. S'il y a de nouveaux textes à traduire, on appelle l'IA
    if (textsToTranslate.length > 0) {
        // Afficher un petit indicateur discret de chargement de langue si tu veux
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
                // data.translations doit être un objet ou un tableau associant { "Texte fr": "Texte traduit" }
                if (data.translations) {
                    Object.keys(data.translations).forEach(frText => {
                        window.kaidoDynamicDict[lang][frText] = data.translations[frText];
                    });
                    // Sauvegarder dans le localStorage pour les prochaines sessions
                    localStorage.setItem('kaido_dynamic_dict', JSON.stringify(window.kaidoDynamicDict));
                }
            }
        } catch (err) {
            console.warn("Erreur lors de la traduction dynamique par l'IA :", err);
        }
    }

    // 4. Appliquer les traductions sur tous les éléments de la page
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('kaido_global_lang') || 'fr';
    if (savedLang !== 'fr') {
        applyGlobalLanguage(savedLang);
    }
});
