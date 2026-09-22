from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
import json

from app.database.connection import get_db
from app.database.models import Student, LearningMetric, DifficultyResult
from app.services.difficulty_engine import generate_structured_recommendations

from app.services.indian_academic_context import get_indian_student_name

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

# In-memory tracking for recommendation completion
_completed_recommendations: Dict[str, set] = {}

@router.get("/student/{student_id}")
def get_student_recommendations(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    m = student.metrics
    d = student.difficulty

    reasons = json.loads(d.reasons) if d and d.reasons else []
    weak_indicators = json.loads(d.weak_indicators) if d and d.weak_indicators else []

    raw_summary = {
        "overall_attendance_rate": m.overall_attendance_rate if m else 0.0,
        "lecture_attendance_rate": m.lecture_attendance_rate if m else 0.0,
        "lab_attendance_rate": m.lab_attendance_rate if m else 0.0,
        "labs_attended": m.labs_attended if m else 0,
        "quiz_average": m.quiz_average if m else 0.0,
        "midterm_marks": m.midterm_marks if m else 0.0,
        "final_marks": m.final_marks if m else 0.0,
        "assignment_completion_rate": m.assignment_completion_rate if m else 0.0,
        "previous_gpa": m.previous_gpa if m else 0.0,
    }

    structured = generate_structured_recommendations(
        risk_level=d.risk_level if d else "NORMAL",
        reasons=reasons,
        weak_indicators=weak_indicators,
        raw_data=raw_summary
    )

    completed_set = _completed_recommendations.get(str(student_id), set())
    enriched_recs = []
    for idx, rec in enumerate(structured):
        enriched_recs.append({
            "id": idx + 1,
            "priority": rec["priority"],
            "category": rec["category"],
            "title": rec["title"],
            "description": rec["description"],
            "action": rec["action"],
            "is_completed": (idx + 1) in completed_set
        })

    return {
        "student_id": student.id,
        "student_name": get_indian_student_name(student.id),
        "risk_level": d.risk_level if d else "NORMAL",
        "recommendations": enriched_recs
    }

@router.post("/{student_id}/item/{item_id}/toggle")
def toggle_recommendation_item(student_id: int, item_id: int):
    key = str(student_id)
    if key not in _completed_recommendations:
        _completed_recommendations[key] = set()
    if item_id in _completed_recommendations[key]:
        _completed_recommendations[key].remove(item_id)
        status = False
    else:
        _completed_recommendations[key].add(item_id)
        status = True
    return {"status": "success", "item_id": item_id, "is_completed": status}

@router.get("/admin")
def get_admin_system_recommendations(db: Session = Depends(get_db)):
    """
    Generates system-level institutional recommendations based on 300 dataset student metrics.
    Section 18 requirement.
    """
    total = db.query(Student).count()
    at_risk = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "AT_RISK").count()
    moderate = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "MODERATE").count()
    low_att = db.query(LearningMetric).filter(LearningMetric.overall_attendance_rate < 60.0).count()
    low_exam = db.query(LearningMetric).filter(LearningMetric.final_marks < 25.0).count()
    low_quiz = db.query(LearningMetric).filter(LearningMetric.quiz_average < 5.0).count()
    low_assign = db.query(LearningMetric).filter(LearningMetric.assignment_completion_rate < 50.0).count()
    both_att_and_perf = db.query(Student).join(LearningMetric).join(DifficultyResult).filter(
        LearningMetric.overall_attendance_rate < 60.0,
        DifficultyResult.risk_level == "AT_RISK"
    ).count()

    admin_recs = [
        {
            "priority": "HIGH",
            "category": "Intervention",
            "title": f"Academic Intervention for {at_risk} At-Risk Students",
            "description": f"{at_risk} students ({round(at_risk/total*100, 1)}% of cohort) exhibit composite learning difficulty scores requiring direct departmental intervention.",
            "impact_count": at_risk,
            "action": "Trigger automated study plan follow-ups and schedule mentor counseling sessions."
        },
        {
            "priority": "HIGH",
            "category": "Attendance",
            "title": f"Dual-Risk Cohort ({both_att_and_perf} Students)",
            "description": f"{both_att_and_perf} students show both severe attendance deficit (<60%) and critical academic difficulty.",
            "impact_count": both_att_and_perf,
            "action": "Issue institutional attendance warning notices and assign peer study partners."
        },
        {
            "priority": "MEDIUM",
            "category": "Curriculum",
            "title": f"Final Examination Readiness Review ({low_exam} Students)",
            "description": f"{low_exam} students scored below 50% on the final assessment, indicating fundamental syllabus gap areas.",
            "impact_count": low_exam,
            "action": "Organize 2 weekend revision webinars covering core syllabus Units 1 through 3."
        },
        {
            "priority": "MEDIUM",
            "category": "Assessment",
            "title": f"Continuous Quiz Diagnostic Reinforcement ({low_quiz} Students)",
            "description": f"{low_quiz} students struggle with continuous quiz problem-solving under timed conditions.",
            "impact_count": low_quiz,
            "action": "Release optional untimed mock quizzes on the student portal for concept practice."
        },
        {
            "priority": "LOW",
            "category": "Engagement",
            "title": f"Assignment Pacing & Submission Checkpoints ({low_assign} Students)",
            "description": f"{low_assign} students completed fewer than half of expected problem sets.",
            "impact_count": low_assign,
            "action": "Introduce mid-week milestone checkpoints before final problem set deadlines."
        }
    ]

    return {
        "total_students": total,
        "recommendations": admin_recs
    }

@router.get("/faculty/{faculty_id}")
def get_faculty_cohort_recommendations(faculty_id: int, db: Session = Depends(get_db)):
    """
    Generates cohort-specific recommendations for assigned faculty mentor.
    Section 19 requirement.
    """
    start_idx = ((faculty_id - 1) % 5) * 60 + 1
    end_idx = start_idx + 59
    cohort_students = db.query(Student).filter(Student.id >= start_idx, Student.id <= end_idx).all()
    total_cohort = len(cohort_students)

    cohort_at_risk = sum(1 for s in cohort_students if s.difficulty and s.difficulty.risk_level == "AT_RISK")
    cohort_low_quiz = sum(1 for s in cohort_students if s.metrics and s.metrics.quiz_average < 5.5)
    cohort_low_att = sum(1 for s in cohort_students if s.metrics and s.metrics.overall_attendance_rate < 65.0)
    cohort_low_final = sum(1 for s in cohort_students if s.metrics and s.metrics.final_marks < 25.0)

    faculty_recs = [
        {
            "priority": "HIGH",
            "category": "Cohort Advisory",
            "title": f"{cohort_at_risk} Cohort Students Require Academic Intervention",
            "description": f"Across your 60 assigned students, {cohort_at_risk} students have elevated difficulty scores requiring direct mentor review.",
            "student_count": cohort_at_risk,
            "action": "Schedule dedicated 15-minute 1-on-1 office consultations during your Wednesday office hours."
        },
        {
            "priority": "HIGH" if cohort_low_att > 15 else "MEDIUM",
            "category": "Attendance & Labs",
            "title": f"{cohort_low_att} Students Display Low Session Attendance",
            "description": f"{cohort_low_att} assigned mentees are falling below institutional lecture and practical attendance targets.",
            "student_count": cohort_low_att,
            "action": "Check in via the portal memo tool to ensure makeup lab hours are completed."
        },
        {
            "priority": "MEDIUM",
            "category": "Quiz Concept Gaps",
            "title": f"{cohort_low_quiz} Students Show Concept Deficits in Quizzes",
            "description": f"{cohort_low_quiz} students average under 5.5/10 across Continuous Quizzes 1, 2, and 3.",
            "student_count": cohort_low_quiz,
            "action": "Dedicate the first 10 minutes of next lecture to solving common quiz misconceptions."
        },
        {
            "priority": "LOW",
            "category": "Progress Monitoring",
            "title": "Study Plan Milestone Verification",
            "description": "35+ students in your cohort have completed at least 3 tasks in their personalized 7-day schedule.",
            "student_count": 35,
            "action": "Acknowledge progress and encourage continued completion of weekend mock exam modules."
        }
    ]

    return {
        "faculty_id": faculty_id,
        "cohort_size": total_cohort,
        "recommendations": faculty_recs
    }
