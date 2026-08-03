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
    const { 
      destination, 
      departure, 
      totalDays, 
      descText, 
      transportGetThere, 
      transportOnSite,   
      transportOnSiteOther 
    } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "La variable GEMINI_API_KEY n'est pas configurée dans Netlify." })
      };
    }

    let finalTransportOnSite = transportOnSite || 'voiture';
    if (finalTransportOnSite.includes('autre') && transportOnSiteOther) {
        finalTransportOnSite = finalTransportOnSite.replace('autre', `autre (${transportOnSiteOther})`);
    }

    const travelMainStr = transportGetThere ? `Mode de transport principal pour s'y rendre : ${transportGetThere}` : '';
    const travelOnSiteStr = finalTransportOnSite ? `Modes de déplacement sur place : ${finalTransportOnSite}` : '';

    // ✨ CORRECTION 1 : Utilisation du modèle de production ultra-rapide (gemini-1.5-flash)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Tu es un expert mondial en création d'itinéraires de voyage sur-mesure pour l'application Kaido.

Génère un itinéraire de ${totalDays} jours pour ${destination} (Ville de départ : ${departure}).
Préférences / Notes de l'utilisateur : "${descText}"
${travelMainStr}
${travelOnSiteStr}

RÈGLES IMPÉRATIVES :
1. PROGRESSION GÉOGRAPHIQUE : Zéro aller-retour absurde. Les étapes du jour N+1 doivent être logiquement proches de la nuit du jour N.
2. FAISABILITÉ : Les étapes d'une même journée doivent être regroupées dans le même secteur.
3. CONCISION : Sois extrêmement concis dans les descriptions ("activity"). Maximum 2 phrases. Va à l'essentiel pour générer la réponse rapidement.
4. LIEUX EXACTS : Remplis "location" avec "Nom du lieu, Ville, Pays". Ne renseigne JAMAIS lat/lng (laisse null).
5. VOYAGE ET TRANSFERT : Le Jour 1 intègre le trajet initial depuis ${departure}. Si un jour implique un très long trajet interne, mets "travelDay": true.
6. HÉBERGEMENT : Indique dans "accommodation" une zone logique où dormir le soir.
7. CHECK-LIST : Fournis 4 à 6 éléments indispensables.
8. BUDGET : Estime en euros (EUR) de manière réaliste.
9. EXACTEMENT ${totalDays} JOURS : Le tableau "itinerary" DOIT contenir exactement ${totalDays} éléments.
10. LANGUE : Tout le contenu doit être en français.

Structure stricte à respecter :
{
  "checklist": ["String"],
  "itinerary": [
    {
      "day": "Jour 1",
      "dateText": "JJ/MM/AAAA",
      "travelDay": false,
      "accommodation": "Ville/secteur",
      "steps": [
        {
          "time": "09:30",
          "activity": "Activité précise",
          "location": "Lieu exact, Ville, Pays",
          "lat": null,
          "lng": null
        }
      ]
    }
  ],
  "budgetDetails": {
    "flights": 300,
    "hotel": 500,
    "food": 250,
    "activities": 150
  }
}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // ✨ CORRECTION 2 : Activation du mode JSON natif de Gemini (Vitesse et stabilité)
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7
        }
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

    // Plus besoin de nettoyer avec des regex (replace /```json/g), Gemini renvoie directement un string JSON pur !
    const rawText = data.candidates[0].content.parts[0].text;

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
