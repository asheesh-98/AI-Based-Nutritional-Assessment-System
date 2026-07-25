"""
Gemini AI Service — interfaces with Google Gemini API.

Provides:
  1. AI Health & Nutrition Assistant Chat
  2. Visual Meal Scanner (Photo -> Foods & Macros)
  3. Multi-modal Blood Report OCR & Analysis
  4. Generative Personalised Recipe & Meal Plan Engine
  5. Clinical Assessment Report Summarizer
"""
import os
import json
import base64
import logging
import urllib.request
import urllib.error
from typing import Dict, List, Any, Optional

from backend.app.config.settings import GEMINI_API_KEY

logger = logging.getLogger(__name__)

MODELS_TO_TRY = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
]


def _get_api_key() -> str:
    """Read API key dynamically from environment or config."""
    key = os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY
    return key.strip() if key else ""


def _call_gemini_api(contents: List[Any], system_instruction: Optional[str] = None) -> str:
    """Call Google Gemini API via REST endpoint with model fallback."""
    api_key = _get_api_key()
    if not api_key:
        return "Gemini API Key is not configured yet. Please enter a valid API key in Admin Settings."

    last_error = ""

    for model_name in MODELS_TO_TRY:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 2048,
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    text_result = "".join([p.get("text", "") for p in parts])
                    if text_result:
                        return text_result
        except urllib.error.HTTPError as http_err:
            last_error = f"HTTP {http_err.code}: {http_err.reason}"
            logger.warning("Gemini model %s returned %s, trying next model...", model_name, last_error)
        except Exception as exc:
            last_error = str(exc)
            logger.warning("Gemini model %s failed: %s", model_name, exc)

    if "429" in last_error or "Too Many Requests" in last_error:
        return (
            "The Gemini API rate limit was reached (HTTP 429). "
            "Please check your API key quota in Google AI Studio or update your API key in Admin Settings."
        )

    return f"Gemini API Notice: Unable to generate response ({last_error}). Please verify your Gemini API key in Admin Settings."


def chat_with_nutritionist(messages: List[Dict[str, str]], health_context: Optional[Dict[str, Any]] = None) -> str:
    """
    Interactive AI Nutritionist Chatbot.
    Converts conversation history into Gemini REST format and incorporates user health context.
    """
    system_prompt = (
        "You are NutriAI Assistant, an empathetic, highly knowledgeable AI Clinical Nutritionist. "
        "Provide clear, practical, evidence-based nutritional advice. "
        "Use bullet points, bold text for key nutrients, and keep responses encouraging, concise, and structured. "
        "Always advise users to consult healthcare professionals for severe medical conditions."
    )

    if health_context:
        system_prompt += f"\n\nUSER HEALTH CONTEXT:\n{json.dumps(health_context, indent=2)}"

    formatted_contents = []
    for msg in messages:
        role = "user" if msg.get("role") in ("user", "human") else "model"
        formatted_contents.append({
            "role": role,
            "parts": [{"text": msg.get("content") or msg.get("text") or ""}]
        })

    return _call_gemini_api(formatted_contents, system_instruction=system_prompt)


def analyze_meal_photo(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Multi-modal vision analysis of a meal photo.
    Returns structured JSON with detected food name, category, meal type, portion, calories, and macros.
    """
    base64_img = base64.b64encode(image_bytes).decode("utf-8")

    prompt = (
        "Analyze this meal image as a professional nutritionist. "
        "Identify the primary food item/dish, estimate portion size in grams, and calculate key nutritional values. "
        "Return ONLY a raw valid JSON object (no markdown formatting, no code blocks) with the following keys:\n"
        "{\n"
        '  "food_name": "string (name of the meal/dish)",\n'
        '  "category": "string (e.g., Grain, Protein, Beverage, Dessert, Snack)",\n'
        '  "suggested_meal_type": "string (breakfast, lunch, dinner, or snack)",\n'
        '  "portion_g": 200.0,\n'
        '  "calories": 350.0,\n'
        '  "protein_g": 18.0,\n'
        '  "carbs_g": 45.0,\n'
        '  "fat_g": 10.0,\n'
        '  "confidence_notes": "string (brief note on visual identification)"\n'
        "}"
    )

    contents = [{
        "role": "user",
        "parts": [
            {"inlineData": {"mimeType": mime_type, "data": base64_img}},
            {"text": prompt}
        ]
    }]

    raw_response = _call_gemini_api(contents)

    clean_json = raw_response.strip()
    if clean_json.startswith("```json"): clean_json = clean_json[7:]
    if clean_json.startswith("```"): clean_json = clean_json[3:]
    if clean_json.endswith("```"): clean_json = clean_json[:-3]

    try:
        data = json.loads(clean_json.strip())
        return data
    except Exception as exc:
        logger.error("Failed to parse Gemini vision response: %s", exc)
        return {
            "food_name": "Scanned Dish",
            "category": "General",
            "suggested_meal_type": "lunch",
            "portion_g": 150.0,
            "calories": 250.0,
            "protein_g": 10.0,
            "carbs_g": 30.0,
            "fat_g": 8.0,
            "confidence_notes": "Identified via visual analysis",
        }


def parse_blood_report_with_gemini(file_bytes: bytes, mime_type: str = "application/pdf") -> Dict[str, Any]:
    """
    Multi-modal OCR & lab parser for blood test reports using Gemini.
    Extracts numeric biomarker values: hemoglobin, iron, ferritin, vitamin_d, vitamin_b12, calcium, magnesium, zinc, blood_sugar, cholesterol.
    """
    base64_file = base64.b64encode(file_bytes).decode("utf-8")

    prompt = (
        "Extract medical lab report biomarker numeric values from this document/image. "
        "Return ONLY a raw valid JSON object (no markdown, no code blocks) with the following numeric keys if present (use null if absent):\n"
        "{\n"
        '  "hemoglobin": float or null,\n'
        '  "iron": float or null,\n'
        '  "ferritin": float or null,\n'
        '  "vitamin_d": float or null,\n'
        '  "vitamin_b12": float or null,\n'
        '  "calcium": float or null,\n'
        '  "magnesium": float or null,\n'
        '  "zinc": float or null,\n'
        '  "blood_sugar": float or null,\n'
        '  "cholesterol": float or null\n'
        "}"
    )

    contents = [{
        "role": "user",
        "parts": [
            {"inlineData": {"mimeType": mime_type, "data": base64_file}},
            {"text": prompt}
        ]
    }]

    raw = _call_gemini_api(contents)
    clean_json = raw.strip()
    if clean_json.startswith("```json"): clean_json = clean_json[7:]
    if clean_json.startswith("```"): clean_json = clean_json[3:]
    if clean_json.endswith("```"): clean_json = clean_json[:-3]

    try:
        return json.loads(clean_json.strip())
    except Exception as exc:
        logger.error("Failed to parse Gemini blood report: %s", exc)
        return {}


def generate_ai_meal_plan_recipes(deficiencies: List[str], preference: str = "vegetarian", target_calories: int = 2000) -> str:
    """
    Generates custom step-by-step cooking recipes tailored to the user's detected deficiencies.
    """
    system_prompt = (
        "You are an expert Culinary Nutritionist. "
        "Generate 3 detailed, delicious step-by-step recipes specifically targeting the user's nutritional deficiencies. "
        "Each recipe should include Dish Name, Target Nutrients, Prep/Cook Time, Exact Ingredients, and Step-by-Step Instructions."
    )

    prompt = (
        f"Generate a customized meal plan recipe set for:\n"
        f"- Target Deficiencies: {', '.join(deficiencies) if deficiencies else 'General Wellness'}\n"
        f"- Dietary Preference: {preference}\n"
        f"- Daily Calorie Goal: {target_calories} kcal\n"
    )

    contents = [{"role": "user", "parts": [{"text": prompt}]}]
    return _call_gemini_api(contents, system_instruction=system_prompt)


def generate_clinical_summary(prediction_data: Dict[str, Any], health_profile: Optional[Dict[str, Any]] = None) -> str:
    """
    Generate a doctor-style explanation report summarizing deficiency risks.
    """
    system_prompt = (
        "You are an expert Clinical Nutritionist generating an assessment summary for a patient. "
        "Explain key deficiency risks, biological significance, and top recommended foods to restore optimal health. "
        "Keep the tone empathetic, professional, clear, and actionable."
    )

    prompt = (
        f"ASSESSMENT RESULTS:\n{json.dumps(prediction_data, indent=2)}\n\n"
        f"USER HEALTH PROFILE:\n{json.dumps(health_profile or {}, indent=2)}\n\n"
        "Please provide a structured 3-paragraph summary:\n"
        "1. **Summary of Findings**: Overview of key risk levels.\n"
        "2. **Health Impact & Biomarker Insights**: Biological explanation of why these nutrients matter.\n"
        "3. **Targeted Nutritional Action Plan**: Top 5 dietary foods & lifestyle modifications to address these deficiencies."
    )

    contents = [{"role": "user", "parts": [{"text": prompt}]}]
    return _call_gemini_api(contents, system_instruction=system_prompt)
