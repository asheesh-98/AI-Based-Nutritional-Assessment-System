"""
Pydantic schemas for the dashboard endpoint.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class NutrientSummary(BaseModel):
    calories_today: float = 0
    protein_today: float = 0
    carbs_today: float = 0
    fat_today: float = 0


class DeficiencyRisk(BaseModel):
    name: str
    risk: float


class DashboardResponse(BaseModel):
    user_name: str
    nutrition_score: Optional[float] = None
    nutrient_summary: NutrientSummary = NutrientSummary()
    deficiency_risks: List[DeficiencyRisk] = []
    recent_predictions: List[Dict] = []
    recent_diary: List[Dict] = []
    bmi: Optional[float] = None
    weight: Optional[float] = None
