// --- MODULE PROJET KIROKU : CALCUL DU BILAN ---
async function calculateTripKiroku(trip) {
    let completedStepsCount = 0;
    let totalStepsCount = 0;

    // 1. Calculer le taux de complétion des activités de l'itinéraire
    if (trip.itinerary && Array.isArray(trip.itinerary)) {
        trip.itinerary.forEach(day => {
            if (day.steps && Array.isArray(day.steps)) {
                day.steps.forEach(step => {
                    totalStepsCount++;
                    // Si la step a été cochée/réalisée (on pourra ajouter une propriété 'done' sur les steps si ce n'est pas fait)
                    if (step.done) {
                        completedStepsCount++;
                    }
                });
            }
        });
    }

    const completionRate = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 100;

    // 2. Calcul du ratio budget (Prévu vs Réel)
    const estimatedBudget = parseFloat(trip.budget) || 1;
    let totalSpent = 0;
    if (trip.expenses && Array.isArray(trip.expenses)) {
        trip.expenses.forEach(exp => totalSpent += parseFloat(exp.amount) || 0);
    }
    
    // Si pas de dépenses enregistrées sur place, on simule ou on se base sur les partagées
    const budgetRatio = totalSpent > 0 ? (totalSpent / estimatedBudget) : 0.8; // Par défaut optimiste si pas de saisie

    // 3. Attribution du Rang (Style JRPG : S, A, B, C)
    let finalRank = 'B';
    if (completionRate >= 90 && budgetRatio <= 1.0) {
        finalRank = 'S'; // Maître absolu du voyage
    } else if (completionRate >= 75 && budgetRatio <= 1.15) {
        finalRank = 'A'; // Très beau voyage bien géré
    } else if (completionRate >= 50) {
        finalRank = 'B'; // Voyage correct mais perfectible
    } else {
        finalRank = 'C'; // Aventure chaotique
    }

    // 4. Attribution des Badges / Titres honorifiques
    const badges = [];
    if (budgetRatio <= 1.0) {
        badges.push({ title: "Maître des finances", icon: "💶", desc: "Budget respecté à la lettre !" });
    }
    if (completionRate === 100) {
        badges.push({ title: "Explorateur infatigable", icon: "⛩️", desc: "100% des étapes du planning réalisées." });
    }
    if (trip.gallery && trip.gallery.length >= 5) {
        badges.push({ title: "Photographe de l'extrême", icon: "📸", desc: "Plus de 5 souvenirs partagés." });
    }

    const kirokuData = {
        status: 'completed',
        final_rank: finalRank,
        completion_rate: completionRate,
        badges: badges
    };

    // 5. Sauvegarde automatique dans Supabase
    if (typeof supabase !== 'undefined' && trip.id) {
        try {
            await supabase
                .from('trips')
                .update({
                    status: kirokuData.status,
                    final_rank: kirokuData.final_rank,
                    completion_rate: kirokuData.completion_rate
                })
                .eq('id', trip.id);
        } catch (err) {
            console.warn("Erreur synchronisation Kiroku Cloud:", err);
        }
    }

    return kirokuData;
}
