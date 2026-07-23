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
        .btn-header-auth {
            background: rgba(212, 175, 55, 0.08);
            border: 1px solid rgba(212, 175, 55, 0.25);
            color: #D4AF37;
            padding: 0.45rem 0.9rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        .btn-header-auth:hover {
            background: #D4AF37;
            color: #0D0B09;
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

    // 4. Inscription / Connexion Supabase
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

    // 5. Injecter et mettre à jour le bouton dans le Header
    const updateHeaderAuth = async () => {
        let headerRight = document.querySelector('.header-right') || document.querySelector('header nav');
        if (!headerRight) return;

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

        let authBtn = document.getElementById('kaidoHeaderAuthBtn');
        if (!authBtn) {
            authBtn = document.createElement('button');
            authBtn.id = 'kaidoHeaderAuthBtn';
            authBtn.className = 'btn-header-auth';
            headerRight.appendChild(authBtn);
        }

        if (user) {
            authBtn.textContent = `👤 ${user.email.split('@')[0]}`;
            authBtn.title = "Cliquer pour vous déconnecter";
            authBtn.onclick = async () => {
                if (confirm("Voulez-vous vous déconnecter de Kaido ?")) {
                    if (client) await client.auth.signOut();
                    location.reload();
                }
            };
        } else {
            authBtn.textContent = "🔑 Connexion";
            authBtn.onclick = () => {
                toggleMode(false);
                modal.style.display = 'flex';
            };
        }
    };

    await updateHeaderAuth();
});
