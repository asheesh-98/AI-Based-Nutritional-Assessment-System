"""
Comprehensive Food Database Re-classifier for NutriAI
Fixes diet_type classifications for all 58,921 rows in food_database_final.csv
"""
import re
import pandas as pd
from pathlib import Path

def main():
    csv_path = Path("ml/datasets/processed/food_database_final.csv").resolve()
    if not csv_path.exists():
        print(f"Error: {csv_path} does not exist.")
        return

    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    total_rows = len(df)
    print(f"Total rows: {total_rows}")

    # Exception list: Words that contain suspicious tokens but are 100% VEGETARIAN/VEGAN
    veg_exceptions = re.compile(
        r'\b(?:kidney\s+bean|red\s+kidney|light\s+red\s+kidney|dark\s+red\s+kidney|white\s+kidney|cannellini|pinto|black\s+bean|chickpea|garbanzo|soy\s+meat|mock\s+meat|plant-based|vegan|veggie|vegetarian|impossible\s+burger|beyond\s+burger|soy\s+chicken|jackfruit|tofu|seitan|tempeh|nutritional\s+yeast)\b',
        re.IGNORECASE
    )

    # NON-VEGETARIAN items (Meat, Poultry, Fish, Seafood, Game, Animal Fats, Eggs, Gelatin, Organ Meats)
    non_veg_terms = [
        # Fish & Seafood
        'fish', 'fishes', 'salmon', 'tuna', 'cod', 'haddock', 'halibut', 'sole', 'flounder', 'snapper',
        'grouper', 'bass', 'perch', 'trout', 'char', 'swordfish', 'mahi', 'marlin', 'shark', 'sturgeon',
        'carp', 'pike', 'walleye', 'tilapia', 'mullet', 'milkfish', 'barramundi', 'kingfish', 'trevally',
        'rohu', 'catfish', 'ari', 'hilsa', 'pomfret', 'mackerel', 'sardine', 'surmai', 'bhetki', 'katla',
        'anchovy', 'anchovies', 'caviar', 'roe', 'surimi', 'kamaboko', 'eel', 'eels',
        'shrimp', 'shrimps', 'prawn', 'prawns', 'crab', 'crabs', 'lobster', 'lobsters', 'clam', 'clams',
        'mussel', 'mussels', 'oyster', 'oysters', 'squid', 'squids', 'cuttlefish', 'octopus', 'scallop',
        'scallops', 'seafood', 'shellfish', 'snails', 'escargot',
        # Poultry & Game
        'chicken', 'chickens', 'turkey', 'turkeys', 'duck', 'ducks', 'goose', 'geese', 'quail', 'pheasant',
        'poultry', 'fowl', 'squab', 'pigeon', 'rabbit', 'hare',
        # Red Meat & Butchery
        'beef', 'pork', 'lamb', 'mutton', 'venison', 'veal', 'goat', 'bacon', 'ham', 'hams', 'sausage',
        'sausages', 'pepperoni', 'salami', 'steak', 'steaks', 'meat', 'meats', 'meatball', 'meatballs',
        'mince', 'minced', 'keema', 'kebab', 'kebabs', 'chorizo', 'prosciutto', 'pancetta', 'biltong',
        'jerky', 'salumi', 'mortadella', 'pastrami', 'bologna', 'frankfurter', 'frankfurters', 'hotdog',
        'hotdogs', 'patty', 'patties', 'nugget', 'nuggets', 'wing', 'wings', 'drumstick', 'drumsticks',
        'rib', 'ribs', 'sirloin', 'ribeye', 'tenderloin', 'brisket', 'tallow', 'lard', 'suet',
        # Eggs & Organ Meats
        'egg', 'eggs', 'yolk', 'yolks', 'liver', 'livers', 'kidney', 'kidneys', 'heart', 'hearts',
        'tripe', 'gizzard', 'gizzards', 'gelatin', 'gelatine', 'bone\s+broth', 'beef\s+broth', 'chicken\s+broth'
    ]

    non_veg_regex = re.compile(r'\b(?:' + '|'.join(non_veg_terms) + r')\b', re.IGNORECASE)

    # NON-VEGAN items (Dairy & Honey)
    non_vegan_terms = [
        'milk', 'cheese', 'cheeses', 'butter', 'cream', 'yogurt', 'yogurts', 'curd', 'paneer',
        'whey', 'ghee', 'honey', 'casein', 'caseinate', 'mayonnaise', 'custard', 'parmesan',
        'cheddar', 'mozzarella', 'ricotta', 'provolone', 'gouda', 'brie', 'camembert', 'feta'
    ]

    non_vegan_regex = re.compile(r'\b(?:' + '|'.join(non_vegan_terms) + r')\b', re.IGNORECASE)

    def classify_row(row):
        name = str(row['Food_Name'])
        cat = str(row.get('Food_Category', ''))
        text = f"{name} {cat}"

        # If it's a known veg exception (e.g. Kidney Beans), check if dairy or pure vegan
        is_veg_exception = bool(veg_exceptions.search(text))

        if not is_veg_exception and non_veg_regex.search(text):
            return 'non_vegetarian'
        
        if non_vegan_regex.search(text):
            return 'vegetarian'

        # Check existing tag if neutral
        orig_tag = str(row.get('diet_type', '')).lower().strip()
        if orig_tag == 'vegetarian':
            return 'vegetarian'
        return 'vegan'

    print("Classifying dataset rows...")
    df['diet_type'] = df.apply(classify_row, axis=1)

    counts = df['diet_type'].value_counts()
    print("\nNew Diet Type Counts:")
    print(counts)

    # Save cleaned dataset
    df.to_csv(str(csv_path), index=False)
    print(f"\nSaved updated dataset to {csv_path} successfully!")

if __name__ == "__main__":
    main()
