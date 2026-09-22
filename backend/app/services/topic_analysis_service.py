"""
Topic Analysis & Priority Scoring Engine for LearnTrack AI
Indian Engineering College Context Layer

Analyzes student assessment patterns and maps them to the 12 Indian Engineering subjects
and unit topics, identifying weak, moderate, and strong topics and generating actionable priorities.
"""

from typing import Dict, Any, List, Optional
from app.services.indian_academic_context import INDIAN_SUBJECTS_CATALOG

# Topic-to-assessment affinity mapping
SUBJECT_AFFINITIES = {
    "CS3301": {"theory_weight": 0.4, "quiz_weight": 0.4, "lab_weight": 0.2},   # DSA
    "CS3492": {"theory_weight": 0.45, "quiz_weight": 0.35, "lab_weight": 0.2},  # DBMS
    "CS3451": {"theory_weight": 0.5, "quiz_weight": 0.3, "lab_weight": 0.2},   # OS
    "CS3591": {"theory_weight": 0.45, "quiz_weight": 0.35, "lab_weight": 0.2},  # Networks
    "CS3602": {"theory_weight": 0.55, "quiz_weight": 0.35, "lab_weight": 0.1},  # DAA
    "MA3354": {"theory_weight": 0.6, "quiz_weight": 0.4, "lab_weight": 0.0},   # Engg Maths
    "CS3501": {"theory_weight": 0.65, "quiz_weight": 0.35, "lab_weight": 0.0},  # TOC
    "CS3391": {"theory_weight": 0.35, "quiz_weight": 0.35, "lab_weight": 0.3},  # OOP
    "CS3401": {"theory_weight": 0.5, "quiz_weight": 0.3, "lab_weight": 0.2},   # Software Engg
    "IT3501": {"theory_weight": 0.3, "quiz_weight": 0.3, "lab_weight": 0.4},   # Web Tech
    "CS3601": {"theory_weight": 0.5, "quiz_weight": 0.35, "lab_weight": 0.15}, # AI
    "AD3491": {"theory_weight": 0.4, "quiz_weight": 0.35, "lab_weight": 0.25}, # ML
}

DIFFICULTY_MULTIPLIERS = {
    "Hard": 1.25,
    "Intermediate": 1.0,
    "Easy": 0.85
}

def analyze_student_topics(
    student_id: int,
    metrics: Dict[str, Any],
    difficulty_result: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Computes explainable, deterministic topic scores and priority rankings for all 12 subjects.
    """
    q_avg = float(metrics.get("quiz_average", 6.0))
    q1 = float(metrics.get("quiz1_marks", 6.0))
    q2 = float(metrics.get("quiz2_marks", 6.0))
    q3 = float(metrics.get("quiz3_marks", 6.0))
    midterm = float(metrics.get("midterm_marks", 18.0))
    final_m = float(metrics.get("final_marks", 30.0))
    lab_att = float(metrics.get("lab_attendance_rate", 75.0))
    assign_rate = float(metrics.get("assignment_completion_rate", 70.0))
    gpa = float(metrics.get("previous_gpa", 2.8))

    norm_quiz = (q_avg / 10.0) * 100.0
    norm_exam = ((midterm + final_m) / 80.0) * 100.0
    declining_trend = q3 < q1

    risk_level = difficulty_result.get("risk_level", "NORMAL") if difficulty_result else "NORMAL"

    all_topics = []
    subject_summaries = []

    for subj in INDIAN_SUBJECTS_CATALOG:
        scode = subj["code"]
        sname = subj["name"]
        affinity = SUBJECT_AFFINITIES.get(scode, {"theory_weight": 0.5, "quiz_weight": 0.3, "lab_weight": 0.2})

        # Calculate subject baseline performance score
        subj_score = (
            affinity["theory_weight"] * norm_exam +
            affinity["quiz_weight"] * norm_quiz +
            affinity["lab_weight"] * lab_att
        )

        # Shift subject score based on inherent difficulty and student profile
        if scode in ("CS3602", "CS3501", "MA3354") and gpa < 3.0:
            subj_score -= 8.0  # Math & DAA are harder for lower GPA baselines
        elif scode in ("IT3501", "CS3391") and lab_att >= 80.0:
            subj_score += 4.0  # Practical subjects benefit from good lab attendance

        subj_score = round(min(max(subj_score, 18.0), 96.0), 1)

        topic_items = []
        for t in subj["topics"]:
            tname = t["name"]
            unit = t.get("unit", 1)
            level = t.get("level", "Intermediate")
            hours = t.get("hours", 4.0)

            # Topic score varies around subject baseline based on unit difficulty
            unit_offset = 0.0
            if level == "Hard":
                unit_offset -= 9.0
            elif level == "Easy":
                unit_offset += 8.0

            # Unit 4 & 5 are later in semester, reflect Quiz 3 / Final performance
            if unit >= 4:
                unit_offset += (q3 - q1) * 2.0

            t_score = round(min(max(subj_score + unit_offset, 15.0), 98.0), 1)

            # Priority Score Calculation
            deficit = max(0.0, 100.0 - t_score)
            diff_mult = DIFFICULTY_MULTIPLIERS.get(level, 1.0)
            p_score = deficit * diff_mult

            # Contextual boosts
            if t_score < 60.0:
                p_score += 15.0
            if declining_trend and unit >= 3:
                p_score += 8.0
            if risk_level == "AT_RISK" and level == "Hard":
                p_score += 12.0

            p_score = round(min(max(p_score, 5.0), 100.0), 1)

            # Priority Level
            if p_score >= 60.0 or t_score < 50.0:
                priority = "HIGH"
                status = "Needs Attention"
            elif p_score >= 35.0 or t_score < 70.0:
                priority = "MEDIUM"
                status = "In Progress"
            else:
                priority = "LOW"
                status = "Mastered"

            # Explainable reason & action
            if t_score < 50.0:
                reason = f"Diagnostic score of {t_score}% indicates substantial conceptual gaps in Unit {unit} ({level} difficulty)."
                action = f"Complete foundational reading and solve 10 introductory practice problems for {tname}."
            elif t_score < 65.0:
                reason = f"Current proficiency at {t_score}% is below passing safety margin for examination."
                action = f"Review textbook examples and retake 15-minute diagnostic quiz on {tname}."
            elif t_score < 75.0:
                reason = f"Moderate grasp ({t_score}%); requires targeted reinforcement before final exam."
                action = f"Solve previous Anna University question bank problems on {tname}."
            else:
                reason = f"Solid proficiency ({t_score}%); topic is well-mastered."
                action = f"Maintain retention with weekly review flashcards."

            item = {
                "subject_code": scode,
                "subject_name": sname,
                "topic_name": tname,
                "unit_number": unit,
                "difficulty_level": level,
                "recommended_hours": hours,
                "score": t_score,
                "priority": priority,
                "priority_score": p_score,
                "reason": reason,
                "recommended_action": action,
                "status": status
            }
            all_topics.append(item)
            topic_items.append(item)

        subject_summaries.append({
            "subject_code": scode,
            "subject_name": sname,
            "credits": subj.get("credits", 4),
            "average_score": subj_score,
            "status": "Weak" if subj_score < 60.0 else ("Moderate" if subj_score < 75.0 else "Strong"),
            "weak_topics_count": sum(1 for t in topic_items if t["score"] < 60.0),
            "high_priority_count": sum(1 for t in topic_items if t["priority"] == "HIGH")
        })

    # Sort topics by priority score descending
    all_topics.sort(key=lambda x: x["priority_score"], reverse=True)

    weak_topics = [t for t in all_topics if t["score"] < 60.0]
    moderate_topics = [t for t in all_topics if 60.0 <= t["score"] < 75.0]
    strong_topics = [t for t in all_topics if t["score"] >= 75.0]

    top_priorities = all_topics[:5]

    return {
        "student_id": student_id,
        "total_topics_analyzed": len(all_topics),
        "weak_count": len(weak_topics),
        "moderate_count": len(moderate_topics),
        "strong_count": len(strong_topics),
        "top_priority_topics": top_priorities,
        "weak_topics": weak_topics[:10],
        "moderate_topics": moderate_topics[:10],
        "strong_topics": strong_topics[:10],
        "all_topics": all_topics,
        "subject_summaries": subject_summaries
    }
