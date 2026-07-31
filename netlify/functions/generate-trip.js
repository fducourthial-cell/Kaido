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

Génère un itinéraire de ${totalDays} jours pour ${destination} (Ville de départ : ${departure}).
Préférences / Notes de l'utilisateur : "${descText}"

RÈGLES IMPÉRATIVES DE LOGISTIQUE ET DE GÉOGRAPHIE :

1. PROGRESSION GÉOGRAPHIQUE GLOBALE (Le Circuit) : L'itinéraire doit suivre une boucle ou une ligne continue logique. Le lieu du matin du Jour N+1 DOIT être géographiquement proche du lieu de la veille au soir (Jour N). Zéro aller-retour absurde d'un bout à l'autre de la région.

2. FAISABILITÉ QUOTIDIENNE (Microgéographie) : Les étapes d'une même journée doivent être regroupées dans le même secteur. Le temps de trajet entre chaque étape doit être court, réaliste et optimisé pour un déplacement en voiture (sauf si "${descText}" précise un autre mode : train, vélo, à pied).

3. LOGISTIQUE D'ARRIVÉE/DÉPART : Le Jour 1 doit refléter l'arrivée depuis ${departure} (atterrissage/gare, trajet, première activité d'introduction, légère). Le dernier jour doit anticiper le rapprochement vers le point de départ pour le trajet retour.

4. JOURS DE TRANSFERT : Si une journée implique un long trajet entre deux secteurs éloignés, réduis le nombre d'étapes ce jour-là plutôt que de forcer 3 étapes irréalistes, et indique "travelDay": true sur ce jour.

5. VÉRACITÉ : Propose uniquement des lieux RÉELS, EXACTS et PRÉCIS (ex: "Eilean Donan Castle", jamais "Un château écossais"). Reste prudent sur les horaires d'ouverture connus (évite par exemple de placer un musée un jour de fermeture habituelle si tu sais qu'il est fermé ce jour-là).

6. PRÉCISION DE LOCALISATION : Remplis "location" avec le nom exact du lieu + Ville + Pays pour un géocodage parfait côté application. Ne renseigne JAMAIS lat/lng : laisse-les strictement à null, ils sont calculés par l'application après coup.

7. HÉBERGEMENT : Pour chaque jour, indique dans "accommodation" une zone ou ville où il est logique de dormir compte tenu du secteur du soir, sans inventer de nom d'hôtel précis.

8. CHECK-LIST : Fournis 4 à 6 éléments de préparation indispensables, spécifiques à ce type de voyage et cette destination.

9. BUDGET : Estime en euros (EUR) de manière réaliste selon la destination et la durée, avec un détail par poste (transport, hébergement, nourriture, activités).

10. LANGUE : Toutes les valeurs textuelles ("activity", "location", "checklist", etc.) doivent être rédigées en français, même si "${descText}" est dans une autre langue.

11. NOMBRE DE JOURS : Le tableau "itinerary" DOIT contenir exactement ${totalDays} éléments, ni plus ni moins — un par jour du voyage.

EXIGENCE ABSOLUE : Retourne UNIQUEMENT un objet JSON valide, sans aucune balise markdown, sans texte avant ni après.

Structure stricte à respecter :
{
  "checklist": ["String", "String", "String"],
  "itinerary": [
    {
      "day": "Jour 1",
      "dateText": "JJ/MM/AAAA",
      "travelDay": false,
      "accommodation": "Ville/secteur pour la nuit",
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
