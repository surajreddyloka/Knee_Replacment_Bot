"""
app.py — Flask application factory and entry point.

Run with:  python app.py
Accessible: http://localhost:5001
"""

import os
from flask import Flask
from extensions import db
from routes import main


def create_app() -> Flask:
    """Application factory — creates and configures the Flask app."""
    app = Flask(__name__, template_folder="templates", static_folder="static")

    # ── Configuration ────────────────────────────────────────────────────
    basedir = os.path.abspath(os.path.dirname(__file__))
    # On Render, use the mounted persistent disk at /data; fall back to local for dev
    db_dir = "/data" if os.path.isdir("/data") else basedir
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"sqlite:///{os.path.join(db_dir, 'database.db')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "knee-replace-dev-secret-42")
    app.config["DEBUG"] = os.environ.get("FLASK_DEBUG", "true").lower() == "true"

    # ── Extensions ───────────────────────────────────────────────────────
    db.init_app(app)

    # ── Blueprints ───────────────────────────────────────────────────────
    app.register_blueprint(main)

    # ── Database Init ────────────────────────────────────────────────────
    with app.app_context():
        db.create_all()
        print("✅ Database initialised.")

    return app


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app = create_app()
    print("\n🦴 KneeBot Platform is running!")
    print("🌐 Open http://localhost:5001 in your browser\n")
    app.run(host="0.0.0.0", port=5001, debug=True)
