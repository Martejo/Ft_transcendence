// auth/login.js
//import Api from '../api/api.js';
import { requestGet } from '../api/index.js';
import { HTTPError } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js'

//[IMPROVE] cette fonction doit rediriger vers la page gane-play lorsque l' utilisateur est authenticated

export async function initializeHomeView() {

    console.log('initializeHomeView');
    let data;
    try {
        data = await requestGet('core', 'home')
        
        //[IMPROVE] integrer ce if else directement dans updateHtmlContent ?
        if (data && data.html)
            updateHtmlContent('#content', data.html)
        else
            console.error('Les données HTML de la page d\'accueil sont manquantes.');
    } 
    catch (error) {
        // [IMPROVE] Faire des gestionnaires d'erreurs specialises pour chaque retour 
        if (error instanceof HTTPError) {
            if (error.status === 403) {
                console.error('Erreur 403 : Utilisateur deja authentifié');
                window.location.hash = "game-home";
                return;
            }
        }
        else
            console.error('Erreur non traitee lors de la récupération de core home :', error);
    }

    //event : click on login_btn =  change hash => load login view
    const loginBtn = document.querySelector('#login-btn');
    if (!loginBtn) return;

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('login clicked');
        window.location.hash = "#accounts-login"
    });

    //event : click on register_btn = change hash => load register view
    const registerBtn = document.querySelector('#register-btn');
    if (!registerBtn) return;

    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('register clicked');
        window.location.hash = "#accounts-register"
    });

    console.log('Fin de initializeHomeView');
}

