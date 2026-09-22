from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import json

from app.database.connection import get_db
from app.database.models import Student, StudyPlan, StudyPlanItem, DifficultyResult, LearningMetric
from app.services.difficulty_engine import generate_study_plan

router = APIRouter(prefix="/api/study-plans", tags=["Study Plans"])

@router.get("")
def list_study_plans(
    risk_level: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(StudyPlan).join(Student).join(DifficultyResult)
    if risk_level and risk_level.upper() != "ALL":
        query = query.filter(DifficultyResult.risk_level == risk_level.upper())

    plans = query.limit(limit).all()
    results = []
    for p in plans:
        s = p.student
        d = s.difficulty if s else None
        completed_items = sum(1 for item in p.items if item.is_completed)
        total_items = len(p.items)
        results.append({
            "id": p.id,
            "student_id": p.student_id,
            "student_name": s.name if s else "Student",
            "risk_level": d.risk_level if d else "NORMAL",
            "title": p.title,
            "focus_summary": p.focus_summary,
            "target_score_improvement": p.target_score_improvement,
            "total_items": total_items,
            "completed_items": completed_items,
            "completion_percentage": round(completed_items / max(total_items, 1) * 100, 1),
            "created_at": p.created_at
        })
    return results

@router.get("/student/{student_id}")
def get_student_study_plan(student_id: int, db: Session = Depends(get_db)):
    plan = db.query(StudyPlan).filter(StudyPlan.student_id == student_id).first()
    if not plan:
        # Generate on the fly
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        d = student.difficulty
        weak_inds = json.loads(d.weak_indicators) if d and d.weak_indicators else []
        sp_data = generate_study_plan(
            student_id=student.id,
            student_name=student.name,
            risk_level=d.risk_level if d else "NORMAL",
            weak_indicators=weak_inds,
            components={}
        )
        plan = StudyPlan(
            student_id=student.id,
            title=sp_data["title"],
            focus_summary=sp_data["focus_summary"],
            target_score_improvement=sp_data["target_score_improvement"]
        )
        db.add(plan)
        db.flush()
        for itm in sp_data["items"]:
            db.add(StudyPlanItem(
                study_plan_id=plan.id,
                day_of_week=itm["day_of_week"],
                time_slot=itm["time_slot"],
                focus_area=itm["focus_area"],
                activity_description=itm["activity_description"],
                estimated_hours=itm["estimated_hours"],
                is_completed=itm["is_completed"]
            ))
        db.commit()

    completed_items = sum(1 for item in plan.items if item.is_completed)
    total_items = len(plan.items)

    return {
        "id": plan.id,
        "student_id": plan.student_id,
        "student_name": plan.student.name if plan.student else "Student",
        "risk_level": plan.student.difficulty.risk_level if plan.student and plan.student.difficulty else "NORMAL",
        "title": plan.title,
        "focus_summary": plan.focus_summary,
        "target_score_improvement": plan.target_score_improvement,
        "total_items": total_items,
        "completed_items": completed_items,
        "completion_percentage": round(completed_items / max(total_items, 1) * 100, 1),
        "items": [
            {
                "id": itm.id,
                "day_of_week": itm.day_of_week,
                "time_slot": itm.time_slot,
                "focus_area": itm.focus_area,
                "activity_description": itm.activity_description,
                "estimated_hours": itm.estimated_hours,
                "is_completed": itm.is_completed,
            }
            for itm in plan.items
        ]
    }

@router.post("/items/{item_id}/toggle")
def toggle_study_plan_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(StudyPlanItem).filter(StudyPlanItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Study plan task item not found")
    item.is_completed = not item.is_completed
    db.commit()
    return {"status": "success", "item_id": item.id, "is_completed": item.is_completed}
