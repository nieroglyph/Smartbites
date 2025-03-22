from django.shortcuts import render

# Create your views here.
# User Registration
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import UserProfile

@api_view(['POST'])
def register_user(request):
    """API to register a new user"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    UserProfile.objects.create(user=user)  # Create linked UserProfile

    return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token

# User Login
@api_view(['POST'])
def login_user(request):
    """API to log in a user and return an authentication token"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

# User Logout
@api_view(['POST'])
def logout_user(request):
    """API to log out a user"""
    request.user.auth_token.delete()
    logout(request)
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

# User Authentication
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def my_secure_view(request):
    return Response({"message": "Welcome, authorized user!"})
