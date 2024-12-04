import pygame
import sys

# Initialisation de Pygame
pygame.init()

# Dimensions de la fenêtre et du terrain
WINDOW_WIDTH, WINDOW_HEIGHT = 800, 400
FPS = 60
BALL_SPEED = 3
PADDLE_SPEED = 5
MAX_BALL_SPEED_Y = 5  # Limite de la vitesse verticale de la balle

# Couleurs
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# Initialisation de la fenêtre
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Pongame")

# Terrain
terrain_rect = pygame.Rect(50, 50, WINDOW_WIDTH - 100, WINDOW_HEIGHT - 100)

# Raquettes
paddle_width, paddle_height = 10, 60
paddle_left = pygame.Rect(terrain_rect.left + 10, terrain_rect.centery - paddle_height // 2, paddle_width, paddle_height)
paddle_right = pygame.Rect(terrain_rect.right - 20, terrain_rect.centery - paddle_height // 2, paddle_width, paddle_height)

# Balle
ball_size = 10
ball = pygame.Rect(terrain_rect.centerx, terrain_rect.centery, ball_size, ball_size)
ball_speed_x, ball_speed_y = BALL_SPEED, BALL_SPEED

# Scores
score_left, score_right = 0, 0

# Horloge pour contrôler les FPS
clock = pygame.time.Clock()

def calculate_collision(ball, paddle, paddle_speed, is_left_paddle):
    """
    Calcule la nouvelle direction de la balle après une collision avec une raquette.
    """
    global ball_speed_x, ball_speed_y

    # Vérifier si la balle touche les côtés de la raquette
    if ball.bottom < paddle.top or ball.top > paddle.bottom:
        # Si la balle dépasse les côtés de la raquette, elle est considérée comme hors du terrain
        return "miss"

    # Ajouter l'effet de l'angle basé sur la vitesse verticale de la raquette
    relative_speed = ball.centery - paddle.centery
    normalized_speed = relative_speed / (paddle_height / 2)  # Normalisation entre -1 et 1
    ball_speed_y += normalized_speed * MAX_BALL_SPEED_Y

    # Ajouter un léger effet de la vitesse de la raquette sur la balle
    # ball_speed_y += paddle_speed * 0.5

    # Limiter la vitesse verticale pour rester dans des valeurs raisonnables
    ball_speed_y = max(-MAX_BALL_SPEED_Y, min(MAX_BALL_SPEED_Y, ball_speed_y))

    # Inverser la direction horizontale
    ball_speed_x *= -1

    # Correction de position pour éviter que la balle reste collée
    if is_left_paddle:
        ball.left = paddle.right  # Repositionner la balle à droite de la raquette
    else:
        ball.right = paddle.left  # Repositionner la balle à gauche de la raquette

    return "hit"

# Boucle principale du jeu
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # Déplacement des raquettes
    keys = pygame.key.get_pressed()
    paddle_left_speed, paddle_right_speed = 0, 0
    if keys[pygame.K_w] and paddle_left.top > terrain_rect.top:
        paddle_left.y -= PADDLE_SPEED
        paddle_left_speed = -PADDLE_SPEED
    if keys[pygame.K_s] and paddle_left.bottom < terrain_rect.bottom:
        paddle_left.y += PADDLE_SPEED
        paddle_left_speed = PADDLE_SPEED
    if keys[pygame.K_UP] and paddle_right.top > terrain_rect.top:
        paddle_right.y -= PADDLE_SPEED
        paddle_right_speed = -PADDLE_SPEED
    if keys[pygame.K_DOWN] and paddle_right.bottom < terrain_rect.bottom:
        paddle_right.y += PADDLE_SPEED
        paddle_right_speed = PADDLE_SPEED

    # Déplacement de la balle
    ball.x += ball_speed_x
    ball.y += ball_speed_y

    # Gestion des collisions avec le haut et le bas du terrain
    if ball.top <= terrain_rect.top or ball.bottom >= terrain_rect.bottom:
        ball_speed_y *= -1

    # Gestion des collisions avec les raquettes
    if ball.colliderect(paddle_left):
        collision_result = calculate_collision(ball, paddle_left, paddle_left_speed, is_left_paddle=True)
        if collision_result == "miss":
            score_right += 1
            ball.x, ball.y = terrain_rect.center
            ball_speed_x, ball_speed_y = BALL_SPEED, BALL_SPEED
    elif ball.colliderect(paddle_right):
        collision_result = calculate_collision(ball, paddle_right, paddle_right_speed, is_left_paddle=False)
        if collision_result == "miss":
            score_left += 1
            ball.x, ball.y = terrain_rect.center
            ball_speed_x, ball_speed_y = -BALL_SPEED, BALL_SPEED

    # Gestion des sorties de balle (lorsqu'elle dépasse les bords latéraux)
    if ball.left <= terrain_rect.left:
        score_right += 1
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = BALL_SPEED, BALL_SPEED
    if ball.right >= terrain_rect.right:
        score_left += 1
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = -BALL_SPEED, BALL_SPEED

    # Dessin des éléments du jeu
    screen.fill(BLACK)  # Fond noir
    pygame.draw.rect(screen, WHITE, terrain_rect, 2)  # Contour du terrain
    pygame.draw.rect(screen, WHITE, paddle_left)  # Raquette gauche
    pygame.draw.rect(screen, WHITE, paddle_right)  # Raquette droite
    pygame.draw.ellipse(screen, WHITE, ball)  # Balle

    # Affichage des scores
    font = pygame.font.SysFont(None, 36)
    score_text = font.render(f"{score_left} - {score_right}", True, WHITE)
    screen.blit(score_text, (terrain_rect.centerx - score_text.get_width() // 2, 10))

    # Mise à jour de l'affichage
    pygame.display.flip()
    clock.tick(FPS)
