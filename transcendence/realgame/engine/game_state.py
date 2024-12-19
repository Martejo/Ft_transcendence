import asyncio
import time
from channels.layers import get_channel_layer


class GameState:
    def __init__(self, game_id):

        self.FPS = 60
        self.running = False
        self.last_update = time.time()

        # Window and field constants
        self.WINDOW_WIDTH = 800
        self.WINDOW_HEIGHT = 400
        self.TERRAIN_MARGIN = 50
        
        # Game objects initial state
        self.ball_state = {
            'x': self.WINDOW_WIDTH // 2,
            'y': self.WINDOW_HEIGHT // 2,
            'size': 15,
            'speed_x': 0,
            'speed_y': 0
        }
        
        self.paddles = {
            'left': {
                'x': self.TERRAIN_MARGIN + 10,
                'y': (self.WINDOW_HEIGHT - 60) // 2,
                'width': 10,
                'height': 60,
                'velocity': 0,
                'on_ice': False
            },
            'right': {
                'x': self.WINDOW_WIDTH - self.TERRAIN_MARGIN - 20,
                'y': (self.WINDOW_HEIGHT - 60) // 2,
                'width': 10,
                'height': 60,
                'velocity': 0,
                'on_ice': False
            }
        }
        
        # Score tracking
        self.score = {
            'left': 0,
            'right': 0
        }
        
        # Power-up states
        self.power_up_state = {
            'left': {
                'inverted': False,
                'shrunk': False,
                'ice': False,
                'speed_boost': False,
                'sticky': False,
                'sticky_angle': 0,
                'sticky_direction': 1
            },
            'right': {
                'inverted': False,
                'shrunk': False,
                'ice': False,
                'speed_boost': False,
                'sticky': False,
                'sticky_angle': 0,
                'sticky_direction': 1
            },
            'flash_effect': False
        }
        
        # Power-up orbs state
        self.power_up_orbs = []
        for effect_type in ['invert', 'shrink', 'ice', 'speed', 'flash', 'sticky']:
            self.power_up_orbs.append({
                'type': effect_type,
                'active': False,
                'x': 0,
                'y': 0,
                'size': 30
            })
            
        # Bumper states
        self.bumpers = []
        for _ in range(3):
            self.bumpers.append({
                'active': False,
                'x': 0,
                'y': 0,
                'radius': 20
            })
            
        # Game state flags
        self.is_countdown_active = True
        self.countdown_start = time.time()
        self.last_scorer = None
        self.last_paddle_hit = None
        
        # Timing information
        self.current_time = time.time()
        
        self.game_id = game_id
        self.channel_layer = get_channel_layer()

    def to_json(self):
        """Convert the entire game state to JSON for transmission"""
        return {
            'ball': self.ball_state,
            'paddles': self.paddles,
            'score': self.score,
            'power_ups': {
                'state': self.power_up_state,
                'orbs': self.power_up_orbs
            },
            'bumpers': self.bumpers,
            'game_flags': {
                'countdown_active': self.is_countdown_active,
                'last_scorer': self.last_scorer,
                'last_paddle_hit': self.last_paddle_hit
            },
            'timing': {
                'current_time': self.current_time,
                'countdown_start': self.countdown_start
            }
        }
    
    @classmethod
    def from_json(cls, json_data):
        """Create a game state from JSON data"""
        state = cls()
        state.ball_state = json_data['ball']
        state.paddles = json_data['paddles']
        state.score = json_data['score']
        state.power_up_state = json_data['power_ups']['state']
        state.power_up_orbs = json_data['power_ups']['orbs']
        state.bumpers = json_data['bumpers']
        state.is_countdown_active = json_data['game_flags']['countdown_active']
        state.last_scorer = json_data['game_flags']['last_scorer']
        state.last_paddle_hit = json_data['game_flags']['last_paddle_hit']
        state.current_time = json_data['timing']['current_time']
        state.countdown_start = json_data['timing']['countdown_start']
        return state

    async def broadcast_state(self):
        """Broadcast current state to all connected clients"""
        await self.channel_layer.group_send(
            f"game_{self.game_id}",
            {
                "type": "game.state_update",
                "state": self.to_json()
            }
        )

    async def start_game_loop(self):
        """Start the game loop"""
        self.running = True
        while self.running:
            current_time = time.time()
            dt = current_time - self.last_update
            
            # Update game state
            await self.update(dt)
            
            # Broadcast new state
            await self.broadcast_state()
            
            # Maintain consistent frame rate
            sleep_time = max(0, (1.0 / self.FPS) - dt)
            await asyncio.sleep(sleep_time)
            self.last_update = time.time()

    async def update(self, dt):
        """Update game state based on elapsed time"""
        if self.is_countdown_active:
            await self.update_countdown(dt)
            return
            
        # Update ball position
        if not (self.power_up_state['left']['sticky'] and self.last_paddle_hit == 'left') and \
           not (self.power_up_state['right']['sticky'] and self.last_paddle_hit == 'right'):
            self.ball_state['x'] += self.ball_state['speed_x']
            self.ball_state['y'] += self.ball_state['speed_y']
        
        # Check collisions
        await self.check_collisions()
        
        # Update power-ups
        await self.update_power_ups(dt)
        
        # Update bumpers
        await self.update_bumpers(dt)
        
    async def check_collisions(self):
        """Check and handle all collisions"""
        # Wall collisions
        if self.ball_state['y'] <= self.TERRAIN_MARGIN or \
           self.ball_state['y'] >= self.WINDOW_HEIGHT - self.TERRAIN_MARGIN:
            self.ball_state['speed_y'] *= -1
        
        # Paddle collisions
        for side in ['left', 'right']:
            if self.check_paddle_collision(side):
                await self.handle_paddle_hit(side)
        
        # Power-up collisions
        for orb in self.power_up_orbs:
            if orb['active'] and self.check_orb_collision(orb):
                await self.handle_power_up_collection(orb)
        
        # Scoring
        if self.ball_state['x'] <= 0:
            await self.handle_score('right')
        elif self.ball_state['x'] >= self.WINDOW_WIDTH:
            await self.handle_score('left')
    
    async def handle_paddle_hit(self, side):
        """Handle ball collision with paddle"""
        paddle = self.paddles[side]
        relative_hit = (self.ball_state['y'] - paddle['y']) / paddle['height']
        
        # Adjust ball direction and speed
        speed = (self.ball_state['speed_x']**2 + self.ball_state['speed_y']**2)**0.5
        speed *= 1.05  # Speed increase on paddle hit
        
        angle = relative_hit * 60 - 30  # Convert to angle between -30 and 30 degrees
        import math
        self.ball_state['speed_x'] = speed * math.cos(math.radians(angle))
        self.ball_state['speed_y'] = speed * math.sin(math.radians(angle))
        
        # Ensure ball moves in correct direction
        if side == 'left':
            self.ball_state['speed_x'] = abs(self.ball_state['speed_x'])
        else:
            self.ball_state['speed_x'] = -abs(self.ball_state['speed_x'])
            
        self.last_paddle_hit = side

    async def handle_power_up_collection(self, orb):
        """Handle power-up collection"""
        orb['active'] = False
        if self.last_paddle_hit:
            # Apply power-up effect
            target = self.last_paddle_hit
            if orb['type'] in ['invert', 'shrink', 'ice']:
                # These power-ups affect the opponent
                target = 'right' if target == 'left' else 'left'
            self.power_up_state[target][orb['type']] = True

    async def update_power_ups(self, dt):
        """Update power-up states and effects"""
        current_time = time.time()
        
        # Update active power-ups
        for side in ['left', 'right']:
            for effect in self.power_up_state[side]:
                if self.power_up_state[side][effect]:
                    # Check if effect should expire
                    pass  # Implement power-up duration logic
        
        # Update power-up orbs
        for orb in self.power_up_orbs:
            if not orb['active']:
                # Check if should spawn new orb
                pass  # Implement orb spawning logic