import pygame
import pymunk
import pymunk.pygame_util
import sys

# Initialisation de Pygame
pygame.init()

# Dimensions de la fenêtre
WINDOW_WIDTH, WINDOW_HEIGHT = 800, 400
FPS = 60

# Couleurs
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# Initialisation de la fenêtre
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Pongame")

# Horloge pour contrôler les FPS
clock = pygame.time.Clock()

# Initialisation de Pymunk
space = pymunk.Space()
space.gravity = 0, 0  # Pas de gravité dans un jeu Pong

# Ajout des bords du terrain
def create_static_border(x1, y1, x2, y2):
    """
    Crée un bord statique dans le moteur physique.
    """
    # Création du corps statique
    body = pymunk.Body(body_type=pymunk.Body.STATIC)
    
    # Création du segment attaché au corps
    shape = pymunk.Segment(body, (x1, y1), (x2, y2), 1.0)
    shape.elasticity = 1.0
    shape.friction = 0.0
    
    # Ajouter le corps et le segment au space
    space.add(body, shape)
    return shape

# Bords supérieurs et inférieurs
create_static_border(50, 50, 750, 50)  # Haut
create_static_border(50, 350, 750, 350)  # Bas

# Raquettes
paddle_width, paddle_height = 10, 60
def create_paddle(x, y):
    body = pymunk.Body(body_type=pymunk.Body.KINEMATIC)
    body.position = x, y
    shape = pymunk.Poly.create_box(body, (paddle_width, paddle_height))
    shape.elasticity = 1.0
    space.add(body, shape)
    return body

paddle_left = create_paddle(60, WINDOW_HEIGHT // 2)
paddle_right = create_paddle(740, WINDOW_HEIGHT // 2)

# Balle
ball_radius = 5
def create_ball():
    body = pymunk.Body(1, pymunk.moment_for_circle(1, 0, ball_radius))
    body.position = WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2
    shape = pymunk.Circle(body, ball_radius)
    shape.elasticity = 1.0
    shape.friction = 0.0
    space.add(body, shape)
    return body

ball = create_ball()
ball.velocity = (300, 200)  # Vitesse initiale (en pixels/seconde)

# Scores
scores = {"player1": 0, "player2": 0}

# Police pour afficher les scores
font = pygame.font.SysFont(None, 36)

# Outil de dessin Pymunk
draw_options = pymunk.pygame_util.DrawOptions(screen)

# Boucle principale du jeu
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # Gestion des entrées pour les raquettes
    keys = pygame.key.get_pressed()

    # Paddle gauche
    if keys[pygame.K_w] and paddle_left.position.y - paddle_height / 2 > 50:
        paddle_left.position = paddle_left.position.x, paddle_left.position.y - 5
    if keys[pygame.K_s] and paddle_left.position.y + paddle_height / 2 < 350:
        paddle_left.position = paddle_left.position.x, paddle_left.position.y + 5

    # Paddle droit
    if keys[pygame.K_UP] and paddle_right.position.y - paddle_height / 2 > 50:
        paddle_right.position = paddle_right.position.x, paddle_right.position.y - 5
    if keys[pygame.K_DOWN] and paddle_right.position.y + paddle_height / 2 < 350:
        paddle_right.position = paddle_right.position.x, paddle_right.position.y + 5

    # Mise à jour de la simulation physique
    space.step(1 / FPS)

    # Vérification des sorties de balle
    if ball.position.x < 50:  # Balle sortie côté gauche
        scores["player2"] += 1
        ball.position = WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2
        ball.velocity = (300, 200)
    elif ball.position.x > 750:  # Balle sortie côté droit
        scores["player1"] += 1
        ball.position = WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2
        ball.velocity = (-300, 200)

    # Dessin des éléments
    screen.fill(BLACK)  # Fond noir
    pygame.draw.rect(screen, WHITE, (50, 50, 700, 300), 2)  # Terrain
    space.debug_draw(draw_options)  # Dessiner avec Pymunk

    # Affichage des scores
    score_text = font.render(f"{scores['player1']} - {scores['player2']}", True, WHITE)
    screen.blit(score_text, (WINDOW_WIDTH // 2 - score_text.get_width() // 2, 10))

    # Mise à jour de l'affichage
    pygame.display.flip()
    clock.tick(FPS)
