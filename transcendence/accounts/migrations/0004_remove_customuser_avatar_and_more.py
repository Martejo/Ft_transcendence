# Generated by Django 4.2.16 on 2024-11-20 14:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_customuserprofile_friends'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='avatar',
        ),
        migrations.AlterField(
            model_name='customuserprofile',
            name='avatar',
            field=models.ImageField(blank=True, default='avatars/default_avatar.png', null=True, upload_to='avatars/'),
        ),
    ]
