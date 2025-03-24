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

# User Login
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token

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
