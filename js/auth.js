// js/auth.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Injection du CSS de la modale d'authentification
    const style = document.createElement('style');
    style.textContent = `
        .kaido-auth-modal {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(13, 11, 9, 0.88);
            backdrop-filter: blur(8px);
            z-index: 2000;
            justify-content: center;
            align-items: center;
        }
        .kaido-auth-card {
            background: #14110E;
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 8px;
            padding: 2.5rem;
            width: 90%;
            max-width: 420px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
            position: relative;
        }
        .kaido-auth-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            color: #F4EFEA;
            margin-bottom: 0.5rem;
            text-align: center;
        }
        .kaido-auth-sub {
            color: #8E847A;
            font-size: 0.85rem;
            text-align: center;
            margin-bottom: 1.8rem;
        }
        .kaido-google-btn {
            width: 100%;
            background: #ffffff;
            color: #333333;
            border: 1px solid rgba(212, 175, 55, 0.3);
            padding: 0.8rem;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 1.2rem;
            transition: all 0.3s ease;
        }
        .kaido-google-btn:hover {
            background: #f1f1f1;
            border-color: #D4AF37;
        }
        .kaido-auth-divider {
            text-align: center;
            color: #8E847A;
            font-size: 0.8rem;
            margin-bottom: 1.2rem;
            position: relative;
        }
        .kaido-auth-field {
            margin-bottom: 1.2rem;
        }
        .kaido-auth-field label {
            display: block;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #D4AF37;
            margin-bottom: 0.4rem;
        }
        .kaido-auth-field input {
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-bottom: 2px solid rgba(212, 175, 55, 0.3);
            padding: 0.8rem 1rem;
            color: #F4EFEA;
            border-radius: 4px;
            outline: none;
            font-family: inherit;
        }
        .kaido-auth-field input:focus {
            border-bottom-color: #D4AF37;
            background: rgba(255, 255, 255, 0.05);
        }
        .kaido-auth-btn {
            width: 100%;
            background: linear-gradient(135deg, #A63A2B, #82271B);
            color: #ffffff;
            border: 1px solid rgba(212, 175, 55, 0.2);
            padding: 0.9rem;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 0.5rem;
            transition: all 0.3s ease;
        }
        .kaido-auth-btn:hover {
            border-color: #D4AF37;
            transform: translateY(-2px);
        }
        .kaido-auth-toggle {
            text-align: center;
            margin-top: 1.5rem;
            font-size: 0.85rem;
            color: #8E847A;
        }
        .kaido-auth-toggle a {
            color: #D4AF37;
            text-decoration: none;
            font-weight: 600;
            cursor: pointer;
        }
        .kaido-auth-close {
            position: absolute;
            top: 1rem; right: 1.2rem;
            background: none; border: none;
            color: #8E847A; font-size: 1.4rem;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // 2. Structure HTML de la Modale
    const modalHTML = `
        <div id="kaidoAuthModal" class="kaido-auth-modal">
            <div class="kaido-auth-card">
                <button class="kaido-auth-close" id="closeAuthModal">✕</button>
                <h3 class="kaido-auth-title" id="authTitle">Connexion à Kaido</h3>
                <p class="kaido-auth-sub" id="authSub">Accédez à tous vos carnets de route synchronisés.</p>
                
                <!-- BOUTON GOOGLE OAUTH -->
                <button type="button" id="googleLoginBtn" class="kaido-google-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.15C3.17 21.32 7.24 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.19C.43 8.13 0 9.87 0 11.7c0 1.83.43 3.57 1.19 5.1l4.08-2.56z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.24 0 3.17 2.68 1.19 6.6l4.08 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                    Continuer avec Google
                </button>

                <div class="kaido-auth-divider">ou par email</div>

                <form id="kaidoAuthForm">
                    <div class="kaido-auth-field">
                        <label for="authEmail">Adresse Email</label>
                        <input type="email" id="authEmail" placeholder="votre.email@exemple.com" required>
                    </div>
                    <div class="kaido-auth-field">
                        <label for="authPassword">Mot de passe</label>
                        <input type="password" id="authPassword" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="kaido-auth-btn" id="authSubmitBtn">Se connecter</button>
                </form>

                <div class="kaido-auth-toggle">
                    <span id="toggleText">Pas encore de compte ?</span>
                    <a id="toggleAuthMode">Créer un compte</a>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 3. Gestionnaires d'état
    let isSignUpMode = false;
    const modal = document.getElementById('kaidoAuthModal');
    const authForm = document.getElementById('kaidoAuthForm');
    const authTitle = document.getElementById('authTitle');
    const authSub = document.getElementById('authSub');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    const toggleText = document.getElementById('toggleText');

    const toggleMode = (signUp) => {
        isSignUpMode = signUp;
        if (isSignUpMode) {
            authTitle.textContent = "Créer un compte Kaido";
            authSub.textContent = "Sauvegardez vos itinéraires sur le cloud.";
            authSubmitBtn.textContent = "Créer mon compte";
            toggleText.textContent = "Déjà inscrit ? ";
            toggleAuthMode.textContent = "Se connecter";
        } else {
            authTitle.textContent = "Connexion à Kaido";
            authSub.textContent = "Accédez à tous vos carnets de route synchronisés.";
            authSubmitBtn.textContent = "Se connecter";
            toggleText.textContent = "Pas encore de compte ? ";
            toggleAuthMode.textContent = "Créer un compte";
        }
    };

    if (toggleAuthMode) toggleAuthMode.addEventListener('click', () => toggleMode(!isSignUpMode));
    if (document.getElementById('closeAuthModal')) {
        document.getElementById('closeAuthModal').addEventListener('click', () => modal.style.display = 'none');
    }

    // Gestionnaire du clic sur le bouton Google OAuth
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
            if (!client) {
                alert("Supabase indisponible.");
                return;
            }
            try {
                const { error } = await client.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + window.location.pathname
                    }
                });
                if (error) throw error;
            } catch (err) {
                alert("Erreur de connexion Google : " + err.message);
            }
        });
    }

    // 4. Inscription / Connexion Supabase classique par email
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value.trim();
            const password = document.getElementById('authPassword').value;

            const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
            if (!client) {
                alert("Supabase indisponible.");
                return;
            }

            authSubmitBtn.disabled = true;
            authSubmitBtn.textContent = "Patientez...";

            try {
                if (isSignUpMode) {
                    const { data, error } = await client.auth.signUp({ email, password });
                    if (error) throw error;
                    alert("Compte créé avec succès ! " + (data.session ? "" : "Vérifiez vos emails si la confirmation est activée."));
                } else {
                    const { data, error } = await client.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                }
                modal.style.display = 'none';
                location.reload();
            } catch (err) {
                alert("Erreur : " + err.message);
            } finally {
                authSubmitBtn.disabled = false;
                authSubmitBtn.textContent = isSignUpMode ? "Créer mon compte" : "Se connecter";
            }
        });
    }

    // 5. Mettre à jour notre bouton existant dans le Header (Extraction ultra-précise du Prénom)
const updateHeaderAuth = async () => {
    const authBtn = document.getElementById('user-profile-link');
    const nameSpan = document.getElementById('user-display-name');
    if (!authBtn) return;

    const client = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
    let user = null;

    if (client && client.auth) {
        try {
            const { data } = await client.auth.getUser();
            user = data?.user || null;
        } catch (err) {
            console.warn("Impossible de récupérer l'utilisateur:", err);
        }
    }

    if (user) {
        const rawSource = user.user_metadata?.given_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
        const rawFirstName = String(rawSource).trim().split(/\s+/)[0];
        const firstName = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase();

        const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        if (userAvatar && authBtn) {
            authBtn.innerHTML = `
                <img src="${userAvatar}" alt="${firstName}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--color-gold);">
            `;
        } else if (nameSpan) {
            nameSpan.textContent = firstName;
        }

        if (nameSpan) nameSpan.textContent = firstName;
        authBtn.title = "Connecté - Cliquer pour vous déconnecter";
        authBtn.onclick = async (e) => {
            e.preventDefault();
            if (confirm("Voulez-vous vous déconnecter ?")) {
                if (client) await client.auth.signOut();
                location.reload();
            }
        };
    } else {
        if (nameSpan) nameSpan.textContent = "Connexion";
        authBtn.title = "Se connecter";
        authBtn.onclick = (e) => {
            e.preventDefault();
            toggleMode(false);
            modal.style.display = 'flex';
        };
    }
};

    await updateHeaderAuth();
});
