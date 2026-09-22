import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from typing import Optional, List, Dict, Any

from app.database.connection import get_db
from app.database.models import Student, LearningMetric, DifficultyResult, StudyPlan, StudyPlanItem, Alert, User
from app.schemas.schemas import StudentListItem, StudentDetail, LearningMetricBase, DifficultyResultBase, StudyPlanBase
from app.api.dependencies import get_current_user, enforce_student_isolation
from app.services.difficulty_engine import (
    calculate_quiz_average, calculate_attendance_percentage,
    calculate_lab_attendance, calculate_assignment_completion,
    calculate_exam_average, calculate_learning_score,
    detect_learning_difficulty, generate_recommendations, generate_study_plan
)
from app.services.indian_academic_context import get_indian_student_name, get_student_academic_meta

router = APIRouter(prefix="/api/students", tags=["Students"])

def normalize_gender_query(gender: Optional[str]) -> Optional[str]:
    if not gender:
        return None
    g = gender.strip().lower()
    if g in ("all", "both", "*", "any", ""):
        return None
    if g in ("m", "male"):
        return "Male"
    if g in ("f", "female"):
        return "Female"
    return gender.capitalize()

@router.get("", response_model=Dict[str, Any])
def list_students(
    search: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    sort_by: str = Query("id"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Student).join(LearningMetric).join(DifficultyResult)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(or_(
            Student.name.ilike(search_term),
            Student.id.cast(Student.id.type).ilike(search_term)
        ))

    if risk_level and risk_level.upper() != "ALL":
        query = query.filter(DifficultyResult.risk_level == risk_level.upper())

    norm_gender = normalize_gender_query(gender)
    if norm_gender:
        query = query.filter(func.lower(Student.gender) == norm_gender.lower())

    # Sorting
    sort_attr = None
    if sort_by == "name":
        sort_attr = Student.name
    elif sort_by == "quiz_average":
        sort_attr = LearningMetric.quiz_average
    elif sort_by == "midterm_marks":
        sort_attr = LearningMetric.midterm_marks
    elif sort_by == "final_marks":
        sort_attr = LearningMetric.final_marks
    elif sort_by == "previous_gpa":
        sort_attr = LearningMetric.previous_gpa
    elif sort_by == "overall_attendance_rate":
        sort_attr = LearningMetric.overall_attendance_rate
    elif sort_by == "assignment_completion_rate":
        sort_attr = LearningMetric.assignment_completion_rate
    elif sort_by == "learning_performance_score":
        sort_attr = LearningMetric.learning_performance_score
    elif sort_by == "difficulty_score":
        sort_attr = DifficultyResult.difficulty_score
    else:
        sort_attr = Student.id

    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_attr))
    else:
        query = query.order_by(asc(sort_attr))

    total = query.count()
    students_page = query.offset((page - 1) * limit).limit(limit).all()

    items = []
    for s in students_page:
        m = s.metrics
        d = s.difficulty
        meta = get_student_academic_meta(s.id)
        iname = get_indian_student_name(s.id)
        items.append({
            "id": s.id,
            "name": iname,
            "age": s.age,
            "gender": s.gender,
            "department": meta["department"],
            "year": meta["year"],
            "semester": meta["semester"],
            "section": meta["section"],
            "register_no": meta["register_no"],
            "quiz_average": m.quiz_average if m else 0.0,
            "midterm_marks": m.midterm_marks if m else 0.0,
            "final_marks": m.final_marks if m else 0.0,
            "previous_gpa": m.previous_gpa if m else 0.0,
            "overall_attendance_rate": m.overall_attendance_rate if m else 0.0,
            "assignment_completion_rate": m.assignment_completion_rate if m else 0.0,
            "learning_performance_score": m.learning_performance_score if m else 0.0,
            "difficulty_score": d.difficulty_score if d else 0.0,
            "risk_level": d.risk_level if d else "NORMAL"
        })

    total_all = db.query(Student).count()
    male_count = db.query(Student).filter(func.lower(Student.gender).in_(["male", "m"])).count()
    female_count = db.query(Student).filter(func.lower(Student.gender).in_(["female", "f"])).count()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
        "gender_counts": {
            "total": total_all,
            "male": male_count,
            "female": female_count
        }
    }

@router.get("/{student_id}", response_model=StudentDetail)
def get_student(
    student_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enforce_student_isolation(student_id, current_user)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student ID {student_id} not found")

    m = student.metrics
    d = student.difficulty
    sp = student.study_plan
    meta = get_student_academic_meta(student.id)
    iname = get_indian_student_name(student.id)

    reasons = json.loads(d.reasons) if d and d.reasons else []
    weak_indicators = json.loads(d.weak_indicators) if d and d.weak_indicators else []

    raw_summary = {
        "overall_attendance_rate": m.overall_attendance_rate if m else 0.0,
        "lab_attendance_rate": m.lab_attendance_rate if m else 0.0,
        "labs_attended": m.labs_attended if m else 0,
        "quiz_average": m.quiz_average if m else 0.0,
        "midterm_marks": m.midterm_marks if m else 0.0,
        "final_marks": m.final_marks if m else 0.0,
        "assignment_completion_rate": m.assignment_completion_rate if m else 0.0,
    }

    recs = generate_recommendations(
        risk_level=d.risk_level if d else "NORMAL",
        reasons=reasons,
        weak_indicators=weak_indicators,
        raw_data=raw_summary
    )

    study_plan_data = None
    if sp:
        study_plan_data = {
            "id": sp.id,
            "student_id": sp.student_id,
            "title": sp.title,
            "focus_summary": sp.focus_summary,
            "target_score_improvement": sp.target_score_improvement,
            "items": [
                {
                    "id": item.id,
                    "day_of_week": item.day_of_week,
                    "time_slot": item.time_slot,
                    "focus_area": item.focus_area,
                    "activity_description": item.activity_description,
                    "estimated_hours": item.estimated_hours,
                    "is_completed": item.is_completed,
                }
                for item in sp.items
            ]
        }

    return {
        "id": student.id,
        "name": iname,
        "age": student.age,
        "gender": student.gender,
        "department": meta["department"],
        "year": meta["year"],
        "semester": meta["semester"],
        "section": meta["section"],
        "register_no": meta["register_no"],
        "metrics": m,
        "difficulty": {
            "difficulty_score": d.difficulty_score if d else 0.0,
            "risk_level": d.risk_level if d else "NORMAL",
            "ml_cluster": d.ml_cluster if d else 0,
            "reasons": reasons,
            "weak_indicators": weak_indicators,
            "calculated_at": d.calculated_at if d else student.created_at
        },
        "study_plan": study_plan_data,
        "recommendations": recs
    }

@router.put("/{student_id}")
def update_student(student_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    m = student.metrics
    if not m:
        raise HTTPException(status_code=404, detail="Student metrics not found")

    if "name" in payload:
        student.name = str(payload["name"]).strip()
    if "age" in payload:
        student.age = int(payload["age"])
    if "gender" in payload:
        student.gender = str(payload["gender"]).strip()

    if "quiz1_marks" in payload: m.quiz1_marks = float(payload["quiz1_marks"])
    if "quiz2_marks" in payload: m.quiz2_marks = float(payload["quiz2_marks"])
    if "quiz3_marks" in payload: m.quiz3_marks = float(payload["quiz3_marks"])
    if "midterm_marks" in payload: m.midterm_marks = float(payload["midterm_marks"])
    if "final_marks" in payload: m.final_marks = float(payload["final_marks"])
    if "previous_gpa" in payload: m.previous_gpa = float(payload["previous_gpa"])
    if "lectures_attended" in payload: m.lectures_attended = int(payload["lectures_attended"])
    if "labs_attended" in payload: m.labs_attended = int(payload["labs_attended"])
    if "assignments_submitted" in payload: m.assignments_submitted = int(payload["assignments_submitted"])

    # Re-calculate derived metrics
    m.quiz_average = calculate_quiz_average(m.quiz1_marks, m.quiz2_marks, m.quiz3_marks)
    m.assignment_completion_rate = calculate_assignment_completion(m.assignments_submitted, m.total_assignments)
    m.exam_average = calculate_exam_average(m.midterm_marks, m.final_marks)
    m.lecture_attendance_rate = calculate_attendance_percentage(m.lectures_attended, m.total_lectures)
    m.lab_attendance_rate = calculate_lab_attendance(m.labs_attended, m.total_lab_sessions)
    m.overall_attendance_rate = calculate_attendance_percentage(
        m.lectures_attended + m.labs_attended,
        m.total_lectures + m.total_lab_sessions
    )

    learning_score, diff_score, components = calculate_learning_score(
        quiz_avg_10=m.quiz_average,
        midterm_30=m.midterm_marks,
        final_50=m.final_marks,
        overall_att_pct=m.overall_attendance_rate,
        assignment_pct=m.assignment_completion_rate,
        gpa_4=m.previous_gpa
    )
    m.learning_performance_score = learning_score

    raw_summary = {
        "previous_gpa": m.previous_gpa,
        "overall_attendance_rate": m.overall_attendance_rate,
        "lecture_attendance_rate": m.lecture_attendance_rate,
        "lab_attendance_rate": m.lab_attendance_rate,
        "labs_attended": m.labs_attended,
        "total_lab_sessions": m.total_lab_sessions,
        "quiz_average": m.quiz_average,
        "midterm_marks": m.midterm_marks,
        "final_marks": m.final_marks,
        "assignment_completion_rate": m.assignment_completion_rate,
    }

    risk_level, reasons, weak_indicators = detect_learning_difficulty(
        learning_score=learning_score,
        components=components,
        raw_data=raw_summary
    )

    if student.difficulty:
        student.difficulty.difficulty_score = diff_score
        student.difficulty.risk_level = risk_level
        student.difficulty.reasons = json.dumps(reasons)
        student.difficulty.weak_indicators = json.dumps(weak_indicators)

    db.commit()
    return {"status": "success", "message": "Student record updated and metrics recalculated successfully"}

@router.get("/{student_id}/analytics")
def get_student_analytics(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    m = student.metrics
    d = student.difficulty

    # Class averages for comparison
    from sqlalchemy import func
    avg_quiz = db.query(func.avg(LearningMetric.quiz_average)).scalar() or 0.0
    avg_midterm = db.query(func.avg(LearningMetric.midterm_marks)).scalar() or 0.0
    avg_final = db.query(func.avg(LearningMetric.final_marks)).scalar() or 0.0
    avg_gpa = db.query(func.avg(LearningMetric.previous_gpa)).scalar() or 0.0
    avg_att = db.query(func.avg(LearningMetric.overall_attendance_rate)).scalar() or 0.0
    avg_perf = db.query(func.avg(LearningMetric.learning_performance_score)).scalar() or 0.0

    radar_comparison = [
        {"subject": "Quiz Performance", "student": round(m.quiz_average / 10.0 * 100, 1), "class_avg": round(avg_quiz / 10.0 * 100, 1), "fullMark": 100},
        {"subject": "Midterm Exam", "student": round(m.midterm_marks / 30.0 * 100, 1), "class_avg": round(avg_midterm / 30.0 * 100, 1), "fullMark": 100},
        {"subject": "Final Exam", "student": round(m.final_marks / 50.0 * 100, 1), "class_avg": round(avg_final / 50.0 * 100, 1), "fullMark": 100},
        {"subject": "Attendance", "student": round(m.overall_attendance_rate, 1), "class_avg": round(avg_att, 1), "fullMark": 100},
        {"subject": "Assignments", "student": round(m.assignment_completion_rate, 1), "class_avg": 78.5, "fullMark": 100},
        {"subject": "Prior GPA", "student": round(m.previous_gpa / 4.0 * 100, 1), "class_avg": round(avg_gpa / 4.0 * 100, 1), "fullMark": 100},
    ]

    return {
        "student_id": student.id,
        "name": student.name,
        "radar_comparison": radar_comparison,
        "class_averages": {
            "quiz_average": round(float(avg_quiz), 2),
            "midterm_marks": round(float(avg_midterm), 2),
            "final_marks": round(float(avg_final), 2),
            "previous_gpa": round(float(avg_gpa), 2),
            "attendance_rate": round(float(avg_att), 2),
            "performance_score": round(float(avg_perf), 2),
        }
    }
