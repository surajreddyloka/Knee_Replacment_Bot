# Architecture Overview

## Stack

- **Backend**: Python 3.9+ / Flask 3.0
- **Database**: SQLite via SQLAlchemy 2.0 (file: `database.db`)
- **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript
- **Charts**: Chart.js 4.4 (CDN)
- **NLP**: Rule-based keyword intent engine (local, no external API)
- **Voice**: Web Speech API (browser-native)

## Component Diagram

```
Browser
  │
  ├── GET /           → index.html
  ├── GET /chatbot    → chatbot.html
  ├── GET /assessment → assessment.html
  ├── GET /dashboard  → dashboard.html
  │
  ├── POST /api/chat              → chatbot.py → get_response()
  ├── POST /api/submit-assessment → routes.py → BMI + scoring
  ├── POST /api/log-recovery      → routes.py → RecoveryLog model
  ├── GET  /api/recovery-data     → Chart.js consumption
  └── POST /api/emergency-check   → chatbot.py → check_emergency_symptoms()

Flask App (app.py)
  └── Blueprint: main (routes.py)
        └── db: extensions.py (SQLAlchemy)
              └── models.py: User, Assessment, RecoveryLog, Message
```

## Design Decisions

1. **No circular imports** — `db = SQLAlchemy()` in `extensions.py`, imported by both `models.py` and `routes.py`.
2. **Session-based anonymity** — Users identified by `session_id` UUID; no login required.
3. **Emergency detection is dual-layer** — Both chatbot responses flag emergency intents AND recovery notes are scanned with `check_emergency_symptoms()`.
4. **Recovery prediction is heuristic** — Expected benchmarks (pain ~0.2/day reduction, walking +15m/day) are compared against logged values.
