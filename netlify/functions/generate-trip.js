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

    // Endpoint v1beta avec le modèle exact attribué à ton compte
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const prompt = `Tu es un expert mondial en création d'itinéraires de voyage sur-mesure pour l'application Kaido, doublé d'un ingénieur senior en logistique géographique.
Génère un itinéraire de ${totalDays} jours pour${destination} (Ville de départ : ${departure}).
Préférences / Notes de l'utilisateur : "${descText}".

Règles impératives de logistique et de géographie :
1. PROGRESSION GÉOGRAPHIQUE GLOBALE (Le Circuit) : L'itinéraire doit suivre une boucle ou une ligne continue logique. Le lieu du matin du Jour N+1 DOIT être géographiquement proche du lieu de la veille au soir (Jour N). Zéro aller-retour absurde d'un bout à l'autre de la région.
2. FAISABILITÉ QUOTIDIENNE (Microgéographie) : Les 3 étapes d'une même journée doivent être regroupées dans le même secteur. Le temps de trajet entre l'étape de 09:30, celle de 14:30 et celle de 19:30 doit être court, réaliste et optimisé.
3. LOGISTIQUE D'ARRIVÉE/DÉPART : Le Jour 1 doit refléter l'arrivée depuis ${departure} (ex: atterrissage, trajet depuis l'aéroport/gare, première activité d'introduction). Le dernier jour doit anticiper le rapprochement vers le point de départ.
4. VÉRACITÉ : Propose uniquement des noms de lieux RÉELS, EXACTS et PRÉCIS (ex: "Eilean Donan Castle", pas "Un château écossais").
5. PRÉCISION DE LOCALISATION : Remplis le champ "location" avec le nom exact du lieu + Ville + Pays pour garantir un géocodage parfait sur l'application. 
6. CHECK-LIST : Fournis 4 à 6 éléments de préparation indispensables et spécifiquement liés à ce type de voyage.
7. BUDGET : Estime de manière réaliste les coûts dans "budgetDetails" en fonction de la destination et de la durée.

Exigence absolue : Retourne UNIQUEMENT un objet JSON valide, sans aucune balise markdown (pas de ```json), sans texte avant ni après.
Structure stricte à respecter :
{
  "checklist": ["String", "String", "String"],
  "itinerary": [
    {
      "day": "Jour 1",
      "dateText": "JJ/MM/AAAA",
      "steps": [
        { "time": "09:30", "activity": "Activité précise", "location": "Lieu exact, Pays", "lat": null, "lng": null },
        { "time": "14:30", "activity": "Activité précise", "location": "Lieu exact, Pays", "lat": null, "lng": null },
        { "time": "19:30", "activity": "Activité précise", "location": "Lieu exact, Pays", "lat": null, "lng": null }
      ]
    }
  ],
  "budgetDetails": {
    "flights": 300,
    "hotel": 500,
    "rest": 400
  }
}``;

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
