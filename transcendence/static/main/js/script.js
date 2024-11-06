// Fonction pour animer la couleur du texte des boutons
function animateTextColor() {
  let loginButton = document.getElementById('login-btn');
  let registerButton = document.getElementById('register-btn');
  let guestButton = document.getElementById('guest-btn');
  let apiButton = document.getElementById('api-btn');

  let isOriginalColor = true;

  setInterval(function() {
    if (isOriginalColor) {
      setTimeout(function() {
        if (registerButton) registerButton.style.color = "#8EC7E1";
        if (loginButton) loginButton.style.color = "#8EC7E1";
      }, 10);

      setTimeout(function() {
        if (guestButton) guestButton.style.color = "#8EC7E1";
        if (apiButton) apiButton.style.color = "#8EC7E1";
      }, 10);
    } else {
      setTimeout(function() {
        if (registerButton) registerButton.style.color = "white";
        if (loginButton) loginButton.style.color = "white";
      }, 10);

      setTimeout(function() {
        if (guestButton) guestButton.style.color = "white";
        if (apiButton) apiButton.style.color = "white";
      }, 10);
    }

    isOriginalColor = !isOriginalColor;
  }, 1000);
}

window.onload = animateTextColor;

// Animation du terrain background
let balle = document.querySelector('.balle');
let traitGauche = document.querySelector('.trait-gauche');
let traitDroit = document.querySelector('.trait-droit');

// MODIFICATION 1 : Vérification de l'existence des éléments avant de les manipuler
if (balle && traitGauche && traitDroit) {
  // Dimensions du terrain en pourcentage
  let terrainWidth = 80; // 80vw
  let terrainHeight = 40; // 40vw

  // Frames adaptées en pourcentage
  let frames = [
      { balleX: 1, balleY: 47, raquetteGaucheY: 36.5, raquetteDroiteY: 36.5 },  // Frame 1
      { balleX: 48, balleY: 0, raquetteGaucheY: 0, raquetteDroiteY: 73 },       // Frame 2
      { balleX: 97, balleY: 47, raquetteGaucheY: 47, raquetteDroiteY: 26 },     // Frame 3
      { balleX: 41, balleY: 95, raquetteGaucheY: 7, raquetteDroiteY: 69 },      // Frame 4
      { balleX: 1, balleY: 60, raquetteGaucheY: 60, raquetteDroiteY: 10 },      // Frame 5
      { balleX: 53, balleY: 0, raquetteGaucheY: 7, raquetteDroiteY: 65 },       // Frame 6
      { balleX: 97, balleY: 37, raquetteGaucheY: 67, raquetteDroiteY: 32 },     // Frame 7
      { balleX: 48, balleY: 95, raquetteGaucheY: 7, raquetteDroiteY: 73 }       // Frame 8
  ];

  let currentFrame = 0;
  let maxFrames = frames.length;
  let transitionTime = 2200; 

  function deplacerBalleEtRaquettes() {
      let frameActuelle = frames[currentFrame];
      let prochaineFrame = frames[(currentFrame + 1) % maxFrames];
      let startTime = null;

      function animate(time) {
          if (!startTime) startTime = time;
          let progress = (time - startTime) / transitionTime;

          if (progress < 1) {
              // Interpolation linéaire pour les coordonnées X et Y de la balle
              balle.style.left = frameActuelle.balleX + (prochaineFrame.balleX - frameActuelle.balleX) * progress + '%';
              balle.style.top = frameActuelle.balleY + (prochaineFrame.balleY - frameActuelle.balleY) * progress + '%';

              // Interpolation linéaire pour les positions des raquettes
              traitGauche.style.top = frameActuelle.raquetteGaucheY + (prochaineFrame.raquetteGaucheY - frameActuelle.raquetteGaucheY) * progress + '%';
              traitDroit.style.top = frameActuelle.raquetteDroiteY + (prochaineFrame.raquetteDroiteY - frameActuelle.raquetteDroiteY) * progress + '%';

              requestAnimationFrame(animate);
          } else {
              currentFrame = (currentFrame + 1) % maxFrames;
              setTimeout(() => requestAnimationFrame(deplacerBalleEtRaquettes), 0);
          }
      }

      // Initialisation
      balle.style.left = frames[0].balleX + '%';
      balle.style.top = frames[0].balleY + '%';
      traitGauche.style.top = frames[0].raquetteGaucheY + '%';
      traitDroit.style.top = frames[0].raquetteDroiteY + '%';

      requestAnimationFrame(animate);
  }

  deplacerBalleEtRaquettes();
}

// Fonction pour ajouter le bouton du menu
function addMenuButton() {
  const menuButton = `
      <a id="menu-btn" class="nav-link text-white d-flex justify-content-center align-items-center" href="#profile">
          <img src="png/7.avif" alt="Menu" style="width: 50px; height:50px;"></img>
      </a>
  `;
  document.getElementById("navbar-right").innerHTML = menuButton;

  // MODIFICATION 2 : Utilisation de la délégation d'événements pour le bouton menu
  $(document).on('click', '#menu-btn', function(event) {
      event.preventDefault();
      // Changer le hachage pour charger la vue 'profile'
      window.location.hash = '#User-profile'; // Exemple : vue 'profile' dans l'app 'User'
  });
}

// Fonction pour obtenir le token CSRF
function getCSRFToken() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
      if (cookie.trim().startsWith('csrftoken=')) {
          return cookie.trim().substring('csrftoken='.length);
      }
  }
  return '';
}

// Configurer les requêtes AJAX pour inclure le token CSRF
$.ajaxSetup({
  beforeSend: function(xhr, settings) {
      if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
          xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
      }
  }
});

function loadContent(app, view) { // MODIFICATION 3 : Accepter 'app' et 'view'
  $.ajax({
      url: `/views/${app}/${view}/`, // MODIFICATION 3 : URL inclut 'app' et 'view'
      method: 'GET',
      success: function(response) {
          $('#content').html(response);
          initializeView(app, view); // MODIFICATION 3 : Passer 'app' et 'view'
      },
      error: function(error) {
          console.error("Erreur lors du chargement de la vue :", error);
          $('#content').html('<p>Une erreur est survenue lors du chargement de la page.</p>');
      }
  });
}

function handleHashChange() {
  const hash = window.location.hash.substring(1); // Supprime le '#'
  const [app, view] = hash.split('-'); // Suppose que le format est 'App-View'

  // MODIFICATION 4 : Vérification de l'existence de 'isAuthenticated'
  if (typeof isAuthenticated !== 'undefined' && !isAuthenticated) {
      if (view !== 'home' && view !== 'login' && view !== 'register') {
          window.location.hash = '#core-home';
          return;
      }
  }

  // Vérifier que 'app' et 'view' sont définis, sinon rediriger vers 'core-home'
  if (!app || !view) {
      window.location.hash = '#core-home';
      return;
  }

  loadContent(app, view);
}

function initializeView(app, view) { // MODIFICATION 4 : Accepter 'app' et 'view'
  if (app === 'core' && view === 'home') {
      initializeHomeView();
  } else if (app === 'User' && view === 'login') {
      initializeLoginView();
  } else if (app === 'User' && view === 'profile') {
      initializeProfileView(); // Vous devrez créer cette fonction
  }
  // Ajouter des conditions pour d'autres applications et vues si nécessaire
}

function initializeHomeView() {
  // MODIFICATION 5 : Utilisation de la délégation d'événements pour les boutons dynamiques
  $(document).on('click', '#login-btn', function(event) {
      event.preventDefault();
      window.location.hash = '#User-login'; // Charger la vue 'login' de l'app 'User'
  });

  $(document).on('click', '#register-btn', function(event) {
      event.preventDefault();
      window.location.hash = '#User-register'; // Charger la vue 'register' de l'app 'User'
  });

  // Appeler la fonction pour animer la couleur du texte
  animateTextColor();
}

function initializeLoginView() {
  // Gestionnaire pour le formulaire de login
  $(document).on('submit', '#login-form', function(event) {
      event.preventDefault();
      const formData = $(this).serialize();

      $.ajax({
          url: '/user/login/',
          method: 'POST',
          data: formData,
          success: function(response) {
              if (response.success) {
                  // Mettre à jour l'état d'authentification
                  isAuthenticated = true;
                  // Mettre à jour la barre de navigation
                  addMenuButton();
                  // Charger la vue du tableau de bord
                  window.location.hash = '#User-dashboard'; // Exemple de vue pour un utilisateur connecté
              } else {
                  // Afficher un message d'erreur
                  $('#login-error').text(response.error);
              }
          },
          error: function(error) {
              console.error("Erreur lors de la soumission du formulaire :", error);
          }
      });
  });
}

function initializeProfileView() {
  // Initialiser les événements spécifiques à la vue 'profile'
  // Exemple : gestion des clics sur les boutons dans le menu burger
  $(document).on('click', '#profile-btn', function(event) {
      event.preventDefault();
      window.location.hash = '#User-profile';
  });

  $(document).on('click', '#logout-btn', function(event) {
      event.preventDefault();
      $.ajax({
          url: '/user/logout/', // Vous devrez créer cette vue
          method: 'POST',
          success: function(response) {
              if (response.success) {
                  isAuthenticated = false;
                  window.location.hash = '#core-home';
              } else {
                  alert('Erreur lors de la déconnexion.');
              }
          },
          error: function(error) {
              console.error("Erreur lors de la déconnexion :", error);
          }
      });
  });
}

function initializeForms() {
  // Gestion du formulaire de login
  // MODIFICATION 6 : Utilisation de la délégation d'événements pour le formulaire de login
  $(document).on('submit', '#login-form', function(event) {
      event.preventDefault();
      const formData = $(this).serialize();

      $.ajax({
          url: '/user/login/',
          method: 'POST',
          data: formData,
          success: function(response) {
              if (response.success) {
                  // Mettre à jour l'état d'authentification
                  isAuthenticated = true;
                  // Mettre à jour la barre de navigation
                  addMenuButton();
                  // Charger la vue du tableau de bord
                  window.location.hash = '#User-dashboard';
              } else {
                  // Afficher un message d'erreur
                  $('#login-error').text(response.error);
              }
          },
          error: function(error) {
              console.error("Erreur lors de la soumission du formulaire :", error);
          }
      });
  });

  // Gestion du formulaire de register (similaire au login)
  // Vous pouvez implémenter cette partie de manière similaire
}

$(window).on('hashchange', handleHashChange);

$(document).ready(function() {
  handleHashChange();
});
