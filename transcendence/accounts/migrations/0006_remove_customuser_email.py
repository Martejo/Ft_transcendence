# Generated by Django 4.2.16 on 2024-11-25 14:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_alter_customuserprofile_friends'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='email',
        ),
    ]
