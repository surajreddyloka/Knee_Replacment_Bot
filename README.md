# KneeBot — Intelligent Knee Replacement Platform

KneeBot is a production-quality, Flask-based web platform that provides AI-powered support for knee replacement patients — from pre-surgery assessment to full post-operative recovery.

## 🚀 Quick Start

```bash
# 1. Navigate to the project
cd /Users/surajreddyloka/Desktop/KneeReplacementbot

# 2. Install dependencies (one time)
pip install -r requirements.txt

# 3. Run
python app.py
```

Open **http://localhost:5000** in your browser.

---

## 🗂 Project Structure

```
KneeReplacementbot/
├── app.py            # Flask app factory, entry point
├── chatbot.py        # NLP chatbot engine (25+ intents)
├── models.py         # SQLAlchemy models: User, Assessment, RecoveryLog, Message
├── routes.py         # All route handlers + REST APIs
├── extensions.py     # Shared Flask extensions
├── requirements.txt  # Python dependencies
├── database.db       # Auto-created SQLite DB on first run
├── static/
│   ├── css/style.css # Glassmorphism design system
│   └── js/script.js  # Chatbot, charts, voice, assessment logic
├── templates/
│   ├── index.html       # Homepage
│   ├── chatbot.html     # Full chatbot page
│   ├── assessment.html  # Pre-surgery assessment form (multi-step)
│   ├── dashboard.html   # Recovery tracker + Chart.js charts
│   └── partials/
│       ├── header.html
│       └── footer.html
└── docs/
    ├── architecture.md
    ├── api.md
    ├── user_guide.md
    └── future_improvements.md
```

---

## 🧠 Modules

| Module | Description |
|---|---|
| **Intelligent Chatbot** | 25+ medical intents, keyword NLP, emergency detection |
| **Pre-Surgery Assessment** | BMI, readiness score, risk level, personalised recommendations |
| **Recovery Tracker** | Daily pain/swelling/walking logs, slow-recovery alerts |
| **Chart.js Dashboard** | 4 interactive charts: pain, walking, exercises, recovery score |
| **Milestone System** | Day 1, 7, 14 / Week 6 / Month 3 / Year 1 tracker |
| **Emergency Alerts** | Real-time keyword detection for DVT, infection, chest pain |
| **Voice Interaction** | Web Speech API for hands-free chatbot input |
| **AI Recovery Prediction** | Heuristic model comparing your logs to expected benchmarks |

---

## 🌐 API Endpoints

| Method | URL | Purpose |
|---|---|---|
| `POST` | `/api/chat` | Chatbot message exchange |
| `POST` | `/api/submit-assessment` | Assessment scoring |
| `POST` | `/api/log-recovery` | Daily recovery log |
| `GET`  | `/api/recovery-data` | Chart data (JSON) |
| `POST` | `/api/emergency-check` | Symptom emergency check |

---

## ⚠️ Medical Disclaimer

This platform is for **informational and educational purposes only**. It is not a substitute for professional medical advice. Always consult your surgeon, GP, or physiotherapist for clinical decisions.

---

## 🛠 Testing

```bash
# Test chatbot API
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is knee replacement?"}'

# Test assessment API
curl -X POST http://localhost:5000/api/submit-assessment \
  -H "Content-Type: application/json" \
  -d '{"age": 65, "weight_kg": 85, "height_cm": 170, "pain_level": 7, "mobility_score": 4, "conditions": ["diabetes"]}'
```

---

## 📋 Requirements

- Python 3.9+
- Flask 3.0+
- Flask-SQLAlchemy 3.1+
- SQLAlchemy 2.0+
- Chart.js (loaded via CDN)
- Modern browser (Chrome/Firefox/Edge) for Voice API

## 🔮 Future Improvements

See `docs/future_improvements.md` for the full roadmap.
