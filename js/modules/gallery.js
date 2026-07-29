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
            // Création d'une case carrée parfaite (aspect-ratio: 1)
            item.style.cssText = `position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);`;
            
            item.innerHTML = `
                <a href="${photo.url}" target="_blank">
                    <img src="${photo.url}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;">
                </a>
                <button class="btn-delete-photo" data-id="${photo.id}" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); border: none; color: #fff; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;" title="Supprimer">✖</button>
            `;
            
            // Suppression de la photo
            item.querySelector('.btn-delete-photo').addEventListener('click', async (e) => {
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
        dropzone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') fileInput.click();
        });
    }

    // 3. Fonction Magique : Compression de l'image (Canvas)
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200; // Résolution max largement suffisante
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    // Calcul du ratio pour réduire la taille
                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Compression en JPEG qualité 80% (Poids divisé par ~15)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
            };
        });
    };

    // 4. Envoi à Cloudinary
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            progressText.style.display = 'block';

            try {
                // On boucle sur toutes les photos sélectionnées (Upload multiple)
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    
                    progressText.textContent = `⏳ Compression image ${i+1}/${files.length}...`;
                    const base64Image = await compressImage(file);

                    progressText.textContent = `☁️ Envoi au cloud ${i+1}/${files.length}...`;
                    const formData = new FormData();
                    formData.append('file', base64Image);
                    formData.append('upload_preset', UPLOAD_PRESET);

                    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    
                    if (data.secure_url) {
                        // Sauvegarde du lien généré par Cloudinary
                        window.activeTrip.gallery.push({
                            id: Date.now() + i,
                            url: data.secure_url,
                            date: new Date().toISOString()
                        });
                    }
                }

                progressText.textContent = `✅ Enregistrement...`;
                await window.saveTrip();
                renderGallery();

            } catch (error) {
                console.error("Erreur d'upload :", error);
                alert("Une erreur est survenue pendant l'envoi.");
            } finally {
                progressText.style.display = 'none';
                fileInput.value = ''; // Réinitialiser le champ
            }
        });
    }
};
