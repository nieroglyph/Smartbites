from django.shortcuts import render

# Create your views here.
# User Registration
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import UserProfile
from .models import CustomUser
from django.contrib.auth import logout
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
def register_user(request):
    email = request.data.get("email")
    full_name = request.data.get("full_name")  # Get full name from request
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(email=email).exists():
        return Response({"error": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.create_user(email=email, password=password, full_name=full_name)  # Pass full_name
    return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

# User Login
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def login_user(request):
    """API to log in a user and return an authentication token"""
    email = request.data.get('email')  # Change from 'username' to 'email'
    password = request.data.get('password')
    
    user = authenticate(email=email, password=password)  # Ensure this matches your user model
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

# User Logout
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """API to log out a user"""
    # Delete token if it exists
    if request.user.auth_token:
        request.user.auth_token.delete()
    
    # Logout user
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

# User Profiles
from .serializers import UserProfileSerializer
from .models import UserProfile
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Ensure the user is logged in
def get_user_profile(request):
    """API to get the logged-in user's profile"""
    user_profile = UserProfile.objects.get(user=request.user)  # Get profile linked to user
    serializer = UserProfileSerializer(user_profile)  # Serialize it
    return Response(serializer.data)  # Send JSON response

# Recipes api view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import Recipe
from .serializers import RecipeSerializer

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def save_recipe(request):
    """Save a new recipe for the logged-in user."""
    data = request.data.copy()  # Make a copy of the request data
    data['user'] = request.user.id  # Assign the logged-in user to the recipe

    serializer = RecipeSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_recipes(request):
    """Retrieve all recipes saved by the logged-in user."""
    recipes = Recipe.objects.filter(user=request.user)
    serializer = RecipeSerializer(recipes, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_recipe(request, recipe_id):
    """Delete a recipe saved by the logged-in user."""
    try:
        recipe = Recipe.objects.get(id=recipe_id, user=request.user)
        recipe.delete()
        return Response({'message': 'Recipe deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Recipe.DoesNotExist:
        return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

# Nutrition Endpoint
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import get_nutrition_data

@api_view(['GET'])
def nutrition_info(request):
    """API to fetch nutrition info by food name"""
    food_name = request.GET.get("food", "")
    if not food_name:
        return Response({"error": "Food name is required"}, status=400)

    data = get_nutrition_data(food_name)
    if data:
        return Response(data)
    
    return Response({"error": "No data found"}, status=404)

# Recipe Endpoint
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import get_recipes

@api_view(['GET'])
def recipe_search(request):
    """API to fetch recipes by multiple ingredients"""
    ingredients = request.GET.getlist("ingredient")  # Accept multiple ingredients

    if not ingredients:
        return Response({"error": "At least one ingredient is required"}, status=400)

    recipes = get_recipes(ingredients)
    return Response(recipes)

# ollama - biteai
import requests
import json

@api_view(['POST'])
def query_ollama(request):
    """API to send a request to Ollama and return a response."""
    try:
        user_prompt = request.data.get("prompt", "Hello, Ollama!")  # Get user prompt

        response = requests.post("http://127.0.0.1:11434/api/generate", json={
            "model": "biteai",
            "prompt": user_prompt
        })

        response_jsons = [json.loads(line) for line in response.text.split("\n") if line.strip()]

        final_response = "".join(entry["response"] for entry in response_jsons)

        # Remove extra whitespace
        cleaned_response = " ".join(final_response.split())

        return Response({"response": cleaned_response}, status=response.status_code)

    except Exception as e:
        return Response({"error": str(e)}, status=500)