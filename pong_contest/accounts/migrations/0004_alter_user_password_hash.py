# Generated by Django 4.2.16 on 2024-10-23 12:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_alter_user_password_hash'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='password_hash',
            field=models.BinaryField(),
        ),
    ]
