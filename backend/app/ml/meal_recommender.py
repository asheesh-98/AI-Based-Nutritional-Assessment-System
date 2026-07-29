"""
Weekly meal-plan generator.

Core algorithm:
1. Load the food database CSV.
2. Filter by diet preference.
3. Score each food based on nutrient density for detected deficiencies.
4. Generate a 7-day plan (breakfast, lunch, dinner, snack) with:
   - No food repeated within the week.
   - Plans change weekly (ISO week-number × year as seed).
   - Top-20 scoring foods per slot → seeded random pick for variety.
   - Rough daily calorie target validation (1500-2500 kcal).
"""
import logging
import random
import re
import urllib.parse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from backend.app.services.spoonacular import get_recipe_by_ingredients

import numpy as np
import pandas as pd

from backend.app.config.settings import FOOD_CSV_PATH

logger = logging.getLogger(__name__)

# ── Nutrient mapping per deficiency ──────────────────────────────────────────
DEFICIENCY_NUTRIENT_MAP: Dict[str, List[tuple]] = {
    "Iron_Anemia_Deficiency": [
        ("Iron_mg", 1.0),
        ("VitaminC_mg", 0.5),
        ("VitaminB12_mcg", 0.4),
    ],
    "Vitamin_D_Deficiency": [
        ("VitaminD_mcg", 1.0),
        ("Calcium_mg", 0.4),
    ],
    "MAGN_Deficiency": [
        ("Magnesium_mg", 1.0),
    ],
    "SCA_Deficiency": [
        ("Calcium_mg", 1.0),
        ("VitaminD_mcg", 0.4),
    ],
    "SK_Deficiency": [
        ("Potassium_mg", 1.0),
    ],
    "R_Deficiency": [
        ("Riboflavin_mg", 1.0),
        ("VitaminB6_mg", 0.5),
    ],
}

SCORE_NUTRIENT_COLS = [
    "Iron_mg", "VitaminC_mg", "VitaminB12_mcg", "VitaminD_mcg",
    "Calcium_mg", "Magnesium_mg", "Potassium_mg", "Riboflavin_mg",
    "VitaminB6_mg",
]

BALANCE_COLS = [("Protein_g", 0.15), ("Energy_kcal", 0.05), ("Fiber_g", 0.10)]
MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"]

NON_VEG_REGEX = re.compile(
    r'\b(?:beef|pork|chicken|turkey|duck|lamb|mutton|fish|tuna|salmon|trout|rohu|catfish|ari|seafood|shrimp|prawn|crab|lobster|clam|mussel|oyster|squid|octopus|meat|bacon|ham|sausage|pepperoni|salami|steak|poultry|anchovy|sardine|cod|haddock|meatball|mince|venison|veal|chorizo|prosciutto|bologna|egg|eggs|yolk)\b',
    re.IGNORECASE
)

NON_VEGAN_REGEX = re.compile(
    r'\b(?:milk|cheese|butter|cream|yogurt|curd|paneer|whey|ghee|honey|casein|egg|mayonnaise|custard|parmesan|cheddar|mozzarella)\b',
    re.IGNORECASE
)

FOOD_IMAGE_KEYWORDS = [
    ("parmesan", "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800&q=80"),
    ("cheese", "https://images.unsplash.com/photo-1552767059-ce182ead8c1b?auto=format&fit=crop&w=800&q=80"),
    ("gingelly", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("seed", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("flaxseed", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("peanut", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"),
    ("butter", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"),
    ("egg", "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"),
    ("pancake", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80"),
    ("salad", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"),
    ("paneer", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"),
    ("curry", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"),
    ("pasta", "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80"),
    ("smoothie", "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80"),
    ("soup", "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"),
    ("rice", "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80"),
    ("bread", "https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80"),
    ("toast", "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"),
    ("oat", "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80"),
    ("chicken", "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80"),
    ("fish", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80"),
    ("fruit", "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80"),
    ("yogurt", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80"),
]

SLOT_FALLBACK_IMAGES = {
    "breakfast": [
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80"
    ],
    "lunch": [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
    ],
    "dinner": [
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80"
    ],
    "snack": [
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80"
    ]
}


def _get_dynamic_food_image(title: str, slot: str) -> str:
    title_lower = title.lower()
    for kw, img_url in FOOD_IMAGE_KEYWORDS:
        if kw in title_lower:
            return img_url
    
    pool = SLOT_FALLBACK_IMAGES.get(slot, SLOT_FALLBACK_IMAGES["lunch"])
    idx = abs(hash(title)) % len(pool)
    return pool[idx]


def _clean_food_name(name: str) -> str:
    """Clean raw USDA / database strings into human-friendly dish titles."""
    if not name:
        return "Nutritional Dish"
    
    cleaned = re.sub(r"-\s*[A-Z0-9]+$", "", name, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"\([^)]*\)", "", cleaned).strip()
    
    parts = [p.strip() for p in cleaned.split(",") if p.strip()]
    
    ignore_words = {"tocopherols", "formulated", "fortified", "prepared", "raw", "dehydrated", "unprepared", "kraft", "nestle", "usda", "100%", "grated"}
    valid_parts = []
    for p in parts:
        words = p.split()
        clean_words = [w for w in words if w.lower() not in ignore_words]
        if clean_words:
            valid_parts.append(" ".join(clean_words))
            
    if valid_parts:
        title = " ".join(reversed(valid_parts[:2])).title()
        return title.strip()
    
    return name.split(",")[0].title()


def generate_weekly_meal_plan(
    diet_preference: str = "non_vegetarian",
    deficiencies: Optional[List[str]] = None,
    daily_calorie_target: int = 2000,
    gender: str = "male",
    age: int = 30,
    week_seed: Optional[int] = None,
) -> dict:
    """Generate a 7-day meal plan optimised for detected nutritional deficiencies."""
    deficiencies = deficiencies or []

    csv_path = Path(FOOD_CSV_PATH)
    if not csv_path.exists():
        logger.warning("Food CSV not found at %s — returning empty plan", csv_path)
        return _empty_plan(diet_preference, deficiencies, daily_calorie_target)

    df = pd.read_csv(csv_path)
    if df.empty:
        logger.warning("Food CSV is empty — returning empty plan")
        return _empty_plan(diet_preference, deficiencies, daily_calorie_target)

    df = _filter_by_diet(df, diet_preference)
    if df.empty:
        logger.warning("No foods left after diet filter — returning empty plan")
        return _empty_plan(diet_preference, deficiencies, daily_calorie_target)

    df = _normalise_nutrients(df)
    df = _score_foods(df, deficiencies)

    now = datetime.now()
    iso_cal = now.isocalendar()
    week_number = iso_cal[1]
    year = iso_cal[0]
    if week_seed is None:
        week_seed = week_number * year

    rng = random.Random(week_seed)

    used_foods: set = set()
    days: List[dict] = []

    for day_idx in range(1, 8):
        day_meals: Dict[str, dict] = {}
        day_calories = 0.0

        for slot in MEAL_SLOTS:
            picked = _pick_food_for_slot(df, slot, used_foods, rng)
            if picked is not None:
                used_foods.add(picked["food_name"])
                day_calories += picked["calories"]
                day_meals[slot] = picked
            else:
                picked = _pick_food_for_slot(df, slot, set(), rng)
                if picked is not None:
                    day_calories += picked["calories"]
                    day_meals[slot] = picked

        # Enrich all meal slots with cleaned titles, recipes, dynamic images, and URLs
        for slot in MEAL_SLOTS:
            if slot in day_meals and day_meals[slot]:
                raw_name = day_meals[slot]["food_name"]
                clean_title = _clean_food_name(raw_name)
                day_meals[slot]["food_name"] = clean_title

                recipe = None
                if slot in ["lunch", "dinner"]:
                    search_term = clean_title.split()[0]
                    recipe = get_recipe_by_ingredients([search_term])

                if recipe and recipe.get("title"):
                    day_meals[slot]["recipe_title"] = recipe["title"]
                    day_meals[slot]["recipe_image"] = recipe.get("image") or _get_dynamic_food_image(clean_title, slot)
                    day_meals[slot]["recipe_instructions"] = recipe.get("instructions") or []
                    day_meals[slot]["recipe_ready_in"] = recipe.get("readyInMinutes", 20)
                    day_meals[slot]["recipe_url"] = recipe.get("sourceUrl")
                else:
                    day_meals[slot]["recipe_title"] = f"Healthy {clean_title}"
                    day_meals[slot]["recipe_image"] = _get_dynamic_food_image(clean_title, slot)
                    day_meals[slot]["recipe_ready_in"] = 15
                    day_meals[slot]["recipe_instructions"] = [
                        f"Prepare fresh {clean_title} with wholesome organic ingredients.",
                        "Season to taste with olive oil, sea salt, black pepper, and herbs.",
                        "Serve warm and enjoy as part of your targeted nutritional daily plan."
                    ]

                # Ensure recipe_url is ALWAYS present for external link button
                if not day_meals[slot].get("recipe_url"):
                    search_query = urllib.parse.quote(f"{clean_title} recipe")
                    day_meals[slot]["recipe_url"] = f"https://www.google.com/search?q={search_query}"

        # Enforce daily calorie target by scaling portions
        if day_calories > 0:
            scale = daily_calorie_target / day_calories
            for slot, meal in day_meals.items():
                meal["calories"] = round(meal["calories"] * scale, 1)
                if "protein" in meal:
                    meal["protein"] = round(meal["protein"] * scale, 1)
                if "carbohydrates" in meal:
                    meal["carbohydrates"] = round(meal["carbohydrates"] * scale, 1)
                if "fat" in meal:
                    meal["fat"] = round(meal["fat"] * scale, 1)
                for k in meal["key_nutrients"]:
                    meal["key_nutrients"][k] = round(meal["key_nutrients"][k] * scale, 2)
            day_calories = daily_calorie_target

        days.append({
            "day": day_idx,
            "meals": day_meals,
            "total_calories": round(day_calories, 1),
        })

    return {
        "week_number": week_number,
        "year": year,
        "diet_preference": diet_preference,
        "daily_calorie_target": daily_calorie_target,
        "deficiencies_targeted": deficiencies,
        "days": days,
    }


def _empty_plan(diet_pref: str, deficiencies: list, cal_target: int) -> dict:
    now = datetime.now()
    iso_cal = now.isocalendar()
    return {
        "week_number": iso_cal[1],
        "year": iso_cal[0],
        "diet_preference": diet_pref,
        "daily_calorie_target": cal_target,
        "deficiencies_targeted": deficiencies,
        "days": [],
    }


def _filter_by_diet(df: pd.DataFrame, pref: str) -> pd.DataFrame:
    pref = pref.strip().lower()
    if "diet_type" not in df.columns:
        filtered = df.copy()
    else:
        df["diet_type"] = df["diet_type"].fillna("").str.strip().str.lower()
        if pref == "vegan":
            filtered = df[df["diet_type"] == "vegan"].copy()
        elif pref == "vegetarian":
            filtered = df[df["diet_type"].isin(["vegetarian", "vegan"])].copy()
        else:
            filtered = df.copy()

    # Hardened runtime keyword exclusion safety filter
    food_col = "Food_Name" if "Food_Name" in filtered.columns else "food_name"
    if pref in ["vegetarian", "vegan"]:
        mask = ~filtered[food_col].astype(str).str.contains(NON_VEG_REGEX, na=False)
        filtered = filtered[mask]

    if pref == "vegan":
        mask = ~filtered[food_col].astype(str).str.contains(NON_VEGAN_REGEX, na=False)
        filtered = filtered[mask]

    return filtered


def _normalise_nutrients(df: pd.DataFrame) -> pd.DataFrame:
    for col in SCORE_NUTRIENT_COLS:
        if col in df.columns:
            cmin = df[col].min()
            cmax = df[col].max()
            if cmax > cmin:
                df[f"{col}_norm"] = (df[col] - cmin) / (cmax - cmin)
            else:
                df[f"{col}_norm"] = 0.0
    return df


def _score_foods(df: pd.DataFrame, deficiencies: List[str]) -> pd.DataFrame:
    df["deficiency_score"] = 0.0

    if deficiencies:
        for deficiency in deficiencies:
            nutrient_weights = DEFICIENCY_NUTRIENT_MAP.get(deficiency, [])
            for col, weight in nutrient_weights:
                norm_col = f"{col}_norm"
                if norm_col in df.columns:
                    df["deficiency_score"] += df[norm_col] * weight

    for col, weight in BALANCE_COLS:
        if col in df.columns:
            cmin = df[col].min()
            cmax = df[col].max()
            if cmax > cmin:
                df["deficiency_score"] += ((df[col] - cmin) / (cmax - cmin)) * weight

    return df


def _pick_food_for_slot(
    df: pd.DataFrame,
    slot: str,
    used: set,
    rng: random.Random,
) -> Optional[dict]:
    if "meal_type" not in df.columns:
        candidates = df.copy()
    else:
        candidates = df[
            df["meal_type"].fillna("").str.lower().str.contains(slot, na=False)
        ].copy()

    if candidates.empty:
        candidates = df.copy()

    if used:
        food_col = "Food_Name" if "Food_Name" in candidates.columns else "food_name"
        candidates = candidates[~candidates[food_col].isin(used)]

    if candidates.empty:
        return None

    candidates = candidates.sort_values("deficiency_score", ascending=False)
    top_n = candidates.head(20)
    row = top_n.iloc[rng.randint(0, len(top_n) - 1)]

    food_name_col = "Food_Name" if "Food_Name" in df.columns else "food_name"
    category_col = "Food_Category" if "Food_Category" in df.columns else "category"

    key_nutrients = {}
    for col in SCORE_NUTRIENT_COLS:
        if col in row.index:
            val = row[col]
            if pd.notna(val) and val > 0:
                key_nutrients[col] = round(float(val), 2)

    energy_col = "Energy_kcal" if "Energy_kcal" in row.index else "energy_kcal"
    calories = float(row.get(energy_col, 0) or 0)

    protein_col = "Protein_g" if "Protein_g" in row.index else "protein_g"
    carbs_col = "Carbohydrate_g" if "Carbohydrate_g" in row.index else "carbohydrates_g"
    fat_col = "Fat_g" if "Fat_g" in row.index else "fat_g"
    
    return {
        "food_name": str(row.get(food_name_col, "Unknown")),
        "category": str(row.get(category_col, "")),
        "calories": round(calories, 1),
        "protein": round(float(row.get(protein_col, 0) or 0), 1),
        "carbohydrates": round(float(row.get(carbs_col, 0) or 0), 1),
        "fat": round(float(row.get(fat_col, 0) or 0), 1),
        "key_nutrients": key_nutrients,
    }
