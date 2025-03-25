import requests

# USDA Food Central
USDA_API_KEY = "s0Zhxj6DhGIgrEVSFHXerIxrdaF81RJwNbBpKbQZ"

def get_nutrition_data(food_name):
    """Fetch nutrition info from USDA FoodData Central API"""
    url = f"https://api.nal.usda.gov/fdc/v1/foods/search?query={food_name}&api_key={USDA_API_KEY}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if data["foods"]:
            return data["foods"][0]  # Return the first food item
    return None

# API Ninja
API_NINJAS_KEY = "aYuErKrro2lKpmQ1TAKR4StUpNYBdqAjFjlGkHsR"

import re

# uses multiple api requests per ingredient, not sustainable for free plan
def get_recipes(ingredients):
    """Fetch recipes that contain all the given ingredients as whole words."""
    headers = {"X-Api-Key": API_NINJAS_KEY}
    all_recipes = []

    for ingredient in ingredients:
        url = f"https://api.api-ninjas.com/v1/recipe?query={ingredient}"
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            all_recipes.extend(response.json())  # Collect all recipes

    # Function to check for whole word matches
    def contains_whole_word(text, word):
        return re.search(rf'\b{re.escape(word)}\b', text, re.IGNORECASE) is not None

    # Filter recipes to only include those containing all ingredients as whole words
    filtered_recipes = [
        recipe for recipe in all_recipes
        if all(contains_whole_word(recipe['ingredients'], ing) for ing in ingredients)
    ]

    return filtered_recipes
