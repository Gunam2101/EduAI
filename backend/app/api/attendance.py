from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List

from app.database.connection import get_db
from app.database.models import Student, LearningMetric, DifficultyResult

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.get("/summary")
def get_attendance_summary(db: Session = Depends(get_db)):
    metrics = db.query(LearningMetric).all()
    total = len(metrics)
    if total == 0:
        return {}

    avg_lec = sum(m.lecture_attendance_rate for m in metrics) / total
    avg_lab = sum(m.lab_attendance_rate for m in metrics) / total
    avg_overall = sum(m.overall_attendance_rate for m in metrics) / total

    # Brackets
    b_crit = sum(1 for m in metrics if m.overall_attendance_rate < 50.0)
    b_warning = sum(1 for m in metrics if 50.0 <= m.overall_attendance_rate < 75.0)
    b_good = sum(1 for m in metrics if 75.0 <= m.overall_attendance_rate < 85.0)
    b_excellent = sum(1 for m in metrics if m.overall_attendance_rate >= 85.0)

    # Low attendance students list
    low_att_query = (
        db.query(Student)
        .join(LearningMetric)
        .join(DifficultyResult)
        .filter(LearningMetric.overall_attendance_rate < 60.0)
        .limit(20)
        .all()
    )
    low_att_students = [
        {
            "id": s.id,
            "name": s.name,
            "overall_attendance": s.metrics.overall_attendance_rate,
            "lectures_attended": f"{s.metrics.lectures_attended}/{s.metrics.total_lectures}",
            "labs_attended": f"{s.metrics.labs_attended}/{s.metrics.total_lab_sessions}",
            "risk_level": s.difficulty.risk_level if s.difficulty else "NORMAL",
            "performance_score": s.metrics.learning_performance_score
        }
        for s in low_att_query
    ]

    # Scatter correlation sample (Attendance vs Performance)
    scatter_data = [
        {
            "id": m.student_id,
            "attendance": round(m.overall_attendance_rate, 1),
            "performance": round(m.learning_performance_score, 1),
            "final_marks": round(m.final_marks, 1),
        }
        for m in metrics[:60]  # Representative sample for performant charting
    ]

    return {
        "kpis": {
            "average_overall": round(avg_overall, 1),
            "average_lectures": round(avg_lec, 1),
            "average_labs": round(avg_lab, 1),
            "critical_count": b_crit,
            "warning_count": b_warning,
            "compliant_count": b_good + b_excellent,
            "compliance_rate": round((b_good + b_excellent) / total * 100, 1),
        },
        "distribution_brackets": [
            {"range": "Critical (< 50%)", "count": b_crit, "color": "#ef4444"},
            {"range": "Warning (50% - 74%)", "count": b_warning, "color": "#f59e0b"},
            {"range": "Good (75% - 84%)", "count": b_good, "color": "#3b82f6"},
            {"range": "Excellent (>= 85%)", "count": b_excellent, "color": "#10b981"},
        ],
        "low_attendance_students": low_att_students,
        "correlation_points": scatter_data
    }
