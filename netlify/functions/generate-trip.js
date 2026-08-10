exports.handler = async (event, context) => {
  // ⏱️ DÉMARRAGE DU CHRONOMÈTRE
  const startTime = Date.now();

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

    // ✨ ICI TU PEUX CHANGER LE MODÈLE POUR TESTER (ex: gemini-3.6-flash ou gemini-3.5-flash-lite)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Tu es un expert mondial en création d'itinéraires de voyage sur-mesure pour l'application Kaido.

Génère un itinéraire de ${totalDays} jours pour ${destination} (Ville de départ : ${departure}).
Préférences / Notes de l'utilisateur : "${descText}"
${travelMainStr}
${travelOnSiteStr}

RÈGLES IMPÉRATIVES :
1. PROGRESSION GÉOGRAPHIQUE : Zéro aller-retour absurde. Les étapes du jour N+1 doivent être logiquement proches de la nuit du jour N.
2. FAISABILITÉ : Les étapes d'une même journée doivent être regroupées dans le même secteur.
3. CONCISION : Sois extrêmement concis pour les descriptions ("activity"). Utilise un format titre court de 3 à 6 mots maximum (ex: "Visite du Rijksmuseum", "Croisière sur les canaux"), sans aucune phrase descriptive superflue. Va droit à l'essentiel.
4. LIEUX EXACTS : Remplis "location" avec "Nom du lieu, Ville, Pays". Ne renseigne JAMAIS lat/lng (laisse null).
5. VOYAGE ET TRANSFERT : Le Jour 1 intègre le trajet initial depuis ${departure}. Si un jour implique un très long trajet interne, mets "travelDay": true.
6. HÉBERGEMENT : Indique dans "accommodation" une zone logique où dormir le soir.
7. CHECK-LIST : Fournis 4 à 6 éléments indispensables.
8. BUDGET : Estime en euros (EUR) de manière réaliste et adapte selon le PIB du pays.
9. EXACTEMENT ${totalDays} JOURS : Le tableau "itinerary" DOIT contenir exactement ${totalDays} éléments.
10. LANGUE : Tout le contenu doit être en français.
11. TRANSFERT AÉROPORT : Identifie le meilleur moyen de transport en commun (navette, bus, train) pour relier l'aéroport principal de la destination au centre-ville. Précise impérativement le nom ou le numéro de la ligne (ex: "Bus X82", "RoissyBus", "Ligne de train RER B").

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
  "airportTransfer": {
    "recommended": "Oui/Non",
    "transportType": "Bus / Train / Navette",
    "lineNumber": "Nom ou Numéro exact de la ligne (ex: Bus 100)",
    "priceEst": "Prix estimé (ex: 5€)"
  },
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

    const rawText = data.candidates[0].content.parts[0].text;

    // ⏱️ ARRÊT DU CHRONOMÈTRE
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // Affichage dans le tableau de bord Netlify (Functions Logs)
    console.log(`🚀 Itinéraire généré en : ${executionTime} ms`);

    // Ajout d'une ligne discrète dans les en-têtes HTTP de la réponse
    headers["X-Kaido-Execution-Time-ms"] = executionTime.toString();

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
