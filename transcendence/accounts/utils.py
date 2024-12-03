# User/utils.py
import bcrypt

# [IMPROVE] Conseil de chat gpt : revoir le CustomUser de Models.py pour ne pas avoir a gerer nous meme les passwords
#   Supprimez ces fonctions et utilisez les méthodes intégrées de Django (set_password et check_password).
#   Cela garantit une gestion sécurisée des mots de passe en utilisant les algorithmes recommandés.
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(hashed_password, password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
