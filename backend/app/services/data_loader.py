import os
import json
import logging
import pandas as pd
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database.models import (
    Student, LearningMetric, DifficultyResult, StudyPlan, StudyPlanItem,
    Alert, User, Faculty, Subject, Topic, Assessment
)
from app.services.difficulty_engine import (
    calculate_quiz_average, calculate_attendance_percentage,
    calculate_lab_attendance, calculate_assignment_completion,
    calculate_exam_average, calculate_learning_score,
    detect_learning_difficulty, generate_recommendations,
    generate_study_plan
)
from app.ml.ml_model import ml_pipeline
from app.services.indian_academic_context import (
    INDIAN_STUDENT_NAMES, get_indian_student_name, INDIAN_SUBJECTS_CATALOG
)

logger = logging.getLogger("EduAI.DataLoader")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

REQUIRED_COLUMNS = [
    "student_id",
    "name",
    "age",
    "gender",
    "quiz1_marks",
    "quiz2_marks",
    "quiz3_marks",
    "total_assignments",
    "assignments_submitted",
    "midterm_marks",
    "final_marks",
    "previous_gpa",
    "total_lectures",
    "lectures_attended",
    "total_lab_sessions",
    "labs_attended"
]

DEFAULT_CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "dataset",
    "student_dropout_behavior_dataset.csv"
)

def validate_dataset_columns(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """Validates that all required columns are present in the dataframe."""
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        return False, missing
    return True, []

def clean_and_impute_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw student dataset and handles missing values.
    Specifically:
    - 'assignments_submitted' in the raw dataset has nulls across rows.
      We impute it based on student lecture engagement:
      assignments_submitted = round((lectures_attended / total_lectures) * total_assignments)
      clipped to [0, total_assignments].
    - Fills any unexpected NaN numeric values with safe defaults.
    """
    df = df.copy()

    # If assignments_submitted is null or empty, impute realistically from lecture engagement
    if df["assignments_submitted"].isnull().all() or df["assignments_submitted"].isnull().any():
        logger.info("Imputing missing 'assignments_submitted' from student lecture attendance ratio.")
        computed_submissions = (
            (df["lectures_attended"] / df["total_lectures"].replace(0, 1)) * df["total_assignments"]
        ).round()
        df["assignments_submitted"] = df["assignments_submitted"].fillna(computed_submissions)
        df["assignments_submitted"] = df["assignments_submitted"].clip(lower=0, upper=df["total_assignments"]).astype(int)

    # Clean numeric fields
    numeric_cols = [
        "age", "quiz1_marks", "quiz2_marks", "quiz3_marks",
        "total_assignments", "assignments_submitted",
        "midterm_marks", "final_marks", "previous_gpa",
        "total_lectures", "lectures_attended",
        "total_lab_sessions", "labs_attended"
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    return df

def seed_default_users_and_faculty(db: Session):
    """Ensures Indian Engineering College Demo accounts, faculty records, and 12 subjects exist."""
    # 1. Indian Users
    admin_user = db.query(User).filter_by(email="admin@ps52.edu").first()
    if not admin_user:
        db.add(User(
            email="admin@ps52.edu",
            hashed_password=pwd_context.hash("admin123"),
            role="Admin",
            name="Dr. K. Ramanathan (Dean - Academic Affairs)"
        ))
    else:
        admin_user.name = "Dr. K. Ramanathan (Dean - Academic Affairs)"

    fac_user = db.query(User).filter_by(email="faculty@ps52.edu").first()
    if not fac_user:
        db.add(User(
            email="faculty@ps52.edu",
            hashed_password=pwd_context.hash("faculty123"),
            role="Faculty",
            name="Dr. S. Rangarajan (Associate Professor)",
            faculty_id=1
        ))
    else:
        fac_user.name = "Dr. S. Rangarajan (Associate Professor)"

    student_user = db.query(User).filter_by(email="student@ps52.edu").first()
    if not student_user:
        db.add(User(
            email="student@ps52.edu",
            hashed_password=pwd_context.hash("student123"),
            role="Student",
            name="Arjun Kumar",
            student_id=1
        ))
    else:
        student_user.name = "Arjun Kumar"
    db.commit()

    # 2. Indian Faculty
    indian_faculties = [
        {"id": 1, "name": "Dr. S. Rangarajan", "email": "faculty@ps52.edu", "department": "Artificial Intelligence & Data Science", "designation": "Associate Professor & Mentor", "assigned": 60},
        {"id": 2, "name": "Dr. Meenakshi Sundaram", "email": "msundaram@ps52.edu", "department": "Computer Science & Engineering", "designation": "Professor & Head", "assigned": 60},
        {"id": 3, "name": "Prof. Rajeshwari Krishnan", "email": "rkrishnan@ps52.edu", "department": "Information Technology", "designation": "Associate Professor", "assigned": 60},
        {"id": 4, "name": "Dr. Venkatraman Iyer", "email": "viyer@ps52.edu", "department": "Applied Mathematics & Computing", "designation": "Professor", "assigned": 60},
        {"id": 5, "name": "Dr. Suresh Chandran", "email": "schandran@ps52.edu", "department": "Software Systems & Networking", "designation": "Assistant Professor", "assigned": 60},
    ]

    for f_info in indian_faculties:
        fac = db.query(Faculty).filter(Faculty.id == f_info["id"]).first()
        if not fac:
            db.add(Faculty(
                id=f_info["id"],
                name=f_info["name"],
                email=f_info["email"],
                department=f_info["department"],
                designation=f_info["designation"],
                assigned_students_count=f_info["assigned"]
            ))
        else:
            fac.name = f_info["name"]
            fac.department = f_info["department"]
            fac.designation = f_info["designation"]
    db.commit()

    # 3. Seed 12 Indian Engineering Subjects and exact Topics
    existing_subjects_count = db.query(Subject).count()
    if existing_subjects_count < 12:
        # Clear legacy placeholder subjects
        db.query(Topic).delete()
        db.query(Subject).delete()
        db.commit()

        for s_data in INDIAN_SUBJECTS_CATALOG:
            sub = Subject(
                code=s_data["code"],
                name=s_data["name"],
                credits=s_data["credits"],
                description=s_data["description"]
            )
            db.add(sub)
            db.flush()

            for t_data in s_data["topics"]:
                db.add(Topic(
                    subject_id=sub.id,
                    unit_number=t_data["unit"],
                    name=t_data["name"],
                    difficulty_level=t_data["level"],
                    recommended_hours=t_data["hours"]
                ))
        db.commit()
        logger.info(f"Seeded {len(INDIAN_SUBJECTS_CATALOG)} Indian Engineering subjects and all topics.")

def load_and_initialize_dataset(db: Session, csv_path: str = None) -> Dict[str, Any]:
    """
    Main ingestion engine:
    1. Reads CSV
    2. Validates schema
    3. Cleans and imputes
    4. Computes derived metrics (quiz avg, exam avg, attendance rates, learning scores)
    5. Computes difficulty classification and explainable reasons
    6. Generates personalized study plans and early warning alerts
    7. Fits Scikit-learn ML pipeline
    8. Persists to database
    """
    path = csv_path or DEFAULT_CSV_PATH
    if not os.path.exists(path):
        # Fallback to local search
        alt_paths = [
            "dataset/student_dropout_behavior_dataset.csv",
            "../dataset/student_dropout_behavior_dataset.csv",
            os.path.join(os.getcwd(), "dataset", "student_dropout_behavior_dataset.csv")
        ]
        for ap in alt_paths:
            if os.path.exists(ap):
                path = ap
                break

    if not os.path.exists(path):
        raise FileNotFoundError(f"Primary student dataset not found at {path}")

    logger.info(f"Loading student dataset from {path}")
    df_raw = pd.read_csv(path)

    # 1. Validate columns
    is_valid, missing = validate_dataset_columns(df_raw)
    if not is_valid:
        raise ValueError(f"Dataset validation failed. Missing required columns: {missing}")

    # 2. Clean & Impute
    df = clean_and_impute_dataset(df_raw)

    # 3. Ensure users/faculty/curricula
    seed_default_users_and_faculty(db)

    # 4. Check if student data already populated in database
    existing_count = db.query(Student).count()
    if existing_count >= len(df):
        logger.info(f"Database already populated with {existing_count} students. Syncing Indian names and curricula...")
        # Ensure all existing students have authentic Indian names
        for s in db.query(Student).all():
            s.name = get_indian_student_name(s.id)
        db.commit()

        # Ensure ML pipeline is fitted with current DB data
        records = []
        target_labels = []
        for s in db.query(Student).all():
            m = s.metrics
            d = s.difficulty
            if m and d:
                records.append({
                    "quiz_average": m.quiz_average,
                    "midterm_marks": m.midterm_marks,
                    "final_marks": m.final_marks,
                    "previous_gpa": m.previous_gpa,
                    "lecture_attendance_rate": m.lecture_attendance_rate,
                    "lab_attendance_rate": m.lab_attendance_rate,
                    "assignment_completion_rate": m.assignment_completion_rate,
                })
                target_labels.append(d.risk_level)
        if records:
            ml_pipeline.fit(pd.DataFrame(records), target_labels)
        return {"status": "success", "total_students": existing_count, "reloaded": False}

    logger.info(f"Populating database with {len(df)} student records from CSV with Indian names...")

    # Clear previous student records if re-importing
    db.query(Alert).delete()
    db.query(StudyPlanItem).delete()
    db.query(StudyPlan).delete()
    db.query(DifficultyResult).delete()
    db.query(LearningMetric).delete()
    db.query(Student).delete()
    db.commit()

    student_objects = []
    metric_objects = []
    difficulty_objects = []
    study_plan_objects = []
    alert_objects = []

    ml_training_records = []
    ml_target_labels = []

    for _, row in df.iterrows():
        sid = int(row["student_id"])
        s_name = get_indian_student_name(sid)
        s_age = int(row["age"])
        s_gender = str(row["gender"]).strip()

        # Metric calculations using backend reusable functions
        q1 = float(row["quiz1_marks"])
        q2 = float(row["quiz2_marks"])
        q3 = float(row["quiz3_marks"])
        q_avg = calculate_quiz_average(q1, q2, q3)

        tot_assign = int(row["total_assignments"])
        sub_assign = int(row["assignments_submitted"])
        assign_rate = calculate_assignment_completion(sub_assign, tot_assign)

        midterm = float(row["midterm_marks"])
        final = float(row["final_marks"])
        exam_avg = calculate_exam_average(midterm, final)

        gpa = float(row["previous_gpa"])

        tot_lectures = int(row["total_lectures"])
        att_lectures = int(row["lectures_attended"])
        lec_rate = calculate_attendance_percentage(att_lectures, tot_lectures)

        tot_labs = int(row["total_lab_sessions"])
        att_labs = int(row["labs_attended"])
        lab_rate = calculate_lab_attendance(att_labs, tot_labs)

        # Overall attendance rate (lectures + labs)
        total_sessions = tot_lectures + tot_labs
        attended_sessions = att_lectures + att_labs
        overall_att_rate = calculate_attendance_percentage(attended_sessions, total_sessions)

        # Performance and Difficulty score calculation
        learning_score, diff_score, components = calculate_learning_score(
            quiz_avg_10=q_avg,
            midterm_30=midterm,
            final_50=final,
            overall_att_pct=overall_att_rate,
            assignment_pct=assign_rate,
            gpa_4=gpa
        )

        raw_student_summary = {
            "previous_gpa": gpa,
            "overall_attendance_rate": overall_att_rate,
            "lecture_attendance_rate": lec_rate,
            "lab_attendance_rate": lab_rate,
            "labs_attended": att_labs,
            "total_lab_sessions": tot_labs,
            "quiz_average": q_avg,
            "midterm_marks": midterm,
            "final_marks": final,
            "assignment_completion_rate": assign_rate,
        }

        # Rule-based difficulty detection with explainability
        risk_level, reasons, weak_indicators = detect_learning_difficulty(
            learning_score=learning_score,
            components=components,
            raw_data=raw_student_summary
        )

        # Append to ML training data
        ml_training_records.append({
            "quiz_average": q_avg,
            "midterm_marks": midterm,
            "final_marks": final,
            "previous_gpa": gpa,
            "lecture_attendance_rate": lec_rate,
            "lab_attendance_rate": lab_rate,
            "assignment_completion_rate": assign_rate,
        })
        ml_target_labels.append(risk_level)

        # 1. Student model
        student_objects.append(Student(id=sid, name=s_name, age=s_age, gender=s_gender))

        # 2. Learning Metric model
        metric_objects.append(LearningMetric(
            student_id=sid,
            quiz1_marks=q1,
            quiz2_marks=q2,
            quiz3_marks=q3,
            quiz_average=q_avg,
            total_assignments=tot_assign,
            assignments_submitted=sub_assign,
            assignment_completion_rate=assign_rate,
            midterm_marks=midterm,
            final_marks=final,
            exam_average=exam_avg,
            previous_gpa=gpa,
            total_lectures=tot_lectures,
            lectures_attended=att_lectures,
            lecture_attendance_rate=lec_rate,
            total_lab_sessions=tot_labs,
            labs_attended=att_labs,
            lab_attendance_rate=lab_rate,
            overall_attendance_rate=overall_att_rate,
            learning_performance_score=learning_score
        ))

        # 3. Difficulty Result model
        difficulty_objects.append(DifficultyResult(
            student_id=sid,
            difficulty_score=diff_score,
            risk_level=risk_level,
            ml_cluster=0,
            reasons=json.dumps(reasons),
            weak_indicators=json.dumps(weak_indicators)
        ))

        # 4. Personalized Study Plan model
        sp_data = generate_study_plan(
            student_id=sid,
            student_name=s_name,
            risk_level=risk_level,
            weak_indicators=weak_indicators,
            components=components
        )
        plan_obj = StudyPlan(
            student_id=sid,
            title=sp_data["title"],
            focus_summary=sp_data["focus_summary"],
            target_score_improvement=sp_data["target_score_improvement"]
        )
        study_plan_objects.append((plan_obj, sp_data["items"]))

        # 5. Early Warning Alerts for Struggling Students
        if risk_level == "AT_RISK":
            alert_objects.append(Alert(
                student_id=sid,
                priority="HIGH",
                title=f"Critical Academic Intervention Required — {s_name}",
                message=f"Student has low performance score ({learning_score:.1f}/100) and elevated difficulty ({diff_score:.1f}/100).",
                trigger_reason="; ".join(reasons[:2])
            ))
        elif risk_level == "MODERATE":
            if assign_rate < 60.0 or q_avg < 5.5:
                alert_objects.append(Alert(
                    student_id=sid,
                    priority="MEDIUM",
                    title=f"Academic Warning — {s_name}",
                    message=f"Moderate difficulty flagged. Monitor upcoming assignment milestones and quiz reviews.",
                    trigger_reason="; ".join(reasons[:2])
                ))

    # Commit all students
    db.add_all(student_objects)
    db.commit()

    db.add_all(metric_objects)
    db.add_all(difficulty_objects)
    db.commit()

    for plan_obj, items in study_plan_objects:
        db.add(plan_obj)
        db.flush()
        for item in items:
            db.add(StudyPlanItem(
                study_plan_id=plan_obj.id,
                day_of_week=item["day_of_week"],
                time_slot=item["time_slot"],
                focus_area=item["focus_area"],
                activity_description=item["activity_description"],
                estimated_hours=item["estimated_hours"],
                is_completed=item["is_completed"]
            ))
    db.commit()

    db.add_all(alert_objects)
    db.commit()

    # Fit Scikit-learn ML pipeline
    df_ml = pd.DataFrame(ml_training_records)
    ml_pipeline.fit(df_ml, ml_target_labels)

    # Update clusters in DB
    for s in db.query(Student).all():
        m = s.metrics
        feat = {
            "quiz_average": m.quiz_average,
            "midterm_marks": m.midterm_marks,
            "final_marks": m.final_marks,
            "previous_gpa": m.previous_gpa,
            "lecture_attendance_rate": m.lecture_attendance_rate,
            "lab_attendance_rate": m.lab_attendance_rate,
            "assignment_completion_rate": m.assignment_completion_rate,
        }
        cluster_id = ml_pipeline.predict_cluster(feat)
        if s.difficulty:
            s.difficulty.ml_cluster = cluster_id
    db.commit()

    logger.info("Successfully ingested 300 student records, computed metrics, and fitted ML model.")
    return {"status": "success", "total_students": len(df), "reloaded": True}
