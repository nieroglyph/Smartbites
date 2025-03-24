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

def get_recipes(ingredient):
    """Fetch recipes using API Ninjas"""
    url = f"https://api.api-ninjas.com/v1/recipe?query={ingredient}"
    headers = {"X-Api-Key": API_NINJAS_KEY}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()  # Returns a list of recipes
    return []
