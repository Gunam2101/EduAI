from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Token & Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    email: str
    student_id: Optional[int] = None
    faculty_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    student_id: Optional[int] = None
    faculty_id: Optional[int] = None

    class Config:
        from_attributes = True

# Metrics & Difficulty
class LearningMetricBase(BaseModel):
    quiz1_marks: float
    quiz2_marks: float
    quiz3_marks: float
    quiz_average: float
    total_assignments: int
    assignments_submitted: int
    assignment_completion_rate: float
    midterm_marks: float
    final_marks: float
    exam_average: float
    previous_gpa: float
    total_lectures: int
    lectures_attended: int
    lecture_attendance_rate: float
    total_lab_sessions: int
    labs_attended: int
    lab_attendance_rate: float
    overall_attendance_rate: float
    learning_performance_score: float

    class Config:
        from_attributes = True

class DifficultyResultBase(BaseModel):
    difficulty_score: float
    risk_level: str
    ml_cluster: int
    reasons: List[str]
    weak_indicators: List[str]
    calculated_at: datetime

    class Config:
        from_attributes = True

# Study Plan
class StudyPlanItemBase(BaseModel):
    id: Optional[int] = None
    day_of_week: str
    time_slot: str
    focus_area: str
    activity_description: str
    estimated_hours: float
    is_completed: bool = False

    class Config:
        from_attributes = True

class StudyPlanBase(BaseModel):
    id: Optional[int] = None
    student_id: int
    title: str
    focus_summary: str
    target_score_improvement: float
    items: List[StudyPlanItemBase] = []

    class Config:
        from_attributes = True

# Student
class StudentListItem(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    department: Optional[str] = "Artificial Intelligence & Data Science"
    year: Optional[str] = "3rd Year"
    semester: Optional[str] = "Semester VI"
    section: Optional[str] = "Section A"
    register_no: Optional[str] = None
    quiz_average: float
    midterm_marks: float
    final_marks: float
    previous_gpa: float
    overall_attendance_rate: float
    assignment_completion_rate: float
    learning_performance_score: float
    difficulty_score: float
    risk_level: str

class StudentDetail(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    department: Optional[str] = "Artificial Intelligence & Data Science"
    year: Optional[str] = "3rd Year"
    semester: Optional[str] = "Semester VI"
    section: Optional[str] = "Section A"
    register_no: Optional[str] = None
    metrics: LearningMetricBase
    difficulty: DifficultyResultBase
    study_plan: Optional[StudyPlanBase] = None
    recommendations: List[str] = []

    class Config:
        from_attributes = True

# Alerts
class AlertBase(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    priority: str  # HIGH, MEDIUM, LOW
    title: str
    message: str
    trigger_reason: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Faculty
class FacultyBase(BaseModel):
    id: int
    name: str
    email: str
    department: str
    designation: str
    assigned_students_count: int

    class Config:
        from_attributes = True

# Curriculum / Subjects
class TopicBase(BaseModel):
    id: Optional[int] = None
    subject_id: int
    unit_number: int
    name: str
    difficulty_level: str
    recommended_hours: float

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    id: Optional[int] = None
    code: str
    name: str
    credits: int
    description: Optional[str] = None
    topics: List[TopicBase] = []

    class Config:
        from_attributes = True

# Analytics Overview
class AnalyticsOverview(BaseModel):
    total_students: int
    total_faculty: int
    total_subjects: int
    students_at_risk: int
    students_moderate: int
    students_normal: int
    average_performance_score: float
    average_attendance_rate: float
    average_quiz_score: float
    average_midterm: float
    average_final: float
    average_gpa: float
    status_distribution: Dict[str, int]
    gender_distribution: Dict[str, int]
    quiz_distribution: List[Dict[str, Any]]
    exam_distribution: List[Dict[str, Any]]
    attendance_distribution: List[Dict[str, Any]]
    gpa_distribution: List[Dict[str, Any]]

# Configuration / Settings
class ScoringSettings(BaseModel):
    quiz_weight: float = 0.20
    exam_weight: float = 0.35
    attendance_weight: float = 0.20
    assignment_weight: float = 0.15
    gpa_weight: float = 0.10
    normal_threshold: float = 70.0
    moderate_threshold: float = 50.0
    critical_attendance_threshold: float = 50.0
    critical_final_threshold: float = 40.0
