from django.contrib import admin

# Register your models here.
# User Profile
from .models import UserProfile
admin.site.register(UserProfile)

# Saved Recipes
from .models import Recipe
admin.site.register(Recipe)

# User
from .models import CustomUser
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_staff', 'is_active')  # Customize as needed