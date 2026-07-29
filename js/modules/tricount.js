window.initTricountModule = async function(tripId) {
    let currentParticipants = [];
    let currentSharedExpenses = [];

    if (!tripId) return;
    await loadParticipants();
    await loadSharedExpenses();

    const addPartForm = document.getElementById('add-participant-form');
    if (addPartForm) {
        addPartForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('participant-name-input');
            const name = nameInput.value.trim();
            if (!name) return;

            const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
            if (!client) return;

            const { error } = await client.from('trip_participants').insert([{ trip_id: tripId, name }]);
            if (!error) {
                nameInput.value = '';
                await loadParticipants();
            } else {
                console.error("Erreur ajout participant:", error);
            }
        });
    }

    const addSharedForm = document.getElementById('add-shared-expense-form');
    if (addSharedForm) {
        addSharedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('shared-title-input').value.trim();
            const amount = parseFloat(document.getElementById('shared-amount-input').value);
            const paid_by = document.getElementById('shared-paidby-select').value;
            const checkedBoxes = document.querySelectorAll('input[name="expense-split-participant"]:checked');
            const selectedParticipantIds = Array.from(checkedBoxes).map(cb => cb.value);

            if (!title || isNaN(amount) || !paid_by) return;
            if (selectedParticipantIds.length === 0) {
                alert("Veuillez sélectionner au moins une personne.");
                return;
            }

            const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
            if (!client) return;
            
            const { data: expenseData, error: expenseError } = await client
                .from('trip_expenses').insert([{ trip_id: tripId, title, amount, paid_by }]).select().single();

            if (expenseError) return console.error("Erreur ajout dépense partagée:", expenseError);

            const splits = selectedParticipantIds.map(participantId => ({
                expense_id: expenseData.id, participant_id: participantId
            }));

            await client.from('trip_expense_splits').insert(splits);

            document.getElementById('shared-title-input').value = '';
            document.getElementById('shared-amount-input').value = '';
            document.querySelectorAll('input[name="expense-split-participant"]').forEach(cb => cb.checked = true);
            await loadSharedExpenses();
        });
    }

    async function loadParticipants() {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;
        const { data, error } = await client.from('trip_participants').select('*').eq('trip_id', tripId);
        if (!error) {
            currentParticipants = data || [];
            renderParticipantsUI(); updatePaidByDropdown(); calculateSettlements();
        }
    }

    async function loadSharedExpenses() {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;
        const { data, error } = await client.from('trip_expenses').select('*, trip_expense_splits(*)').eq('trip_id', tripId);
        if (!error) {
            currentSharedExpenses = data || [];
            renderSharedExpensesUI(); calculateSettlements();
        }
    }

    function renderParticipantsUI() {
        const container = document.getElementById('participants-tags');
        if (!container) return;
        if (currentParticipants.length === 0) {
            container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">Aucun participant.</span>';
            return;
        }
        container.innerHTML = currentParticipants.map(p => `
            <span style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--color-gold); color: var(--color-gold); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
                ${p.name} <span onclick="window.deleteParticipant('${p.id}')" style="cursor: pointer; font-weight: bold; margin-left: 2px;">&times;</span>
            </span>`).join('');
    }

    function updatePaidByDropdown() {
        const select = document.getElementById('shared-paidby-select');
        if (!select) return;
        select.innerHTML = '<option value="">Payé par...</option>' + currentParticipants.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        const checkboxesContainer = document.getElementById('shared-splits-checkboxes');
        if (checkboxesContainer) {
            if (currentParticipants.length === 0) {
                checkboxesContainer.innerHTML = '<span style="color: var(--text-muted); font-style: italic;">Ajoutez des participants d\'abord.</span>';
                return;
            }
            checkboxesContainer.innerHTML = currentParticipants.map(p => `
                <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
                    <input type="checkbox" name="expense-split-participant" value="${p.id}" checked style="accent-color: var(--color-gold);"> ${p.name}
                </label>`).join('');
        }
    }

    function renderSharedExpensesUI() {
        const container = document.getElementById('shared-expenses-list');
        if (!container) return;
        if (currentSharedExpenses.length === 0) {
            container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">Aucune dépense.</span>';
            return;
        }
        container.innerHTML = currentSharedExpenses.map(exp => {
            const payer = currentParticipants.find(p => p.id === exp.paid_by);
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-dark); padding: 0.5rem 0.8rem; border-radius: 4px; font-size: 0.85rem; border: 1px solid var(--border-color);">
                    <div>
                        <strong style="color: var(--text-main);">${exp.title}</strong>
                        <div style="color: var(--text-muted); font-size: 0.75rem;">Payé par ${payer ? payer.name : 'Inconnu'}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--color-gold); font-weight: 600;">${Number(exp.amount).toFixed(2)} €</span>
                        <button onclick="window.deleteSharedExpense('${exp.id}')" style="background: none; border: none; color: var(--color-torii); cursor: pointer; font-size: 0.9rem;">🗑️</button>
                    </div>
                </div>`;
        }).join('');
    }

    function calculateSettlements() {
        const resultsContainer = document.getElementById('settlement-results');
        if (!resultsContainer) return;
        if (currentParticipants.length === 0 || currentSharedExpenses.length === 0) {
            resultsContainer.innerHTML = '<span style="color: var(--text-muted);">Ajoutez des participants et des dépenses.</span>';
            return;
        }

        const balances = {};
        currentParticipants.forEach(p => balances[p.id] = { name: p.name, net: 0 });

        currentSharedExpenses.forEach(exp => {
            const amount = Number(exp.amount);
            const splits = exp.trip_expense_splits || [];
            if (splits.length === 0) return;
            const sharePerPerson = amount / splits.length;

            if (balances[exp.paid_by]) balances[exp.paid_by].net += amount;
            splits.forEach(split => {
                if (balances[split.participant_id]) balances[split.participant_id].net -= sharePerPerson;
            });
        });

        let debtors = [], creditors = [];
        Object.keys(balances).forEach(id => {
            const b = balances[id];
            if (b.net < -0.01) debtors.push({ id, name: b.name, amount: -b.net, originalId: id });
            else if (b.net > 0.01) creditors.push({ id, name: b.name, amount: b.net, originalId: id });
        });

        let transactions = [], dIndex = 0, cIndex = 0;
        while (dIndex < debtors.length && cIndex < creditors.length) {
            let debtor = debtors[dIndex], creditor = creditors[cIndex];
            let paidAmount = Math.min(debtor.amount, creditor.amount);
            
            transactions.push(`
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 0.4rem 0.6rem; border-radius: 4px; margin-bottom: 0.3rem; border: 1px solid var(--border-color);">
                    <span>${debtor.name} doit <strong>${paidAmount.toFixed(2)} €</strong> à ${creditor.name}</span>
                    <button onclick="window.settleDebt('${debtor.originalId}', '${creditor.originalId}', ${paidAmount}, '${debtor.name} rembourse ${creditor.name}')" style="background: var(--color-gold); color: var(--bg-dark); border: none; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.75rem;">Régler</button>
                </div>`);

            debtor.amount -= paidAmount; creditor.amount -= paidAmount;
            if (debtor.amount < 0.01) dIndex++;
            if (creditor.amount < 0.01) cIndex++;
        }

        resultsContainer.innerHTML = transactions.length === 0 ? '<span style="color: #4ade80;">✨ Les comptes sont à l\'équilibre !</span>' : transactions.join('');
    }

    window.settleDebt = async function(debtorId, creditorId, amount, title) {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;
        const { data: expenseData, error: expenseError } = await client.from('trip_expenses').insert([{ trip_id: tripId, title: title, amount: amount, paid_by: debtorId }]).select().single();
        if (expenseError) return;
        await client.from('trip_expense_splits').insert([{ expense_id: expenseData.id, participant_id: creditorId }]);
        await loadSharedExpenses();
    };

    window.deleteParticipant = async function(id) {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;
        await client.from('trip_participants').delete().eq('id', id);
        await loadParticipants();
    };

    window.deleteSharedExpense = async function(id) {
        const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) return;
        await client.from('trip_expenses').delete().eq('id', id);
        await loadSharedExpenses();
    };
};
