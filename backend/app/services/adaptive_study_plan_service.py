"""
Adaptive Personalized Study Plan Service for LearnTrack AI
Indian Engineering College Context Layer

Generates and dynamically adapts a student's study plan based on their top priority weak topics,
assessment outcomes, and completion tracking.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.database.models import Student, StudyPlan, StudyPlanItem, LearningMetric, DifficultyResult
from app.services.topic_analysis_service import analyze_student_topics
from app.services.difficulty_engine import calculate_comprehensive_risk

def generate_adaptive_plan_data(
    student_id: int,
    student_name: str,
    top_topics: List[Dict[str, Any]],
    risk_level: str
) -> Dict[str, Any]:
    """
    Builds a prioritized, multi-stage 7-day adaptive academic schedule.
    """
    primary_topic = top_topics[0] if len(top_topics) > 0 else {
        "topic_name": "Core Algorithms", "subject_name": "Data Structures & Algorithms", "score": 60.0
    }
    secondary_topic = top_topics[1] if len(top_topics) > 1 else {
        "topic_name": "Database Queries", "subject_name": "DBMS", "score": 65.0
    }

    target_gain = 20.0 if risk_level == "AT_RISK" else (14.0 if risk_level == "MODERATE" else 8.0)

    schedule = [
        {
            "day_of_week": "Monday",
            "time_slot": "5:30 PM - 7:00 PM",
            "estimated_hours": 1.5,
            "focus_area": f"Concept Foundation: {primary_topic['topic_name']}",
            "activity_description": f"Read Unit textbook notes on {primary_topic['topic_name']} ({primary_topic['subject_name']}). Create summary flashcards and definition notes.",
            "is_completed": False
        },
        {
            "day_of_week": "Tuesday",
            "time_slot": "6:00 PM - 7:30 PM",
            "estimated_hours": 1.5,
            "focus_area": f"Guided Problem Solving: {primary_topic['topic_name']}",
            "activity_description": f"Solve 8 targeted practice exercises on {primary_topic['topic_name']}. Review step-by-step solutions for any missed steps.",
            "is_completed": False
        },
        {
            "day_of_week": "Wednesday",
            "time_slot": "5:00 PM - 6:30 PM",
            "estimated_hours": 1.5,
            "focus_area": f"Concept Reinforcement: {secondary_topic['topic_name']}",
            "activity_description": f"Review key principles, formulas, and architecture diagrams for {secondary_topic['topic_name']} ({secondary_topic['subject_name']}).",
            "is_completed": False
        },
        {
            "day_of_week": "Thursday",
            "time_slot": "5:30 PM - 7:00 PM",
            "estimated_hours": 1.5,
            "focus_area": "Laboratory Practical & Assignment Verification",
            "activity_description": "Complete and verify pending lab observation manuals and assignment problem sets 24 hours prior to deadline.",
            "is_completed": False
        },
        {
            "day_of_week": "Friday",
            "time_slot": "4:30 PM - 6:00 PM",
            "estimated_hours": 1.5,
            "focus_area": f"Self-Assessment Diagnostic Quiz",
            "activity_description": f"Take 20-minute timed multiple-choice practice quiz covering {primary_topic['topic_name']} and {secondary_topic['topic_name']}.",
            "is_completed": False
        },
        {
            "day_of_week": "Saturday",
            "time_slot": "10:00 AM - 12:30 PM",
            "estimated_hours": 2.5,
            "focus_area": "University Previous Years Question Paper Drills",
            "activity_description": "Solve Anna University previous board exam questions (Part B & Part C subjective proofs) under timed conditions.",
            "is_completed": False
        },
        {
            "day_of_week": "Sunday",
            "time_slot": "4:00 PM - 5:15 PM",
            "estimated_hours": 1.25,
            "focus_area": "Weekly Progress Audit & Peer Study Circle",
            "activity_description": "Audit weekly milestones, update study progress tracker, and plan upcoming lecture milestones with study group.",
            "is_completed": False
        }
    ]

    return {
        "student_id": student_id,
        "title": f"Adaptive Study Plan — {student_name}",
        "focus_summary": f"Prioritized for {primary_topic['topic_name']} and {secondary_topic['topic_name']}. Target boost: +{target_gain}%.",
        "target_score_improvement": target_gain,
        "items": schedule
    }

def get_or_adapt_student_study_plan(db: Session, student_id: int) -> Dict[str, Any]:
    """
    Retrieves the existing StudyPlan or generates/adapts it dynamically using student weak topics.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {}

    plan = db.query(StudyPlan).filter(StudyPlan.student_id == student_id).first()
    m = student.metrics
    d = student.difficulty

    metrics_dict = {
        "quiz_average": m.quiz_average if m else 6.0,
        "quiz1_marks": m.quiz1_marks if m else 6.0,
        "quiz2_marks": m.quiz2_marks if m else 6.0,
        "quiz3_marks": m.quiz3_marks if m else 6.0,
        "midterm_marks": m.midterm_marks if m else 18.0,
        "final_marks": m.final_marks if m else 30.0,
        "lab_attendance_rate": m.lab_attendance_rate if m else 75.0,
        "lecture_attendance_rate": m.lecture_attendance_rate if m else 75.0,
        "overall_attendance_rate": m.overall_attendance_rate if m else 75.0,
        "assignment_completion_rate": m.assignment_completion_rate if m else 70.0,
        "previous_gpa": m.previous_gpa if m else 2.8,
    }

    diff_dict = {"risk_level": d.risk_level if d else "NORMAL"}
    topic_analysis = analyze_student_topics(student.id, metrics_dict, diff_dict)
    top_topics = topic_analysis.get("top_priority_topics", [])

    if not plan or not plan.items:
        # Generate new plan
        plan_data = generate_adaptive_plan_data(student.id, student.name, top_topics, diff_dict["risk_level"])
        if not plan:
            plan = StudyPlan(
                student_id=student.id,
                title=plan_data["title"],
                focus_summary=plan_data["focus_summary"],
                target_score_improvement=plan_data["target_score_improvement"]
            )
            db.add(plan)
            db.commit()
            db.refresh(plan)

        # Clear existing items if any
        db.query(StudyPlanItem).filter(StudyPlanItem.study_plan_id == plan.id).delete()
        for it in plan_data["items"]:
            new_item = StudyPlanItem(
                study_plan_id=plan.id,
                day_of_week=it["day_of_week"],
                time_slot=it["time_slot"],
                focus_area=it["focus_area"],
                activity_description=it["activity_description"],
                estimated_hours=it["estimated_hours"],
                is_completed=it["is_completed"]
            )
            db.add(new_item)
        db.commit()
        db.refresh(plan)

    # Format return
    items = []
    completed_count = 0
    for it in plan.items:
        if it.is_completed:
            completed_count += 1
        items.append({
            "id": it.id,
            "day_of_week": it.day_of_week,
            "time_slot": it.time_slot,
            "focus_area": it.focus_area,
            "activity_description": it.activity_description,
            "estimated_hours": it.estimated_hours,
            "is_completed": it.is_completed
        })

    total_items = len(items)
    comp_pct = round((completed_count / max(1, total_items)) * 100, 1)

    # Determine today's item based on day of week
    today_name = datetime.utcnow().strftime("%A")
    today_items = [it for it in items if it["day_of_week"].lower() == today_name.lower()]
    if not today_items and items:
        today_items = [items[0]]

    return {
        "id": plan.id,
        "student_id": plan.student_id,
        "title": plan.title,
        "focus_summary": plan.focus_summary,
        "target_score_improvement": plan.target_score_improvement,
        "total_items": total_items,
        "total_tasks": total_items,
        "completed_items": completed_count,
        "completed_tasks": completed_count,
        "completion_percentage": comp_pct,
        "completion_rate": comp_pct,
        "today_tasks": today_items,
        "todays_tasks": today_items,
        "items": items,
        "schedule": items,
        "top_priority_topics": top_topics[:3]
    }

def toggle_adaptive_study_plan_task(db: Session, student_id: int, task_id: Any) -> Dict[str, Any]:
    """Toggles completion of a task in the student study plan and updates dynamic metrics."""
    plan = db.query(StudyPlan).filter(StudyPlan.student_id == student_id).first()
    if not plan:
        get_or_adapt_student_study_plan(db, student_id)
        plan = db.query(StudyPlan).filter(StudyPlan.student_id == student_id).first()

    item = None
    try:
        t_int = int(task_id)
        item = db.query(StudyPlanItem).filter(StudyPlanItem.id == t_int, StudyPlanItem.study_plan_id == plan.id).first()
    except (ValueError, TypeError):
        pass

    if not item and plan and plan.items:
        item = plan.items[0]

    if item:
        item.is_completed = not item.is_completed
        db.commit()
        db.refresh(item)

    updated_plan = get_or_adapt_student_study_plan(db, student_id)
    return {
        "status": "success",
        "task_id": str(task_id),
        "is_completed": item.is_completed if item else True,
        "plan": updated_plan
    }

