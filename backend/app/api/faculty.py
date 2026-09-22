from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.connection import get_db
from app.database.models import Faculty, Student, DifficultyResult

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])

@router.get("", response_model=List[Dict[str, Any]])
def list_faculty(db: Session = Depends(get_db)):
    faculties = db.query(Faculty).all()
    results = []
    for f in faculties:
        # Determine assigned student cohort
        results.append({
            "id": f.id,
            "name": f.name,
            "email": f.email,
            "department": f.department,
            "designation": f.designation,
            "assigned_students_count": f.assigned_students_count,
            "active_courses": ["CS501 Core ML", "CS502 Data Structures"],
            "office_hours": "Mon, Wed 2:00 PM - 4:00 PM"
        })
    return results

@router.get("/{faculty_id}/students")
def get_faculty_students(faculty_id: int, db: Session = Depends(get_db)):
    # Cohort slicing for demonstration (each faculty gets 60 students from the 300)
    start_idx = ((faculty_id - 1) % 5) * 60 + 1
    end_idx = start_idx + 59
    students = db.query(Student).filter(Student.id >= start_idx, Student.id <= end_idx).all()

    items = []
    for s in students:
        m = s.metrics
        d = s.difficulty
        items.append({
            "id": s.id,
            "name": s.name,
            "age": s.age,
            "gender": s.gender,
            "quiz_average": m.quiz_average if m else 0.0,
            "midterm_marks": m.midterm_marks if m else 0.0,
            "final_marks": m.final_marks if m else 0.0,
            "overall_attendance_rate": m.overall_attendance_rate if m else 0.0,
            "assignment_completion_rate": m.assignment_completion_rate if m else 0.0,
            "learning_performance_score": m.learning_performance_score if m else 0.0,
            "risk_level": d.risk_level if d else "NORMAL",
            "difficulty_score": d.difficulty_score if d else 0.0
        })

    at_risk_count = sum(1 for i in items if i["risk_level"] == "AT_RISK")
    moderate_count = sum(1 for i in items if i["risk_level"] == "MODERATE")
    normal_count = sum(1 for i in items if i["risk_level"] == "NORMAL")

    return {
        "faculty_id": faculty_id,
        "total_assigned": len(items),
        "at_risk_count": at_risk_count,
        "moderate_count": moderate_count,
        "normal_count": normal_count,
        "students": items
    }
