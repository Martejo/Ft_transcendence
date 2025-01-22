import random
from django.utils.timezone import now
from accounts.models import CustomUser
from game.models import GameResult

def simulate_matches_for_jojo():
    """
    Simule des matchs pour l'utilisateur 'jojo'.
    """
    # Vérifier si l'utilisateur 'jojo' existe
    try:
        user_jojo = CustomUser.objects.get(username="jojo")
    except CustomUser.DoesNotExist:
        print("Erreur : L'utilisateur 'jojo' n'existe pas. Veuillez le créer manuellement avec un mot de passe valide.")
        return

    # Créer deux autres utilisateurs pour les adversaires s'ils n'existent pas
    user2, created2 = CustomUser.objects.get_or_create(username="Player2")
    user3, created3 = CustomUser.objects.get_or_create(username="Player3")

    # S'assurer que les utilisateurs adversaires ont un mot de passe haché et un avatar
    if created2 or not user2.has_usable_password():
        user2.set_password("password2")
        user2.avatar = "avatars/default_avatar.png"
        user2.save()

    if created3 or not user3.has_usable_password():
        user3.set_password("password3")
        user3.avatar = "avatars/default_avatar.png"
        user3.save()

    # Liste des adversaires
    players = [user2, user3]

    # Nombre de matchs à simuler
    num_matches = 10

    for _ in range(num_matches):
        # Choisir un adversaire aléatoire
        opponent = random.choice(players)
        
        # Générer des scores aléatoires
        score_jojo = random.randint(5, 15)
        score_opponent = random.randint(5, 15)

        # Déterminer le gagnant, le perdant, ou si c'est un match nul
        if score_jojo > score_opponent:
            winner = user_jojo
            is_draw = False
        elif score_jojo < score_opponent:
            winner = opponent
            is_draw = False
        else:
            winner = None  # Pas de gagnant en cas de match nul
            is_draw = True

        # Créer le résultat du match
        GameResult.objects.create(
            player1=user_jojo,
            player2=opponent,
            score_player1=score_jojo,
            score_player2=score_opponent,
            winner=winner,
            is_draw=is_draw,
            status="finished",
            date=now(),
        )

    print(f"{num_matches} matchs simulés avec succès pour 'jojo'.")
