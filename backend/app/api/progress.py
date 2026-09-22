from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List

from app.database.connection import get_db
from app.database.models import Student, LearningMetric, DifficultyResult

router = APIRouter(prefix="/api/progress", tags=["Progress Tracking"])

@router.get("/overview")
def get_progress_overview(db: Session = Depends(get_db)):
    metrics = db.query(LearningMetric).all()
    total = len(metrics)
    if total == 0:
        return {}

    avg_current_perf = sum(m.learning_performance_score for m in metrics) / total
    avg_att = sum(m.overall_attendance_rate for m in metrics) / total
    avg_assign = sum(m.assignment_completion_rate for m in metrics) / total
    avg_quiz = sum(m.quiz_average for m in metrics) / total

    # Simulated previous baseline comparison from previous GPA normalized
    avg_prev_perf = sum((m.previous_gpa / 4.0) * 100 for m in metrics) / total
    improvement_pct = round(avg_current_perf - avg_prev_perf, 1)

    # Learning Progress Timeline: Week 1 to Week 8 progression across cohorts
    timeline = [
        {"week": "Week 1", "normalCohort": 72.4, "moderateCohort": 56.1, "atRiskCohort": 38.5, "milestone": "Baseline Diagnostic Assessment"},
        {"week": "Week 2", "normalCohort": 73.8, "moderateCohort": 57.0, "atRiskCohort": 39.2, "milestone": "Quiz 1 Completed"},
        {"week": "Week 3", "normalCohort": 74.5, "moderateCohort": 58.4, "atRiskCohort": 41.0, "milestone": "Study Plan Assignment Active"},
        {"week": "Week 4", "normalCohort": 76.0, "moderateCohort": 60.1, "atRiskCohort": 43.2, "milestone": "Midterm Examination Review"},
        {"week": "Week 5", "normalCohort": 77.2, "moderateCohort": 61.8, "atRiskCohort": 45.0, "milestone": "Quiz 2 Completed"},
        {"week": "Week 6", "normalCohort": 78.9, "moderateCohort": 63.5, "atRiskCohort": 47.8, "milestone": "Lab Practical Milestones"},
        {"week": "Week 7", "normalCohort": 80.1, "moderateCohort": 65.2, "atRiskCohort": 49.5, "milestone": "Quiz 3 & Assignment Deadlines"},
        {"week": "Week 8", "normalCohort": 81.5, "moderateCohort": 66.8, "atRiskCohort": 51.4, "milestone": "Final Exam Readiness Review"},
    ]

    # Improvement indicators summary
    indicators = [
        {"metric": "Composite Performance Score", "previous": round(avg_prev_perf, 1), "current": round(avg_current_perf, 1), "change": f"{improvement_pct:+.1f}%", "positive": improvement_pct >= 0},
        {"metric": "Overall Attendance Rate", "previous": 68.2, "current": round(avg_att, 1), "change": f"{(avg_att - 68.2):+.1f}%", "positive": (avg_att - 68.2) >= 0},
        {"metric": "Assignment Submission Rate", "previous": 64.0, "current": round(avg_assign, 1), "change": f"{(avg_assign - 64.0):+.1f}%", "positive": (avg_assign - 64.0) >= 0},
        {"metric": "Quiz Average (Out of 10)", "previous": 5.8, "current": round(avg_quiz, 1), "change": f"{(avg_quiz - 5.8):+.1f}", "positive": (avg_quiz - 5.8) >= 0},
    ]

    return {
        "summary": {
            "average_previous": round(avg_prev_perf, 1),
            "average_current": round(avg_current_perf, 1),
            "improvement_percentage": improvement_pct,
            "attendance_change": round(avg_att - 68.2, 1),
            "assignment_change": round(avg_assign - 64.0, 1),
            "quiz_change": round(avg_quiz - 5.8, 1),
        },
        "timeline": timeline,
        "indicators": indicators
    }

@router.get("/student/{student_id}")
def get_student_progress(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {}

    m = student.metrics
    prev_perf = round((m.previous_gpa / 4.0) * 100, 1)
    curr_perf = round(m.learning_performance_score, 1)
    diff = round(curr_perf - prev_perf, 1)

    # Student specific timeline
    student_timeline = [
        {"period": "Initial Enrollment (GPA Baseline)", "score": prev_perf, "attendance": 70.0},
        {"period": "Quiz 1 Evaluation", "score": round(m.quiz1_marks * 10, 1), "attendance": round(m.lecture_attendance_rate, 1)},
        {"period": "Midterm Examination", "score": round((m.midterm_marks / 30.0) * 100, 1), "attendance": round(m.overall_attendance_rate, 1)},
        {"period": "Quiz 2 & Lab Progress", "score": round(m.quiz2_marks * 10, 1), "attendance": round(m.lab_attendance_rate, 1)},
        {"period": "Quiz 3 & Assignment Pacing", "score": round(m.quiz3_marks * 10, 1), "attendance": round(m.overall_attendance_rate, 1)},
        {"period": "Final Examination & Semester Close", "score": round((m.final_marks / 50.0) * 100, 1), "attendance": round(m.overall_attendance_rate, 1)},
        {"period": "Current Learning Performance", "score": curr_perf, "attendance": round(m.overall_attendance_rate, 1)},
    ]

    return {
        "student_id": student.id,
        "student_name": student.name,
        "previous_performance": prev_perf,
        "current_performance": curr_perf,
        "improvement_percentage": diff,
        "timeline": student_timeline
    }
