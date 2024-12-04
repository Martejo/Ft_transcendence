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
BALL_SPEED_INCREMENT = 0.03

# Tailles des raquettes
INITIAL_PADDLE_HEIGHT = 60
MIN_PADDLE_HEIGHT = 30

# Couleurs
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
PURPLE = (147, 0, 211)  # Couleur pour l'orbe d'inversion
RED = (255, 0, 0)      # Couleur pour l'orbe de rétrécissement

# Initialisation de la fenêtre
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Pongame with Power-ups")

# Clock for controlling FPS
clock = pygame.time.Clock()

# Terrain
terrain_rect = pygame.Rect(50, 50, WINDOW_WIDTH - 100, WINDOW_HEIGHT - 100)

# Raquettes
paddle_width = 10
paddle_left = pygame.Rect(terrain_rect.left + 10, terrain_rect.centery - INITIAL_PADDLE_HEIGHT // 2, 
                         paddle_width, INITIAL_PADDLE_HEIGHT)
paddle_right = pygame.Rect(terrain_rect.right - 20, terrain_rect.centery - INITIAL_PADDLE_HEIGHT // 2, 
                          paddle_width, INITIAL_PADDLE_HEIGHT)

# Balle
ball_size = 15
ball = pygame.Rect(terrain_rect.centerx, terrain_rect.centery, ball_size, ball_size)
ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED

# Scores
score_left, score_right = 0, 0

# Power-up system
class PowerUpOrb:
    def __init__(self, terrain_rect, color, effect_type):
        self.size = 30  # Increased orb size
        self.color = color
        self.effect_type = effect_type
        self.active = True
        self.respawn_time = 5  # Secondes avant réapparition
        self.last_collected_time = 0
        self.reposition(terrain_rect)
        
    def reposition(self, terrain_rect):
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
        self.shrunk_paddle = {"left": False, "right": False}
        self.effect_duration = 5  # Durée en secondes
        self.effect_start_time = {"left": {"invert": 0, "shrink": 0}, 
                                "right": {"invert": 0, "shrink": 0}}
        
    def apply_effect(self, player, effect_type, current_time):
        if effect_type == "invert":
            self.inverted_controls[player] = True
            self.effect_start_time[player]["invert"] = current_time
        elif effect_type == "shrink":
            self.shrunk_paddle[player] = True
            self.effect_start_time[player]["shrink"] = current_time
        
    def update(self, current_time):
        for player in ["left", "right"]:
            # Update inversion effect
            if self.inverted_controls[player]:
                if current_time - self.effect_start_time[player]["invert"] >= self.effect_duration:
                    self.inverted_controls[player] = False
            
            # Update shrink effect
            if self.shrunk_paddle[player]:
                if current_time - self.effect_start_time[player]["shrink"] >= self.effect_duration:
                    self.shrunk_paddle[player] = False
                    # Reset paddle height
                    if player == "left":
                        paddle_left.height = INITIAL_PADDLE_HEIGHT
                        paddle_left.centery = paddle_left.centery  # Recenter paddle
                    else:
                        paddle_right.height = INITIAL_PADDLE_HEIGHT
                        paddle_right.centery = paddle_right.centery  # Recenter paddle

# Création des objets power-up
power_up_orbs = [
    PowerUpOrb(terrain_rect, PURPLE, "invert"),
    PowerUpOrb(terrain_rect, RED, "shrink")
]
power_up_state = PowerUpState()

def calculate_collision(ball, paddle, is_left_paddle):
    global ball_speed_x, ball_speed_y
    
    if is_left_paddle:
        if ball.right < paddle.left or ball_speed_x > 0:
            return "miss"
    else:
        if ball.left > paddle.right or ball_speed_x < 0:
            return "miss"
            
    if abs(ball.centery - paddle.centery) > paddle.height/2:
        return "miss"
        
    relative_position = (ball.centery - paddle.centery) / (paddle.height / 2)
    ball_speed_y = relative_position * abs(ball_speed_x)
    ball_speed_x = -ball_speed_x * (1 + BALL_SPEED_INCREMENT)
    
    if is_left_paddle:
        ball.left = paddle.right
    else:
        ball.right = paddle.left
        
    return "hit"

def apply_shrink_effect(player):
    if player == "left":
        paddle_left.height = MIN_PADDLE_HEIGHT
        paddle_left.centery = min(max(terrain_rect.top + paddle_left.height//2,
                                    paddle_left.centery),
                                terrain_rect.bottom - paddle_left.height//2)
    else:
        paddle_right.height = MIN_PADDLE_HEIGHT
        paddle_right.centery = min(max(terrain_rect.top + paddle_right.height//2,
                                     paddle_right.centery),
                                 terrain_rect.bottom - paddle_right.height//2)

# Variable pour suivre le dernier joueur ayant touché la balle
last_paddle_hit = None

# Boucle principale du jeu
while True:
    current_time = time.time()
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # Mise à jour des power-ups
    for orb in power_up_orbs:
        orb.update(current_time)
    power_up_state.update(current_time)

    # Déplacement des raquettes avec gestion des contrôles inversés
    keys = pygame.key.get_pressed()
    
    # Raquette gauche
    if power_up_state.inverted_controls["left"]:
        if keys[pygame.K_s] and paddle_left.top > terrain_rect.top:
            paddle_left.y -= PADDLE_SPEED
        if keys[pygame.K_w] and paddle_left.bottom < terrain_rect.bottom:
            paddle_left.y += PADDLE_SPEED
    else:
        if keys[pygame.K_w] and paddle_left.top > terrain_rect.top:
            paddle_left.y -= PADDLE_SPEED
        if keys[pygame.K_s] and paddle_left.bottom < terrain_rect.bottom:
            paddle_left.y += PADDLE_SPEED
    
    # Raquette droite
    if power_up_state.inverted_controls["right"]:
        if keys[pygame.K_DOWN] and paddle_right.top > terrain_rect.top:
            paddle_right.y -= PADDLE_SPEED
        if keys[pygame.K_UP] and paddle_right.bottom < terrain_rect.bottom:
            paddle_right.y += PADDLE_SPEED
    else:
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

    # Gestion des collisions avec les raquettes et mise à jour du dernier joueur
    if ball.colliderect(paddle_left):
        collision_result = calculate_collision(ball, paddle_left, is_left_paddle=True)
        if collision_result == "hit":
            last_paddle_hit = "left"
        else:
            score_right += 1
            ball.x, ball.y = terrain_rect.center
            ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
            last_paddle_hit = None
            
    elif ball.colliderect(paddle_right):
        collision_result = calculate_collision(ball, paddle_right, is_left_paddle=False)
        if collision_result == "hit":
            last_paddle_hit = "right"
        else:
            score_left += 1
            ball.x, ball.y = terrain_rect.center
            ball_speed_x, ball_speed_y = -INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
            last_paddle_hit = None

    # Gestion des collisions avec les orbes de power-up
    for orb in power_up_orbs:
        if orb.active and ball.colliderect(orb.rect):
            orb.collect(current_time)
            if last_paddle_hit:
                power_up_state.apply_effect(last_paddle_hit, orb.effect_type, current_time)
                if orb.effect_type == "shrink":
                    apply_shrink_effect(last_paddle_hit)

    # Gestion des sorties de balle
    if ball.left <= terrain_rect.left:
        score_right += 1
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
        last_paddle_hit = None
    if ball.right >= terrain_rect.right:
        score_left += 1
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = -INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
        last_paddle_hit = None

    # Dessin
    screen.fill(BLACK)
    pygame.draw.rect(screen, WHITE, terrain_rect, 2)
    pygame.draw.rect(screen, WHITE, paddle_left)
    pygame.draw.rect(screen, WHITE, paddle_right)
    pygame.draw.ellipse(screen, WHITE, ball)
    
    # Dessin des orbes de power-up
    for orb in power_up_orbs:
        if orb.active:
            pygame.draw.circle(screen, orb.color, 
                             (orb.x + orb.size//2, orb.y + orb.size//2), 
                             orb.size//2)

    # Affichage des scores
    font = pygame.font.SysFont(None, 36)
    score_text = font.render(f"{score_left} - {score_right}", True, WHITE)
    screen.blit(score_text, (terrain_rect.centerx - score_text.get_width() // 2, 10))

    # Affichage des états de power-up actifs
    for player in ["left", "right"]:
        effects = []
        if power_up_state.inverted_controls[player]:
            effects.append("Inverted!")
        if power_up_state.shrunk_paddle[player]:
            effects.append("Shrunk!")
            
        if effects:
            effect_text = font.render(" & ".join(effects), True, PURPLE)
            x_pos = terrain_rect.left if player == "left" else terrain_rect.right - effect_text.get_width()
            screen.blit(effect_text, (x_pos, 10))

    pygame.display.flip()
    clock.tick(FPS)