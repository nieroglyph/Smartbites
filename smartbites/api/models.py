from django.db import models

# Create your models here.
from django.contrib.auth.models import User  # Default Django User model

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    dietary_preference = models.CharField(max_length=100, choices=[
        ('vegan', 'Vegan'),
        ('keto', 'Keto'),
        ('vegetarian', 'Vegetarian'),
        ('omnivore', 'Omnivore'),
    ], default='omnivore')
    allergies = models.TextField(blank=True, null=True)
    caloric_needs = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.user.username