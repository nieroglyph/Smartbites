# Generated by Django 5.1.7 on 2025-04-14 11:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_customuser_full_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='budget',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
    ]
