from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'Admin', 'Faculty', 'Student'
    name = Column(String(120), nullable=False)
    student_id = Column(Integer, nullable=True)  # link if Student
    faculty_id = Column(Integer, nullable=True)  # link if Faculty
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)  # maps to student_id from CSV
    name = Column(String(120), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    metrics = relationship("LearningMetric", back_populates="student", uselist=False, cascade="all, delete-orphan")
    difficulty = relationship("DifficultyResult", back_populates="student", uselist=False, cascade="all, delete-orphan")
    study_plan = relationship("StudyPlan", back_populates="student", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="student", cascade="all, delete-orphan")
    progress_records = relationship("ProgressRecord", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("FacultyIntervention", back_populates="student", cascade="all, delete-orphan")

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    department = Column(String(100), default="Computer Science & Engineering")
    designation = Column(String(100), default="Assistant Professor")
    assigned_students_count = Column(Integer, default=50)

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), unique=True, nullable=False)
    name = Column(String(150), nullable=False)
    credits = Column(Integer, default=4)
    description = Column(Text, nullable=True)

    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    unit_number = Column(Integer, default=1)
    name = Column(String(150), nullable=False)
    difficulty_level = Column(String(50), default="Intermediate")  # Easy, Intermediate, Hard
    recommended_hours = Column(Float, default=3.0)

    subject = relationship("Subject", back_populates="topics")
    assessments = relationship("Assessment", back_populates="topic")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    title = Column(String(150), nullable=False)
    assessment_type = Column(String(50), nullable=False)  # Quiz, Midterm, Final, Assignment
    max_marks = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="assessments")

class LearningMetric(Base):
    __tablename__ = "learning_metrics"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    quiz1_marks = Column(Float, default=0.0)
    quiz2_marks = Column(Float, default=0.0)
    quiz3_marks = Column(Float, default=0.0)
    quiz_average = Column(Float, default=0.0)
    total_assignments = Column(Integer, default=5)
    assignments_submitted = Column(Integer, default=0)
    assignment_completion_rate = Column(Float, default=0.0)
    midterm_marks = Column(Float, default=0.0)
    final_marks = Column(Float, default=0.0)
    exam_average = Column(Float, default=0.0)
    previous_gpa = Column(Float, default=0.0)
    total_lectures = Column(Integer, default=12)
    lectures_attended = Column(Integer, default=0)
    lecture_attendance_rate = Column(Float, default=0.0)
    total_lab_sessions = Column(Integer, default=6)
    labs_attended = Column(Integer, default=0)
    lab_attendance_rate = Column(Float, default=0.0)
    overall_attendance_rate = Column(Float, default=0.0)
    learning_performance_score = Column(Float, default=0.0)

    student = relationship("Student", back_populates="metrics")

class DifficultyResult(Base):
    __tablename__ = "difficulty_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    difficulty_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String(50), nullable=False)    # 'NORMAL', 'MODERATE', 'AT_RISK'
    ml_cluster = Column(Integer, default=0)
    reasons = Column(Text, nullable=False)             # JSON list or pipe-separated reasons
    weak_indicators = Column(Text, nullable=False)     # Top weak areas
    calculated_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="difficulty")

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    title = Column(String(150), default="Personalized Weekly Academic Recovery Plan")
    focus_summary = Column(Text, nullable=False)
    target_score_improvement = Column(Float, default=15.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="study_plan")
    items = relationship("StudyPlanItem", back_populates="study_plan", cascade="all, delete-orphan")

class StudyPlanItem(Base):
    __tablename__ = "study_plan_items"

    id = Column(Integer, primary_key=True, index=True)
    study_plan_id = Column(Integer, ForeignKey("study_plans.id"), nullable=False)
    day_of_week = Column(String(20), nullable=False)  # Monday, Tuesday, ...
    time_slot = Column(String(50), default="5:00 PM - 6:30 PM")
    focus_area = Column(String(100), nullable=False)
    activity_description = Column(Text, nullable=False)
    estimated_hours = Column(Float, default=1.5)
    is_completed = Column(Boolean, default=False)

    study_plan = relationship("StudyPlan", back_populates="items")

class ProgressRecord(Base):
    __tablename__ = "progress_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    week_number = Column(Integer, default=1)
    performance_score = Column(Float, nullable=False)
    attendance_rate = Column(Float, nullable=False)
    quiz_average = Column(Float, nullable=False)
    assignment_rate = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="progress_records")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    priority = Column(String(20), nullable=False)  # HIGH, MEDIUM, LOW
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    trigger_reason = Column(String(200), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="alerts")

class FacultyIntervention(Base):
    __tablename__ = "faculty_interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    faculty_name = Column(String(120), default="Dr. S. Rangarajan")
    title = Column(String(150), nullable=False)
    intervention_type = Column(String(80), nullable=False)  # Remedial Coaching, Counseling, Parent Consultation, Peer Mentorship, Attendance Warning
    action_plan = Column(Text, nullable=False)
    target_date = Column(String(50), nullable=False)
    status = Column(String(50), default="Active")  # Active, In Progress, Completed
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="interventions")
