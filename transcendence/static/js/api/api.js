const Api = {
    getCSRFToken() {
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
        return cookie ? cookie.trim().substring('csrftoken='.length) : '';
    },

    getJWTToken() {
        return localStorage.getItem('jwtToken') || null;
    },

    /**
     * Effectue une requête HTTP avec fetch en utilisant FormData.
     * @param {string} url - L'URL complète de la ressource.
     * @param {string} method - La méthode HTTP (GET, POST, PUT, DELETE).
     * @param {FormData|null} formData - Les données à envoyer dans le corps de la requête, sous forme de FormData.
     * @param {Object} headers - Headers supplémentaires à ajouter.
     * @returns {Promise} - Une promesse résolue avec les données JSON ou rejetée en cas d'erreur.
     */
    async request(url, method = 'GET', formData = null, headers = {}) {
        const csrfToken = this.getCSRFToken();
        const jwtToken = this.getJWTToken();
    
        const defaultHeaders = {
            'X-CSRFToken': csrfToken,
        };
    
        if (jwtToken) {
            defaultHeaders['Authorization'] = `Bearer ${jwtToken}`;
        }
    
        const response = await fetch(url, {
            method,
            headers: { ...defaultHeaders, ...headers },
            body: (method !== 'GET' && formData instanceof FormData) ? formData : undefined,
        });
    
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();// Conversion automatique en objet JS
        } else {
            // [IMPROVE] on ne devrait pas se retrouver ici car notre back ne retourne que du json
            return response.text();
        }
    },

    get(url) {
        return this.request(url, 'GET');
    },

    post(url, formData) {
        return this.request(url, 'POST', formData);
    },

    put(url, formData) {
        return this.request(url, 'PUT', formData);
    },

    delete(url, formData) {
        return this.request(url, 'DELETE', formData);
    }
};

export default Api;
