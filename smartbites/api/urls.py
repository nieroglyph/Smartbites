from django.urls import path

# User Registration, Login, Logout
from .views import register_user, login_user, logout_user

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
]