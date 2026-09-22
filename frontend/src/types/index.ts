export type Role = 'Admin' | 'Faculty' | 'Student'

export type RiskLevel = 'NORMAL' | 'MODERATE' | 'AT_RISK'

export interface User {
  id: number
  email: string
  name: string
  role: Role
  student_id?: number
  faculty_id?: number
}

export interface StudentListItem {
  id: number
  name: string
  age: number
  gender: string
  roll_number?: string
  register_no?: string
  department?: string
  year?: string
  semester?: string
  section?: string
  quiz_average: number
  midterm_marks: number
  final_marks: number
  previous_gpa: number
  overall_attendance_rate: number
  assignment_completion_rate: number
  learning_performance_score: number
  difficulty_score: number
  risk_level: RiskLevel
}

export interface LearningMetric {
  quiz1_marks: number
  quiz2_marks: number
  quiz3_marks: number
  quiz_average: number
  total_assignments: number
  assignments_submitted: number
  assignment_completion_rate: number
  midterm_marks: number
  final_marks: number
  exam_average: number
  previous_gpa: number
  total_lectures: number
  lectures_attended: number
  lecture_attendance_rate: number
  total_lab_sessions: number
  labs_attended: number
  lab_attendance_rate: number
  overall_attendance_rate: number
  learning_performance_score: number
}

export interface DifficultyResult {
  difficulty_score: number
  risk_level: RiskLevel
  ml_cluster: number
  reasons: string[]
  weak_indicators: string[]
  calculated_at: string
}

export type RecommendationPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface StructuredRecommendation {
  priority: RecommendationPriority
  category: string
  title: string
  description: string
  action: string
}

export interface SystemRecommendation {
  priority: RecommendationPriority
  category: string
  title: string
  description: string
  impact_count: number
  action: string
}

export interface FacultyCohortRecommendation {
  priority: RecommendationPriority
  category: string
  title: string
  description: string
  student_count: number
  action: string
}

export interface StudyPlanItem {
  id: number
  day_of_week: string
  time_slot: string
  focus_area: string
  activity_description: string
  estimated_hours: number
  is_completed: boolean
}

export interface StudyPlan {
  id: number
  student_id: number
  student_name?: string
  risk_level?: RiskLevel
  title: string
  focus_summary: string
  target_score_improvement: number
  total_items?: number
  completed_items?: number
  completion_percentage?: number
  items: StudyPlanItem[]
}

export interface StudentDetail {
  id: number
  name: string
  age: number
  gender: string
  roll_number?: string
  register_no?: string
  department?: string
  year?: string
  semester?: string
  section?: string
  regulation?: string
  metrics: LearningMetric
  difficulty: DifficultyResult
  study_plan?: StudyPlan
  recommendations: string[]
}

export interface RoadmapStep {
  step_number: number
  stage: string
  title: string
  subject: string
  topics: string[]
  learning_activity: string
  estimated_effort: string
  status: 'COMPLETED' | 'CURRENT' | 'NOT_STARTED'
  progress: number
  action_type: 'review' | 'practice' | 'quiz' | 'eval'
  action_label: string
  recommendation_tip?: string
}

export interface PracticeQuestion {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface StudentRoadmap {
  student_id: number
  student_name: string
  department: string
  year: string
  semester: string
  section: string
  register_no: string
  regulation: string
  learning_score: number
  risk_level: RiskLevel
  status_label: string
  primary_weak_subject: string
  secondary_weak_subject: string
  focus_summary: string
  overall_progress_percentage: number
  current_step: RoadmapStep
  next_step_title: string
  next_step_action: string
  steps: RoadmapStep[]
  practice_questions: PracticeQuestion[]
}

export interface Alert {
  id: number
  student_id: number
  student_name?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  message: string
  trigger_reason: string
  is_read: boolean
  created_at: string
}

export interface FacultyMember {
  id: number
  name: string
  email: string
  department: string
  designation: string
  assigned_students_count: number
  active_courses: string[]
  office_hours: string
}

export interface SubjectTopic {
  id: number
  subject_id: number
  unit_number: number
  name: string
  difficulty_level: string
  recommended_hours: number
  assessments_count: number
}

export interface Subject {
  id: number
  code: string
  name: string
  credits: number
  description?: string
  topics_count: number
  topics: SubjectTopic[]
}

export interface AnalyticsKPIs {
  total_students: number
  total_faculty: number
  total_subjects: number
  students_needing_attention: number
  students_at_risk: number
  students_moderate: number
  students_normal: number
  at_risk_percentage: number
  average_performance: number
  average_attendance: number
  average_quiz: number
  average_midterm: number
  average_final: number
  average_gpa: number
  average_assignment_completion: number
}

export interface AnalyticsOverview {
  kpis: AnalyticsKPIs
  status_distribution: { name: string; value: number; color: string }[]
  quiz_trends: { quiz: string; average: number; maxMarks: number }[]
  exam_comparison: { name: string; average: number; maxMarks: number; pct: number }[]
  attendance_types: { type: string; rate: number; sessions: number }[]
  gpa_buckets: { bracket: string; count: number }[]
  gender_breakdown: { Male: number; Female: number }
}

export interface PredictionResult {
  student_id: number
  predicted_score: number
  trajectory_status: 'Improving' | 'Stable' | 'Declining'
  confidence_percentage: number
  score_interval: {
    lower_bound: number
    upper_bound: number
  }
  historical_scores: {
    quiz_average_pct: number
    midterm_marks: number
    final_marks: number
    previous_gpa_pct: number
    attendance_rate: number
    assignment_rate: number
  }
  r2_score: number
  feature_importances: Record<string, number>
}

export interface RiskFactorItem {
  factor: string
  score: number
  max_score: number
  contribution_pct: number
  status: 'Critical' | 'Warning' | 'Healthy'
  description: string
}

export interface RiskAnalysis {
  student_id: number
  risk_score: number
  risk_level: RiskLevel
  status_label: string
  breakdown: Record<string, number>
  factors: RiskFactorItem[]
  reasons: string[]
  weak_indicators: string[]
  confidence_score: number
}

export interface TopicAnalysisItem {
  subject_code: string
  subject_name: string
  topic_name: string
  topic_score: number
  category: 'Weak' | 'Moderate' | 'Strong'
  priority_level: 'HIGH' | 'MEDIUM' | 'LOW'
  priority_score: number
  urgency_label: string
  reasons: string[]
  recommended_actions: string[]
}

export interface TopicAnalysisResult {
  student_id: number
  total_analyzed: number
  weak_count: number
  moderate_count: number
  strong_count: number
  topics: TopicAnalysisItem[]
  top_weak_topics: TopicAnalysisItem[]
}

export interface AIExplanation {
  student_id: number
  risk_level: RiskLevel
  risk_score: number
  prediction: {
    predicted_score: number
    trajectory_status: string
    confidence_percentage: number
  }
  risk_explanation: string
  prediction_explanation: string
  topic_priority_explanation: string
  next_best_actions: string[]
}

export interface AdaptiveTaskItem {
  id: string
  day_of_week: string
  time_slot: string
  focus_area: string
  topic_name: string
  activity_description: string
  action_type: 'concept_review' | 'practice_problems' | 'quiz_prep' | 'lab_remedy' | 'consolidation'
  estimated_hours: number
  priority_level: 'HIGH' | 'MEDIUM' | 'LOW'
  is_completed: boolean
}

export interface AdaptiveStudyPlan {
  student_id: number
  student_name: string
  risk_level: RiskLevel
  risk_score: number
  target_score_improvement: number
  focus_summary: string
  total_tasks: number
  completed_tasks: number
  completion_rate: number
  urgency_message: string
  todays_tasks: AdaptiveTaskItem[]
  schedule: AdaptiveTaskItem[]
}

export interface StudentTrendAnalysis {
  student_id: number
  trajectory_status: 'Improving' | 'Stable' | 'Declining'
  predicted_score: number
  confidence_percentage: number
  quiz_trajectory: {
    quiz1: number
    quiz2: number
    quiz3: number
    slope: number
  }
  exam_trajectory: {
    midterm: number
    final: number
    diff: number
  }
  milestones: {
    label: string
    score: number
    status: string
  }[]
}

