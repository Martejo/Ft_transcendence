// ajax_utils.js

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

// Fonction générique pour les requêtes AJAX
function ajaxRequest(url, method, data, successCallback, errorCallback) {
    $.ajax({
        url: url,
        method: method,
        data: data,
        beforeSend: function(xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            }
        },
        success: successCallback,
        error: errorCallback
    });
}

