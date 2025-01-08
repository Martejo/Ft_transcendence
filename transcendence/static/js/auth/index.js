// auth/index.js
// contient uniquement les fonctions que l' on souhaite appeler depuis d'autres fichiers

export { initializeLoginView } from './login.js';
export { initializeRegisterView } from './register.js';
export { logoutUser } from './logout.js';

// Export des vues 2FA
export { initializeEnable2FAView } from './2faEnable.js';
export { initializeLogin2FAView } from './2faLogin.js';
export { initializeDisable2FAView } from './2faDisable.js';

export { handleDeleteAccount } from './deleteAccount.js';