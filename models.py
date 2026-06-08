"""
models.py — SQLAlchemy database models for the Knee Replacement Platform.
Tables: User, Assessment, RecoveryLog, Message
"""

from datetime import datetime, date, timezone
from extensions import db


class User(db.Model):
    """Represents a patient or user of the platform."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    assessments = db.relationship("Assessment", backref="user", lazy=True)
    recovery_logs = db.relationship("RecoveryLog", backref="user", lazy=True)
    messages = db.relationship("Message", backref="user", lazy=True)

    def __repr__(self):
        return f"<User {self.email}>"


class Assessment(db.Model):
    """Pre-surgery assessment data submitted by a patient."""
    __tablename__ = "assessments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    session_id = db.Column(db.String(64), nullable=True)  # anonymous sessions

    # Demographics
    age = db.Column(db.Integer, nullable=False)
    weight_kg = db.Column(db.Float, nullable=False)
    height_cm = db.Column(db.Float, nullable=False)
    bmi = db.Column(db.Float, nullable=False)

    # Medical conditions (comma-separated flags)
    conditions = db.Column(db.Text, default="")      # e.g. "diabetes,hypertension"
    pain_level = db.Column(db.Integer, default=0)    # 0-10
    mobility_score = db.Column(db.Integer, default=0) # 0-10

    # Computed outputs
    readiness_score = db.Column(db.Float, default=0.0)  # 0-100
    risk_level = db.Column(db.String(20), default="low")  # low / moderate / high
    recommendations = db.Column(db.Text, default="")

    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Assessment id={self.id} bmi={self.bmi} risk={self.risk_level}>"


class RecoveryLog(db.Model):
    """Daily post-surgery recovery log entry."""
    __tablename__ = "recovery_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    session_id = db.Column(db.String(64), nullable=True)

    log_date = db.Column(db.Date, nullable=False, default=date.today)
    day_number = db.Column(db.Integer, default=1)   # days since surgery

    pain_level = db.Column(db.Integer, default=0)    # 0-10
    swelling_level = db.Column(db.Integer, default=0) # 0-10
    walking_distance_m = db.Column(db.Float, default=0.0)
    exercises_done = db.Column(db.Integer, default=0) # count of exercises completed
    medications_taken = db.Column(db.Boolean, default=True)
    notes = db.Column(db.Text, default="")

    # Computed
    slow_recovery_alert = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<RecoveryLog day={self.day_number} pain={self.pain_level}>"


class Message(db.Model):
    """Chatbot conversation message store."""
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    session_id = db.Column(db.String(64), nullable=True)

    role = db.Column(db.String(10), nullable=False)  # "user" or "bot"
    content = db.Column(db.Text, nullable=False)
    intent = db.Column(db.String(50), default="unknown")  # detected intent
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "content": self.content,
            "intent": self.intent,
            "timestamp": self.timestamp.isoformat(),
        }

    def __repr__(self):
        return f"<Message role={self.role} intent={self.intent}>"
