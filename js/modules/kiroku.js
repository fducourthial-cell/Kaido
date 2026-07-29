async function calculateTripKiroku(trip) {
    let completedStepsCount = 0;
    let totalStepsCount = 0;

    // Parcourt l'itinéraire pour compter les étapes réelles et celles cochées (done)
    if (trip.itinerary && Array.isArray(trip.itinerary)) {
        trip.itinerary.forEach(day => {
            if (day.steps && Array.isArray(day.steps)) {
                day.steps.forEach(step => {
                    totalStepsCount++;
                    if (step.done === true) {
                        completedStepsCount++;
                    }
                });
            }
        });
    }

    // Calcul du vrai pourcentage (0% si rien n'est coché)
    const completionRate = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

    // Calcul du ratio financier (Budget estimé vs Dépenses réelles enregistrées)
    const estimatedBudget = parseFloat(trip.budget) || 1;
    let totalSpent = 0;
    if (trip.expenses && Array.isArray(trip.expenses)) {
        trip.expenses.forEach(exp => totalSpent += parseFloat(exp.amount) || 0);
    }
    const budgetRatio = totalSpent > 0 ? (totalSpent / estimatedBudget) : 0.8;

    // Attribution dynamique du Rang (S, A, B, C)
    let finalRank = 'B';
    if (completionRate >= 90 && budgetRatio <= 1.0) {
        finalRank = 'S';
    } else if (completionRate >= 75 && budgetRatio <= 1.15) {
        finalRank = 'A';
    } else if (completionRate >= 40) {
        finalRank = 'B';
    } else {
        finalRank = 'C';
    }

    // Sauvegarde des données calculées dans l'objet du voyage
    trip.completion_rate = completionRate;
    trip.final_rank = finalRank;

    // Mise à jour synchrone dans le localStorage pour que kiroku.html l'affiche instantanément
    let allTrips = JSON.parse(localStorage.getItem('kaido_trips')) || [];
    allTrips = allTrips.map(t => String(t.id) === String(trip.id) ? trip : t);
    localStorage.setItem('kaido_trips', JSON.stringify(allTrips));
    localStorage.setItem('kaido_active_trip', JSON.stringify(trip));

    // Synchronisation Cloud Supabase si le client est disponible
    if (typeof supabase !== 'undefined' && trip.id) {
        try {
            await supabase
                .from('trips')
                .update({
                    status: completionRate === 100 ? 'completed' : 'ongoing',
                    final_rank: finalRank,
                    completion_rate: completionRate
                })
                .eq('id', trip.id);
        } catch (err) {
            console.warn("Synchro Kiroku Supabase hors-ligne ou ignorée.", err);
        }
    }

    return { completionRate, finalRank };
}
