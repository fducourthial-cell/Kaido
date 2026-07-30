window.initDocumentsModule = function() {
     if (!window.activeTrip.documents) window.activeTrip.documents = [];
    const renderDocuments = () => {
        const container = document.getElementById('documents-list');
        if (!container) return;
        
        container.innerHTML = '';
        if (window.activeTrip.documents.length === 0) {
            container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem; grid-column: 1 / -1; text-align: center;">Aucun document sauvegardé pour ce voyage.</span>`;
            return;
        }

        window.activeTrip.documents.forEach(doc => {
            const isPDF = doc.url.toLowerCase().includes('.pdf');
            const icon = isPDF ? '📄' : '🖼️';

            const card = document.createElement('div');
            card.style.cssText = `background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;`;
            
            card.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 1rem;">
                    <span style="font-size: 1.5rem;">${icon}</span>
                    <strong style="color: var(--text-main); font-size: 0.9rem; word-break: break-word;">${doc.title}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(212,175,55,0.1); padding-top: 0.8rem;">
                    <a href="${doc.url}" target="_blank" style="color: var(--color-gold); text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(212,175,55,0.1); padding: 0.3rem 0.6rem; border-radius: 4px;">Ouvrir</a>
                    <button class="btn-delete-doc" data-id="${doc.id}" style="background: none; border: none; color: var(--color-torii); cursor: pointer; font-size: 0.9rem;" title="Supprimer">🗑️</button>
                </div>
            `;

            card.querySelector('.btn-delete-doc').addEventListener('click', async () => {
                if(confirm(`Supprimer le document "${doc.title}" ?`)) {
                    const filePath = doc.url.split('travel_docs/')[1];
                    if (filePath) await supabase.storage.from('travel_docs').remove([filePath]);
                    window.activeTrip.documents = window.activeTrip.documents.filter(d => d.id !== doc.id);
                    await window.saveTrip();
                    renderDocuments();
                }
            });
            container.appendChild(card);
        });
    };

    renderDocuments();

    const docForm = document.getElementById('upload-doc-form');
    if (docForm) {
        docForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('doc-file-input');
            const titleInput = document.getElementById('doc-title-input');
            const submitBtn = document.getElementById('btn-upload-doc');

            const file = fileInput.files[0];
            const title = titleInput.value.trim();
            if (!file || !title) return;

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = "⏳ Téléversement...";
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";

            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${window.activeTrip.id}/${fileName}`; 

                const { error: uploadError } = await supabase.storage.from('travel_docs').upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('travel_docs').getPublicUrl(filePath);

                window.activeTrip.documents.push({ id: Date.now(), title: title, url: urlData.publicUrl });
                await window.saveTrip();
                renderDocuments();

                fileInput.value = ''; titleInput.value = '';
            } catch (err) {
                console.error("Erreur lors de l'upload :", err);
                alert("Une erreur est survenue lors de l'ajout du document.");
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
        });
    }
};
