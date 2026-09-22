import {
  StudentRoadmap,
  PredictionResult,
  RiskAnalysis,
  TopicAnalysisResult,
  AIExplanation,
  AdaptiveStudyPlan,
  StudentTrendAnalysis,
  TopicAnalysisItem,
} from '../types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('eduai_token')
  const selectedStudentId =
    localStorage.getItem('eduai_selected_student_id') || localStorage.getItem('eduai_active_student_id')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (selectedStudentId) {
    headers['X-Selected-Student-Id'] = selectedStudentId
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.detail || `HTTP Error ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  // Auth
  login: (data: { email: string; password: string; role?: string }) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  selectStudent: (studentId: number) =>
    request<any>(`/auth/select-student/${studentId}`, {
      method: 'POST',
    }),
  getMe: () => request<any>('/auth/me'),

  // Students
  getStudents: (params: {
    search?: string
    risk_level?: string
    gender?: string
    sort_by?: string
    sort_order?: string
    page?: number
    limit?: number
  }) => {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    if (params.risk_level) q.set('risk_level', params.risk_level)
    if (params.gender) q.set('gender', params.gender)
    if (params.sort_by) q.set('sort_by', params.sort_by)
    if (params.sort_order) q.set('sort_order', params.sort_order)
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    return request<{
      items: any[]
      total: number
      page: number
      limit: number
      total_pages: number
    }>(`/students?${q.toString()}`)
  },
  getStudent: (id: number) => request<any>(`/students/${id}`),
  updateStudent: (id: number, data: any) =>
    request<any>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getStudentAnalytics: (id: number) => request<any>(`/students/${id}/analytics`),

  // Analytics
  getAnalyticsOverview: () => request<any>('/analytics/overview'),
  getDifficultyAnalytics: () => request<any>('/analytics/difficulty'),

  // Assessments & Attendance
  getAssessmentsSummary: () => request<any>('/assessments/summary'),
  getAttendanceSummary: () => request<any>('/attendance/summary'),

  // Study Plans
  getStudyPlans: (riskLevel?: string) => {
    const q = riskLevel ? `?risk_level=${riskLevel}` : ''
    return request<any[]>(`/study-plans${q}`)
  },
  getStudentStudyPlan: (studentId: number) => request<any>(`/study-plans/student/${studentId}`),
  toggleStudyPlanItem: (itemId: number) =>
    request<any>(`/study-plans/items/${itemId}/toggle`, { method: 'POST' }),

  // Progress
  getProgressOverview: () => request<any>('/progress/overview'),
  getStudentProgress: (studentId: number) => request<any>(`/progress/student/${studentId}`),

  // Learning Roadmaps
  getStudentRoadmap: (studentId: number) =>
    request<StudentRoadmap>(`/roadmaps/student/${studentId}`),
  toggleRoadmapStep: (studentId: number, stepNumber: number) =>
    request<any>(`/roadmaps/student/${studentId}/step/${stepNumber}/toggle`, { method: 'POST' }),
  getFacultyCohortRoadmaps: (facultyId: number) =>
    request<any>(`/roadmaps/cohort/${facultyId}`),
  getInstitutionalRoadmapsOverview: () =>
    request<any>('/roadmaps/overview'),

  // Recommendations
  getStudentRecommendations: (studentId: number) =>
    request<{ student_id: number; student_name: string; risk_level: string; recommendations: any[] }>(
      `/recommendations/student/${studentId}`
    ),
  getAdminRecommendations: () =>
    request<{ total_students: number; recommendations: any[] }>('/recommendations/admin'),
  getFacultyRecommendations: (facultyId: number) =>
    request<{ faculty_id: number; cohort_size: number; recommendations: any[] }>(
      `/recommendations/faculty/${facultyId}`
    ),

  // Alerts
  getAlerts: (priority?: string) => {
    const q = priority ? `?priority=${priority}` : ''
    return request<any>(`/alerts${q}`)
  },
  getStudentAlerts: (studentId: number) =>
    request<{ alerts: any[]; total: number }>(`/alerts/student/${studentId}`),
  markAlertRead: (alertId: number) =>
    request<any>(`/alerts/${alertId}/read`, { method: 'POST' }),
  markAllAlertsRead: () =>
    request<any>('/alerts/read-all', { method: 'POST' }),

  // Faculty
  getFacultyList: () => request<any[]>('/faculty'),
  getFacultyStudents: (facultyId: number) => request<any>(`/faculty/${facultyId}/students`),

  // Curriculum
  getSubjects: () => request<any[]>('/curriculum/subjects'),
  createSubject: (data: any) =>
    request<any>('/curriculum/subjects', { method: 'POST', body: JSON.stringify(data) }),
  createTopic: (data: any) =>
    request<any>('/curriculum/topics', { method: 'POST', body: JSON.stringify(data) }),
  deleteSubject: (id: number) =>
    request<any>(`/curriculum/subjects/${id}`, { method: 'DELETE' }),

  // Reports (with filters)
  getReportData: (reportType: string, filters?: { gender?: string; risk_level?: string; search?: string }) => {
    const q = new URLSearchParams({ report_type: reportType })
    if (filters?.gender) q.set('gender', filters.gender)
    if (filters?.risk_level) q.set('risk_level', filters.risk_level)
    if (filters?.search) q.set('search', filters.search)
    return request<any>(`/reports/data?${q.toString()}`)
  },
  getExportCsvUrl: (reportType: string, filters?: { gender?: string; risk_level?: string; search?: string }) => {
    const q = new URLSearchParams({ report_type: reportType })
    if (filters?.gender) q.set('gender', filters.gender)
    if (filters?.risk_level) q.set('risk_level', filters.risk_level)
    if (filters?.search) q.set('search', filters.search)
    return `${API_BASE}/reports/export/csv?${q.toString()}`
  },
  getExportPdfUrl: (reportType: string, filters?: { gender?: string; risk_level?: string; search?: string }) => {
    const q = new URLSearchParams({ report_type: reportType })
    if (filters?.gender) q.set('gender', filters.gender)
    if (filters?.risk_level) q.set('risk_level', filters.risk_level)
    if (filters?.search) q.set('search', filters.search)
    return `${API_BASE}/reports/export/pdf?${q.toString()}`
  },

  // Student Portal (Self - Strictly isolated via JWT)
  getMyProfile: () => request<any>('/student/me/profile'),
  getMyPerformance: () => request<any>('/student/me/performance'),
  getMyRoadmap: () => request<StudentRoadmap>('/student/me/roadmap'),
  toggleMyRoadmapStep: (stepId: number) =>
    request<any>(`/student/me/roadmap/step/${stepId}/toggle`, { method: 'POST' }),
  getMyProgress: () => request<any>('/student/me/progress'),
  getMyCalendar: () => request<any>('/student/me/calendar'),
  getMyAssessments: () => request<any>('/student/me/assessments'),
  getMyHistory: () => request<any>('/student/me/history'),

  // Interventions (Faculty)
  getInterventions: (params?: { student_id?: number; status?: string }) => {
    const q = new URLSearchParams()
    if (params?.student_id) q.set('student_id', String(params.student_id))
    if (params?.status) q.set('status', params.status)
    return request<{ total: number; interventions: any[] }>(`/interventions?${q.toString()}`)
  },
  createIntervention: (data: any) =>
    request<any>('/interventions', { method: 'POST', body: JSON.stringify(data) }),
  updateIntervention: (id: number, data: any) =>
    request<any>(`/interventions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIntervention: (id: number) =>
    request<any>(`/interventions/${id}`, { method: 'DELETE' }),
  getInterventionStats: () => request<any>('/interventions/stats'),

  // Academic Insights (Faculty & Admin)
  getAcademicInsights: () => request<any>('/insights/academic'),

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) =>
    request<any>('/settings', { method: 'POST', body: JSON.stringify(data) }),
  reloadDataset: () => request<any>('/settings/reload-dataset', { method: 'POST' }),

  // ML Predictions & Early Risk Detection (PS52)
  getStudentPrediction: (studentId: number) =>
    request<PredictionResult>(`/predictions/student/${studentId}`),
  getMyPrediction: () =>
    request<PredictionResult>('/student/me/prediction'),

  getStudentRisk: (studentId: number) =>
    request<RiskAnalysis>(`/risk/student/${studentId}`),
  getMyRisk: () =>
    request<RiskAnalysis>('/student/me/risk'),

  getStudentWeakTopics: (studentId: number) =>
    request<TopicAnalysisResult>(`/weak-topics/student/${studentId}`),
  getMyWeakTopics: () =>
    request<TopicAnalysisResult>('/student/me/weak-topics'),

  getStudentTopicPriorities: (studentId: number) =>
    request<{ student_id: number; priorities: TopicAnalysisItem[] }>(`/topic-priorities/student/${studentId}`),
  getMyTopicPriorities: () =>
    request<{ student_id: number; priorities: TopicAnalysisItem[] }>('/student/me/topic-priorities'),

  getAdaptiveStudyPlan: (studentId: number) =>
    request<AdaptiveStudyPlan>(`/adaptive-study-plan/student/${studentId}`),
  getMyAdaptiveStudyPlan: () =>
    request<AdaptiveStudyPlan>('/student/me/adaptive-study-plan'),
  toggleAdaptiveTask: (studentId: number, taskId: string) =>
    request<{ status: string; task_id: string; is_completed: boolean; plan: AdaptiveStudyPlan }>(
      `/adaptive-study-plan/student/${studentId}/task/${taskId}/toggle`,
      { method: 'POST' }
    ),
  toggleMyAdaptiveTask: (taskId: string) =>
    request<{ status: string; task_id: string; is_completed: boolean; plan: AdaptiveStudyPlan }>(
      `/student/me/adaptive-study-plan/task/${taskId}/toggle`,
      { method: 'POST' }
    ),

  getStudentExplanations: (studentId: number) =>
    request<AIExplanation>(`/explanations/student/${studentId}`),
  getMyExplanations: () =>
    request<AIExplanation>('/student/me/explanations'),

  getStudentTrends: (studentId: number) =>
    request<StudentTrendAnalysis>(`/trends/student/${studentId}`),
  getMyTrends: () =>
    request<StudentTrendAnalysis>('/student/me/trends'),

  toggleRecommendationItem: (studentId: number, itemId: number) =>
    request<{ status: string; item_id: number; is_completed: boolean }>(
      `/recommendations/${studentId}/item/${itemId}/toggle`,
      { method: 'POST' }
    ),

  getCommonWeakTopics: () =>
    request<{ total_topics: number; common_weak_topics: any[] }>('/predictions/common-weak-topics'),
}

