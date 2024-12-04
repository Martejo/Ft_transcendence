import pygame
import sys
import time
import random

# Initialisation de Pygame
pygame.init()

# Power ups specifics
MAX_ACTIVE_POWERUPS = 2
POWERUP_SPAWN_COOLDOWN = 8
INITIAL_SPAWN_DELAY = 3

# Dimensions de la fenêtre et du terrain
WINDOW_WIDTH, WINDOW_HEIGHT = 800, 400
FPS = 60
INITIAL_BALL_SPEED = 4
PADDLE_SPEED = 5
BALL_SPEED_INCREMENT = 0.03

# Physics constants
ICE_ACCELERATION = 0.5
ICE_FRICTION = 0.02

# Tailles des raquettes
INITIAL_PADDLE_HEIGHT = 60
MIN_PADDLE_HEIGHT = 30

# Couleurs
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
PURPLE = (147, 0, 211)  # Couleur pour l'orbe d'inversion
RED = (255, 0, 0)      # Couleur pour l'orbe de rétrécissement
BLUE = (0, 191, 255)   # Couleur pour l'orbe de glace

# Initialisation de la fenêtre
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Pongame with Power-ups")

# Clock for controlling FPS
clock = pygame.time.Clock()

# Terrain
terrain_rect = pygame.Rect(50, 50, WINDOW_WIDTH - 100, WINDOW_HEIGHT - 100)

class Paddle:
    def __init__(self, x, y, width, height):
        self.rect = pygame.Rect(x, y, width, height)
        self.velocity = 0
        self.on_ice = False
        
    def move(self, direction, is_on_ice, terrain_top, terrain_bottom):
        if is_on_ice:
            # Add to velocity based on input
            self.velocity += direction * ICE_ACCELERATION
            # Apply friction
            self.velocity *= (1 - ICE_FRICTION)
        else:
            # Normal movement
            self.velocity = direction * PADDLE_SPEED
            
        # Apply movement with boundary checking
        new_y = self.rect.y + self.velocity
        if new_y < terrain_top:
            new_y = terrain_top
            self.velocity = 0
        elif new_y + self.rect.height > terrain_bottom:
            new_y = terrain_bottom - self.rect.height
            self.velocity = 0
            
        self.rect.y = new_y

# Raquettes
paddle_left = Paddle(terrain_rect.left + 10, 
                    terrain_rect.centery - INITIAL_PADDLE_HEIGHT // 2,
                    10, INITIAL_PADDLE_HEIGHT)
paddle_right = Paddle(terrain_rect.right - 20,
                     terrain_rect.centery - INITIAL_PADDLE_HEIGHT // 2,
                     10, INITIAL_PADDLE_HEIGHT)

# Balle
ball_size = 15
ball = pygame.Rect(terrain_rect.centerx, terrain_rect.centery, ball_size, ball_size)
ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED

# Scores
score_left, score_right = 0, 0

class PowerUpOrb:

    last_global_spawn_time = 0
    global_spawn_cooldown = 0

    def __init__(self, terrain_rect, color, effect_type):
        self.size = 30
        self.color = color
        self.effect_type = effect_type
        self.active = False  # Start inactive
        self.respawn_time = random.uniform(3, 7)
        self.duration = random.uniform(5, 10)
        self.spawn_start_time = time.time()
        self.activation_time = 0
        self.x = 0
        self.y = 0
        self.rect = pygame.Rect(0, 0, self.size, self.size)
        
    def reposition(self, terrain_rect):
        max_attempts = 100
        margin = 50
        
        for _ in range(max_attempts):
            new_x = random.randint(terrain_rect.left + margin, terrain_rect.right - margin)
            new_y = random.randint(terrain_rect.top + margin, terrain_rect.bottom - margin)
            
            overlapping = False
            for orb in power_up_orbs:
                if orb != self and orb.active:
                    center1 = (new_x + self.size//2, new_y + self.size//2)
                    center2 = (orb.x + orb.size//2, orb.y + orb.size//2)
                    
                    distance = ((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)**0.5
                    min_distance = (self.size + orb.size) * 0.75
                    
                    if distance < min_distance:
                        overlapping = True
                        break
            
            if not overlapping:
                self.x = new_x
                self.y = new_y
                self.rect = pygame.Rect(self.x, self.y, self.size, self.size)
                return True
                
        return False
        
    def update(self, current_time, active_orbs_count):
        # If active, check if it should vanish
        if self.active:
            if current_time - self.activation_time >= self.duration:
                self.active = False
                self.spawn_start_time = current_time  # Reset spawn timer
                self.respawn_time = random.uniform(3, 7)  # New random spawn time
                PowerUpOrb.last_global_vanish_time = current_time
        # If inactive, check if it should spawn
        elif current_time - self.spawn_start_time >= self.respawn_time:
            # Check global cooldown first
            if current_time - PowerUpOrb.last_global_vanish_time >= PowerUpOrb.global_spawn_cooldown:
                # Do an immediate count of active orbs to ensure accuracy
                current_active_orbs = sum(1 for orb in power_up_orbs if orb.active)
                if current_active_orbs < MAX_ACTIVE_POWERUPS:
                    if self.reposition(terrain_rect):
                        # Double-check that we still don't exceed the limit
                        if sum(1 for orb in power_up_orbs if orb.active) < MAX_ACTIVE_POWERUPS:
                            self.active = True
                            self.activation_time = current_time

    def collect(self, current_time):
        self.active = False
        self.last_collected_time = current_time
        PowerUpOrb.last_global_vanish_time = current_time

# Création des objets power-up
power_up_orbs = [
    PowerUpOrb(terrain_rect, PURPLE, "invert"),
    PowerUpOrb(terrain_rect, RED, "shrink"),
    PowerUpOrb(terrain_rect, BLUE, "ice")
]

def reset_point(to_right=True):
        global ball_speed_x, ball_speed_y, last_paddle_hit
        ball.x, ball.y = terrain_rect.center
        ball_speed_x = INITIAL_BALL_SPEED if to_right else -INITIAL_BALL_SPEED
        ball_speed_y = INITIAL_BALL_SPEED
        last_paddle_hit = None
        current_time = time.time()
        # reset all orbs
        for orb in power_up_orbs:
            orb.active = False
            orb.spawn_start_time = current_time
            orb.respawn_time = random.uniform(3, 7)
        PowerUpOrb.last_global_spawn_time = current_time

# État des power-ups
class PowerUpState:
    def __init__(self):
        self.inverted_controls = {"left": False, "right": False}
        self.shrunk_paddle = {"left": False, "right": False}
        self.ice_physics = {"left": False, "right": False}
        self.effect_duration = 5
        self.effect_start_time = {
            "left": {"invert": 0, "shrink": 0, "ice": 0}, 
            "right": {"invert": 0, "shrink": 0, "ice": 0}
        }
        
    def apply_effect(self, player, effect_type, current_time):
        if effect_type == "invert":
            self.inverted_controls[player] = True
            self.effect_start_time[player]["invert"] = current_time
        elif effect_type == "shrink":
            self.shrunk_paddle[player] = True
            self.effect_start_time[player]["shrink"] = current_time
        elif effect_type == "ice":
            self.ice_physics[player] = True
            self.effect_start_time[player]["ice"] = current_time
        
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
                    paddle = paddle_left if player == "left" else paddle_right
                    paddle.rect.height = INITIAL_PADDLE_HEIGHT
                    paddle.rect.centery = paddle.rect.centery
                    
            # Update ice physics effect
            if self.ice_physics[player]:
                if current_time - self.effect_start_time[player]["ice"] >= self.effect_duration:
                    self.ice_physics[player] = False
                    # Reset velocity
                    paddle = paddle_left if player == "left" else paddle_right
                    paddle.velocity = 0

def count_active_orbs(orbs):
    return sum(1 for orb in orbs if orb.active)

def initialize_orbs():
    for i, orb in enumerate(power_up_orbs):
        if i < MAX_ACTIVE_POWERUPS:  # Only activate initial orbs up to the maximum
            orb.active = True
            orb.reposition(terrain_rect)
        else:
            orb.active = False
            # Set different last_collected_times to stagger spawns
            orb.last_collected_time = time.time() - orb.respawn_time + (i * POWERUP_SPAWN_COOLDOWN)

# Initialize the orbs
initialize_orbs()

power_up_state = PowerUpState()

def calculate_collision(ball, paddle_rect, is_left_paddle):
    global ball_speed_x, ball_speed_y
    
    if is_left_paddle:
        if ball.right < paddle_rect.left or ball_speed_x > 0:
            return "miss"
    else:
        if ball.left > paddle_rect.right or ball_speed_x < 0:
            return "miss"
            
    if abs(ball.centery - paddle_rect.centery) > paddle_rect.height/2:
        return "miss"
        
    relative_position = (ball.centery - paddle_rect.centery) / (paddle_rect.height / 2)
    ball_speed_y = relative_position * abs(ball_speed_x)
    ball_speed_x = -ball_speed_x * (1 + BALL_SPEED_INCREMENT)
    
    if is_left_paddle:
        ball.left = paddle_rect.right
    else:
        ball.right = paddle_rect.left
        
    return "hit"

def apply_shrink_effect(player):
    paddle = paddle_left if player == "left" else paddle_right
    paddle.rect.height = MIN_PADDLE_HEIGHT
    paddle.rect.centery = min(max(terrain_rect.top + paddle.rect.height//2,
                                paddle.rect.centery),
                            terrain_rect.bottom - paddle.rect.height//2)

# Variable pour suivre le dernier joueur ayant touché la balle
last_paddle_hit = None

# Boucle principale du jeu
while True:
    current_time = time.time()
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # Mise à jour des power-ups avec le compte des orbes actifs
    active_orbs = count_active_orbs(power_up_orbs)
    for orb in power_up_orbs:
        orb.update(current_time, active_orbs)
    power_up_state.update(current_time)

    # Déplacement des raquettes avec gestion des contrôles inversés
    keys = pygame.key.get_pressed()
    
    # Raquette gauche
    direction_left = 0
    if power_up_state.inverted_controls["left"]:
        if keys[pygame.K_s]: direction_left -= 1
        if keys[pygame.K_w]: direction_left += 1
    else:
        if keys[pygame.K_w]: direction_left -= 1
        if keys[pygame.K_s]: direction_left += 1
    
    paddle_left.move(direction_left, power_up_state.ice_physics["left"], 
                    terrain_rect.top, terrain_rect.bottom)
    
    # Raquette droite
    direction_right = 0
    if power_up_state.inverted_controls["right"]:
        if keys[pygame.K_DOWN]: direction_right -= 1
        if keys[pygame.K_UP]: direction_right += 1
    else:
        if keys[pygame.K_UP]: direction_right -= 1
        if keys[pygame.K_DOWN]: direction_right += 1
    
    paddle_right.move(direction_right, power_up_state.ice_physics["right"],
                     terrain_rect.top, terrain_rect.bottom)

    # Déplacement de la balle
    ball.x += ball_speed_x
    ball.y += ball_speed_y

    # Gestion des collisions avec le haut et le bas du terrain
    if ball.top <= terrain_rect.top or ball.bottom >= terrain_rect.bottom:
        ball_speed_y *= -1

    # Gestion des collisions avec les raquettes et mise à jour du dernier joueur
    if ball.colliderect(paddle_left.rect):
        collision_result = calculate_collision(ball, paddle_left.rect, is_left_paddle=True)
        if collision_result == "hit":
            last_paddle_hit = "left"
        else:
            score_right += 1
            reset_point(True)
            ball.x, ball.y = terrain_rect.center
            ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
            last_paddle_hit = None
            
    elif ball.colliderect(paddle_right.rect):
        collision_result = calculate_collision(ball, paddle_right.rect, is_left_paddle=False)
        if collision_result == "hit":
            last_paddle_hit = "right"
        else:
            score_left += 1
            reset_point(True)
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
        reset_point(True)
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
        last_paddle_hit = None
    if ball.right >= terrain_rect.right:
        score_left += 1
        reset_point(True)
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = -INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
        last_paddle_hit = None

    # Dessin
    screen.fill(BLACK)
    pygame.draw.rect(screen, WHITE, terrain_rect, 2)
    pygame.draw.rect(screen, WHITE, paddle_left.rect)
    pygame.draw.rect(screen, WHITE, paddle_right.rect)
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
        if power_up_state.ice_physics[player]:
            effects.append("Icy!")
            
        if effects:
            effect_text = font.render(" & ".join(effects), True, PURPLE)
            x_pos = terrain_rect.left if player == "left" else terrain_rect.right - effect_text.get_width()
            screen.blit(effect_text, (x_pos, 10))

    pygame.display.flip()
    clock.tick(FPS)