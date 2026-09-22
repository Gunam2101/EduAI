from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.database.connection import get_db
from app.database.models import User, Student, LearningMetric, DifficultyResult, ProgressRecord
from app.api.dependencies import get_current_user, require_authenticated_user
from app.api.roadmaps import get_student_roadmap, toggle_roadmap_step
from app.api.predictions import (
    get_student_prediction, get_student_risk, get_student_weak_topics,
    get_student_topic_priorities, get_student_adaptive_study_plan,
    get_student_explanations, get_student_trends
)

from app.services.indian_academic_context import get_indian_student_name, get_student_academic_meta

router = APIRouter(prefix="/api/student/me", tags=["Student Portal (Self)"])

def get_auth_student(
    request: Request,
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
) -> Student:
    # Check X-Selected-Student-Id header first
    header_sid = request.headers.get("X-Selected-Student-Id")
    student_id = None
    if header_sid:
        try:
            student_id = int(header_sid)
        except (ValueError, TypeError):
            pass

    if not student_id:
        student_id = current_user.student_id or 1

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        student = db.query(Student).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")
    return student

@router.get("/profile")
def get_my_profile(student: Student = Depends(get_auth_student)):
    meta = get_student_academic_meta(student.id)
    indian_name = get_indian_student_name(student.id)
    m = student.metrics
    d = student.difficulty

    return {
        "id": student.id,
        "name": indian_name,
        "age": student.age,
        "gender": student.gender,
        "college": meta["college"],
        "department": meta["department"],
        "degree": meta["degree"],
        "year": meta["year"],
        "semester": meta["semester"],
        "section": meta["section"],
        "register_no": meta["register_no"],
        "academic_year": meta["academic_year"],
        "regulation": meta["regulation"],
        "mentor_faculty": meta["mentor_faculty"],
        "overall_gpa": m.previous_gpa if m else 0.0,
        "overall_attendance_rate": m.overall_attendance_rate if m else 0.0,
        "learning_performance_score": m.learning_performance_score if m else 0.0,
        "risk_level": d.risk_level if d else "NORMAL",
        "enrolled_courses": [
            {"code": "CS3601", "name": "Artificial Intelligence & Expert Systems", "credits": 4, "faculty": "Dr. S. Rangarajan"},
            {"code": "CS3602", "name": "Design and Analysis of Algorithms", "credits": 4, "faculty": "Prof. V. Meenakshi"},
            {"code": "CS3603", "name": "Computer Networks & Security", "credits": 3, "faculty": "Dr. K. Ramanathan"},
            {"code": "CS3604", "name": "Cloud Computing Technologies", "credits": 3, "faculty": "Dr. P. Karthikeyan"},
            {"code": "CS3611", "name": "AI & Machine Learning Laboratory", "credits": 2, "faculty": "Dr. S. Rangarajan"},
            {"code": "CS3612", "name": "Network & Cloud Security Laboratory", "credits": 2, "faculty": "Dr. P. Karthikeyan"}
        ]
    }

@router.get("/performance")
def get_my_performance(student: Student = Depends(get_auth_student)):
    m = student.metrics
    d = student.difficulty
    meta = get_student_academic_meta(student.id)

    # 9 core performance metrics + lab attendance
    indicators = [
        {"name": "Quiz 1 Score", "value": m.quiz1_marks if m else 0.0, "max": 20, "unit": "/20", "status": "Good" if (m and m.quiz1_marks >= 12) else "Needs Attention"},
        {"name": "Quiz 2 Score", "value": m.quiz2_marks if m else 0.0, "max": 20, "unit": "/20", "status": "Good" if (m and m.quiz2_marks >= 12) else "Needs Attention"},
        {"name": "Quiz 3 Score", "value": m.quiz3_marks if m else 0.0, "max": 20, "unit": "/20", "status": "Good" if (m and m.quiz3_marks >= 12) else "Needs Attention"},
        {"name": "Quiz Average", "value": round(m.quiz_average, 1) if m else 0.0, "max": 20, "unit": "/20", "status": "Normal"},
        {"name": "Continuous Midterm Marks", "value": m.midterm_marks if m else 0.0, "max": 100, "unit": "/100", "status": "Good" if (m and m.midterm_marks >= 60) else "Low"},
        {"name": "Final Semester Exam Marks", "value": m.final_marks if m else 0.0, "max": 100, "unit": "/100", "status": "Good" if (m and m.final_marks >= 55) else "Critical"},
        {"name": "Previous Semester CGPA", "value": m.previous_gpa if m else 0.0, "max": 10.0, "unit": "GPA", "status": "Good" if (m and m.previous_gpa >= 7.0) else "Moderate"},
        {"name": "Assignment Submission Rate", "value": round(m.assignment_completion_rate, 1) if m else 0.0, "max": 100, "unit": "%", "status": "Good" if (m and m.assignment_completion_rate >= 80) else "Needs Attention"},
        {"name": "Theory Lecture Attendance", "value": round(m.lecture_attendance_rate, 1) if m else 0.0, "max": 100, "unit": "%", "status": "Good" if (m and m.lecture_attendance_rate >= 75) else "Shortage Warning"},
        {"name": "Practical Laboratory Attendance", "value": round(m.lab_attendance_rate, 1) if m else 0.0, "max": 100, "unit": "%", "status": "Good" if (m and m.lab_attendance_rate >= 80) else "Shortage Warning"}
    ]

    return {
        "student_id": student.id,
        "name": get_indian_student_name(student.id),
        "department": meta["department"],
        "register_no": meta["register_no"],
        "overall_learning_score": round(m.learning_performance_score, 1) if m else 0.0,
        "difficulty_score": round(d.difficulty_score, 1) if d else 0.0,
        "risk_level": d.risk_level if d else "NORMAL",
        "overall_attendance": round(m.overall_attendance_rate, 1) if m else 0.0,
        "indicators": indicators,
        "trajectory": [
            {"label": "Week 1 (Diagnostic)", "score": max(20, round(m.previous_gpa * 10 - 5, 1)) if m else 60},
            {"label": "Week 3 (Quiz 1)", "score": round(m.quiz1_marks * 5, 1) if m else 65},
            {"label": "Week 6 (Midterm)", "score": round(m.midterm_marks, 1) if m else 62},
            {"label": "Week 9 (Quiz 2)", "score": round(m.quiz2_marks * 5, 1) if m else 68},
            {"label": "Week 12 (Quiz 3)", "score": round(m.quiz3_marks * 5, 1) if m else 70},
            {"label": "Current (Composite)", "score": round(m.learning_performance_score, 1) if m else 72},
        ]
    }

@router.get("/roadmap")
def get_my_roadmap(
    student: Student = Depends(get_auth_student),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_student_roadmap(student.id, current_user, db)

@router.post("/roadmap/step/{step_id}/toggle")
def toggle_my_roadmap_step(
    step_id: int,
    student: Student = Depends(get_auth_student),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return toggle_roadmap_step(student.id, step_id, current_user, db)

@router.get("/progress")
def get_my_progress(
    student: Student = Depends(get_auth_student),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    m = student.metrics
    d = student.difficulty
    roadmap = get_student_roadmap(student.id, current_user, db)

    baseline_score = max(35.0, round(m.previous_gpa * 10.0, 1)) if m else 55.0
    current_score = round(m.learning_performance_score, 1) if m else 68.0
    improvement_delta = round(current_score - baseline_score, 1)

    return {
        "student_id": student.id,
        "name": get_indian_student_name(student.id),
        "baseline_score": baseline_score,
        "current_score": current_score,
        "improvement_delta": improvement_delta,
        "improvement_percentage": round((improvement_delta / max(1.0, baseline_score)) * 100, 1),
        "roadmap_completion_percentage": roadmap.get("overall_progress_percentage", 65.0),
        "total_steps_count": len(roadmap.get("steps", [])),
        "weekly_metrics": [
            {"week": "Week 1", "baseline": baseline_score, "actual": baseline_score, "target": baseline_score + 2},
            {"week": "Week 2", "baseline": baseline_score, "actual": baseline_score + 1.5, "target": baseline_score + 4},
            {"week": "Week 3", "baseline": baseline_score, "actual": baseline_score + 3.2, "target": baseline_score + 6},
            {"week": "Week 4", "baseline": baseline_score, "actual": baseline_score + 4.8, "target": baseline_score + 8},
            {"week": "Week 5", "baseline": baseline_score, "actual": current_score, "target": baseline_score + 10},
        ],
        "domain_mastery": [
            {"domain": "Core Theory Concepts", "mastery": 74, "status": "Proficient"},
            {"domain": "Algorithm Problem Solving", "mastery": 62, "status": "Progressing"},
            {"domain": "Laboratory Hands-on Implementation", "mastery": 80, "status": "Mastered"},
            {"domain": "Quiz & Objective Testing", "mastery": round(m.quiz_average * 5, 1) if m else 65, "status": "Progressing"},
            {"domain": "Semester Exam Subjective Writing", "mastery": round(m.midterm_marks * 0.9, 1) if m else 60, "status": "Needs Attention"}
        ]
    }

@router.get("/calendar")
def get_my_academic_calendar(student: Student = Depends(get_auth_student)):
    # Anna University / AICTE typical odd/even semester calendar
    events = [
        {
            "id": "EV-101",
            "title": "Continuous Internal Assessment (CIA - 1)",
            "type": "Internal Exam",
            "subject": "CS3601 Artificial Intelligence & CS3602 DAA",
            "date": "2026-10-08",
            "status": "Upcoming",
            "weightage": "20% of Internal Marks",
            "syllabus": "Units 1 & 2 (Search Algorithms, Recurrences)"
        },
        {
            "id": "EV-102",
            "title": "Practice Assignment 2 Submission Deadline",
            "type": "Assignment",
            "subject": "CS3603 Computer Networks & Security",
            "date": "2026-10-12",
            "status": "Pending",
            "weightage": "5% of Internal Marks",
            "syllabus": "Subnetting and TCP Sliding Window Protocol"
        },
        {
            "id": "EV-103",
            "title": "Lab Observation Book Verification & Viva",
            "type": "Lab Assessment",
            "subject": "CS3611 AI & Machine Learning Lab",
            "date": "2026-10-16",
            "status": "Upcoming",
            "weightage": "10% of Lab Internal",
            "syllabus": "Experiments 1-6 (A* Search, Minimax, Naive Bayes)"
        },
        {
            "id": "EV-104",
            "title": "Online Quiz 2 (Proctored)",
            "type": "Quiz",
            "subject": "CS3604 Cloud Computing Technologies",
            "date": "2026-10-22",
            "status": "Upcoming",
            "weightage": "5% of Internal Marks",
            "syllabus": "Virtualization, Hypervisors & AWS Basics"
        },
        {
            "id": "EV-105",
            "title": "Continuous Internal Assessment (CIA - 2)",
            "type": "Internal Exam",
            "subject": "All 4 Theory Subjects",
            "date": "2026-11-04",
            "status": "Scheduled",
            "weightage": "20% of Internal Marks",
            "syllabus": "Units 3 & 4 (Knowledge Representation, Dynamic Programming)"
        },
        {
            "id": "EV-106",
            "title": "Semester Model Practical Examination",
            "type": "Lab Assessment",
            "subject": "Both Practical Labs",
            "date": "2026-11-18",
            "status": "Scheduled",
            "weightage": "20% of Lab Marks",
            "syllabus": "Complete Laboratory Syllabus"
        },
        {
            "id": "EV-107",
            "title": "Model Theory Examinations",
            "type": "Model Exam",
            "subject": "All Core Subjects",
            "date": "2026-11-25",
            "status": "Scheduled",
            "weightage": "Full Syllabus Simulation",
            "syllabus": "Units 1 to 5 Comprehensive"
        },
        {
            "id": "EV-108",
            "title": "End Semester University Theory Examinations",
            "type": "University Exam",
            "subject": "University Board Exam Schedule",
            "date": "2026-12-08",
            "status": "Scheduled",
            "weightage": "60% of Total Grade",
            "syllabus": "Complete Prescribed University Curriculum"
        }
    ]
    return {
        "student_id": student.id,
        "academic_session": "2026 - 2027 (Even Semester)",
        "current_semester": "Semester VI",
        "total_events": len(events),
        "events": events
    }

@router.get("/assessments")
def get_my_assessments(student: Student = Depends(get_auth_student)):
    m = student.metrics
    meta = get_student_academic_meta(student.id)

    assessments_list = [
        {
            "code": "CIA-1",
            "name": "Internal Assessment Test - I",
            "date": "Aug 2026",
            "max_marks": 50,
            "scored_marks": round((m.quiz1_marks / 20.0) * 50, 1) if m else 32,
            "percentage": round((m.quiz1_marks / 20.0) * 100, 1) if m else 64,
            "status": "Completed",
            "feedback": "Strong in theoretical definitions, work on derivation steps."
        },
        {
            "code": "QZ-1",
            "name": "Objective Quiz 1",
            "date": "Aug 2026",
            "max_marks": 20,
            "scored_marks": m.quiz1_marks if m else 12,
            "percentage": round((m.quiz1_marks / 20.0) * 100, 1) if m else 60,
            "status": "Completed",
            "feedback": "Review MCQ questions on tree traversal complexities."
        },
        {
            "code": "MID-TERM",
            "name": "Continuous Midterm Assessment",
            "date": "Sep 2026",
            "max_marks": 100,
            "scored_marks": m.midterm_marks if m else 65,
            "percentage": m.midterm_marks if m else 65,
            "status": "Completed",
            "feedback": "Good performance overall. Needs practice in numerical proofs."
        },
        {
            "code": "QZ-2",
            "name": "Objective Quiz 2",
            "date": "Sep 2026",
            "max_marks": 20,
            "scored_marks": m.quiz2_marks if m else 13,
            "percentage": round((m.quiz2_marks / 20.0) * 100, 1) if m else 65,
            "status": "Completed",
            "feedback": "Solid understanding of graph search mechanisms."
        },
        {
            "code": "QZ-3",
            "name": "Objective Quiz 3",
            "date": "Oct 2026",
            "max_marks": 20,
            "scored_marks": m.quiz3_marks if m else 14,
            "percentage": round((m.quiz3_marks / 20.0) * 100, 1) if m else 70,
            "status": "Completed",
            "feedback": "Commendable improvement over Quiz 1."
        },
        {
            "code": "LAB-INT",
            "name": "Lab Continuous Assessment & Viva",
            "date": "Oct 2026",
            "max_marks": 25,
            "scored_marks": round((m.lab_attendance_rate / 100.0) * 25, 1) if m else 21,
            "percentage": m.lab_attendance_rate if m else 84,
            "status": "Completed",
            "feedback": "Practical programs executed on time."
        }
    ]

    return {
        "student_id": student.id,
        "name": get_indian_student_name(student.id),
        "assessments": assessments_list,
        "summary": {
            "cia_average": round(m.quiz_average * 5, 1) if m else 68.0,
            "midterm_score": m.midterm_marks if m else 65.0,
            "assignment_submissions": f"{m.assignments_submitted}/{m.total_assignments}" if m else "4/5",
            "readiness_index": "On Track for First Class" if (m and m.learning_performance_score >= 70) else "Targeting 60%+ Pass"
        }
    }

@router.get("/history")
def get_my_learning_history(student: Student = Depends(get_auth_student)):
    m = student.metrics
    d = student.difficulty

    timeline = [
        {
            "id": 1,
            "timestamp": "Semester Commencement",
            "title": "Enrolled in Semester VI — Computer Science & Engineering",
            "type": "academic_milestone",
            "description": "Registered for 4 core theory courses and 2 laboratory sessions under Regulation 2021.",
            "badge": "Enrolled"
        },
        {
            "id": 2,
            "timestamp": "Week 2",
            "title": "Baseline Diagnostic Evaluation",
            "type": "assessment",
            "description": f"Recorded previous semester GPA of {m.previous_gpa:.2f}. Initial readiness evaluated.",
            "badge": "Diagnostic"
        },
        {
            "id": 3,
            "timestamp": "Week 4",
            "title": "Quiz 1 Assessment Completed",
            "type": "assessment",
            "description": f"Scored {m.quiz1_marks:.1f} / 20.0 in Fundamental Algorithms and Data Structures.",
            "badge": "Assessment"
        },
        {
            "id": 4,
            "timestamp": "Week 6",
            "title": "Learning Difficulty Diagnosis & Risk Classification",
            "type": "difficulty_detection",
            "description": f"AI Engine classified student as {d.risk_level if d else 'NORMAL'} risk with difficulty score {d.difficulty_score if d else 30:.1f}/100.",
            "badge": d.risk_level if d else "NORMAL"
        },
        {
            "id": 5,
            "timestamp": "Week 7",
            "title": "Personalized 5-Stage Learning Roadmap Unlocked",
            "type": "roadmap_event",
            "description": "Tailored curriculum reinforcement roadmap generated focusing on core concepts and practice MCQs.",
            "badge": "Roadmap Activated"
        },
        {
            "id": 6,
            "timestamp": "Week 8",
            "title": "Midterm Examination Completed",
            "type": "assessment",
            "description": f"Secured {m.midterm_marks:.1f} / 100 in Continuous Internal Assessment.",
            "badge": "Exam"
        },
        {
            "id": 7,
            "timestamp": "Current Week",
            "title": "Active Learning & Continuous Improvement",
            "type": "progress",
            "description": f"Achieved composite learning performance score of {m.learning_performance_score:.1f} and overall attendance of {m.overall_attendance_rate:.1f}%.",
            "badge": "In Progress"
        }
    ]

    return {
        "student_id": student.id,
        "name": get_indian_student_name(student.id),
        "total_milestones": len(timeline),
        "timeline": timeline
    }

@router.get("/prediction")
def get_my_prediction(
    student: Student = Depends(get_auth_student),
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    return get_student_prediction(student.id, current_user, db)

@router.get("/risk")
def get_my_risk(
    student: Student = Depends(get_auth_student),
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    return get_student_risk(student.id, current_user, db)

@router.get("/weak-topics")
def get_my_weak_topics(
    student: Student = Depends(get_auth_student),
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    return get_student_weak_topics(student.id, current_user, db)

@router.get("/topic-priorities")
def get_my_topic_priorities(
    student: Student = Depends(get_auth_student),
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    return get_student_topic_priorities(student.id, current_user, db)

@router.get("/adaptive-study-plan")
def get_my_adaptive_study_plan(
    student: Student = Depends(get_auth_student),
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    return get_student_adaptive_study_plan(student.id, current_user, db)

@router.get("/explanations")
def get_my_explanations(
    student: Student = Depends(get_auth_student),
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    return get_student_explanations(student.id, current_user, db)

@router.get("/trends")
def get_my_trends(
    student: Student = Depends(get_auth_student),
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    return get_student_trends(student.id, current_user, db)
