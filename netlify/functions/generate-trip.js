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

    // ✨ CHANGEMENT : On pointe désormais vers la variable de la clé Anthropic
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "La variable ANTHROPIC_API_KEY n'est pas configurée dans Netlify." })
      };
    }

    let finalTransportOnSite = transportOnSite || 'voiture';
    if (finalTransportOnSite.includes('autre') && transportOnSiteOther) {
        finalTransportOnSite = finalTransportOnSite.replace('autre', `autre (${transportOnSiteOther})`);
    }

    const travelMainStr = transportGetThere ? `Mode de transport principal pour s'y rendre : ${transportGetThere}` : '';
    const travelOnSiteStr = finalTransportOnSite ? `Modes de déplacement sur place : ${finalTransportOnSite}` : '';

    // ✨ CHANGEMENT : Le prompt intègre la consigne stricte de formatage à la toute fin
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
}

Ne renvoie absolument aucun texte en dehors des accolades du JSON. Commence ta réponse directement par { et termine la par }.`;

    // ✨ CHANGEMENT : URL de l'API Anthropic
    const endpoint = 'https://api.anthropic.com/v1/messages';

    // ✨ CHANGEMENT : Requête adaptée au format Claude
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01', // Version d'API obligatoire chez Anthropic
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Le modèle le plus rapide (équivalent Flash)
        max_tokens: 4000,
        system: "Tu es un expert mondial en logistique et création d'itinéraires de voyage. Tu dois répondre UNIQUEMENT par un objet JSON valide, sans aucune phrase d'introduction ni de conclusion.",
        messages: [
          { 
              role: 'user', 
              content: prompt 
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error ? data.error.message : "Erreur de réponse de l'API Anthropic";
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: errorMsg })
      };
    }

    // ✨ CHANGEMENT : On récupère le texte selon la structure JSON de Claude
    let rawText = data.content[0].text;
    
    // Nettoyage au cas où Claude ajouterait des balises Markdown (sécurité supplémentaire)
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
