"""
AI Explanation Engine for LearnTrack AI
Indian Engineering College Context Layer

Transforms quantitative ML metrics, risk scores, and topic priorities into
human-readable, understandable explanations grounded in student data.
"""

from typing import Dict, Any, List

def generate_student_ai_explanations(
    student_name: str,
    metrics: Dict[str, Any],
    risk_analysis: Dict[str, Any],
    prediction_result: Dict[str, Any],
    top_topics: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Synthesizes multi-dimensional, data-grounded AI explanations for the student dashboard.
    """
    risk_level = risk_analysis.get("risk_level", "NORMAL")
    risk_score = risk_analysis.get("risk_score", 30.0)
    factors = risk_analysis.get("factors", [])

    pred_score = prediction_result.get("predicted_performance", 65.0)
    pred_status = prediction_result.get("prediction_status", "Stable")
    confidence = prediction_result.get("confidence", 80.0)

    # 1. Risk Explanation
    if risk_level == "AT_RISK":
        lead_factors = [f["factor"] for f in factors[:2]]
        factor_text = " and ".join(lead_factors) if lead_factors else "continuous assessment deficits"
        risk_exp = (
            f"Your risk classification is AT_RISK (Risk Score: {risk_score}/100) because "
            f"{factor_text.lower()} have fallen below the institutional pass threshold. "
            f"{risk_analysis.get('recommended_action', '')}"
        )
    elif risk_level == "MODERATE":
        risk_exp = (
            f"Your risk level is MODERATE (Risk Score: {risk_score}/100). You are passing core requirements, "
            f"but specific unit gaps and attendance consistency need proactive reinforcement before semester exams."
        )
    else:
        risk_exp = (
            f"Your risk level is NORMAL (Risk Score: {risk_score}/100). Your academic metrics, lecture attendance, "
            f"and assignment submissions meet institutional proficiency standards."
        )

    # 2. Prediction Explanation
    q1 = metrics.get("quiz1_marks", 6.0)
    q3 = metrics.get("quiz3_marks", 6.0)
    if pred_status == "Improving":
        pred_exp = (
            f"The predictive regression model forecasts a score of {pred_score}% with {confidence}% confidence. "
            f"Your performance is classified as Improving because your continuous quiz scores showed upward momentum "
            f"(Quiz 1: {q1:.1f}/10 → Quiz 3: {q3:.1f}/10)."
        )
    elif pred_status == "Declining":
        pred_exp = (
            f"The model forecasts a potential score of {pred_score}% ({confidence}% confidence). "
            f"Status is Declining due to recent assessment variance (Quiz 3 at {q3:.1f}/10 vs Quiz 1 at {q1:.1f}/10). "
            f"Engaging with the recommended practice drills will reverse this trend."
        )
    else:
        pred_exp = (
            f"The model projects an academic score of {pred_score}% with {confidence}% confidence, "
            f"reflecting stable consistency with your previous CGPA and continuous internal assessments."
        )

    # 3. Topic Priority Explanation
    if top_topics:
        top1 = top_topics[0]
        topic_exp = (
            f"'{top1['topic_name']}' in {top1['subject_name']} is designated HIGH PRIORITY "
            f"with a score of {top1['score']}%. It represents a {top1['difficulty_level']} unit concept "
            f"that carries substantial exam weightage. {top1['recommended_action']}"
        )
    else:
        topic_exp = "All core engineering topics currently meet minimum mastery thresholds."

    # 4. Next Best Action
    if factors and factors[0]["factor"].startswith("Lecture & Practical Lab Attendance"):
        next_action = {
            "title": "Attend Scheduled Lab Practical Session",
            "category": "Attendance Recovery",
            "time_estimate": "2.0 Hours",
            "description": "Lab attendance is the highest contributor to your risk score. Complete the next experiment to stay exam-eligible."
        }
    elif top_topics:
        next_action = {
            "title": f"Practice {top_topics[0]['topic_name']} Problems",
            "category": "Targeted Drill",
            "time_estimate": "45 Mins",
            "description": f"Solve 5 practice problems targeting {top_topics[0]['topic_name']} to boost your domain proficiency by +15%."
        }
    else:
        next_action = {
            "title": "Complete Weekly Milestone Review",
            "category": "Maintenance",
            "time_estimate": "30 Mins",
            "description": "Review summary flashcards and preview syllabus topics for next week's lectures."
        }

    action_bullets = [
        f"{next_action['title']}: {next_action['description']}",
        "Review and submit pending lab observations and assignment milestones to improve internal assessment marks."
    ]

    return {
        "student_name": student_name,
        "risk_explanation": risk_exp,
        "prediction_explanation": pred_exp,
        "topic_priority_explanation": topic_exp,
        "next_best_action": next_action,
        "next_best_actions": action_bullets
    }

