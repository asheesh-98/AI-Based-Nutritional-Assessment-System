"""
Dashboard endpoint — aggregates key user metrics into a single response.
"""
import json
from datetime import date
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func

from backend.app.database.db import get_db
from backend.app.auth.jwt_handler import get_current_user
from backend.app.models.user import User
from backend.app.models.health_profile import HealthProfile
from backend.app.models.prediction import Prediction
from backend.app.models.food_diary import FoodDiary
from backend.app.models.progress import ProgressLog
from backend.app.schemas.dashboard import DashboardResponse, NutrientSummary, DeficiencyRisk

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregate dashboard data for the current user."""

    # ── Profile / BMI ────────────────────────────────────────────────────
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    bmi = profile.bmi if profile else None
    weight = profile.weight_kg if profile else None

    # ── Today's food diary summary ───────────────────────────────────────
    today = date.today()
    diary_entries = (
        db.query(FoodDiary)
        .filter(
            FoodDiary.user_id == current_user.id,
            sa_func.date(FoodDiary.created_at) == today,
        )
        .all()
    )
    nutrient_summary = NutrientSummary(
        calories_today=sum(e.calories or 0 for e in diary_entries),
        protein_today=sum(e.protein or 0 for e in diary_entries),
        carbs_today=sum(e.carbs or 0 for e in diary_entries),
        fat_today=sum(e.fat or 0 for e in diary_entries),
    )

    # ── Latest prediction → deficiency risks ─────────────────────────────
    latest_pred = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.prediction_date.desc())
        .first()
    )
    deficiency_risks: List[DeficiencyRisk] = []
    if latest_pred:
        risk_pairs = [
            ("Iron Deficiency", latest_pred.iron_risk),
            ("Vitamin D Deficiency", latest_pred.vitamin_d_risk),
            ("Calcium Deficiency", latest_pred.calcium_risk),
            ("Magnesium Deficiency", latest_pred.magnesium_risk),
            ("Potassium Deficiency", latest_pred.potassium_risk),
            ("Vitamin B12 Deficiency", latest_pred.vitamin_b12_risk),
        ]
        deficiency_risks = [
            DeficiencyRisk(name=name, risk=round(risk or 0, 4))
            for name, risk in risk_pairs
        ]

    # ── Recent predictions (last 5) ──────────────────────────────────────
    recent_preds = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.prediction_date.desc())
        .limit(5)
        .all()
    )
    recent_predictions = [
        {
            "id": p.id,
            "confidence_score": p.confidence_score,
            "prediction_date": str(p.prediction_date) if p.prediction_date else None,
        }
        for p in recent_preds
    ]

    # ── Recent diary entries ─────────────────────────────────────────────
    recent_diary = [
        {
            "food_name": e.food_name,
            "meal_type": e.meal_type,
            "calories": e.calories,
            "created_at": str(e.created_at) if e.created_at else None,
        }
        for e in diary_entries[:5]
    ]

    # ── Nutrition score from latest progress log ─────────────────────────
    latest_progress = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id)
        .order_by(ProgressLog.log_date.desc())
        .first()
    )
    nutrition_score = latest_progress.nutrition_score if latest_progress else None

    return DashboardResponse(
        user_name=current_user.full_name,
        nutrition_score=nutrition_score,
        nutrient_summary=nutrient_summary,
        deficiency_risks=deficiency_risks,
        recent_predictions=recent_predictions,
        recent_diary=recent_diary,
        bmi=bmi,
        weight=weight,
    )
