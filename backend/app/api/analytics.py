from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List

from app.database.connection import get_db
from app.database.models import Student, LearningMetric, DifficultyResult, Faculty, Subject
from app.ml.ml_model import ml_pipeline

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    total_students = db.query(Student).count()
    total_faculty = db.query(Faculty).count()
    total_subjects = db.query(Subject).count()

    # Learning status counts
    at_risk_count = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "AT_RISK").count()
    moderate_count = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "MODERATE").count()
    normal_count = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "NORMAL").count()

    # Dynamic averages from 300 students
    avg_perf = db.query(func.avg(LearningMetric.learning_performance_score)).scalar() or 0.0
    avg_att = db.query(func.avg(LearningMetric.overall_attendance_rate)).scalar() or 0.0
    avg_quiz = db.query(func.avg(LearningMetric.quiz_average)).scalar() or 0.0
    avg_q1 = db.query(func.avg(LearningMetric.quiz1_marks)).scalar() or 0.0
    avg_q2 = db.query(func.avg(LearningMetric.quiz2_marks)).scalar() or 0.0
    avg_q3 = db.query(func.avg(LearningMetric.quiz3_marks)).scalar() or 0.0
    avg_midterm = db.query(func.avg(LearningMetric.midterm_marks)).scalar() or 0.0
    avg_final = db.query(func.avg(LearningMetric.final_marks)).scalar() or 0.0
    avg_gpa = db.query(func.avg(LearningMetric.previous_gpa)).scalar() or 0.0
    avg_assign = db.query(func.avg(LearningMetric.assignment_completion_rate)).scalar() or 0.0

    # Gender breakdown
    males = db.query(Student).filter(Student.gender.ilike("male")).count()
    females = db.query(Student).filter(Student.gender.ilike("female")).count()

    # Status distribution for donut chart
    status_distribution = [
        {"name": "Normal", "value": normal_count, "color": "#10b981"},
        {"name": "Moderate Difficulty", "value": moderate_count, "color": "#f59e0b"},
        {"name": "At Risk", "value": at_risk_count, "color": "#ef4444"},
    ]

    # Quiz performance progression chart
    quiz_trends = [
        {"quiz": "Quiz 1", "average": round(float(avg_q1), 2), "maxMarks": 10},
        {"quiz": "Quiz 2", "average": round(float(avg_q2), 2), "maxMarks": 10},
        {"quiz": "Quiz 3", "average": round(float(avg_q3), 2), "maxMarks": 10},
    ]

    # Exam performance comparison
    exam_comparison = [
        {"name": "Midterm Exam", "average": round(float(avg_midterm), 2), "maxMarks": 30, "pct": round(float(avg_midterm) / 30.0 * 100, 1)},
        {"name": "Final Exam", "average": round(float(avg_final), 2), "maxMarks": 50, "pct": round(float(avg_final) / 50.0 * 100, 1)},
    ]

    # Attendance breakdown (Lecture vs Lab)
    avg_lec = db.query(func.avg(LearningMetric.lecture_attendance_rate)).scalar() or 0.0
    avg_lab = db.query(func.avg(LearningMetric.lab_attendance_rate)).scalar() or 0.0
    attendance_types = [
        {"type": "Lectures Attended", "rate": round(float(avg_lec), 1), "sessions": 12},
        {"type": "Lab Sessions", "rate": round(float(avg_lab), 1), "sessions": 6},
        {"type": "Overall Attendance", "rate": round(float(avg_att), 1), "sessions": 18},
    ]

    # GPA Distribution Buckets
    gpa_buckets = [
        {"bracket": "< 2.0", "count": db.query(LearningMetric).filter(LearningMetric.previous_gpa < 2.0).count()},
        {"bracket": "2.0 - 2.5", "count": db.query(LearningMetric).filter(LearningMetric.previous_gpa >= 2.0, LearningMetric.previous_gpa < 2.5).count()},
        {"bracket": "2.5 - 3.0", "count": db.query(LearningMetric).filter(LearningMetric.previous_gpa >= 2.5, LearningMetric.previous_gpa < 3.0).count()},
        {"bracket": "3.0 - 3.5", "count": db.query(LearningMetric).filter(LearningMetric.previous_gpa >= 3.0, LearningMetric.previous_gpa < 3.5).count()},
        {"bracket": "3.5 - 4.0", "count": db.query(LearningMetric).filter(LearningMetric.previous_gpa >= 3.5).count()},
    ]

    return {
        "kpis": {
            "total_students": total_students,
            "total_faculty": total_faculty,
            "total_subjects": total_subjects,
            "students_needing_attention": at_risk_count + moderate_count,
            "students_at_risk": at_risk_count,
            "students_moderate": moderate_count,
            "students_normal": normal_count,
            "at_risk_percentage": round((at_risk_count / max(total_students, 1)) * 100, 1),
            "average_performance": round(float(avg_perf), 1),
            "average_attendance": round(float(avg_att), 1),
            "average_quiz": round(float(avg_quiz), 1),
            "average_midterm": round(float(avg_midterm), 1),
            "average_final": round(float(avg_final), 1),
            "average_gpa": round(float(avg_gpa), 2),
            "average_assignment_completion": round(float(avg_assign), 1),
        },
        "status_distribution": status_distribution,
        "quiz_trends": quiz_trends,
        "exam_comparison": exam_comparison,
        "attendance_types": attendance_types,
        "gpa_buckets": gpa_buckets,
        "gender_breakdown": {"Male": males, "Female": females},
    }

@router.get("/difficulty")
def get_difficulty_analytics(db: Session = Depends(get_db)):
    total = db.query(Student).count()
    at_risk = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "AT_RISK").count()
    moderate = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "MODERATE").count()
    normal = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "NORMAL").count()

    # Feature importances from Scikit-Learn
    feature_importances = ml_pipeline.get_feature_importances()

    # Common contributing risk factors
    low_att_count = db.query(LearningMetric).filter(LearningMetric.overall_attendance_rate < 60.0).count()
    low_quiz_count = db.query(LearningMetric).filter(LearningMetric.quiz_average < 5.5).count()
    low_exam_count = db.query(LearningMetric).filter(LearningMetric.final_marks < 25.0).count()
    low_assign_count = db.query(LearningMetric).filter(LearningMetric.assignment_completion_rate < 60.0).count()
    low_gpa_count = db.query(LearningMetric).filter(LearningMetric.previous_gpa < 2.2).count()

    risk_factors = [
        {"factor": "Low Final Exam Marks (< 50%)", "count": low_exam_count, "pct": round(low_exam_count / max(total, 1) * 100, 1)},
        {"factor": "Low Overall Attendance (< 60%)", "count": low_att_count, "pct": round(low_att_count / max(total, 1) * 100, 1)},
        {"factor": "Low Quiz Performance (< 55%)", "count": low_quiz_count, "pct": round(low_quiz_count / max(total, 1) * 100, 1)},
        {"factor": "Incomplete Assignments (< 60%)", "count": low_assign_count, "pct": round(low_assign_count / max(total, 1) * 100, 1)},
        {"factor": "Low Prior GPA (< 2.20)", "count": low_gpa_count, "pct": round(low_gpa_count / max(total, 1) * 100, 1)},
    ]

    return {
        "status_summary": {
            "total": total,
            "at_risk": at_risk,
            "moderate": moderate,
            "normal": normal,
            "at_risk_pct": round(at_risk / max(total, 1) * 100, 1),
            "moderate_pct": round(moderate / max(total, 1) * 100, 1),
            "normal_pct": round(normal / max(total, 1) * 100, 1),
        },
        "scoring_formula": {
            "formula_name": "Multi-Factor Weighted Learning Difficulty Index",
            "equation": "Learning Score = 0.20*(Quiz%) + 0.35*(Exam%) + 0.20*(Att%) + 0.15*(Assign%) + 0.10*(GPA%)",
            "difficulty_equation": "Difficulty Score = 100 - Learning Score",
            "classification_rules": [
                "NORMAL: Learning Score >= 70 (Difficulty <= 30)",
                "MODERATE: 50 <= Learning Score < 70 (30 < Difficulty <= 50)",
                "AT RISK: Learning Score < 50, OR Attendance < 50%, OR Final Exam < 40%"
            ]
        },
        "feature_importances": feature_importances,
        "risk_factors": risk_factors
    }
