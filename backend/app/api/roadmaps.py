from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import json

from app.database.connection import get_db
from app.database.models import Student, LearningMetric, DifficultyResult, Faculty, User
from app.api.dependencies import get_current_user, enforce_student_isolation
from app.services.roadmap_engine import generate_personalized_roadmap
from app.services.indian_academic_context import get_indian_student_name, get_student_academic_meta

router = APIRouter(prefix="/api/roadmaps", tags=["Learning Roadmaps"])

# In-memory progress overrides for live interactive demos
_interactive_step_state: Dict[str, Dict[str, Any]] = {}

@router.get("/student/{student_id}")
def get_student_roadmap(
    student_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enforce_student_isolation(student_id, current_user)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    m = student.metrics
    d = student.difficulty

    # Use Indian student name and metadata
    indian_name = get_indian_student_name(student.id)
    risk_level = d.risk_level if d else "NORMAL"
    learning_score = m.learning_performance_score if m else 75.0
    weak_inds = json.loads(d.weak_indicators) if (d and d.weak_indicators) else []

    metrics_dict = {
        "quiz_average": m.quiz_average if m else 8.0,
        "midterm_marks": m.midterm_marks if m else 22.0,
        "final_marks": m.final_marks if m else 38.0,
        "previous_gpa": m.previous_gpa if m else 3.2,
        "overall_attendance_rate": m.overall_attendance_rate if m else 85.0,
        "lecture_attendance_rate": m.lecture_attendance_rate if m else 85.0,
        "lab_attendance_rate": m.lab_attendance_rate if m else 85.0,
        "assignment_completion_rate": m.assignment_completion_rate if m else 80.0,
    }

    roadmap = generate_personalized_roadmap(
        student_id=student.id,
        student_name=indian_name,
        risk_level=risk_level,
        learning_score=learning_score,
        metrics=metrics_dict,
        weak_indicators=weak_inds
    )

    # Apply any live interactive overrides if user toggled step or completed quiz
    cache_key = f"student_{student_id}"
    if cache_key in _interactive_step_state:
        saved = _interactive_step_state[cache_key]
        for step in roadmap["steps"]:
            snum = step["step_number"]
            if snum in saved:
                step["status"] = saved[snum]["status"]
                step["progress"] = saved[snum]["progress"]
        # Recalculate
        roadmap["overall_progress_percentage"] = round(
            sum(s["progress"] for s in roadmap["steps"]) / len(roadmap["steps"]), 1
        )
        current = next((s for s in roadmap["steps"] if s["status"] == "CURRENT"), None)
        if not current:
            current = next((s for s in roadmap["steps"] if s["status"] == "NOT_STARTED"), roadmap["steps"][-1])
        roadmap["current_step"] = current
        roadmap["next_step_title"] = current["title"]
        roadmap["next_step_action"] = current["action_label"]

    return roadmap

@router.post("/student/{student_id}/step/{step_number}/toggle")
def toggle_roadmap_step(
    student_id: int,
    step_number: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enforce_student_isolation(student_id, current_user)
    cache_key = f"student_{student_id}"
    if cache_key not in _interactive_step_state:
        _interactive_step_state[cache_key] = {}

    curr = _interactive_step_state[cache_key].get(step_number, {})
    curr_status = curr.get("status")

    if curr_status == "COMPLETED":
        _interactive_step_state[cache_key][step_number] = {"status": "CURRENT", "progress": 50}
    else:
        _interactive_step_state[cache_key][step_number] = {"status": "COMPLETED", "progress": 100}

    return {"status": "success", "step_number": step_number, "updated": _interactive_step_state[cache_key][step_number]}

@router.get("/cohort/{faculty_id}")
def get_faculty_cohort_roadmaps(faculty_id: int, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    # Assigned students slice
    students = db.query(Student).slice(0, 60).all()
    records = []
    completed_steps_total = 0

    for s in students:
        d = s.difficulty
        m = s.metrics
        r_level = d.risk_level if d else "NORMAL"
        l_score = m.learning_performance_score if m else 70.0
        iname = get_indian_student_name(s.id)
        meta = get_student_academic_meta(s.id)

        # Quick roadmap archetype
        if r_level == "AT_RISK":
            status_text = "Needs Critical Intervention"
            weak_subj = "Data Structures & Algorithms"
            progress = 35
            cur_step = "Step 2: Concept Building"
        elif r_level == "MODERATE":
            status_text = "Needs Improvement"
            weak_subj = "Database Management Systems"
            progress = 55
            cur_step = "Step 3: Guided Practice"
        else:
            status_text = "Good Standing"
            weak_subj = "Machine Learning (Enrichment)"
            progress = 80
            cur_step = "Step 4: Assessment"

        records.append({
            "student_id": s.id,
            "student_name": iname,
            "department": meta["department"],
            "section": meta["section"],
            "register_no": meta["register_no"],
            "risk_level": r_level,
            "status_label": status_text,
            "weak_subject": weak_subj,
            "progress_percentage": progress,
            "current_step": cur_step
        })

    return {
        "faculty_id": faculty_id,
        "faculty_name": faculty.name,
        "total_mentored": len(records),
        "needing_intervention": sum(1 for r in records if r["risk_level"] == "AT_RISK"),
        "moderate_followup": sum(1 for r in records if r["risk_level"] == "MODERATE"),
        "students": records
    }

@router.get("/overview")
def get_institutional_roadmaps_overview(db: Session = Depends(get_db)):
    total_students = db.query(Student).count()
    at_risk = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "AT_RISK").count()
    moderate = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "MODERATE").count()
    normal = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "NORMAL").count()

    return {
        "total_active_roadmaps": total_students,
        "foundation_stage": at_risk,
        "concept_building_stage": moderate,
        "advanced_assessment_stage": normal,
        "average_institution_progress": 64.8,
        "subjects_mapped": 12,
        "regulation": "Regulation 2021 (Autonomous Engineering Curricula)"
    }
