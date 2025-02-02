# Generated by Django 4.2.18 on 2025-01-24 08:47

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import game.models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GameInvitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(default=game.models.default_expiration_time)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('expired', 'Expired')], default='pending', max_length=10)),
                ('from_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations_sent', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='GameSession',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('player_left', models.CharField(blank=True, max_length=50, null=True)),
                ('player_right', models.CharField(blank=True, max_length=50, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(default='running', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='GameResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('winner', models.CharField(max_length=10)),
                ('looser', models.CharField(max_length=10)),
                ('score_left', models.IntegerField()),
                ('score_right', models.IntegerField()),
                ('ended_at', models.DateTimeField(auto_now_add=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='game.gamesession')),
            ],
        ),
        migrations.CreateModel(
            name='GameParameters',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ball_speed', models.PositiveSmallIntegerField(choices=[(1, 'Slow'), (2, 'Medium'), (3, 'Fast')], default=2)),
                ('racket_size', models.PositiveSmallIntegerField(choices=[(1, 'Small'), (2, 'Medium'), (3, 'Large')], default=2)),
                ('bonus_malus_activation', models.BooleanField(default=True)),
                ('bumpers_activation', models.BooleanField(default=False)),
                ('game_session', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='parameters', to='game.gamesession')),
            ],
        ),
        migrations.CreateModel(
            name='GameInvitationParameters',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ball_speed', models.PositiveSmallIntegerField(choices=[(1, 'Slow'), (2, 'Medium'), (3, 'Fast')], default=2)),
                ('racket_size', models.PositiveSmallIntegerField(choices=[(1, 'Small'), (2, 'Medium'), (3, 'Large')], default=2)),
                ('bonus_malus_activation', models.BooleanField(default=True)),
                ('bumpers_activation', models.BooleanField(default=False)),
                ('invitation', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='parameters', to='game.gameinvitation')),
            ],
        ),
        migrations.AddField(
            model_name='gameinvitation',
            name='session',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='invitations', to='game.gamesession'),
        ),
        migrations.AddField(
            model_name='gameinvitation',
            name='to_user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations_received', to=settings.AUTH_USER_MODEL),
        ),
    ]
