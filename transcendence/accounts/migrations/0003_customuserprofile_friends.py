# Generated by Django 4.2.16 on 2024-11-15 10:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_customuserprofile_is_logged_in'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuserprofile',
            name='friends',
            field=models.ManyToManyField(blank=True, to='accounts.customuserprofile'),
        ),
    ]
