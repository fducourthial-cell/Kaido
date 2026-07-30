window.initGalleryModule = function() {
    // Initialisation de la donnée si inexistante
    if (!window.activeTrip.gallery) window.activeTrip.gallery = [];

    const grid = document.getElementById('gallery-grid');
    const fileInput = document.getElementById('gallery-file-input');
    const dropzone = document.getElementById('gallery-dropzone');
    const progressText = document.getElementById('gallery-upload-progress');

    // --- TES CLÉS CLOUDINARY ---
    const CLOUD_NAME = 'extb0gyo';
    const UPLOAD_PRESET = 'e65nihpw';

    // 1. Fonction pour afficher la galerie
    const renderGallery = () => {
        if (!grid) return;
        grid.innerHTML = '';

        if (window.activeTrip.gallery.length === 0) {
            grid.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem; grid-column: 1 / -1; text-align: center;">Aucune photo pour le moment. Soyez le premier !</span>';
            return;
        }

        window.activeTrip.gallery.forEach(photo => {
            const item = document.createElement('div');
            item.style.cssText = `position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);`;
            
            // Badge visuel si la photo attend d'être envoyée sur le Cloud
            const syncBadge = photo.isPending ? `<div style="position: absolute; top: 5px; left: 5px; background: var(--color-torii); color: white; font-size: 0.65rem; padding: 3px 6px; border-radius: 4px; font-weight: bold; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.5);" title="En attente de réseau">⏳ Hors-ligne</div>` : '';

            item.innerHTML = `
                ${syncBadge}
                <a href="${photo.url}" target="_blank" style="display: block; width: 100%; height: 100%;">
                    <img src="${photo.url}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; ${photo.isPending ? 'filter: brightness(0.8);' : ''}">
                </a>
                <button class="btn-delete-photo" data-id="${photo.id}" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); border: none; color: #fff; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; z-index: 10;" title="Supprimer">✖</button>
            `;
            
            // Suppression de la photo
            item.querySelector('.btn-delete-photo').addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if(confirm("Supprimer cette photo de la galerie ?")) {
                    window.activeTrip.gallery = window.activeTrip.gallery.filter(p => p.id !== photo.id);
                    await window.saveTrip();
                    renderGallery();
                }
            });

            grid.appendChild(item);
        });
    };

    renderGallery();

    // 2. Clic sur la zone pour ouvrir l'explorateur de fichiers
    if (dropzone && fileInput) {
        // Nettoyage des écouteurs existants pour éviter les doublons au rechargement
        const newDropzone = dropzone.cloneNode(true);
        dropzone.parentNode.replaceChild(newDropzone, dropzone);
        newDropzone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') document.getElementById('gallery-file-input').click();
        });
    }

    // 3. Compression de l'image
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
            };
        });
    };

    // 4. Fonction de synchronisation en arrière-plan
    const processPendingUploads = async () => {
        if (!navigator.onLine) return; // Arrêt si pas de réseau
        
        const pendingPhotos = window.activeTrip.gallery.filter(p => p.isPending);
        if (pendingPhotos.length === 0) return;

        let dataUpdated = false;

        for (let photo of pendingPhotos) {
            try {
                const formData = new FormData();
                formData.append('file', photo.url); // Base64
                formData.append('upload_preset', UPLOAD_PRESET);

                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                
                if (data.secure_url) {
                    // Remplacement de l'URL Base64 locale par l'URL Cloudinary
                    photo.url = data.secure_url;
                    photo.isPending = false;
                    dataUpdated = true;
                }
            } catch (error) {
                console.error("Erreur de synchronisation pour la photo", photo.id, error);
            }
        }

        // Si au moins une photo a été uploadée, on sauvegarde et on rafraîchit l'UI
        if (dataUpdated) {
            await window.saveTrip();
            renderGallery();
        }
    };

    // Écouteur global : déclenche l'upload dès que le réseau revient
    window.addEventListener('online', processPendingUploads);
    
    // Tente un upload au démarrage du module s'il y a des photos en attente et du réseau
    if (navigator.onLine) {
        processPendingUploads();
    }

    // 5. Gestion de l'ajout de nouvelles photos
    const currentFileInput = document.getElementById('gallery-file-input');
    if (currentFileInput) {
        const newFileInput = currentFileInput.cloneNode(true);
        currentFileInput.parentNode.replaceChild(newFileInput, currentFileInput);

        newFileInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            progressText.style.display = 'block';

            try {
                let photosAdded = false;

                // On stocke d'abord toutes les photos en local
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    progressText.textContent = `⏳ Traitement de l'image ${i+1}/${files.length}...`;
                    
                    const base64Image = await compressImage(file);

                    window.activeTrip.gallery.push({
                        id: Date.now() + i,
                        url: base64Image,
                        date: new Date().toISOString(),
                        isPending: true // Tag vital pour le hors-ligne
                    });
                    
                    photosAdded = true;
                }

                if (photosAdded) {
                    progressText.textContent = `✅ Sauvegarde locale réussie...`;
                    await window.saveTrip();
                    renderGallery(); // Affichage immédiat dans l'interface

                    // Tentative d'envoi en arrière-plan si réseau présent
                    if (navigator.onLine) {
                        progressText.textContent = `☁️ Synchronisation cloud en cours...`;
                        await processPendingUploads();
                    } else {
                        progressText.textContent = `📵 Synchronisation en attente de réseau.`;
                    }
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout de l'image :", error);
                alert("Une erreur est survenue lors de l'enregistrement de l'image.");
            } finally {
                setTimeout(() => { progressText.style.display = 'none'; }, 3000);
                newFileInput.value = ''; // Réinitialisation
            }
        });
    }
};
