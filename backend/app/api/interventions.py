from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.database.connection import get_db
from app.database.models import FacultyIntervention, Student, DifficultyResult, LearningMetric
from app.api.dependencies import get_current_user
from app.services.indian_academic_context import get_indian_student_name, get_student_academic_meta

router = APIRouter(prefix="/api/interventions", tags=["Faculty Interventions"])

class InterventionCreate(BaseModel):
    student_id: int
    faculty_id: Optional[int] = 1
    faculty_name: Optional[str] = "Dr. S. Rangarajan"
    title: str
    intervention_type: str
    action_plan: str
    target_date: str
    status: Optional[str] = "Active"
    notes: Optional[str] = ""

class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    action_plan: Optional[str] = None
    target_date: Optional[str] = None

@router.get("")
def list_interventions(
    student_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(FacultyIntervention)
    if student_id:
        query = query.filter(FacultyIntervention.student_id == student_id)
    if status and status.upper() != "ALL":
        query = query.filter(FacultyIntervention.status == status)

    interventions = query.order_by(FacultyIntervention.created_at.desc()).all()

    # Seed default sample interventions if table is empty
    if len(interventions) == 0 and not student_id:
        seed_samples = [
            FacultyIntervention(
                student_id=1,
                faculty_id=1,
                faculty_name="Dr. S. Rangarajan",
                title="Remedial Coaching on Dynamic Programming & Graph Theory",
                intervention_type="Remedial Coaching",
                action_plan="Conduct 3 1-on-1 tutoring sessions on recurrence relations and memoization tables before CIA-2.",
                target_date="2026-10-15",
                status="In Progress",
                notes="Student attended session 1 on Oct 2nd. Demonstrating good grasp of recursive trees."
            ),
            FacultyIntervention(
                student_id=5,
                faculty_id=1,
                faculty_name="Dr. S. Rangarajan",
                title="Mandatory Attendance Advisory & Academic Counseling",
                intervention_type="Attendance Warning",
                action_plan="Issue formal attendance advisory letter. Review missing morning lecture sessions and lab logs.",
                target_date="2026-10-10",
                status="Active",
                notes="Parent notification sent via SMS. Counselor meeting scheduled for Oct 8."
            ),
            FacultyIntervention(
                student_id=12,
                faculty_id=1,
                faculty_name="Dr. S. Rangarajan",
                title="Laboratory Hands-On Viva Recovery",
                intervention_type="Practice Assignments",
                action_plan="Assign supplementary coding lab exercises for Network Socket programming.",
                target_date="2026-10-20",
                status="Active",
                notes="Lab manual submission due next Monday."
            ),
            FacultyIntervention(
                student_id=18,
                faculty_id=1,
                faculty_name="Dr. S. Rangarajan",
                title="Peer Mentoring Pairing with Senior Teaching Assistant",
                intervention_type="Peer Mentorship",
                action_plan="Pair with 4th year topper for weekly algorithm problem solving discussions.",
                target_date="2026-11-01",
                status="Completed",
                notes="Student completed 4 study circles. Quiz 2 score improved by 25%."
            )
        ]
        for sample in seed_samples:
            db.add(sample)
        db.commit()
        interventions = db.query(FacultyIntervention).order_by(FacultyIntervention.created_at.desc()).all()

    results = []
    for item in interventions:
        st = db.query(Student).filter(Student.id == item.student_id).first()
        student_name = get_indian_student_name(item.student_id) if st else f"Student #{item.student_id}"
        meta = get_student_academic_meta(item.student_id) if st else {}
        results.append({
            "id": item.id,
            "student_id": item.student_id,
            "student_name": student_name,
            "department": meta.get("department", "CSE"),
            "section": meta.get("section", "A"),
            "register_no": meta.get("register_no", f"7100221040{item.student_id:02d}"),
            "faculty_id": item.faculty_id,
            "faculty_name": item.faculty_name,
            "title": item.title,
            "intervention_type": item.intervention_type,
            "action_plan": item.action_plan,
            "target_date": item.target_date,
            "status": item.status,
            "notes": item.notes,
            "created_at": item.created_at.strftime("%Y-%m-%d %H:%M") if item.created_at else ""
        })

    return {"total": len(results), "interventions": results}

@router.post("")
def create_intervention(data: InterventionCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student #{data.student_id} not found")

    intervention = FacultyIntervention(
        student_id=data.student_id,
        faculty_id=data.faculty_id or 1,
        faculty_name=data.faculty_name or "Dr. S. Rangarajan",
        title=data.title,
        intervention_type=data.intervention_type,
        action_plan=data.action_plan,
        target_date=data.target_date,
        status=data.status or "Active",
        notes=data.notes or ""
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)

    return {
        "message": "Intervention created successfully",
        "id": intervention.id,
        "student_id": intervention.student_id,
        "status": intervention.status
    }

@router.put("/{intervention_id}")
def update_intervention(intervention_id: int, data: InterventionUpdate, db: Session = Depends(get_db)):
    intervention = db.query(FacultyIntervention).filter(FacultyIntervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    if data.status is not None:
        intervention.status = data.status
    if data.notes is not None:
        intervention.notes = data.notes
    if data.action_plan is not None:
        intervention.action_plan = data.action_plan
    if data.target_date is not None:
        intervention.target_date = data.target_date

    db.commit()
    db.refresh(intervention)

    return {"message": "Intervention updated successfully", "id": intervention.id, "status": intervention.status}

@router.delete("/{intervention_id}")
def delete_intervention(intervention_id: int, db: Session = Depends(get_db)):
    intervention = db.query(FacultyIntervention).filter(FacultyIntervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    db.delete(intervention)
    db.commit()
    return {"message": "Intervention deleted successfully"}

@router.get("/stats")
def get_intervention_stats(db: Session = Depends(get_db)):
    total = db.query(FacultyIntervention).count()
    active = db.query(FacultyIntervention).filter(FacultyIntervention.status == "Active").count()
    in_progress = db.query(FacultyIntervention).filter(FacultyIntervention.status == "In Progress").count()
    completed = db.query(FacultyIntervention).filter(FacultyIntervention.status == "Completed").count()

    # Total at-risk students count
    at_risk_count = db.query(DifficultyResult).filter(DifficultyResult.risk_level == "AT_RISK").count()

    return {
        "total_interventions": total,
        "active_interventions": active,
        "in_progress_interventions": in_progress,
        "completed_interventions": completed,
        "at_risk_students_total": at_risk_count,
        "intervention_coverage_rate": round((total / max(1, at_risk_count)) * 100, 1)
    }
