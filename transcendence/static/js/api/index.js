// api/index.js
// contient uniquement les fonctions que l' on souhaite appeler depuis d'autres fichiers

export { Api } from './api.js';
export { getViewJson } from './getView.js';
export { RequestError, HTTPError, ContentTypeError, NetworkError } from './apiErrors.js';
