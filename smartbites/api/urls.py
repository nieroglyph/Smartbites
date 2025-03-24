from django.urls import path

# User Registration, Login, Logout
from .views import register_user, login_user, logout_user, my_secure_view
# User Profiles
from .views import get_user_profiles

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('authentication/', my_secure_view, name='authentication'),
    path('profiles/', get_user_profiles, name='get_user_profiles')
]
