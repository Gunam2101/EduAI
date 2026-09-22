from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.connection import get_db
from app.database.models import Subject, Topic, Assessment
from app.schemas.schemas import SubjectBase, TopicBase

router = APIRouter(prefix="/api/curriculum", tags=["Curriculum Architecture"])

@router.get("/subjects")
def list_subjects(db: Session = Depends(get_db)):
    subjects = db.query(Subject).all()
    results = []
    for s in subjects:
        topics_data = []
        for t in s.topics:
            topics_data.append({
                "id": t.id,
                "subject_id": t.subject_id,
                "unit_number": t.unit_number,
                "name": t.name,
                "difficulty_level": t.difficulty_level,
                "recommended_hours": t.recommended_hours,
                "assessments_count": len(t.assessments)
            })
        results.append({
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "credits": s.credits,
            "description": s.description,
            "topics_count": len(topics_data),
            "topics": topics_data
        })
    return results

@router.post("/subjects")
def create_subject(payload: Dict[str, Any], db: Session = Depends(get_db)):
    code = payload.get("code", "").strip().upper()
    name = payload.get("name", "").strip()
    if not code or not name:
        raise HTTPException(status_code=400, detail="Subject code and name are required")

    existing = db.query(Subject).filter(Subject.code == code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Subject code '{code}' already exists")

    subject = Subject(
        code=code,
        name=name,
        credits=int(payload.get("credits", 4)),
        description=payload.get("description", "")
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return {"status": "success", "id": subject.id, "code": subject.code, "name": subject.name}

@router.post("/topics")
def create_topic(payload: Dict[str, Any], db: Session = Depends(get_db)):
    subject_id = payload.get("subject_id")
    name = payload.get("name", "").strip()
    if not subject_id or not name:
        raise HTTPException(status_code=400, detail="Subject ID and topic name are required")

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Parent subject not found")

    topic = Topic(
        subject_id=subject_id,
        unit_number=int(payload.get("unit_number", 1)),
        name=name,
        difficulty_level=payload.get("difficulty_level", "Intermediate"),
        recommended_hours=float(payload.get("recommended_hours", 3.0))
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return {"status": "success", "id": topic.id, "name": topic.name}

@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"status": "success", "message": f"Subject '{subject.name}' deleted"}
