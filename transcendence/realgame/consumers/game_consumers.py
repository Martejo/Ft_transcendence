from channels.generic.websocket import AsyncJsonWebsocketConsumer
from ..engine.game_state import GameState
import json
import asyncio

class GameConsumer(AsyncJsonWebsocketConsumer):
    # Class variable to track players across all instances
    players = {}
    
    async def connect(self):
        print("Attempting to connect...")  # Debug print
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        print(f"Game ID: {self.game_id}")  # Debug print
        self.game_group_name = f'game_{self.game_id}'
        
        # Initialize game state for this game if it doesn't exist
        if not hasattr(self.__class__, 'game_states'):
            self.__class__.game_states = {}
            
        if self.game_id not in self.__class__.game_states:
            self.__class__.game_states[self.game_id] = GameState(self.game_id)
        
        self.game_state = self.__class__.game_states[self.game_id]
        
        # Track players
        if self.game_id not in self.players:
            self.players[self.game_id] = set()
        
        # Assign player side (left or right)
        self.player_side = 'left' if len(self.players[self.game_id]) == 0 else 'right'
        self.players[self.game_id].add(self.channel_name)
        
        # Join game group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        
        # Accept the connection
        await self.accept()
        
        # Send initial player assignment
        await self.send_json({
            'type': 'player_assignment',
            'side': self.player_side
        })
        
        # Start game if we have two players
        if len(self.players[self.game_id]) == 2:
            asyncio.create_task(self.game_state.start_game_loop())
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'game.start',
                    'message': 'Game starting'
                }
            )

    async def disconnect(self, close_code):
        if self.game_id in self.players:
            self.players[self.game_id].remove(self.channel_name)
            if len(self.players[self.game_id]) == 0:
                # Stop game loop if this was the last player
                if self.game_id in self.__class__.game_states:
                    self.__class__.game_states[self.game_id].running = False
                    del self.__class__.game_states[self.game_id]
                del self.players[self.game_id]

        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        """Handle incoming messages from clients"""
        message_type = content.get('type')
        
        if message_type == 'paddle_move':
            # Use the assigned player side
            direction = content.get('direction')
            
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'game.paddle_update',
                    'player': self.player_side,
                    'direction': direction
                }
            )
        
        elif message_type == 'power_up_action':
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'game.power_up',
                    'action': content.get('action'),
                    'player': self.player_side
                }
            )

    async def game_state_update(self, event):
        """Send game state to client"""
        await self.send_json({
            'type': 'game_state',
            'state': event['state']
        })

    async def game_paddle_update(self, event):
        # Update game state with new paddle position
        if hasattr(self, 'game_state'):
            self.game_state.update_paddle(event['player'], event['direction'])
            await self.game_state.broadcast_state()

    async def game_start(self, event):
        """Handle game start event"""
        await self.send_json({
            'type': 'game_start',
            'message': event['message']
        })

    async def game_power_up(self, event):
        """Handle power-up activation"""
        if hasattr(self, 'game_state'):
            self.game_state.activate_power_up(event['player'], event['action'])
            await self.game_state.broadcast_state()