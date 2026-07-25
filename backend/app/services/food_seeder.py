"""
Seed the ``foods`` table from ``food_database_final.csv`` on first startup.

* If the CSV does not exist → logs a warning and skips (no crash).
* If the ``foods`` table already has rows → skips to avoid duplicates.
"""
import logging
from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from backend.app.config.settings import FOOD_CSV_PATH
from backend.app.database.db import SessionLocal
from backend.app.models.food import Food

logger = logging.getLogger(__name__)

# Map CSV column names → Food ORM attribute names
_CSV_TO_ORM: dict = {
    "Food_Name": "food_name",
    "Food_Category": "category",
    "diet_type": "diet_type",
    "meal_type": "meal_type",
    "Energy_kcal": "energy_kcal",
    "Protein_g": "protein_g",
    "Carbohydrate_g": "carbohydrate_g",
    "Fat_g": "fat_g",
    "Fiber_g": "fiber_g",
    "Iron_mg": "iron_mg",
    "Calcium_mg": "calcium_mg",
    "Magnesium_mg": "magnesium_mg",
    "Zinc_mg": "zinc_mg",
    "Potassium_mg": "potassium_mg",
    "Sodium_mg": "sodium_mg",
    "VitaminD_mcg": "vitamin_d_mcg",
    "VitaminB12_mcg": "vitamin_b12_mcg",
    "VitaminC_mg": "vitamin_c_mg",
    "VitaminA_mcgRAE": "vitamin_a_mcg_rae",
    "VitaminE_mg": "vitamin_e_mg",
    "VitaminK_mcg": "vitamin_k_mcg",
    "Riboflavin_mg": "riboflavin_mg",
    "Thiamin_mg": "thiamin_mg",
    "Niacin_mg": "niacin_mg",
    "VitaminB6_mg": "vitamin_b6_mg",
    "Folate_mcg": "folate_mcg",
    "Sugars_g": "sugars_g",
    "Cholesterol_mg": "cholesterol_mg",
    "nutriscore_grade": "nutriscore_grade",
}


def seed_foods() -> None:
    """Read the food CSV and bulk-insert into the ``foods`` table if empty."""
    csv_path = Path(FOOD_CSV_PATH)

    if not csv_path.exists():
        logger.warning(
            "Food CSV not found at %s — skipping food database seeding. "
            "Place the CSV there and restart to populate the food table.",
            csv_path,
        )
        return

    db: Session = SessionLocal()
    try:
        existing_count = db.query(Food).count()
        if existing_count > 0:
            logger.info(
                "Foods table already has %d rows — skipping seed.", existing_count
            )
            return

        logger.info("Seeding foods table from %s …", csv_path)
        df = pd.read_csv(csv_path)

        foods: list[Food] = []
        for _, row in df.iterrows():
            kwargs: dict = {}
            for csv_col, orm_attr in _CSV_TO_ORM.items():
                if csv_col in row.index:
                    val = row[csv_col]
                    # Convert NaN → None
                    if pd.isna(val):
                        val = None
                    kwargs[orm_attr] = val
            foods.append(Food(**kwargs))

        db.bulk_save_objects(foods)
        db.commit()
        logger.info("Seeded %d foods into the database.", len(foods))

    except Exception as exc:
        db.rollback()
        logger.error("Failed to seed foods table: %s", exc)
    finally:
        db.close()
