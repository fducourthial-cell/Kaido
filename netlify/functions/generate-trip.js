exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: JSON.stringify({ message: "OK" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  try {
    const { destination, departure, totalDays, descText } = JSON.parse(event.body || "{}");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "La variable GEMINI_API_KEY n'est pas configurée dans Netlify." })
      };
    }

    // Modèle Pro universellement accessible
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Tu es un expert mondial en création d'itinéraires de voyage sur-mesure pour l'application Kaido.
Génère un itinéraire de ${totalDays} jours pour ${destination} (Ville de départ : ${departure}).
Préférences / Notes : "${descText}".

Consignes de réponse :
1. Propose des noms de lieux RÉELS, EXACTS et PRÉCIS (ex: "Eilean Donan Castle", "Glen Coe Valley", "Talisker Distillery", "Burj Khalifa").
2. Pour chaque jour, inclus 3 étapes clés (09:30, 14:30, 19:30).
3. Remplis le champ "location" avec le nom exact du lieu pour le repérage sur carte.
4. Crée une check-list de préparation (4 à 6 éléments) adaptée au type de voyage.

Exigence absolue : Retourne UNIQUEMENT un objet JSON valide sans texte autour, suivant exactement cette structure :
{
  "checklist": ["Passeport", "Permis de conduire", "Réservation véhicule"],
  "itinerary": [
    {
      "day": "Jour 1",
      "steps": [
        { "time": "09:30", "activity": "Nom précis de l'activité", "location": "Lieu précis, Pays" },
        { "time": "14:30", "activity": "Nom précis de l'activité", "location": "Lieu précis, Pays" },
        { "time": "19:30", "activity": "Soirée ou dîner", "location": "Lieu précis, Pays" }
      ]
    }
  ]
}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error ? data.error.message : "Erreur de réponse de l'API Google";
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: errorMsg })
      };
    }

    let rawText = data.candidates[0].content.parts[0].text;
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    return {
      statusCode: 200,
      headers,
      body: rawText
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
