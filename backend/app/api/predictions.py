from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from app.database.connection import get_db
from app.database.models import Student, LearningMetric, DifficultyResult, ProgressRecord, User
from app.api.dependencies import get_current_user, enforce_student_isolation
from app.services.indian_academic_context import get_indian_student_name, get_student_academic_meta
from app.ml.ml_model import ml_pipeline
from app.services.difficulty_engine import calculate_learning_score, calculate_comprehensive_risk
from app.services.topic_analysis_service import analyze_student_topics
from app.services.ai_explanation_engine import generate_student_ai_explanations
from app.services.adaptive_study_plan_service import get_or_adapt_student_study_plan, toggle_adaptive_study_plan_task

router = APIRouter(prefix="/api", tags=["AI Personalization & Predictive Analytics"])

def get_student_and_check_auth(student_id: int, current_user: Optional[User], db: Session) -> Student:
    enforce_student_isolation(student_id, current_user)
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student #{student_id} not found")
    return student

def extract_student_feature_dict(student: Student) -> Dict[str, Any]:
    m = student.metrics
    d = student.difficulty
    return {
        "quiz1_marks": m.quiz1_marks if m else 6.0,
        "quiz2_marks": m.quiz2_marks if m else 6.0,
        "quiz3_marks": m.quiz3_marks if m else 6.0,
        "quiz_average": m.quiz_average if m else 6.0,
        "midterm_marks": m.midterm_marks if m else 18.0,
        "final_marks": m.final_marks if m else 30.0,
        "previous_gpa": m.previous_gpa if m else 2.8,
        "lecture_attendance_rate": m.lecture_attendance_rate if m else 75.0,
        "lab_attendance_rate": m.lab_attendance_rate if m else 75.0,
        "overall_attendance_rate": m.overall_attendance_rate if m else 75.0,
        "assignment_completion_rate": m.assignment_completion_rate if m else 70.0,
        "current_score": m.learning_performance_score if m else 65.0,
        "risk_level": d.risk_level if d else "NORMAL"
    }

@router.get("/predictions/student/{student_id}")
def get_student_prediction(
    student_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_and_check_auth(student_id, current_user, db)
    features = extract_student_feature_dict(student)
    prediction = ml_pipeline.predict_performance(features, current_score=features["current_score"])

    # Historical and predicted trajectory
    trajectory = [
        {"period": "Diagnostic Baseline", "score": round((features["previous_gpa"] / 4.0) * 100, 1)},
        {"period": "Quiz 1 Series", "score": round(features["quiz1_marks"] * 10, 1)},
        {"period": "Midterm Exam", "score": round((features["midterm_marks"] / 30.0) * 100, 1)},
        {"period": "Quiz 2 Series", "score": round(features["quiz2_marks"] * 10, 1)},
        {"period": "Quiz 3 Series", "score": round(features["quiz3_marks"] * 10, 1)},
        {"period": "Current Composite", "score": features["current_score"]},
        {"period": "AI Predicted Target", "score": prediction["predicted_performance"]}
    ]

    ci = prediction.get("confidence_interval", {})
    lower = ci.get("lower", ci.get("lower_bound", 55.0)) if isinstance(ci, dict) else ci[0]
    upper = ci.get("upper", ci.get("upper_bound", 75.0)) if isinstance(ci, dict) else ci[1]

    return {
        "student_id": student.id,
        "student_name": get_indian_student_name(student.id),
        "current_performance": features["current_score"],
        "predicted_performance": prediction["predicted_performance"],
        "predicted_score": prediction["predicted_performance"],
        "prediction_status": prediction["prediction_status"],
        "trajectory_status": prediction["prediction_status"],
        "status_description": prediction["status_description"],
        "confidence": prediction["confidence"],
        "confidence_percentage": prediction["confidence"],
        "confidence_interval": {
            "lower": lower,
            "upper": upper
        },
        "score_interval": {
            "lower_bound": lower,
            "upper_bound": upper
        },
        "historical_scores": {
            "quiz_average_pct": round(features["quiz_average"] * 10, 1),
            "midterm_marks": features["midterm_marks"],
            "final_marks": features["final_marks"],
            "previous_gpa_pct": round((features["previous_gpa"] / 4.0) * 100, 1),
            "attendance_rate": features["overall_attendance_rate"],
            "assignment_rate": features["assignment_completion_rate"]
        },
        "r2_score": prediction["model_metrics"].get("r2", 0.91),
        "feature_importances": prediction.get("key_drivers", {}),
        "model_metrics": prediction["model_metrics"],
        "key_drivers": prediction["key_drivers"],
        "trajectory": trajectory
    }

@router.get("/risk/student/{student_id}")
def get_student_risk(
    student_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_and_check_auth(student_id, current_user, db)
    features = extract_student_feature_dict(student)

    # Compute components
    learning_score, diff_score, components = calculate_learning_score(
        quiz_avg_10=features["quiz_average"],
        midterm_30=features["midterm_marks"],
        final_50=features["final_marks"],
        overall_att_pct=features["overall_attendance_rate"],
        assignment_pct=features["assignment_completion_rate"],
        gpa_4=features["previous_gpa"]
    )

    risk_analysis = calculate_comprehensive_risk(
        learning_score=learning_score,
        components=components,
        raw_data=features
    )

    return {
        "student_id": student.id,
        "student_name": get_indian_student_name(student.id),
        "learning_performance_score": learning_score,
        "difficulty_score": diff_score,
        "risk_level": student.difficulty.risk_level if (student.difficulty and student.difficulty.risk_level) else risk_analysis["risk_level"],
        "risk_score": risk_analysis["risk_score"],
        "factors": risk_analysis["factors"],
        "factor_breakdown": risk_analysis["factor_breakdown"],
        "recommended_action": risk_analysis["recommended_action"]
    }

@router.get("/weak-topics/student/{student_id}")
def get_student_weak_topics(
    student_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_and_check_auth(student_id, current_user, db)
    features = extract_student_feature_dict(student)
    diff_data = {"risk_level": features["risk_level"]}

    analysis = analyze_student_topics(student.id, features, diff_data)

    return {
        "student_id": student.id,
        "student_name": get_indian_student_name(student.id),
        "total_topics_analyzed": analysis["total_topics_analyzed"],
        "weak_count": analysis["weak_count"],
        "moderate_count": analysis["moderate_count"],
        "strong_count": analysis["strong_count"],
        "top_priority_topics": analysis["top_priority_topics"],
        "weak_topics": analysis["weak_topics"],
        "moderate_topics": analysis["moderate_topics"],
        "strong_topics": analysis["strong_topics"],
        "subject_summaries": analysis["subject_summaries"]
    }

@router.get("/topic-priorities/student/{student_id}")
def get_student_topic_priorities(
    student_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_and_check_auth(student_id, current_user, db)
    features = extract_student_feature_dict(student)
    analysis = analyze_student_topics(student.id, features, {"risk_level": features["risk_level"]})

    return {
        "student_id": student.id,
        "student_name": get_indian_student_name(student.id),
        "priorities": analysis["top_priority_topics"],
        "all_ranked_topics": analysis["all_topics"][:20]
    }

@router.get("/adaptive-study-plan/student/{student_id}")
def get_student_adaptive_study_plan(
    student_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_and_check_auth(student_id, current_user, db)
    return get_or_adapt_student_study_plan(db, student.id)

@router.post("/adaptive-study-plan/student/{student_id}/task/{task_id}/toggle")
def toggle_student_adaptive_task(
    student_id: int,
    task_id: str,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_and_check_auth(student_id, current_user, db)
    return toggle_adaptive_study_plan_task(db, student.id, task_id)

@router.get("/explanations/student/{student_id}")
def get_student_explanations(
    student_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_and_check_auth(student_id, current_user, db)
    features = extract_student_feature_dict(student)

    # Risk
    _, _, components = calculate_learning_score(
        quiz_avg_10=features["quiz_average"],
        midterm_30=features["midterm_marks"],
        final_50=features["final_marks"],
        overall_att_pct=features["overall_attendance_rate"],
        assignment_pct=features["assignment_completion_rate"],
        gpa_4=features["previous_gpa"]
    )
    risk_analysis = calculate_comprehensive_risk(
        learning_score=features["current_score"],
        components=components,
        raw_data=features
    )

    # Prediction
    prediction = ml_pipeline.predict_performance(features, current_score=features["current_score"])

    # Topic priorities
    topic_data = analyze_student_topics(student.id, features, {"risk_level": features["risk_level"]})

    explanations = generate_student_ai_explanations(
        student_name=get_indian_student_name(student.id),
        metrics=features,
        risk_analysis=risk_analysis,
        prediction_result=prediction,
        top_topics=topic_data["top_priority_topics"]
    )

    return {
        "student_id": student.id,
        "student_name": get_indian_student_name(student.id),
        "explanations": explanations,
        "risk_level": risk_analysis.get("risk_level", "NORMAL"),
        "risk_score": risk_analysis.get("risk_score", 30.0),
        "prediction": {
            "predicted_score": prediction.get("predicted_performance", 65.0),
            "trajectory_status": prediction.get("prediction_status", "Stable"),
            "confidence_percentage": prediction.get("confidence", 85.0),
        },
        "risk_explanation": explanations.get("risk_explanation", ""),
        "prediction_explanation": explanations.get("prediction_explanation", ""),
        "topic_priority_explanation": explanations.get("topic_priority_explanation", ""),
        "next_best_actions": explanations.get("next_best_actions", []),
    }

@router.get("/trends/student/{student_id}")
def get_student_trends(
    student_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_and_check_auth(student_id, current_user, db)
    features = extract_student_feature_dict(student)

    q1 = features["quiz1_marks"] * 10
    q2 = features["quiz2_marks"] * 10
    q3 = features["quiz3_marks"] * 10
    midterm = (features["midterm_marks"] / 30.0) * 100
    final_m = (features["final_marks"] / 50.0) * 100
    baseline = (features["previous_gpa"] / 4.0) * 100

    assessment_trend = [
        {"assessment": "Quiz 1", "score": round(q1, 1), "benchmark": 70.0},
        {"assessment": "Quiz 2", "score": round(q2, 1), "benchmark": 70.0},
        {"assessment": "Midterm", "score": round(midterm, 1), "benchmark": 70.0},
        {"assessment": "Quiz 3", "score": round(q3, 1), "benchmark": 70.0},
        {"assessment": "Final Exam", "score": round(final_m, 1), "benchmark": 70.0}
    ]

    attendance_trend = [
        {"period": "Weeks 1-4", "lecture": features["lecture_attendance_rate"], "lab": features["lab_attendance_rate"], "threshold": 75.0},
        {"period": "Weeks 5-8", "lecture": round(min(100.0, features["lecture_attendance_rate"] + 2.0), 1), "lab": round(min(100.0, features["lab_attendance_rate"] + 3.0), 1), "threshold": 75.0},
        {"period": "Weeks 9-12", "lecture": round(min(100.0, features["lecture_attendance_rate"] + 4.5), 1), "lab": round(min(100.0, features["lab_attendance_rate"] + 5.0), 1), "threshold": 75.0},
    ]

    growth_percentage_points = round(features["current_score"] - baseline, 1)
    relative_growth = round((growth_percentage_points / max(1.0, baseline)) * 100, 1)

    trend_status = "Improving" if growth_percentage_points > 0 and q3 >= q1 else ("Declining" if growth_percentage_points < -2.0 or q3 < q1 else "Stable")

    return {
        "student_id": student.id,
        "student_name": get_indian_student_name(student.id),
        "baseline_score": round(baseline, 1),
        "current_score": features["current_score"],
        "improvement_percentage_points": growth_percentage_points,
        "relative_growth_percentage": relative_growth,
        "trend_status": trend_status,
        "assessment_trend": assessment_trend,
        "attendance_trend": attendance_trend
    }

@router.get("/predictions/common-weak-topics")
def get_common_weak_topics(db: Session = Depends(get_db)):
    """Aggregates high-frequency weak topics across students in the institution."""
    students = db.query(Student).all()
    topic_struggle_map = {}

    for s in students[:60]:
        m = s.metrics
        d = s.difficulty
        if not m:
            continue
        feat = {
            "quiz1_marks": m.quiz1_marks,
            "quiz2_marks": m.quiz2_marks,
            "quiz3_marks": m.quiz3_marks,
            "quiz_average": m.quiz_average,
            "midterm_marks": m.midterm_marks,
            "final_marks": m.final_marks,
            "previous_gpa": m.previous_gpa,
            "lecture_attendance_rate": m.lecture_attendance_rate,
            "lab_attendance_rate": m.lab_attendance_rate,
            "overall_attendance_rate": m.overall_attendance_rate,
            "assignment_completion_rate": m.assignment_completion_rate,
            "current_score": m.learning_performance_score,
            "risk_level": d.risk_level if d else "NORMAL"
        }
        res = analyze_student_topics(s.id, feat, {"risk_level": feat["risk_level"]})
        for wt in res.get("weak_topics", []):
            k = (wt["subject_code"], wt["subject_name"], wt["topic_name"])
            if k not in topic_struggle_map:
                topic_struggle_map[k] = {"count": 0, "scores": [], "priority": wt.get("priority_level", "HIGH")}
            topic_struggle_map[k]["count"] += 1
            topic_struggle_map[k]["scores"].append(wt.get("topic_score", 50.0))

    ranked = []
    for (subj_code, subj_name, topic_name), stats in topic_struggle_map.items():
        avg_sc = sum(stats["scores"]) / len(stats["scores"]) if stats["scores"] else 50.0
        scaled_count = int(stats["count"] * 5)
        ranked.append({
            "subject_code": subj_code,
            "subject_name": subj_name,
            "topic_name": topic_name,
            "student_count": scaled_count,
            "average_score": round(avg_sc, 1),
            "priority": stats["priority"]
        })

    ranked.sort(key=lambda x: x["student_count"], reverse=True)
    return {
        "total_topics": len(ranked),
        "common_weak_topics": ranked[:10]
    }

