// [RESSOURCES] https://docs.google.com/document/d/1X_Rb3YWQRoStFm36sitQ8bAURj4iXGCp-LhOAs67YOA/edit?tab=t.0#heading=h.gk6wtwi17q59

// Ce fichier gère l'initialisation et la gestion des différentes vues de votre application web.
// Il centralise les actions spécifiques à chaque vue 
import Api from './api.js'; // Importation d'un module qui gère probablement les appels réseau AJAX (API HTTP).

// Creation de l'objet Views qui contient toutes les methodes liees a la generation des vues (on utilise un objet pour l'encapsulation)
const Views = {
    // Initialisation de la vue de connexion
    initializeLoginView() {
        const loginForm = document.querySelector('#login-form'); // Sélectionne l'élément du DOM ayant l'ID 'login-form'.

        if (loginForm) { // Vérifie si le formulaire de connexion existe dans la page.
            loginForm.addEventListener('submit', event => { 
                // Ajoute un gestionnaire d'événements au formulaire pour intercepter sa soumission.
                event.preventDefault(); // Empêche le comportement par défaut du navigateur (le rechargement de la page).

                const formData = new FormData(loginForm); 
                // Récupère les données du formulaire sous forme d'un objet FormData.

                const data = Object.fromEntries(formData.entries()); 
                // Convertit FormData en un objet JavaScript simple (clé/valeur).

                Api.post('accounts/submit_login/', data, 
                    // Appelle une méthode Api.post pour envoyer une requête POST à l'URL spécifiée avec les données du formulaire.
                    response => { 
                        // Callback de succès, appelée si la requête réussit.
                        if (response.status === 'success') { 
                            // Vérifie si la réponse indique un succès.
                            console.log('Connexion réussie');
                            localStorage.setItem('jwtToken', response.jwtToken); 
                            // Stocke le jeton JWT dans le sessionStorage pour l'utiliser plus tard.
                            window.location.hash = '#accounts-profile'; 
                            // Change le hash dans l'URL pour rediriger l'utilisateur vers la vue profil.
                        } else {
                            console.error('Erreur de connexion :', response.message);
                            this.displayError('#login-error', response.message); 
                            // Affiche un message d'erreur spécifique si la connexion échoue.
                        }
                    },
                    error => {
                        // Callback d'erreur réseau.
                        console.error('Erreur réseau lors de la connexion :', error);
                        this.displayError('#login-error', 'Une erreur réseau est survenue.'); 
                        // Affiche un message d'erreur général en cas de problème réseau.
                    }
                );
            });
        }
    },

    // Initialisation de la vue d'inscription
    initializeRegisterView() {
        const registerForm = document.querySelector('#register-form'); // Sélectionne le formulaire d'inscription.

        if (registerForm) { 
            // Vérifie que le formulaire existe avant d'y attacher un gestionnaire.
            registerForm.addEventListener('submit', event => {
                event.preventDefault(); // Empêche le rechargement de la page.

                const formData = new FormData(registerForm);
                const data = Object.fromEntries(formData.entries()); 
                // Transforme les données en objet JavaScript.

                Api.post('accounts/submit_registration/', data, 
                    response => {
                        if (response.status === 'success') {
                            alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                            window.location.hash = '#accounts-login'; 
                            // Redirige l'utilisateur vers la page de connexion.
                        } else {
                            console.error('Erreur lors de l\'inscription :', response);
                            this.displayError('#register-error', response.message || 'Une erreur est survenue.');
                        }
                    },
                    error => {
                        console.error('Erreur réseau lors de l\'inscription :', error);
                        this.displayError('#register-error', 'Une erreur réseau est survenue.');
                    }
                );
            });
        }
    },

    // Initialisation de la vue de gestion du profil utilisateur
    initializeProfileView() {
        Api.get('accounts/get_user_profile_data/',
            data => { 
                // Callback appelée en cas de succès de la requête GET.
                if (data) {
                    document.querySelector('#profile-username').textContent = data.username; 
                    // Met à jour l'élément avec le nom d'utilisateur.
                    document.querySelector('#profile-avatar').src = data.avatar_url; 
                    // Met à jour l'image de l'avatar.
                }
            },
            error => {
                console.error('Erreur lors du chargement du profil utilisateur :', error);
            }
        );

        const logoutButton = document.querySelector('#logout-btn'); // Sélectionne le bouton de déconnexion.

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                Api.post('accounts/logout/', {}, 
                    // Envoie une requête POST pour déconnecter l'utilisateur.
                    () => {
                        localStorage.removeItem('jwtToken'); 
                        // Supprime le jeton JWT stocké.
                        alert('Vous êtes déconnecté.');
                        window.location.hash = '#core-home'; 
                        // Redirige vers la page d'accueil.
                    },
                    error => {
                        console.error('Erreur lors de la déconnexion :', error);
                    }
                );
            });
        }
    },

    // Méthode utilitaire pour afficher les erreurs
    displayError(selector, message) {
        const errorElement = document.querySelector(selector); // Sélectionne l'élément destiné à afficher les erreurs.
        if (errorElement) {
            errorElement.textContent = message; // Met à jour le contenu avec le message d'erreur.
            errorElement.style.display = 'block'; // Affiche l'élément.
            setTimeout(() => {
                errorElement.style.display = 'none'; // Masque l'élément après 5 secondes.
            }, 5000);
        }
    },

    // Initialisation des vues dynamiquement selon le hash de l'URL
    initializeViewFromHash() {
        const hash = window.location.hash.substring(1); 
        // Récupère le hash de l'URL (sans le caractère #).
        const [app, view] = hash.split('-'); 
        // Sépare le hash en deux parties : application et vue (exemple : "accounts-login").

        if (app && view) {
            // Vérifie que le hash est valide avant de tenter de l'initialiser.
            switch (`${app}-${view}`) { 
                // Choisit la vue à initialiser en fonction du hash.
                case 'accounts-login':
                    this.initializeLoginView();
                    break;
                case 'accounts-register':
                    this.initializeRegisterView();
                    break;
                case 'accounts-profile':
                    this.initializeProfileView();
                    break;
                default:
                    console.warn('Vue inconnue :', hash);
            }
        } else {
            window.location.hash = '#core-home'; 
            // Si aucun hash valide, redirige vers la page d'accueil.
        }
    },

    // Initialisation globale à appeler lors du chargement de la page
    initializeGlobalEvents() {
        window.addEventListener('hashchange', () => this.initializeViewFromHash()); 
        // Met à jour la vue à chaque changement de hash dans l'URL.
        this.initializeViewFromHash(); 
        // Initialise la vue correspondant au hash actuel.
    },
};

export default Views; // Rend l'objet Views disponible pour être utilisé dans d'autres fichiers.
