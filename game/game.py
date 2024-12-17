import pygame
import sys
import time
import random
import math

# Initialisation de Pygame
pygame.init()

# Power ups specifics
MAX_ACTIVE_POWERUPS = 2
POWERUP_SPAWN_COOLDOWN = 5
INITIAL_SPAWN_DELAY = 5

#Paddle's hitbox
HITBOX_MARGIN = 5

#Countdown
COUNTDOWN_DURATION = 3
COUNTDOWN_FONT_SIZE = 72
countdown_start = None
is_countdown_active = False

# Dimensions de la fenêtre et du terrain
WINDOW_WIDTH, WINDOW_HEIGHT = 800, 400
FPS = 60
INITIAL_BALL_SPEED = 4
PADDLE_SPEED = 6
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
YELLOW = (255, 255, 0) # Couleur pour l'orbe de vitesse
GREEN = (0, 255, 0) # Couleur pour l'orbe sticky

STICKY_DURATION = 5
ARROW_LENGTH = 40
ARROW_SPEED = 2

# Initialisation de la fenêtre
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Pongame with Power-ups")

# Clock for controlling FPS
clock = pygame.time.Clock()

# Terrain
terrain_rect = pygame.Rect(50, 50, WINDOW_WIDTH - 100, WINDOW_HEIGHT - 100)

bumpers = []
power_up_orbs = []

class Paddle:
    def __init__(self, x, y, width, height):
        self.rect = pygame.Rect(x, y, width, height)
        self.velocity = 0
        self.on_ice = False
        
    def move(self, direction, is_on_ice, terrain_top, terrain_bottom, speed_boost = False):
        if is_on_ice:
            # Add to velocity based on input
            self.velocity += direction * ICE_ACCELERATION
            # Apply friction
            self.velocity *= (1 - ICE_FRICTION)
        else:
            # Normal movement
            speed = PADDLE_SPEED * 1.5 if speed_boost else PADDLE_SPEED
            self.velocity = direction * speed
            
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
    next_spawn_time = time.time() + random.uniform(2, 5)
    global_spawn_cooldown = random.uniform(2, 5)

    def __init__(self, terrain_rect, color, effect_type):
        self.size = 30
        self.color = color
        self.effect_type = effect_type
        self.active = False  # Start inactive
        self.respawn_time = random.uniform(2, 5)
        self.duration = random.uniform(5, 15)
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
                for bumper in bumpers:
                    if bumper.active:
                        center1 = (new_x + self.size//2, new_y + self.size//2)
                        center2 = (bumper.x, bumper.y)  # Bumper position is its center
                        
                        distance = ((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)**0.5
                        min_distance = (self.size//2 + bumper.radius) * 1.5  # Using radius for bumpers
                        
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
        if self.active:
            if current_time - self.activation_time >= self.duration:
                self.active = False
                self.spawn_start_time = current_time
                self.respawn_time = random.uniform(5, 10)
                PowerUpOrb.last_global_vanish_time = current_time
                PowerUpOrb.next_spawn_time = current_time + PowerUpOrb.global_spawn_cooldown

        elif current_time >= PowerUpOrb.next_spawn_time:
            # If this is the sticky orb and we're under the max active orbs
            if self.effect_type == "sticky" and active_orbs_count < MAX_ACTIVE_POWERUPS:
                if self.reposition(terrain_rect):
                    self.active = True
                    self.activation_time = current_time
                    PowerUpOrb.next_spawn_time = current_time + PowerUpOrb.global_spawn_cooldown
            # For other orbs, don't spawn them
            elif self.effect_type != "sticky":
                return

    # def update(self, current_time, active_orbs_count):
    #     if self.active:
    #         if current_time - self.activation_time >= self.duration:
    #             self.active = False
    #             self.spawn_start_time = current_time
    #             self.respawn_time = random.uniform(2, 5)
    #             PowerUpOrb.last_global_vanish_time = current_time
    #             PowerUpOrb.next_spawn_time = current_time + PowerUpOrb.global_spawn_cooldown

    #     elif current_time >= PowerUpOrb.next_spawn_time:
    #         # Get all inactive orbs
    #         inactive_orbs = [orb for orb in power_up_orbs if not orb.active]
    #         if inactive_orbs and active_orbs_count < MAX_ACTIVE_POWERUPS:
    #             # Randomly choose one of the inactive orbs to try spawning
    #             if self == random.choice(inactive_orbs):
    #                 if self.reposition(terrain_rect):
    #                     self.active = True
    #                     self.activation_time = current_time
    #                     PowerUpOrb.next_spawn_time = current_time + PowerUpOrb.global_spawn_cooldown

    def collect(self, current_time):
        self.active = False
        self.last_collected_time = current_time
        PowerUpOrb.last_global_vanish_time = current_time

def reset_point(to_right=True):
        global ball_speed_x, ball_speed_y, last_scorer
        ball.x, ball.y = terrain_rect.center
        if last_scorer == 1:
            ball_speed_x = -INITIAL_BALL_SPEED
        else:
            ball_speed_x = INITIAL_BALL_SPEED
        ball_speed_y = INITIAL_BALL_SPEED
        last_paddle_hit = None
        current_time = time.time()

        countdown_start = current_time
        is_countdown_active = True

        # reset all orbs
        for orb in power_up_orbs:
            orb.active = False
            orb.spawn_start_time = current_time
            orb.respawn_time = random.uniform(5, 8)
        PowerUpOrb.last_global_spawn_time = current_time
        #clear effects
        power_up_state.inverted_controls = {"left": False, "right": False}
        power_up_state.shrunk_paddle = {"left": False, "right": False}
        power_up_state.ice_physics = {"left": False, "right": False}
        power_up_state.speed_boost = {"left": False, "right": False}
        power_up_state.flash_effect = False
        #reset paddle size
        paddle_left.rect.height = INITIAL_PADDLE_HEIGHT
        paddle_right.rect.height = INITIAL_PADDLE_HEIGHT
        #reset bumpers
        reset_bumpers()

# État des power-ups
class PowerUpState:
    def __init__(self):
        self.inverted_controls = {"left": False, "right": False}
        self.shrunk_paddle = {"left": False, "right": False}
        self.ice_physics = {"left": False, "right": False}
        self.speed_boost = {"left": False, "right": False}
        self.flash_effect = {"left": False, "right": False}
        self.effect_duration = 5
        self.flash_duration = 0.5
        self.sticky_ball = {"left": False, "right": False}
        self.sticky_start_time = {"left": 0, "right": 0}
        self.sticky_angle = {"left": 0, "right": 0}
        self.sticky_direction = {"left": 1, "right": 1}  # 1 for down, -1 for up
        self.effect_start_time = {
            "left": {"invert": 0, "shrink": 0, "ice": 0, "speed" : 0}, 
            "right": {"invert": 0, "shrink": 0, "ice": 0, "speed" : 0}
        }
        self.flash_start_time = 0
    def release_sticky_ball(self, player):
        """Release the ball from sticky state and return the current angle"""
        angle = self.sticky_angle[player]
        self.sticky_ball[player] = False
        return angle

    def apply_effect(self, last_paddle_hit, effect_type, current_time):
        if effect_type == "speed" or effect_type == "sticky":
            target_player = last_paddle_hit
        else:
            target_player = "right" if last_paddle_hit == "left" else "left"
        if effect_type == "speed":
            self.speed_boost[target_player] = True
            self.effect_start_time[target_player]["speed"] = current_time
        if effect_type == "sticky":
            self.sticky_ball[target_player] = True
            self.sticky_start_time[target_player] = current_time
            self.sticky_angle[target_player] = 0
        if effect_type == "invert":
            self.inverted_controls[target_player] = True
            self.effect_start_time[target_player]["invert"] = current_time
        elif effect_type == "shrink":
            self.shrunk_paddle[target_player] = True
            self.effect_start_time[target_player]["shrink"] = current_time
            apply_shrink_effect(target_player)
        elif effect_type == "ice":
            self.ice_physics[target_player] = True
            self.effect_start_time[target_player]["ice"] = current_time
        
        elif effect_type == "flash":
            self.flash_effect = True
            self.flash_start_time = current_time

    def update(self, current_time):
        for player in ["left", "right"]:
            # Update inversion effect
            if self.inverted_controls[player]:
                if current_time - self.effect_start_time[player]["invert"] >= self.effect_duration:
                    self.inverted_controls[player] = False
            
            # Update sticky effect
            if self.sticky_ball[player]:
                 # Update arrow angle
                self.sticky_angle[player] += ARROW_SPEED * self.sticky_direction[player]
                if self.sticky_angle[player] >= 45:
                    self.sticky_direction[player] = -1
                elif self.sticky_angle[player] <= -45:
                    self.sticky_direction[player] = 1
                if current_time - self.sticky_start_time[player] >= STICKY_DURATION:
                    self.release_sticky_ball(player)

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

            if self.speed_boost[player]:
                if current_time - self.effect_start_time[player]["speed"] >= self.effect_duration:
                    self.speed_boost[player] = False

            if self.flash_effect:
                if current_time - self.flash_start_time >= self.flash_duration:
                    self.flash_effect = False

        def release_sticky_ball(self, player):
            self.sticky_ball[player] = False
            return self.sticky_angle[player]

def calculate_sticky_release(angle, is_right_paddle=False):
    # If it's the right paddle, invert the angle since ball goes left
    if is_right_paddle:
        angle = -angle  # Invert the angle for right paddle
    
    # Convert angle to radians
    rad_angle = math.radians(angle)
    
    # Calculate speed magnitude
    speed = math.sqrt(ball_speed_x ** 2 + ball_speed_y ** 2)
    
    # Calculate new velocities
    new_speed_x = speed * math.cos(rad_angle)
    new_speed_y = speed * math.sin(rad_angle)
    
    return new_speed_x, new_speed_y

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

class Bumper:
    last_global_spawn_time = 0
    next_spawn_time = time.time() + random.uniform(7, 10)
    global_spawn_cooldown = random.uniform(7, 10)

    def __init__(self, terrain_rect, color=WHITE):
        self.radius = 20
        self.color = color
        self.active = False
        self.respawn_time = random.uniform(7, 12)
        self.duration = random.uniform(7, 15)
        self.spawn_start_time = time.time()
        self.activation_time = 0
        self.x = 0
        self.y = 0
        self.rect = pygame.Rect(0, 0, self.radius * 2, self.radius * 2)

    def reposition(self, terrain_rect):
        max_attempts = 100
        margin = self.radius + 100
        
        for _ in range(max_attempts):
            new_x = random.randint(terrain_rect.left + margin, terrain_rect.right - margin)
            new_y = random.randint(terrain_rect.top + margin, terrain_rect.bottom - margin)
            
            overlapping = False
            for bumper in bumpers:
                if bumper != self and bumper.active:
                    dist = ((new_x - bumper.x)**2 + (new_y - bumper.y)**2)**0.5
                    if dist < (self.radius + bumper.radius) * 1.5:
                        overlapping = True
                        break

            # Check overlap with power-up orbs
            if not overlapping:
                for orb in power_up_orbs:
                    if orb.active:
                        center1 = (new_x, new_y)  # Bumper position is its center
                        center2 = (orb.x + orb.size//2, orb.y + orb.size//2)
                        
                        distance = ((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)**0.5
                        min_distance = (self.radius + orb.size//2) * 1.5
                        
                        if distance < min_distance:
                            overlapping = True
                            break
            
            if not overlapping:
                self.x = new_x
                self.y = new_y
                self.rect = pygame.Rect(self.x - self.radius, self.y - self.radius, 
                                    self.radius * 2, self.radius * 2)
                return True
        return False

    def update(self, current_time, active_bumpers_count):
    # If active, check if should vanish
        if self.active:
            if current_time - self.activation_time >= self.duration:
                self.active = False
                self.spawn_start_time = current_time
                self.respawn_time = random.uniform(7, 10)
                Bumper.last_global_vanish_time = current_time
                Bumper.next_spawn_time = current_time + Bumper.global_spawn_cooldown
        # If inactive and can spawn
        elif current_time >= Bumper.next_spawn_time:
            current_active_bumpers = sum(1 for bumper in bumpers if bumper.active)
            if current_active_bumpers < MAX_BUMPERS:
                if self.reposition(terrain_rect):
                    self.active = True
                    self.activation_time = current_time
                    Bumper.next_spawn_time = current_time + Bumper.global_spawn_cooldown


    def check_collision(self, ball):
        if not self.active:
            return None
        center_dist = ((ball.centerx - self.x)**2 + (ball.centery - self.y)**2)**0.5
        if center_dist <= self.radius + ball.width/2:
            # Calculate relative position like with paddles
            relative_position = (ball.centery - self.y) / self.radius
            # Return relative position for y speed calculation
            return relative_position
        return None

# Création des objets power-up
power_up_orbs = [
    PowerUpOrb(terrain_rect, PURPLE, "invert"),
    PowerUpOrb(terrain_rect, RED, "shrink"),
    PowerUpOrb(terrain_rect, BLUE, "ice"),
    PowerUpOrb(terrain_rect, YELLOW, "speed"),
    PowerUpOrb(terrain_rect, WHITE, "flash"),
    PowerUpOrb(terrain_rect, GREEN, "sticky")
]

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

    MIN_ANGLE = 0.1
    if abs(relative_position) < MIN_ANGLE:
        relative_position = MIN_ANGLE if relative_position >= 0 else -MIN_ANGLE

    ANGLE_FACTOR = 1.2

    ball_speed_y = relative_position * abs(ball_speed_x) * ANGLE_FACTOR
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

# Create and manage bumpers
bumpers = [Bumper(terrain_rect) for _ in range(3)]
MAX_BUMPERS = 2
BUMPER_SPAWN_TIME = 15  # Seconds between spawns

def count_active_bumpers(bumpers):
    return sum(1 for bumper in bumpers if bumper.active)

def reset_bumpers():
    current_time = time.time()
    for bumper in bumpers:
        bumper.active = False
        bumper.activation_time = current_time
    Bumper.next_spawn_time = current_time + random.uniform(7, 10)

def initialize_bumpers():
    current_time = time.time()
    for i, bumper in enumerate(bumpers):
        bumper.active = False
        bumper.spawn_start_time = current_time
        bumper.respawn_time = random.uniform(7, 10)
    Bumper.next_spawn_time = current_time + random.uniform(7, 10)  # Set initial spawn time

initialize_bumpers()

# Boucle principale du jeu
while True:
    current_time = time.time()

    if is_countdown_active:
        time_left = COUNTDOWN_DURATION - (current_time - countdown_start)
        if time_left <= 0:
            # Countdown finished, start the point
            is_countdown_active = False
            if last_scorer == 1:
                ball_speed_x = -INITIAL_BALL_SPEED
            else:
                ball_speed_x = INITIAL_BALL_SPEED
            ball_speed_y = INITIAL_BALL_SPEED
        else:
            # Don't move ball during countdown
            ball_speed_x = 0
            ball_speed_y = 0
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # Mise à jour des power-ups avec le compte des orbes actifs
    active_orbs = count_active_orbs(power_up_orbs)
    active_bumpers = count_active_bumpers(bumpers)

    for orb in power_up_orbs:
        orb.update(current_time, active_orbs)

    for bumper in bumpers:
        bumper.update(current_time, active_bumpers)

    power_up_state.update(current_time)

    # Déplacement des raquettes avec gestion des contrôles inversés
    keys = pygame.key.get_pressed()
    
    # Handle sticky ball before movement
    if power_up_state.sticky_ball["left"] and last_paddle_hit == "left":
        ball.centerx = paddle_left.rect.right
        ball.centery = paddle_left.rect.centery
        if keys[pygame.K_SPACE]:  # Left player uses spacebar
            new_speed_x, new_speed_y = calculate_sticky_release(power_up_state.sticky_angle["left"], False)
            ball_speed_x, ball_speed_y = abs(new_speed_x), new_speed_y  # Ensure ball goes right
            power_up_state.release_sticky_ball("left")
            
    elif power_up_state.sticky_ball["right"] and last_paddle_hit == "right":
        ball.centerx = paddle_right.rect.left
        ball.centery = paddle_right.rect.centery
        if keys[pygame.K_RETURN]:  # Right player uses return/enter
            new_speed_x, new_speed_y = calculate_sticky_release(power_up_state.sticky_angle["right"], True)
            ball_speed_x, ball_speed_y = -abs(new_speed_x), new_speed_y  # Ensure ball goes left
            power_up_state.release_sticky_ball("right")
    
    # Raquette gauche
    direction_left = 0
    if power_up_state.inverted_controls["left"]:
        if keys[pygame.K_s]: direction_left -= 1
        if keys[pygame.K_w]: direction_left += 1
    else:
        if keys[pygame.K_w]: direction_left -= 1
        if keys[pygame.K_s]: direction_left += 1
    
    paddle_left.move(direction_left, power_up_state.ice_physics["left"], 
                    terrain_rect.top, terrain_rect.bottom, power_up_state.speed_boost["left"])
    
    # Raquette droite
    direction_right = 0
    if power_up_state.inverted_controls["right"]:
        if keys[pygame.K_DOWN]: direction_right -= 1
        if keys[pygame.K_UP]: direction_right += 1
    else:
        if keys[pygame.K_UP]: direction_right -= 1
        if keys[pygame.K_DOWN]: direction_right += 1
    
    paddle_right.move(direction_right, power_up_state.ice_physics["right"],
                     terrain_rect.top, terrain_rect.bottom, power_up_state.speed_boost["right"])

    # Only move ball if not sticky
    if not (power_up_state.sticky_ball["left"] and last_paddle_hit == "left") and \
       not (power_up_state.sticky_ball["right"] and last_paddle_hit == "right"):
        ball.x += ball_speed_x
        ball.y += ball_speed_y

    # First check paddle collisions
    if ball.colliderect(paddle_left.rect):
        collision_result = calculate_collision(ball, paddle_left.rect, is_left_paddle=True)
        if collision_result == "hit":
            last_paddle_hit = "left"
    elif ball.colliderect(paddle_right.rect):
        collision_result = calculate_collision(ball, paddle_right.rect, is_left_paddle=False)
        if collision_result == "hit":
            last_paddle_hit = "right"

    # Then check wall collisions and fix position
    if ball.top <= terrain_rect.top:
        ball_speed_y = abs(ball_speed_y)  # Force ball to go down
        ball.top = terrain_rect.top  # Fix position
    elif ball.bottom >= terrain_rect.bottom:
        ball_speed_y = -abs(ball_speed_y)  # Force ball to go up
        ball.bottom = terrain_rect.bottom  # Fix position

    for bumper in bumpers:
        bounce = bumper.check_collision(ball)
        if bounce:
            ball_speed_x = -ball_speed_x * 1.05  # 10% increase
            ball_speed_y = bounce * abs(ball_speed_x)

    # Gestion des collisions avec les orbes de power-up
    for orb in power_up_orbs:
        if orb.active and ball.colliderect(orb.rect):
            orb.collect(current_time)
            if last_paddle_hit:
                power_up_state.apply_effect(last_paddle_hit, orb.effect_type, current_time)

    # Gestion des sorties de balle
    if ball.left <= terrain_rect.left:
        score_right += 1
        last_scorer = 2
        reset_point(True)
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
        last_paddle_hit = None
    if ball.right >= terrain_rect.right:
        score_left += 1
        last_scorer = 1
        reset_point(True)
        ball.x, ball.y = terrain_rect.center
        ball_speed_x, ball_speed_y = -INITIAL_BALL_SPEED, INITIAL_BALL_SPEED
        last_paddle_hit = None

    # Dessin
    if power_up_state.flash_effect:
        screen.fill(WHITE)
    else:
        screen.fill(BLACK)
        pygame.draw.rect(screen, WHITE, terrain_rect, 2)
        pygame.draw.rect(screen, WHITE, paddle_left.rect)
        pygame.draw.rect(screen, WHITE, paddle_right.rect)
        pygame.draw.ellipse(screen, WHITE, ball)
        for orb in power_up_orbs:
            if orb.active:
                pygame.draw.circle(screen, orb.color, 
                             (orb.x + orb.size//2, orb.y + orb.size//2), 
                             orb.size//2)
        for bumper in bumpers:
            if bumper.active:
                pygame.draw.circle(screen, WHITE, (int(bumper.x), int(bumper.y)), bumper.radius)

        # Draw sticky ball arrow if active
        for player in ["left", "right"]:
            if power_up_state.sticky_ball[player] and last_paddle_hit == player:
                # Calculate arrow start point
                start_pos = (0, 0)
                if player == "left":
                    start_pos = (paddle_left.rect.right, paddle_left.rect.centery)
                    base_angle = 0
                else:
                    start_pos = (paddle_right.rect.left, paddle_right.rect.centery)
                    base_angle = 180
                
                # Calculate arrow end point using angle
                angle = base_angle + power_up_state.sticky_angle[player]
                rad_angle = math.radians(angle)
                end_pos = (
                    start_pos[0] + (ARROW_LENGTH * math.cos(rad_angle)),
                    start_pos[1] + (ARROW_LENGTH * math.sin(rad_angle))
                )
                
                # Draw the arrow line
                pygame.draw.line(screen, GREEN, start_pos, end_pos, 2)
                
                # Draw arrow head
                arrow_head_length = 10
                arrow_head_angle = math.pi / 6  # 30 degrees
                angle1 = rad_angle + arrow_head_angle
                angle2 = rad_angle - arrow_head_angle
                
                head1_pos = (
                    end_pos[0] - arrow_head_length * math.cos(angle1),
                    end_pos[1] - arrow_head_length * math.sin(angle1)
                )
                head2_pos = (
                    end_pos[0] - arrow_head_length * math.cos(angle2),
                    end_pos[1] - arrow_head_length * math.sin(angle2)
                )
                
                # Draw arrow head lines
                pygame.draw.line(screen, GREEN, end_pos, head1_pos, 2)
                pygame.draw.line(screen, GREEN, end_pos, head2_pos, 2)

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
        if power_up_state.speed_boost[player]:
            effects.append("Speedy Gonzales!")
        if power_up_state.sticky_ball[player]:
            effects.append("Sticky!")
            
        if effects:
            effect_text = font.render(" & ".join(effects), True, PURPLE)
            x_pos = terrain_rect.left if player == "left" else terrain_rect.right - effect_text.get_width()
            screen.blit(effect_text, (x_pos, 10))


    if is_countdown_active:
        time_left = COUNTDOWN_DURATION - (current_time - countdown_start)
        if time_left > 0:
            countdown_number = str(min(3, int(time_left) + 1))  # +1 so it shows 3,2,1 instead of 2,1,0
            font = pygame.font.SysFont(None, COUNTDOWN_FONT_SIZE)
            count_text = font.render(countdown_number, True, WHITE)
            text_rect = count_text.get_rect(center=terrain_rect.center)
            screen.blit(count_text, text_rect)

    pygame.display.flip()
    clock.tick(FPS)