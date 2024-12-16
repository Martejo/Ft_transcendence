// auth/login.js
//import Api from '../api/api.js';
import { getViewJson } from './getView.js';
import { getViewJson } from '../api/getView.js';
import { loadNavbar } from '../navbar/index.js';

//[IMPROVE] cette fonction doit rediriger vers la page gane-play lorsque l' utilisateur est authenticated
export function initializeHomeView() {
    if(isAuthenticate = true){

    }
    
    const data = NULL;
    try {
        data = getViewJson('core', 'home')
        updateHtmlContent('#content', data.html)
    } 
    
    catch (error) {
        
        // [IMPROVE] Faire un gestionnaire d'erreurs 
        console.error('Erreur lors de la requete API initializeHomeView :', error);
    }

    //event : click on login_btn =  change hash => load login view
    const loginBtn = document.querySelector('#login-btn');
    if (!loginBtn) return;

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash= "#account-login"
    });

    //event : click on register_btn = change hash => load register view
    const registerBtn = document.querySelector('#register-btn');
    if (!registerBtn) return;

    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash= "#account-register"
    });
}