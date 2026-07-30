const { GoogleGenAI } = require("@google/genai");

// Initialisation de Gemini avec ta variable d'environnement existante
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { targetLang, texts } = JSON.parse(event.body);

        if (!targetLang || !texts || !Array.isArray(texts)) {
            return { statusCode: 400, body: JSON.stringify({ error: "Paramètres manquants (targetLang ou texts)" }) };
        }

        const langNames = {
            en: "English",
            es: "Spanish",
            it: "Italian",
            de: "German",
            ja: "Japanese",
            zh: "Chinese",
            cs: "Czech",
            ru: "Russian"
        };
        const targetLanguageName = langNames[targetLang] || targetLang;

        const prompt = `You are a professional translator for a high-end travel application called Kaido. 
Translate the following array of French texts into ${targetLanguageName}. 
Keep the tone professional, elegant, and consistent with a luxury travel app. 
CRITICAL: Return ONLY a valid JSON object where keys are the exact original French texts and values are the translated texts. Do not add markdown formatting like \`\`\`json, just output the raw JSON object.

Texts to translate:
${JSON.stringify(texts, null, 2)}`;

        // Appel à l'API Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Modèle rapide et idéal pour ce type de tâche textuelle
            contents: prompt,
        });

        const rawContent = response.text.trim();
        
        // Nettoyage au cas où le modèle ajoute des balises markdown de code
        const cleanJsonStr = rawContent.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
        const translationsMap = JSON.parse(cleanJsonStr);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ translations: translationsMap })
        };

    } catch (error) {
        console.error("Erreur de traduction Netlify Function (Gemini):", error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
