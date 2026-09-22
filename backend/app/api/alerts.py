from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database.connection import get_db
from app.database.models import Alert, Student

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

class AlertCreateRequest(BaseModel):
    student_id: int
    priority: str = "MEDIUM"
    title: str
    message: str
    trigger_reason: Optional[str] = ""

@router.get("")
def list_alerts(
    priority: Optional[str] = Query(None),
    is_read: Optional[bool] = Query(None),
    deduplicate: bool = Query(True, description="Suppress duplicate alerts for the same student and title"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).join(Student)
    if priority and priority.upper() != "ALL":
        query = query.filter(Alert.priority == priority.upper())
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)

    raw_alerts = query.order_by(Alert.id.desc()).all()

    # Deduplicate logic: keep newest occurrence per (student_id, title)
    seen_keys = set()
    deduped_alerts = []
    
    for a in raw_alerts:
        key = (a.student_id, a.title.strip().lower())
        if deduplicate and key in seen_keys:
            continue
        seen_keys.add(key)
        deduped_alerts.append(a)
        if len(deduped_alerts) >= limit:
            break

    results = []
    for a in deduped_alerts:
        results.append({
            "id": a.id,
            "student_id": a.student_id,
            "student_name": a.student.name if a.student else "Student",
            "priority": a.priority,
            "title": a.title,
            "message": a.message,
            "trigger_reason": a.trigger_reason,
            "is_read": a.is_read,
            "created_at": a.created_at
        })

    # Unread counts
    high_count = db.query(Alert).filter(Alert.priority == "HIGH", Alert.is_read == False).count()
    med_count = db.query(Alert).filter(Alert.priority == "MEDIUM", Alert.is_read == False).count()
    low_count = db.query(Alert).filter(Alert.priority == "LOW", Alert.is_read == False).count()

    return {
        "total": len(results),
        "unread_high": high_count,
        "unread_medium": med_count,
        "unread_low": low_count,
        "alerts": results
    }

@router.get("/student/{student_id}")
def get_student_alerts(
    student_id: int,
    is_read: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).filter(Alert.student_id == student_id)
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)
    
    raw_alerts = query.order_by(Alert.id.desc()).all()
    seen = set()
    deduped = []
    for a in raw_alerts:
        title_key = a.title.strip().lower()
        if title_key in seen:
            continue
        seen.add(title_key)
        deduped.append({
            "id": a.id,
            "student_id": a.student_id,
            "priority": a.priority,
            "title": a.title,
            "message": a.message,
            "trigger_reason": a.trigger_reason,
            "is_read": a.is_read,
            "created_at": a.created_at
        })
    return {"alerts": deduped, "total": len(deduped)}

@router.post("")
def create_alert(
    req: AlertCreateRequest,
    db: Session = Depends(get_db)
):
    # Check if duplicate unread alert exists
    existing = db.query(Alert).filter(
        Alert.student_id == req.student_id,
        Alert.title == req.title,
        Alert.is_read == False
    ).first()

    if existing:
        # Update existing alert rather than duplicating
        existing.message = req.message
        existing.priority = req.priority.upper()
        existing.trigger_reason = req.trigger_reason or existing.trigger_reason
        existing.created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        db.commit()
        db.refresh(existing)
        return {"status": "updated", "alert_id": existing.id, "deduplicated": True}

    new_alert = Alert(
        student_id=req.student_id,
        priority=req.priority.upper(),
        title=req.title,
        message=req.message,
        trigger_reason=req.trigger_reason or "",
        is_read=False
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return {"status": "created", "alert_id": new_alert.id, "deduplicated": False}

@router.post("/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"status": "success", "alert_id": alert_id, "is_read": True}

@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Alert).update({Alert.is_read: True})
    db.commit()
    return {"status": "success", "message": "All alerts marked as read"}

