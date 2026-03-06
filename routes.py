"""
routes.py — All Flask route handlers for the Knee Replacement Platform.

Routes:
  GET  /                    → Homepage
  GET  /chatbot             → Full chatbot page
  GET  /assessment          → Pre-surgery assessment form
  GET  /dashboard           → Recovery dashboard

API endpoints:
  POST /api/chat            → Chatbot message exchange
  POST /api/submit-assessment → Assessment form submission
  POST /api/log-recovery    → Log daily recovery entry
  GET  /api/recovery-data   → Recovery chart data (JSON)
  POST /api/emergency-check → Check for emergency symptoms in text
"""

import uuid
from datetime import date, timedelta
from flask import (
    Blueprint, render_template, request, jsonify, session
)
from extensions import db
from models import Assessment, RecoveryLog, Message
from chatbot import get_response, check_emergency_symptoms

main = Blueprint("main", __name__)


# ---------------------------------------------------------------------------
# Helper — session ID for anonymous users
# ---------------------------------------------------------------------------

def get_session_id():
    """Return or create a unique session ID for the current browser session."""
    if "session_id" not in session:
        session["session_id"] = str(uuid.uuid4())
    return session["session_id"]


# ---------------------------------------------------------------------------
# Page Routes
# ---------------------------------------------------------------------------

@main.route("/")
def index():
    """Homepage — hero, features, quick chatbot widget, milestones."""
    return render_template("index.html")


@main.route("/chatbot")
def chatbot_page():
    """Full-page chatbot interface."""
    sid = get_session_id()
    # Load last 20 messages for this session to pre-populate conversation
    messages = (
        Message.query
        .filter_by(session_id=sid)
        .order_by(Message.timestamp.asc())
        .limit(20)
        .all()
    )
    return render_template("chatbot.html", messages=[m.to_dict() for m in messages])


@main.route("/assessment")
def assessment_page():
    """Pre-surgery assessment form page."""
    return render_template("assessment.html")


@main.route("/dashboard")
def dashboard_page():
    """Post-surgery recovery dashboard page."""
    sid = get_session_id()
    logs = (
        RecoveryLog.query
        .filter_by(session_id=sid)
        .order_by(RecoveryLog.log_date.asc())
        .all()
    )
    return render_template("dashboard.html", logs=logs)


# ---------------------------------------------------------------------------
# API — Chatbot
# ---------------------------------------------------------------------------

@main.route("/api/chat", methods=["POST"])
def api_chat():
    """
    Accept a user message and return a chatbot response.

    Request JSON: { "message": "..." }
    Response JSON: { "intent": "...", "response": "...", "emergency": bool }
    """
    data = request.get_json(silent=True) or {}
    user_text = (data.get("message") or "").strip()

    if not user_text:
        return jsonify({"error": "Empty message"}), 400

    sid = get_session_id()

    # Save user message
    user_msg = Message(session_id=sid, role="user", content=user_text)
    db.session.add(user_msg)

    # Get bot response
    bot_data = get_response(user_text)

    # Save bot message
    bot_msg = Message(
        session_id=sid,
        role="bot",
        content=bot_data["response"],
        intent=bot_data["intent"],
    )
    db.session.add(bot_msg)
    db.session.commit()

    return jsonify({
        "intent": bot_data["intent"],
        "response": bot_data["response"],
        "emergency": bot_data["emergency"],
        "timestamp": bot_data["timestamp"],
    })


# ---------------------------------------------------------------------------
# API — Assessment
# ---------------------------------------------------------------------------

@main.route("/api/submit-assessment", methods=["POST"])
def api_submit_assessment():
    """
    Process pre-surgery assessment form.

    Computes: BMI, readiness score (0-100), risk level, recommendations.
    """
    data = request.get_json(silent=True) or {}

    try:
        age = int(data.get("age", 0))
        weight_kg = float(data.get("weight_kg", 0))
        height_cm = float(data.get("height_cm", 0))
        pain_level = int(data.get("pain_level", 0))
        mobility_score = int(data.get("mobility_score", 5))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid input values"}), 400

    conditions = data.get("conditions", [])
    if not isinstance(conditions, list):
        conditions = [str(conditions)] if conditions else []

    if height_cm <= 0 or weight_kg <= 0:
        return jsonify({"error": "Height and weight must be positive"}), 400

    # BMI Calculation
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m ** 2), 1)

    # ── Readiness Score (0–100) ──────────────────────────────────────────
    score = 100.0

    # BMI penalties
    if bmi >= 40:
        score -= 30
    elif bmi >= 35:
        score -= 20
    elif bmi >= 30:
        score -= 10
    elif bmi < 18.5:
        score -= 10

    # Age adjustments
    if age > 80:
        score -= 15
    elif age > 70:
        score -= 5
    elif age < 40:
        score -= 5  # unusual, may need more conservative approach

    # Pain level — higher pain slightly reduces score (may need more prep)
    if pain_level >= 9:
        score -= 5

    # Mobility — lower mobility reduces score
    score -= (10 - mobility_score) * 2

    # Conditions penalties
    condition_penalties = {
        "diabetes": 10,
        "hypertension": 5,
        "heart_disease": 15,
        "copd": 12,
        "kidney_disease": 10,
        "blood_disorder": 8,
        "osteoporosis": 5,
    }
    for condition in conditions:
        score -= condition_penalties.get(condition, 0)

    score = max(0.0, min(100.0, round(score, 1)))

    # ── Risk Level ───────────────────────────────────────────────────────
    if score >= 70:
        risk_level = "low"
    elif score >= 45:
        risk_level = "moderate"
    else:
        risk_level = "high"

    # ── Personalised Recommendations ─────────────────────────────────────
    recs = []

    if bmi >= 30:
        recs.append(f"Consider weight loss before surgery. Current BMI {bmi} increases complication risk.")
    if bmi < 18.5:
        recs.append("Your BMI is low. Nutritional support before surgery is recommended.")
    if "diabetes" in conditions:
        recs.append("Ensure blood glucose is well-controlled (HbA1c < 8%) before surgery.")
    if "hypertension" in conditions:
        recs.append("Blood pressure should be well-managed (< 140/90) prior to operation.")
    if "heart_disease" in conditions:
        recs.append("Cardiology clearance is strongly recommended before knee replacement.")
    if mobility_score <= 3:
        recs.append("Consider pre-habilitation exercises to improve mobility and strength before surgery.")
    if pain_level >= 8:
        recs.append("Your high pain levels indicate urgency. Discuss timelines with your surgeon.")
    if age > 75:
        recs.append("Geriatric pre-operative assessment recommended to optimise post-op recovery.")
    if not conditions:
        recs.append("No significant comorbidities detected — good baseline health for surgery.")

    recs.append("Complete all pre-operative investigations: blood tests, ECG, chest X-ray.")
    recs.append("Start physiotherapy exercises (quad sets, straight leg raises) now to improve outcomes.")

    # Persist to DB
    sid = get_session_id()
    assessment = Assessment(
        session_id=sid,
        age=age,
        weight_kg=weight_kg,
        height_cm=height_cm,
        bmi=bmi,
        conditions=",".join(conditions),
        pain_level=pain_level,
        mobility_score=mobility_score,
        readiness_score=score,
        risk_level=risk_level,
        recommendations="|".join(recs),
    )
    db.session.add(assessment)
    db.session.commit()

    # Ensure conditions are filtered if "none" was somehow passed
    filtered_conditions = [c for c in conditions if c.lower() != "none"]

    return jsonify({
        "bmi": bmi,
        "bmi_category": _bmi_category(bmi),
        "readiness_score": score,
        "risk_level": risk_level,
        "recommendations": recs,
    })


def _bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Healthy Weight"
    elif bmi < 30:
        return "Overweight"
    elif bmi < 35:
        return "Obese (Class I)"
    elif bmi < 40:
        return "Obese (Class II)"
    else:
        return "Morbidly Obese"


@main.route("/api/last-assessment", methods=["GET"])
def api_get_last_assessment():
    """Retrieve the most recent assessment for the current session."""
    sid = get_session_id()
    last = (
        Assessment.query
        .filter_by(session_id=sid)
        .order_by(Assessment.submitted_at.desc())
        .first()
    )

    if not last:
        return jsonify({"found": False}), 404

    return jsonify({
        "found": True,
        "bmi": last.bmi,
        "bmi_category": _bmi_category(last.bmi),
        "readiness_score": last.readiness_score,
        "risk_level": last.risk_level,
        "recommendations": last.recommendations.split("|") if last.recommendations else [],
        "submitted_at": last.submitted_at.isoformat()
    })


# ---------------------------------------------------------------------------
# API — Recovery Logging
# ---------------------------------------------------------------------------

@main.route("/api/log-recovery", methods=["POST"])
def api_log_recovery():
    """
    Submit a daily recovery log entry.

    Request JSON: {
      "day_number": int,
      "pain_level": int (0-10),
      "swelling_level": int (0-10),
      "walking_distance_m": float,
      "exercises_done": int,
      "medications_taken": bool,
      "notes": str
    }
    """
    data = request.get_json(silent=True) or {}
    sid = get_session_id()

    try:
        day_number = int(data.get("day_number", 1))
        pain_level = int(data.get("pain_level", 0))
        swelling_level = int(data.get("swelling_level", 0))
        walking_distance_m = float(data.get("walking_distance_m", 0))
        exercises_done = int(data.get("exercises_done", 0))
        med_val = data.get("medications_taken", True)
        medications_taken = str(med_val).lower() == "true" if isinstance(med_val, str) else bool(med_val)
        notes = str(data.get("notes", "")).strip()
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid log values"}), 400

    # Emergency symptom check on notes
    emergency = check_emergency_symptoms(notes)

    # Slow recovery alert logic:
    # After Day 7, pain should be trending down and walking increasing
    slow_recovery = False
    if day_number > 7 and pain_level >= 8:
        slow_recovery = True
    if day_number > 14 and walking_distance_m < 50:
        slow_recovery = True
    if day_number > 7 and exercises_done == 0:
        slow_recovery = True

    log = RecoveryLog(
        session_id=sid,
        log_date=date.today(),
        day_number=day_number,
        pain_level=pain_level,
        swelling_level=swelling_level,
        walking_distance_m=walking_distance_m,
        exercises_done=exercises_done,
        medications_taken=medications_taken,
        notes=notes,
        slow_recovery_alert=slow_recovery,
    )
    db.session.add(log)
    db.session.commit()

    # AI recovery prediction (statistical heuristic)
    prediction = _recovery_prediction(day_number, pain_level, walking_distance_m)

    return jsonify({
        "success": True,
        "emergency": emergency,
        "slow_recovery_alert": slow_recovery,
        "prediction": prediction,
        "log_id": log.id,
    })


@main.route("/api/recovery-data", methods=["GET"])
def api_recovery_data():
    """
    Return all recovery logs for the current session as JSON (for Chart.js).
    """
    sid = get_session_id()
    logs = (
        RecoveryLog.query
        .filter_by(session_id=sid)
        .order_by(RecoveryLog.day_number.asc())
        .all()
    )

    return jsonify({
        "logs": [
            {
                "day": log.day_number,
                "pain": log.pain_level,
                "swelling": log.swelling_level,
                "walking": log.walking_distance_m,
                "exercises": log.exercises_done,
                "medications": log.medications_taken,
                "slow_alert": log.slow_recovery_alert,
                "notes": log.notes,
            }
            for log in logs
        ]
    })


def _recovery_prediction(day: int, pain: int, walking: float) -> dict:
    """
    Heuristic-based recovery trajectory prediction.
    Returns category and message for display.
    """
    # Expected benchmarks
    expected_pain = max(0, 8 - (day / 5))          # pain decreasing ~0.2/day
    expected_walking = min(1000, day * 15)           # walking increasing ~15m/day

    pain_ok = pain <= (expected_pain + 2)
    walk_ok = walking >= (expected_walking * 0.6)

    if pain_ok and walk_ok:
        category = "on_track"
        message = "🟢 Your recovery is progressing well! Keep up the great work."
        estimated_full = max(90 - day, 0)
    elif pain_ok or walk_ok:
        category = "average"
        message = "🟡 Recovery is progressing, but there's room to improve. Stay consistent with exercises."
        estimated_full = max(100 - day, 0)
    else:
        category = "slow"
        message = "🔴 Recovery may be slower than expected. Please consult your physiotherapist."
        estimated_full = max(120 - day, 0)

    return {
        "category": category,
        "message": message,
        "estimated_days_to_full_recovery": estimated_full,
    }


# ---------------------------------------------------------------------------
# API — Emergency Check
# ---------------------------------------------------------------------------

@main.route("/api/emergency-check", methods=["POST"])
def api_emergency_check():
    """
    Check arbitrary text for emergency symptoms.

    Request JSON: { "text": "..." }
    Response JSON: { "emergency": bool, "message": str }
    """
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    is_emergency = check_emergency_symptoms(text)

    return jsonify({
        "emergency": is_emergency,
        "message": (
            "🚨 Emergency symptoms detected! Please call 911 or your surgeon immediately."
            if is_emergency
            else "No emergency symptoms detected."
        ),
    })
