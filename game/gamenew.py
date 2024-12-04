import pygame
import sys
import time
import random

# Initialisation de Pygame
pygame.init()

# Dimensions de la fenêtre et du terrain
WINDOW_WIDTH, WINDOW_HEIGHT = 800, 400
FPS = 60
INITIAL_BALL_SPEED = 4
PADDLE_SPEED = 5
BALL_SPEED_INCREMENT = 0.03  # Augmentation progressive de la vitesse horizontale

# Couleurs
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# Initialisation de la fenêtre
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Pongame")

# Clock for controlling FPS
clock = pygame.time.Clock()

# Terrain
terrain_rect = pygame.Rect(50, 50, WINDOW_WIDTH - 100, WINDOW_HEIGHT - 100)

# Raquettes
paddle_width, paddle_height = 10, 60
paddle_left = pygame.Rect(terrain_rect.left + 10, terrain_rect.centery - paddle_height // 2, paddle_width, paddle_height)
paddle_right = pygame.Rect(terrain_rect.right - 10, terrain_rect.centery - paddle_height // 2, paddle_width, paddle_height)

# Balle
ball_size = 15
ball = pygame.Rect(terrain_rect.centerx, terrain_rect.centery, ball_size, ball_size)
ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED

# Scores
score_left, score_right = 0, 0

# Horloge pour contrôler les FPS
clock = pygame.time.Clock()

# Power-up system
class PowerUpOrb:
    def __init__(self, terrain_rect):
        self.size = 20
        self.active = True
        self.respawn_time = 5  # Secondes avant réapparition
        self.last_collected_time = 0
        self.reposition(terrain_rect)
        
    def reposition(self, terrain_rect):
        # Position aléatoire dans le terrain, en évitant les bords
        margin = 50
        self.x = random.randint(terrain_rect.left + margin, terrain_rect.right - margin)
        self.y = random.randint(terrain_rect.top + margin, terrain_rect.bottom - margin)
        self.rect = pygame.Rect(self.x, self.y, self.size, self.size)
        
    def update(self, current_time):
        if not self.active and current_time - self.last_collected_time >= self.respawn_time:
            self.active = True
            self.reposition(terrain_rect)
            
    def collect(self, current_time):
        self.active = False
        self.last_collected_time = current_time

# État des power-ups
class PowerUpState:
    def __init__(self):
        self.inverted_controls = {"left": False, "right": False}
        self.effect_duration = 5  # Durée en secondes
        self.effect_start_time = {"left": 0, "right": 0}
        
    def apply_inversion(self, player, current_time):
        self.inverted_controls[player] = True
        self.effect_start_time[player] = current_time
        
    def update(self, current_time):
        for player in ["left", "right"]:
            if self.inverted_controls[player]:
                if current_time - self.effect_start_time[player] >= self.effect_duration:
                    self.inverted_controls[player] = False

# Création des objets power-up
power_up_orb = PowerUpOrb(terrain_rect)
power_up_state = PowerUpState()

def calculate_collision(ball, paddle, is_left_paddle):
    global ball_speed_x, ball_speed_y
    
    # Vérifier si la balle arrive du bon côté
    if is_left_paddle:
        if ball.right < paddle.left or ball_speed_x > 0:
            return "miss"
    else:
        if ball.left > paddle.right or ball_speed_x < 0:
            return "miss"
            
    # Miss si on touche le haut ou le bas de la raquette
    if abs(ball.centery - paddle.centery) > paddle_height/2:
        return "miss"
        
    # Calcul rebond normal
    relative_position = (ball.centery - paddle.centery) / (paddle_height / 2)
    ball_speed_y = relative_position * abs(ball_speed_x)
    ball_speed_x = -ball_speed_x * (1 + BALL_SPEED_INCREMENT)
    
    if is_left_paddle:
        ball.left = paddle.right
    else:
        ball.right = paddle.left
        
    return "hit"

# Variable pour suivre le dernier joueur ayant touché la balle
last_paddle_hit = None

# Boucle principale du jeu
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # Mise à jour des power-ups
    power_up_orb.update(current_time)
    power_up_state.update(current_time)

    # Déplacement des raquettes
    keys = pygame.key.get_pressed()
    if keys[pygame.K_w] and paddle_left.top > terrain_rect.top:
        paddle_left.y -= PADDLE_SPEED
    if keys[pygame.K_s] and paddle_left.bottom < terrain_rect.bottom:
        paddle_left.y += PADDLE_SPEED
    if keys[pygame.K_UP] and paddle_right.top > terrain_rect.top:
        paddle_right.y -= PADDLE_SPEED
    if keys[pygame.K_DOWN] and paddle_right.bottom < terrain_rect.bottom:
        paddle_right.y += PADDLE_SPEED

    # Déplacement de la balle
    ball.x += ball_speed_x
    ball.y += ball_speed_y

    # Gestion des collisions avec le haut et le bas du terrain
    if ball.top <= terrain_rect.top or ball.bottom >= terrain_rect.bottom:
        ball_speed_y *= -1

 # Gestion des collisions avec les raquettes
    if ball.colliderect(paddle_left):
        collision_result = calculate_collision(ball, paddle_left, is_left_paddle=True)
        if collision_result == "miss":
            # time.sleep(1)
            score_right += 1
            ball.x, ball.y = terrain_rect.center
            ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
    elif ball.colliderect(paddle_right):
        collision_result = calculate_collision(ball, paddle_right, is_left_paddle=False)
        if collision_result == "miss":
            # time.sleep(1)
            score_left += 1
            ball.x, ball.y = terrain_rect.center
            ball_speed_x, ball_speed_y = -INITIAL_BALL_SPEED, INITIAL_BALL_SPEED



    # Gestion des sorties de balle (lorsqu'elle dépasse les bords latéraux)
    if ball.left <= terrain_rect.left:
        # time.sleep(1)
        score_right += 1
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
    if ball.right  >= terrain_rect.right:
        # time.sleep(1)
        score_left += 1
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = -INITIAL_BALL_SPEED, INITIAL_BALL_SPEED

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
