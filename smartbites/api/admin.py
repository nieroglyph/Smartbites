from django.contrib import admin

# Register your models here.
# User Profile
from .models import UserProfile
admin.site.register(UserProfile)

# Saved Recipes
from .models import Recipe
admin.site.register(Recipe)