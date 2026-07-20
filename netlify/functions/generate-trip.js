exports.handler = async (event, context) => {
  // En-têtes pour autoriser les requêtes cross-origin (CORS) depuis GitHub Pages
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Gestion de la requête de pré-vérification du navigateur (Preflight OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { destination, departure, totalDays, descText } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Clé API Gemini non configurée sur le serveur Netlify." })
      };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Tu es un expert en voyages sur-mesure pour l'application Kaido.
Génère un itinéraire ultra-précis et réaliste de ${totalDays} jours pour ${destination} (Départ : ${departure}).
Exigences et souhaits du voyageur : "${descText}".

Consignes très strictes :
1. Donne des NOMS DE LIEUX RÉELS et PRÉCIS (ex: "Eilean Donan Castle", "Glen Coe Valley", "Talisker Distillery", etc.).
2. Pour chaque jour, inclus 3 étapes (09:30, 14:30, 19:30) adaptées au rythme du séjour.
3. Remplis le champ "location" avec le lieu exact (ex: "Eilean Donan Castle, Écosse") pour que Google Maps puisse s'y placer.
4. Propose une check-list de voyage (4 à 6 éléments) adaptée aux besoins de ce voyage précis (ex: permis de conduire, location voiture, chaussures de rando...).

Retourne UNIQUEMENT un JSON structuré comme ceci (sans aucun texte Markdown autour) :
{
  "checklist": ["Élément 1", "Élément 2", "Élément 3"],
  "itinerary": [
    {
      "day": "Jour 1",
      "steps": [
        { "time": "09:30", "activity": "Nom et détail de l'activité du matin", "location": "Lieu précis, Pays" },
        { "time": "14:30", "activity": "Nom et détail de l'activité de l'après-midi", "location": "Lieu précis, Pays" },
        { "time": "19:30", "activity": "Nom et détail de l'activité ou soirée", "location": "Lieu précis, Pays" }
      ]
    }
  ]
}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error ? data.error.message : "Erreur API Google";
      return { statusCode: response.status, headers, body: JSON.stringify({ error: errorMsg }) };
    }

    const jsonText = data.candidates[0].content.parts[0].text;
    
    return {
      statusCode: 200,
      headers,
      body: jsonText
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
