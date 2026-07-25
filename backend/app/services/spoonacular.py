import logging
import urllib.parse
import urllib.request
import json
from typing import Optional, Dict

import os
from backend.app.config.settings import SPOONACULAR_API_KEY

logger = logging.getLogger(__name__)

# Simple in-memory cache to save API quota
_RECIPE_CACHE: Dict[str, dict] = {}

def get_recipe_by_ingredients(ingredients: list[str]) -> Optional[dict]:
    """
    Search Spoonacular for a recipe using the provided ingredients.
    Returns a recipe dictionary with title, image, and instructions, or None.
    """
    api_key = os.getenv("SPOONACULAR_API_KEY", "")
    if not api_key:
        logger.warning("Spoonacular API key is missing. Skipping API call.")
        return None

    # Filter out empty ingredients and get first 3 to avoid super restrictive searches
    valid_ingredients = [i.strip() for i in ingredients if i.strip()][:3]
    if not valid_ingredients:
        return None

    # Sort ingredients to create a consistent cache key
    cache_key = ",".join(sorted([i.lower() for i in valid_ingredients]))
    
    if cache_key in _RECIPE_CACHE:
        return _RECIPE_CACHE[cache_key]

    try:
        # We use complexSearch to get recipe information directly
        query_params = urllib.parse.urlencode({
            "apiKey": api_key,
            "includeIngredients": ",".join(valid_ingredients),
            "addRecipeInformation": "true",
            "fillIngredients": "true",
            "number": 1,
            "sort": "max-used-ingredients"
        })
        
        url = f"https://api.spoonacular.com/recipes/complexSearch?{query_params}"
        
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                if data.get("results") and len(data["results"]) > 0:
                    recipe = data["results"][0]
                    
                    # Extract instructions if available
                    instructions = []
                    if recipe.get("analyzedInstructions") and len(recipe["analyzedInstructions"]) > 0:
                        for step in recipe["analyzedInstructions"][0].get("steps", []):
                            instructions.append(step.get("step"))
                    elif recipe.get("instructions"):
                        instructions = [recipe.get("instructions")]
                    
                    result = {
                        "id": recipe.get("id"),
                        "title": recipe.get("title"),
                        "image": recipe.get("image"),
                        "readyInMinutes": recipe.get("readyInMinutes"),
                        "servings": recipe.get("servings"),
                        "instructions": instructions,
                        "sourceUrl": recipe.get("sourceUrl") or recipe.get("spoonacularSourceUrl")
                    }
                    _RECIPE_CACHE[cache_key] = result
                    return result
                    
        return None
        
    except Exception as e:
        logger.error(f"Error fetching recipe from Spoonacular: {e}")
        return None
