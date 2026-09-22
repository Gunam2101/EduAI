from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List

from app.database.connection import get_db
from app.database.models import LearningMetric, Student, Subject, Topic, Assessment

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.get("/summary")
def get_assessments_summary(db: Session = Depends(get_db)):
    metrics = db.query(LearningMetric).all()
    total = len(metrics)
    if total == 0:
        return {"assessments": []}

    avg_q1 = sum(m.quiz1_marks for m in metrics) / total
    avg_q2 = sum(m.quiz2_marks for m in metrics) / total
    avg_q3 = sum(m.quiz3_marks for m in metrics) / total
    avg_midterm = sum(m.midterm_marks for m in metrics) / total
    avg_final = sum(m.final_marks for m in metrics) / total

    # Passing thresholds: Quizzes >= 5/10, Midterm >= 15/30, Final >= 25/50
    q1_pass = sum(1 for m in metrics if m.quiz1_marks >= 5.0)
    q2_pass = sum(1 for m in metrics if m.quiz2_marks >= 5.0)
    q3_pass = sum(1 for m in metrics if m.quiz3_marks >= 5.0)
    mid_pass = sum(1 for m in metrics if m.midterm_marks >= 15.0)
    final_pass = sum(1 for m in metrics if m.final_marks >= 25.0)

    assessments = [
        {
            "id": 1,
            "title": "Continuous Assessment Quiz 1",
            "type": "Quiz",
            "max_marks": 10,
            "average": round(avg_q1, 2),
            "percentage": round(avg_q1 / 10.0 * 100, 1),
            "pass_rate": round(q1_pass / total * 100, 1),
            "total_candidates": total,
            "description": "Evaluates foundational concepts, terminology, and exploratory basics."
        },
        {
            "id": 2,
            "title": "Continuous Assessment Quiz 2",
            "type": "Quiz",
            "max_marks": 10,
            "average": round(avg_q2, 2),
            "percentage": round(avg_q2 / 10.0 * 100, 1),
            "pass_rate": round(q2_pass / total * 100, 1),
            "total_candidates": total,
            "description": "Tests mathematical principles, algorithm steps, and procedural mechanics."
        },
        {
            "id": 3,
            "title": "Continuous Assessment Quiz 3",
            "type": "Quiz",
            "max_marks": 10,
            "average": round(avg_q3, 2),
            "percentage": round(avg_q3 / 10.0 * 100, 1),
            "pass_rate": round(q3_pass / total * 100, 1),
            "total_candidates": total,
            "description": "Integrative problem-solving, advanced applications, and case scenarios."
        },
        {
            "id": 4,
            "title": "Midterm Examination",
            "type": "Midterm",
            "max_marks": 30,
            "average": round(avg_midterm, 2),
            "percentage": round(avg_midterm / 30.0 * 100, 1),
            "pass_rate": round(mid_pass / total * 100, 1),
            "total_candidates": total,
            "description": "Comprehensive evaluation covering Units 1 and 2 of the syllabus."
        },
        {
            "id": 5,
            "title": "Final Examination",
            "type": "Final",
            "max_marks": 50,
            "average": round(avg_final, 2),
            "percentage": round(avg_final / 50.0 * 100, 1),
            "pass_rate": round(final_pass / total * 100, 1),
            "total_candidates": total,
            "description": "Summative semester examination assessing all course learning outcomes."
        },
    ]

    return {
        "total_assessments": len(assessments),
        "total_students": total,
        "assessments": assessments
    }
