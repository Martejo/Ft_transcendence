import { updateHtmlContent } from '../tools/index.js'
import { requestGet } from '../api/index.js';


//[IMPROVE] cette fonction doit rediriger vers la page gane-play lorsque l' utilisateur est authenticated

export async function initializeGameHomeView() {

    console.log('initializeGameHomeView');
    let data;
    try {
        data = await requestGet('game', 'home')
        
        if (data && data.html)
            updateHtmlContent('#content', data.html)
        else
            console.error('Les données HTML de la page d\'accueil sont manquantes.');
    } 
    catch (error) {
        
        // [IMPROVE] Faire un gestionnaire d'erreurs 
        console.error('Erreur lors de la requete API initializeGameHomeView :', error);
    }

    //event : click on login_btn =  change hash => load login view
    const playBtn = document.querySelector('#play-btn');
    if (!playBtn) return;

    playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('play-btn clicked');
        window.location.hash = "#game-game_menu"
    });



    console.log('Fin de initializeGameHomeView');
}

