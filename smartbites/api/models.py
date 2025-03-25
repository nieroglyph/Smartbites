from django.db import models

# Create your models here.
from django.contrib.auth.models import User  # Default Django User model

# User Profiles
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    dietary_preference = models.CharField(max_length=100, choices=[
        ('vegan', 'Vegan'),
        ('keto', 'Keto'),
        ('vegetarian', 'Vegetarian'),
        ('omnivore', 'Omnivore'),
    ], default='omnivore')
    allergies = models.TextField(blank=True, null=True)
    # calories = models.IntegerField(blank=True, null=True)  # Commented out for now

    def __str__(self):
        return self.user.username

# Saved Recipes
class Recipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Links recipe to a user
    title = models.CharField(max_length=255)  # Recipe title
    ingredients = models.TextField()  # Ingredients list (as a text)
    instructions = models.TextField()  # Cooking instructions
    image_url = models.URLField(blank=True, null=True)  # Optional image link
    saved_at = models.DateTimeField(auto_now_add=True)  # When the recipe was saved

    def __str__(self):
        return self.title