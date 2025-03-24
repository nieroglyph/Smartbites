from django.urls import path

# User Registration, Login, Logout
from .views import register_user, login_user, logout_user, my_secure_view
# User Profiles
from .views import get_user_profile
# Save, Fetch, Delete Recipe
from .views import save_recipe, get_user_recipes, delete_recipe
# Nutrition, Recipe API
from .views import nutrition_info, recipe_search

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('authentication/', my_secure_view, name='authentication'),
    path('profile/', get_user_profile, name='get_user_profile'),
    path('recipes/save/', save_recipe, name='save_recipe'),
    path('recipes/user', get_user_recipes, name='get_user_recipes'),
    path('recipes/delete/<int:recipe_id>/', delete_recipe, name='delete_recipe'),
    path("nutrition/", nutrition_info, name="nutrition"),
    path("recipes/", recipe_search, name="recipes")
]
