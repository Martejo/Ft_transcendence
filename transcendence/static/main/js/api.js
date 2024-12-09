// Ce fichier centralise les appels AJAX vers l'API de votre application.
// Il fournit des méthodes génériques et spécifiques pour effectuer des requêtes HTTP vers notre backend(=api).
// Les methodes de cette classe sont utiles pour gerer l'interaction entre views.js et notre backend 

const Api = {
    baseUrl: '/api/', // Base URL pour toutes les requêtes API

    // Fonction pour obtenir le token CSRF
    getCSRFToken() {
        return document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='))?.split('=')[1] || '';
    },

    // Fonction pour obtenir le token JWT depuis le sessionStorage
    getJWTToken() {
        return sessionStorage.getItem('jwtToken') || null;
    },

    // Fonction générique pour les requêtes
    request(url, method = 'GET', data = {}, headers = {}, onSuccess = () => {}, onError = () => {}) {
        const csrfToken = this.getCSRFToken();
        const jwtToken = this.getJWTToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        };

        if (jwtToken) {
            defaultHeaders['Authorization'] = `Bearer ${jwtToken}`;
        }

        // fetch => utilitaire (api) nous permettant de generer des requetes HTTP async vers notre backend.
        fetch(this.baseUrl + url, {
            method,
            headers: { ...defaultHeaders, ...headers },
            body: method !== 'GET' ? JSON.stringify(data) : undefined,
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
            })
            .then(onSuccess)
            .catch(onError);
    },

    //---------------- REQUETES BASIQUES -----------------
    // Explication :Methodes basiques appelant la methode request() avec des arguments prepares a l'avance 
    // Objectif : simplifier l'appel a request() en passant par des methodes qui attendent des arguments plus specifiques.


    // Méthode simplifiée pour effectuer une requete GET (requete qui HTTP ne contenant jamais de body)
    // Récupère des données depuis le serveur.
    get(url, onSuccess, onError) {
        this.request(url, 'GET', {}, {}, onSuccess, onError);
    },

    // Méthode simplifiée pour POST
    // Envoie des données au serveur pour créer ou modifier des ressources.
    post(url, data, onSuccess, onError) {
        this.request(url, 'POST', data, {}, onSuccess, onError);
    },

    // Méthode simplifiée pour PUT
    // Envoie des données pour mettre à jour des ressources existantes.
    put(url, data, onSuccess, onError) {
        this.request(url, 'PUT', data, {}, onSuccess, onError);
    },

    // Méthode simplifiée pour DELETE
    // Supprime des ressources sur le serveur.
    delete(url, data, onSuccess, onError) {
        this.request(url, 'DELETE', data, {}, onSuccess, onError);
    },




    //---------------- REQUETES SPECIALISEES -----------------

    // Met à jour le statut d'un utilisateur (en ligne, hors ligne, etc.).
    updateStatus(status, onSuccess, onError) {
        this.post('update_status/', { status }, onSuccess, onError);
    },

    // Exemple pour gérer les invitations d'amis
    // Envoie une invitation d'ami.
    sendFriendRequest(friendUsername, onSuccess, onError) {
        this.post('send_friend_request/', { friend_username: friendUsername }, onSuccess, onError);
    },

    // Annule une invitation d'ami existante.
    cancelFriendRequest(friendUsername, onSuccess, onError) {
        this.post('cancel_friend_request/', { friend_username: friendUsername }, onSuccess, onError);
    },

    // Accepte ou refuse une invitation d'ami.
    handleFriendRequest(requestId, action, onSuccess, onError) {
        this.post('handle_friend_request/', { request_id: requestId, action }, onSuccess, onError);
    },

    // Chargement des données utilisateur
    // Récupère les informations de profil utilisateur.
    getUserProfile(onSuccess, onError) {
        this.get('get_user_profile_data/', onSuccess, onError);
    },

    // Chargement des données du menu burger
    // Récupère les informations nécessaires pour afficher le menu burger (amis, avatar, etc.).
    getBurgerMenuData(onSuccess, onError) {
        this.get('get_burger_menu_data/', onSuccess, onError);
    },
};

export default Api;
