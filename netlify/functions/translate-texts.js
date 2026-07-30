exports.handler = async (event, context) => {
  // Configuration des entêtes CORS pour autoriser l'appel depuis ton front-end,
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Réponse rapide pour les requêtes preflight (CORS)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  try {
    const { targetLang, texts } = JSON.parse(event.body || "{}");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "La clé GEMINI_API_KEY est manquante." })
      };
    }

    if (!targetLang || !texts || texts.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Langue cible ou textes manquants." })
      };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    // Le prompt strict pour obliger Gemini à renvoyer un JSON parfait avec le mapping
    const prompt = `Tu es un traducteur expert. Traduis le tableau de textes suivant vers cette langue : "${targetLang}".
    
    RÈGLE ABSOLUE : Tu dois STRICTEMENT renvoyer un objet JSON valide, sans aucune balise markdown (pas de \`\`\`json), sans texte avant ni après.
    
    Structure attendue :
    {
      "translations": {
        "Texte original 1": "Texte traduit 1",
        "Texte original 2": "Texte traduit 2"
      }
    }
    
    Voici les textes à traduire :
    ${JSON.stringify(texts)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error ? data.error.message : "Erreur API" })
      };
    }

    // Nettoyage de la réponse au cas où l'IA ajouterait des balises Markdown
    let rawText = data.candidates[0].content.parts[0].text;
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    return {
      statusCode: 200,
      headers,
      body: rawText // Renvoie le JSON brut attendu par i18n.js
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
