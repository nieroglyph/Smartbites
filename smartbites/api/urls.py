from django.urls import path

# User Registration, Login, Logout
from .views import register_user, login_user, logout_user, my_secure_view

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('authentication/', my_secure_view, name='authentication')
]