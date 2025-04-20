from django.urls import path

# User Registration, Login, Logout
from .views import register_user, login_user, logout_user, my_secure_view
# User Profiles
from .views import get_user_profile
# Save, Fetch, Delete, Edit Recipe
from .views import save_recipe, get_user_recipes, delete_recipe, update_recipe
# ollama
from .views import query_ollama
# display user data in react
from .views import get_current_user
# edit account, change password
from .views import update_profile, change_password
# edit user profile
from .views import update_user_profile

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('authentication/', my_secure_view, name='authentication'),
    path('profile/', get_user_profile, name='get_user_profile'),
    path('save-recipe/', save_recipe, name='save_recipe'),
    path('get-user-recipes/', get_user_recipes, name='get_user_recipes'),
    path('update-recipe/<int:recipe_id>/', update_recipe, name='update-recipe'),
    path('delete-recipe/<int:recipe_id>/', delete_recipe, name='delete_recipe'),
    path('query-ollama/', query_ollama, name='query_ollama'),
    path('current-user/', get_current_user, name='current-user'),
    path('update-profile/', update_profile, name='update-profile'),
    path('change-password/', change_password, name='change-password'),
    path('update-user-profile/', update_user_profile, name='update-user-profile'),
]