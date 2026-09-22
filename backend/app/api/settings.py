from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.connection import get_db
from app.database.models import Student, LearningMetric, DifficultyResult
from app.schemas.schemas import ScoringSettings
from app.services.difficulty_engine import (
    calculate_learning_score, detect_learning_difficulty,
    DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS
)
from app.services.data_loader import load_and_initialize_dataset
import json

router = APIRouter(prefix="/api/settings", tags=["Settings"])

# Global runtime configuration state
CURRENT_SETTINGS = ScoringSettings()

@router.get("", response_model=ScoringSettings)
def get_settings():
    return CURRENT_SETTINGS

@router.post("")
def update_settings(new_settings: ScoringSettings, db: Session = Depends(get_db)):
    global CURRENT_SETTINGS

    # Validate weight sum close to 1.0
    w_sum = (
        new_settings.quiz_weight +
        new_settings.exam_weight +
        new_settings.attendance_weight +
        new_settings.assignment_weight +
        new_settings.gpa_weight
    )
    if abs(w_sum - 1.0) > 0.05:
        raise HTTPException(status_code=400, detail=f"Weights must sum to approximately 1.0 (current sum = {w_sum:.2f})")

    CURRENT_SETTINGS = new_settings

    # Re-apply weights across all students dynamically
    weights = {
        "quiz": new_settings.quiz_weight,
        "exam": new_settings.exam_weight,
        "attendance": new_settings.attendance_weight,
        "assignment": new_settings.assignment_weight,
        "gpa": new_settings.gpa_weight,
    }
    thresholds = {
        "normal": new_settings.normal_threshold,
        "moderate": new_settings.moderate_threshold,
        "critical_attendance": new_settings.critical_attendance_threshold,
        "critical_final": new_settings.critical_final_threshold,
    }

    students = db.query(Student).all()
    for s in students:
        m = s.metrics
        if not m:
            continue
        learning_score, diff_score, components = calculate_learning_score(
            quiz_avg_10=m.quiz_average,
            midterm_30=m.midterm_marks,
            final_50=m.final_marks,
            overall_att_pct=m.overall_attendance_rate,
            assignment_pct=m.assignment_completion_rate,
            gpa_4=m.previous_gpa,
            weights=weights
        )
        m.learning_performance_score = learning_score

        raw_summary = {
            "previous_gpa": m.previous_gpa,
            "overall_attendance_rate": m.overall_attendance_rate,
            "lecture_attendance_rate": m.lecture_attendance_rate,
            "lab_attendance_rate": m.lab_attendance_rate,
            "labs_attended": m.labs_attended,
            "total_lab_sessions": m.total_lab_sessions,
            "quiz_average": m.quiz_average,
            "midterm_marks": m.midterm_marks,
            "final_marks": m.final_marks,
            "assignment_completion_rate": m.assignment_completion_rate,
        }

        risk_level, reasons, weak_indicators = detect_learning_difficulty(
            learning_score=learning_score,
            components=components,
            raw_data=raw_summary,
            thresholds=thresholds
        )

        if s.difficulty:
            s.difficulty.difficulty_score = diff_score
            s.difficulty.risk_level = risk_level
            s.difficulty.reasons = json.dumps(reasons)
            s.difficulty.weak_indicators = json.dumps(weak_indicators)

    db.commit()

    return {
        "status": "success",
        "message": "Settings updated and all 300 student metrics recalculated instantly.",
        "settings": CURRENT_SETTINGS
    }

@router.post("/reload-dataset")
def reload_dataset(db: Session = Depends(get_db)):
    res = load_and_initialize_dataset(db)
    return res
