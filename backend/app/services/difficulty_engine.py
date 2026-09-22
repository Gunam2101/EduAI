import math
from typing import Dict, Any, List, Tuple

# Default configurable scoring weights (sum = 1.0)
DEFAULT_WEIGHTS = {
    "quiz": 0.20,
    "exam": 0.35,
    "attendance": 0.20,
    "assignment": 0.15,
    "gpa": 0.10,
}

DEFAULT_THRESHOLDS = {
    "normal": 70.0,
    "moderate": 50.0,
    "critical_attendance": 50.0,
    "critical_final": 40.0,
}

def calculate_quiz_average(quiz1: float, quiz2: float, quiz3: float) -> float:
    """Calculates the average marks across Quiz 1, Quiz 2, and Quiz 3 (scale 0 - 10)."""
    return round((float(quiz1) + float(quiz2) + float(quiz3)) / 3.0, 2)

def calculate_attendance_percentage(attended: int, total: int) -> float:
    """Calculates lecture attendance percentage (0 - 100%)."""
    if total <= 0:
        return 0.0
    return round((float(attended) / float(total)) * 100.0, 2)

def calculate_lab_attendance(attended: int, total: int) -> float:
    """Calculates lab attendance percentage (0 - 100%)."""
    if total <= 0:
        return 0.0
    return round((float(attended) / float(total)) * 100.0, 2)

def calculate_assignment_completion(submitted: int, total: int) -> float:
    """Calculates assignment completion percentage (0 - 100%)."""
    if total <= 0:
        return 0.0
    return round((float(submitted) / float(total)) * 100.0, 2)

def calculate_exam_average(midterm: float, final: float) -> float:
    """
    Calculates combined examination percentage.
    Midterm is out of 30, Final is out of 50 (Total = 80 marks).
    Returns normalized 0 - 100% value.
    """
    total_marks = float(midterm) + float(final)
    return round((total_marks / 80.0) * 100.0, 2)

def calculate_learning_score(
    quiz_avg_10: float,
    midterm_30: float,
    final_50: float,
    overall_att_pct: float,
    assignment_pct: float,
    gpa_4: float,
    weights: Dict[str, float] = None
) -> Tuple[float, float, Dict[str, float]]:
    """
    Calculates composite Learning Performance Score (0 - 100) and Difficulty Score (100 - Learning Score).
    Normalizes every dimension to a 0-100 scale before applying configurable weights:
    - Quiz Score (normalized to 100): (quiz_avg / 10) * 100
    - Exam Score (normalized to 100): ((midterm + final) / 80) * 100
    - Attendance Score (normalized to 100): overall_att_pct
    - Assignment Score (normalized to 100): assignment_pct
    - GPA Score (normalized to 100): (previous_gpa / 4.0) * 100
    """
    w = weights or DEFAULT_WEIGHTS

    norm_quiz = min(max((quiz_avg_10 / 10.0) * 100.0, 0.0), 100.0)
    norm_exam = min(max(((midterm_30 + final_50) / 80.0) * 100.0, 0.0), 100.0)
    norm_att = min(max(overall_att_pct, 0.0), 100.0)
    norm_assign = min(max(assignment_pct, 0.0), 100.0)
    norm_gpa = min(max((gpa_4 / 4.0) * 100.0, 0.0), 100.0)

    learning_score = (
        w["quiz"] * norm_quiz +
        w["exam"] * norm_exam +
        w["attendance"] * norm_att +
        w["assignment"] * norm_assign +
        w["gpa"] * norm_gpa
    )
    learning_score = round(min(max(learning_score, 0.0), 100.0), 2)
    difficulty_score = round(100.0 - learning_score, 2)

    components = {
        "norm_quiz": round(norm_quiz, 2),
        "norm_exam": round(norm_exam, 2),
        "norm_att": round(norm_att, 2),
        "norm_assign": round(norm_assign, 2),
        "norm_gpa": round(norm_gpa, 2),
    }

    return learning_score, difficulty_score, components

def detect_learning_difficulty(
    learning_score: float,
    components: Dict[str, float],
    raw_data: Dict[str, Any],
    thresholds: Dict[str, float] = None
) -> Tuple[str, List[str], List[str]]:
    """
    Transparent rule-based learning difficulty classifier with explainable trigger reasons.
    Categories:
    - NORMAL (Learning Score >= 70)
    - MODERATE (50 <= Learning Score < 70)
    - AT_RISK (Learning Score < 50, or critical override rules)

    Critical override:
    - Overall attendance < critical_attendance (e.g. 50%) -> AT_RISK
    - Final exam < critical_final (e.g. 40%) -> AT_RISK
    """
    th = thresholds or DEFAULT_THRESHOLDS
    reasons = []
    weak_indicators = []

    # Check individual dimension deficiencies
    if components["norm_att"] < 60.0:
        reasons.append(f"Low overall attendance ({components['norm_att']}% vs 75% required target)")
        weak_indicators.append("Lecture & Lab Attendance")

    if components["norm_quiz"] < 55.0:
        reasons.append(f"Low quiz comprehension ({components['norm_quiz']}% average across quizzes)")
        weak_indicators.append("Quiz Assessment Performance")

    if components["norm_exam"] < 50.0:
        reasons.append(f"Struggling examination performance ({components['norm_exam']}% across midterm & final)")
        weak_indicators.append("Midterm & Final Examination")

    if components["norm_assign"] < 60.0:
        reasons.append(f"Sub-optimal assignment completion ({components['norm_assign']}%)")
        weak_indicators.append("Assignment Submission Rate")

    if components["norm_gpa"] < 55.0:
        reasons.append(f"Low historical cumulative GPA ({raw_data.get('previous_gpa', 0):.2f}/4.00)")
        weak_indicators.append("Cumulative Prior GPA")

    # Specific lab or lecture checks
    if raw_data.get("lab_attendance_rate", 100) < 50.0:
        reasons.append(f"Low lab practical attendance ({raw_data.get('labs_attended', 0)}/{raw_data.get('total_lab_sessions', 6)} sessions)")
        if "Lab Sessions" not in weak_indicators:
            weak_indicators.append("Lab Sessions")

    # Classification logic
    risk_level = "NORMAL"
    if (
        learning_score < th["moderate"]
        or components["norm_att"] < th["critical_attendance"]
        or (raw_data.get("final_marks", 50) / 50.0 * 100.0) < th["critical_final"]
    ):
        risk_level = "AT_RISK"
        if not reasons:
            reasons.append("Overall composite academic performance falls significantly below passing threshold.")
    elif learning_score < th["normal"]:
        risk_level = "MODERATE"
        if not reasons:
            reasons.append("Academic indicators demonstrate moderate difficulty requiring structured reinforcement.")
    else:
        risk_level = "NORMAL"
        if not reasons:
            reasons.append("Student demonstrates consistent academic progress and solid learning engagement.")

    if not weak_indicators:
        weak_indicators = ["General Review", "Advanced Practice"]

    return risk_level, reasons, weak_indicators

def calculate_comprehensive_risk(
    learning_score: float,
    components: Dict[str, float],
    raw_data: Dict[str, Any],
    thresholds: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Computes a transparent 0-100 Early Risk Score broken down into measurable factor points.
    Factors:
    1. Academic Deficit (up to 35 pts)
    2. Attendance Deficit (up to 25 pts)
    3. Assessment Trend Deficit (up to 15 pts)
    4. Assignment Completion Deficit (up to 15 pts)
    5. Prior GPA Deficit (up to 10 pts)
    """
    th = thresholds or DEFAULT_THRESHOLDS
    factors = []

    # 1. Academic Performance Deficit (35 pts max)
    norm_exam = components.get("norm_exam", 70.0)
    norm_quiz = components.get("norm_quiz", 70.0)
    exam_pts = max(0.0, (75.0 - norm_exam) / 75.0 * 25.0) if norm_exam < 75.0 else 0.0
    quiz_pts = max(0.0, (75.0 - norm_quiz) / 75.0 * 10.0) if norm_quiz < 75.0 else 0.0
    acad_pts = round(min(35.0, exam_pts + quiz_pts), 1)

    if acad_pts > 0:
        sev = "High" if acad_pts >= 20.0 else ("Medium" if acad_pts >= 10.0 else "Low")
        factors.append({
            "factor": "Academic Examination & Quiz Deficit",
            "points": acad_pts,
            "max_points": 35,
            "severity": sev,
            "details": f"Midterm & final exam marks average {norm_exam:.1f}%, quizzes average {norm_quiz:.1f}% (target: 75%)."
        })

    # 2. Attendance Deficit (25 pts max)
    lec_att = raw_data.get("lecture_attendance_rate", components.get("norm_att", 80.0))
    lab_att = raw_data.get("lab_attendance_rate", 80.0)
    lec_pts = max(0.0, (75.0 - lec_att) / 75.0 * 15.0) if lec_att < 75.0 else 0.0
    lab_pts = max(0.0, (80.0 - lab_att) / 80.0 * 10.0) if lab_att < 80.0 else 0.0
    att_pts = round(min(25.0, lec_pts + lab_pts), 1)

    if att_pts > 0:
        sev = "High" if (lec_att < 60.0 or lab_att < 60.0) else "Medium"
        factors.append({
            "factor": "Lecture & Practical Lab Attendance Shortage",
            "points": att_pts,
            "max_points": 25,
            "severity": sev,
            "details": f"Theory lecture attendance {lec_att:.1f}% (req: 75%), Lab attendance {lab_att:.1f}% (req: 80%)."
        })

    # 3. Assessment Trend Deficit (15 pts max)
    q1 = raw_data.get("quiz1_marks", 6.0)
    q3 = raw_data.get("quiz3_marks", 6.0)
    mid = raw_data.get("midterm_marks", 18.0)
    trend_pts = 0.0
    if q3 < q1:
        trend_pts += min(10.0, (q1 - q3) * 2.5)
    if mid < 15.0:  # <50% on 30-mark midterm
        trend_pts += 5.0
    trend_pts = round(min(15.0, trend_pts), 1)

    if trend_pts > 0:
        factors.append({
            "factor": "Declining Assessment Trajectory",
            "points": trend_pts,
            "max_points": 15,
            "severity": "High" if trend_pts >= 10.0 else "Medium",
            "details": f"Quiz 1 was {q1:.1f}/10 while Quiz 3 dropped to {q3:.1f}/10. Midterm secured {mid:.1f}/30."
        })

    # 4. Assignment Completion Deficit (15 pts max)
    assign_rate = raw_data.get("assignment_completion_rate", components.get("norm_assign", 80.0))
    assign_pts = round(max(0.0, (80.0 - assign_rate) / 80.0 * 15.0), 1) if assign_rate < 80.0 else 0.0
    if assign_pts > 0:
        factors.append({
            "factor": "Incomplete Continuous Assignments",
            "points": assign_pts,
            "max_points": 15,
            "severity": "High" if assign_rate < 50.0 else "Medium",
            "details": f"Assignment submission rate is {assign_rate:.1f}% (institutional benchmark: 80%)."
        })

    # 5. Prior GPA Deficit (10 pts max)
    gpa = raw_data.get("previous_gpa", 3.0)
    gpa_pts = round(max(0.0, (3.0 - gpa) / 3.0 * 10.0), 1) if gpa < 3.0 else 0.0
    if gpa_pts > 0:
        factors.append({
            "factor": "Prior Semester Academic Deficit",
            "points": gpa_pts,
            "max_points": 10,
            "severity": "Medium" if gpa < 2.0 else "Low",
            "details": f"Prior cumulative GPA is {gpa:.2f}/4.00."
        })

    raw_total = acad_pts + att_pts + trend_pts + assign_pts + gpa_pts

    # Critical Overrides
    crit_att = raw_data.get("overall_attendance_rate", 100.0) < th.get("critical_attendance", 50.0)
    crit_final = (raw_data.get("final_marks", 50.0) / 50.0 * 100.0) < th.get("critical_final", 40.0)

    if crit_att or crit_final:
        raw_total = max(raw_total, 65.0)

    risk_score = round(min(100.0, max(0.0, raw_total)), 1)

    if risk_score >= 55.0 or crit_att or crit_final:
        risk_level = "AT_RISK"
    elif risk_score >= 30.0:
        risk_level = "MODERATE"
    else:
        risk_level = "NORMAL"

    # Direct actionable recommendation based on highest contributor
    if att_pts >= max(acad_pts, assign_pts, 12.0):
        rec_action = "Prioritize attendance recovery: attend all upcoming theory lectures and schedule makeup lab sessions."
    elif acad_pts >= 18.0:
        rec_action = "Dedicate weekly 2-hour problem-solving blocks to review midterm topics and solve previous exam papers."
    elif trend_pts >= 8.0:
        rec_action = "Target quiz error analysis: take 15-minute diagnostic practice quizzes before the next CIA assessment."
    elif assign_pts >= 8.0:
        rec_action = "Establish Tuesday/Thursday checkpoints to complete problem sets 24 hours prior to deadline."
    else:
        rec_action = "Maintain disciplined study habits and explore advanced concept reinforcement."

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "factors": factors,
        "recommended_action": rec_action,
        "factor_breakdown": {
            "academic_points": acad_pts,
            "attendance_points": att_pts,
            "trend_points": trend_pts,
            "assignment_points": assign_pts,
            "gpa_points": gpa_pts
        }
    }

def generate_recommendations(
    risk_level: str,
    reasons: List[str],
    weak_indicators: List[str],
    raw_data: Dict[str, Any]
) -> List[str]:
    """Generates personalized, actionable recommendations derived directly from student weaknesses."""
    recs = []

    # Attendance recommendation
    att_rate = raw_data.get("overall_attendance_rate", 100.0)
    if att_rate < 75.0:
        recs.append(f"Mandatory Attendance Recovery: Currently at {att_rate:.1f}%. Attend all upcoming lectures and practical labs to surpass the 75% institutional threshold.")

    # Lab specific
    lab_rate = raw_data.get("lab_attendance_rate", 100.0)
    if lab_rate < 60.0:
        recs.append(f"Hands-on Lab Catch-up: Attend faculty office hours for makeup lab sessions ({raw_data.get('labs_attended', 0)}/6 completed).")

    # Quiz performance
    quiz_avg = raw_data.get("quiz_average", 10.0)
    if quiz_avg < 6.0:
        recs.append(f"Quiz Diagnostic Drills: Average quiz score is {quiz_avg:.1f}/10. Practice weekly 15-minute concept quizzes to reinforce retention before major tests.")

    # Exam performance
    final_marks = raw_data.get("final_marks", 50.0)
    midterm_marks = raw_data.get("midterm_marks", 30.0)
    if final_marks < 25.0 or midterm_marks < 15.0:
        recs.append("Examination Preparation Strategy: Dedicate 3 weekly blocks to solving previous examination papers and review core syllabus unit summaries.")

    # Assignment completion
    assign_rate = raw_data.get("assignment_completion_rate", 100.0)
    if assign_rate < 70.0:
        recs.append(f"Assignment Pacing: Current submission rate is {assign_rate:.1f}%. Set Tuesday/Thursday milestones to submit problem sets 24 hours prior to deadline.")

    # General / High risk support
    if risk_level == "AT_RISK":
        recs.append("Academic Advisory Intervention: Schedule a 1-on-1 counseling consultation with the assigned faculty mentor this week.")
    elif risk_level == "MODERATE":
        recs.append("Peer Study Circles: Form or join an active study group to discuss challenging problem sets and clarify lecture doubts.")
    else:
        recs.append("Enrichment & Advanced Topics: Explore extension challenges, research papers, or open source projects to further elevate academic distinction.")

    return recs

def generate_structured_recommendations(
    risk_level: str,
    reasons: List[str],
    weak_indicators: List[str],
    raw_data: Dict[str, Any]
) -> List[Dict[str, str]]:
    """
    Generates structured, prioritized recommendations with Category, Title, Description, and Action.
    Matches Section 6 & 7 of the specification:
    - High / Medium / Low priority badges
    - Derived dynamically from student academic and engagement values
    """
    recs = []

    att_rate = raw_data.get("overall_attendance_rate", 100.0)
    lec_att = raw_data.get("lecture_attendance_rate", 100.0)
    lab_att = raw_data.get("lab_attendance_rate", 100.0)
    quiz_avg = raw_data.get("quiz_average", 10.0)
    final_marks = raw_data.get("final_marks", 50.0)
    midterm_marks = raw_data.get("midterm_marks", 30.0)
    assign_rate = raw_data.get("assignment_completion_rate", 100.0)
    gpa = raw_data.get("previous_gpa", 3.0)

    # 1. Critical Attendance
    if att_rate < 50.0:
        recs.append({
            "priority": "HIGH",
            "category": "Attendance",
            "title": "Critical Attendance Intervention",
            "description": f"Overall attendance is critically low at {att_rate:.1f}%. Institutional minimum is 75% for exam eligibility.",
            "action": "Schedule immediate consultation with academic advisor and commit to 100% presence in remaining sessions."
        })
    elif att_rate < 75.0:
        recs.append({
            "priority": "HIGH" if att_rate < 65.0 else "MEDIUM",
            "category": "Attendance",
            "title": "Improve Lecture & Lab Participation",
            "description": f"Your attendance ({att_rate:.1f}%) is below the recommended threshold. Missing classes directly impairs examination retention.",
            "action": "Maintain regular lecture participation and attend scheduled makeup lab sessions."
        })

    # 2. Lab Specific
    if lab_att < 50.0:
        recs.append({
            "priority": "HIGH",
            "category": "Attendance",
            "title": "Make Up Laboratory Practicals",
            "description": f"Lab completion is at {lab_att:.1f}% ({raw_data.get('labs_attended', 0)}/6 sessions). Practical skills directly impact the final examination.",
            "action": "Request lab instructor signoff for supervised practical makeup hours."
        })

    # 3. Final Examination Risk
    if final_marks < 25.0:
        recs.append({
            "priority": "HIGH",
            "category": "Assessment",
            "title": "Intensive Examination Revision",
            "description": f"Final examination score ({final_marks:.1f}/50) falls into the high-risk zone. Structured revision of foundational units is needed.",
            "action": "Allocate 3 weekly revision blocks solving previous year examination papers and unit summaries."
        })
    elif midterm_marks < 15.0:
        recs.append({
            "priority": "MEDIUM",
            "category": "Assessment",
            "title": "Midterm Exam Diagnostic Review",
            "description": f"Midterm performance ({midterm_marks:.1f}/30) shows conceptual gaps in Units 1 and 2.",
            "action": "Review graded midterm paper with teaching assistants to resolve common errors."
        })

    # 4. Continuous Quizzes
    if quiz_avg < 5.0:
        recs.append({
            "priority": "HIGH",
            "category": "Assessment",
            "title": "Weekly Concept Quiz Drills",
            "description": f"Average quiz score is {quiz_avg:.1f}/10. Concepts require continuous reinforcement rather than last-minute memorization.",
            "action": "Complete weekly 15-minute diagnostic quizzes and review formula cards."
        })
    elif quiz_avg < 7.0:
        recs.append({
            "priority": "MEDIUM",
            "category": "Assessment",
            "title": "Practice Additional Quiz Questions",
            "description": f"Quiz average ({quiz_avg:.1f}/10) indicates room for improvement on algorithmic and numerical problems.",
            "action": "Solve 10 practice problems per module prior to each continuous assessment."
        })

    # 5. Assignments
    if assign_rate < 60.0:
        recs.append({
            "priority": "HIGH" if assign_rate < 40.0 else "MEDIUM",
            "category": "Pacing",
            "title": "Complete Pending Problem Sets",
            "description": f"Assignment submission rate is {assign_rate:.1f}%. Homework builds foundational problem-solving intuition.",
            "action": "Establish Tuesday/Thursday assignment completion checkpoints 24h prior to deadline."
        })

    # 6. Overall Performance / Study Habits
    if risk_level == "AT_RISK":
        recs.append({
            "priority": "HIGH",
            "category": "Advisory",
            "title": "1-on-1 Faculty Mentorship Session",
            "description": "Multi-factor difficulty index indicates multiple converging academic stressors requiring faculty intervention.",
            "action": "Book an office hour slot with your assigned faculty mentor this week."
        })
    elif risk_level == "MODERATE":
        recs.append({
            "priority": "MEDIUM",
            "category": "Study Habit",
            "title": "Engage in Peer Study Circles",
            "description": "Collaborative discussion on difficult units strengthens conceptual mastery and accountability.",
            "action": "Form or join a study group of 3-4 classmates to tackle complex unit problem sets."
        })
    else:
        # High performers / Normal
        recs.append({
            "priority": "LOW",
            "category": "Study Habit",
            "title": "Maintain Your Current Study Routine",
            "description": "Your current academic performance and attendance are consistent. Continue your disciplined study schedule.",
            "action": "Maintain weekly pacing and explore advanced enrichment challenge problems."
        })
        if gpa >= 3.5:
            recs.append({
                "priority": "LOW",
                "category": "Advisory",
                "title": "Explore Advanced Honors & Research Topics",
                "description": "Strong cumulative GPA (>= 3.50). Consider faculty-led research projects or honors coursework.",
                "action": "Speak with department chair about undergraduate research opportunities."
            })

    return recs

def generate_study_plan(
    student_id: int,
    student_name: str,
    risk_level: str,
    weak_indicators: List[str],
    components: Dict[str, float]
) -> Dict[str, Any]:
    """
    Synthesizes a personalized 7-day study plan tailored to the student's diagnosed weak indicators.
    Tailors each day's focus depending on whether Quiz, Exam, Attendance/Labs, or Assignments are weak.
    """
    weakest_primary = weak_indicators[0] if len(weak_indicators) > 0 else "Academic Review"
    weakest_secondary = weak_indicators[1] if len(weak_indicators) > 1 else "Concept Reinforcement"

    target_boost = 20.0 if risk_level == "AT_RISK" else (12.0 if risk_level == "MODERATE" else 6.0)

    # Schedule items
    days = [
        ("Monday", "5:00 PM - 6:30 PM", 1.5, f"Core Diagnosis & {weakest_primary}", f"Review past quiz and assessment mistakes targeting {weakest_primary}. Create flashcards and summary notes."),
        ("Tuesday", "5:30 PM - 7:00 PM", 1.5, f"Practical Drills & Problem Solving", "Solve 10 targeted practice problems and complete any pending assignment milestones."),
        ("Wednesday", "6:00 PM - 7:30 PM", 1.5, f"Deep Concept Reinforcement ({weakest_secondary})", f"Deep dive into reference readings and textbook chapters addressing {weakest_secondary}."),
        ("Thursday", "5:00 PM - 6:45 PM", 1.75, "Faculty Consultation & Doubt Clearing", "Meet faculty during office hours or post questions in the academic forum for unresolved concepts."),
        ("Friday", "4:30 PM - 6:00 PM", 1.5, "Self-Assessment Mock Quiz", "Timed 30-minute practice quiz followed by detailed error analysis and formula sheet review."),
        ("Saturday", "10:00 AM - 12:30 PM", 2.5, "Comprehensive Exam Preparation", "Full mock exam module under timed conditions simulating midterm and final test formats."),
        ("Sunday", "4:00 PM - 5:15 PM", 1.25, "Weekly Review & Milestone Planning", "Review weekly completed tasks, update progress tracker, and organize notebook for the upcoming week."),
    ]

    items = []
    for day, time_slot, hrs, focus, desc in days:
        items.append({
            "day_of_week": day,
            "time_slot": time_slot,
            "estimated_hours": hrs,
            "focus_area": focus,
            "activity_description": desc,
            "is_completed": False
        })

    return {
        "student_id": student_id,
        "title": f"Personalized 7-Day Recovery Plan — {student_name}",
        "focus_summary": f"Prioritized intervention targeting {weakest_primary} and {weakest_secondary}. Designed to achieve +{target_boost}% score improvement.",
        "target_score_improvement": target_boost,
        "items": items
    }
