import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { StudentProvider } from './context/StudentContext'
import { DashboardLayout } from './layouts/DashboardLayout'

// Auth
import { Login } from './pages/auth/Login'
import { RoleProtectedRoute } from './components/common/RoleProtectedRoute'

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { StudentsList } from './pages/admin/StudentsList'
import { StudentProfile } from './pages/admin/StudentProfile'
import { FacultyDirectory } from './pages/admin/FacultyDirectory'
import { SubjectsAndTopics } from './pages/admin/SubjectsAndTopics'
import { AssessmentsOverview } from './pages/admin/AssessmentsOverview'
import { AttendanceAnalytics } from './pages/admin/AttendanceAnalytics'
import { DifficultyAnalytics } from './pages/admin/DifficultyAnalytics'
import { StudyPlansOverview } from './pages/admin/StudyPlansOverview'
import { ProgressTracking } from './pages/admin/ProgressTracking'
import { AlertsCenter } from './pages/admin/AlertsCenter'
import { ReportsCenter } from './pages/admin/ReportsCenter'
import { SettingsPage } from './pages/admin/SettingsPage'
import { AdminRecommendations } from './pages/admin/AdminRecommendations'
import { AdminRoadmaps } from './pages/admin/AdminRoadmaps'
import { AdminInsights } from './pages/admin/AdminInsights'

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard'
import { MyStudents } from './pages/faculty/MyStudents'
import { FacultyAssessments } from './pages/faculty/FacultyAssessments'
import { FacultyAttendance } from './pages/faculty/FacultyAttendance'
import { FacultyDifficulty } from './pages/faculty/FacultyDifficulty'
import { FacultyProgress } from './pages/faculty/FacultyProgress'
import { FacultyRecommendations } from './pages/faculty/FacultyRecommendations'
import { FacultyRoadmaps } from './pages/faculty/FacultyRoadmaps'
import { FacultyReports } from './pages/faculty/FacultyReports'
import { FacultyInterventions } from './pages/faculty/FacultyInterventions'
import { FacultyInsights } from './pages/faculty/FacultyInsights'

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard'
import { StudentProfilePage } from './pages/student/StudentProfilePage'
import { MyPerformance } from './pages/student/MyPerformance'
import { LearningRoadmap } from './pages/student/LearningRoadmap'
import { MyWeakAreas } from './pages/student/MyWeakAreas'
import { MyStudyPlan } from './pages/student/MyStudyPlan'
import { StudentRecommendations } from './pages/student/StudentRecommendations'
import { StudentProgress } from './pages/student/StudentProgress'
import { StudentAlerts } from './pages/student/StudentAlerts'
import { StudentReports } from './pages/student/StudentReports'
import { StudentSettings } from './pages/student/StudentSettings'
import { AcademicCalendar } from './pages/student/AcademicCalendar'
import { StudentAssessments } from './pages/student/StudentAssessments'
import { LearningHistory } from './pages/student/LearningHistory'

// 404
import { NotFound } from './pages/common/NotFound'

const RootRedirect: React.FC = () => {
  const { role, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role === 'Admin') return <Navigate to="/admin/dashboard" replace />
  if (role === 'Faculty') return <Navigate to="/faculty/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StudentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowedRole="Admin">
                  <DashboardLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentsList />} />
              <Route path="students/:id" element={<StudentProfile />} />
              <Route path="faculty" element={<FacultyDirectory />} />
              <Route path="subjects" element={<SubjectsAndTopics />} />
              <Route path="assessments" element={<AssessmentsOverview />} />
              <Route path="attendance" element={<AttendanceAnalytics />} />
              <Route path="difficulty" element={<DifficultyAnalytics />} />
              <Route path="study-plans" element={<StudyPlansOverview />} />
              <Route path="roadmaps" element={<AdminRoadmaps />} />
              <Route path="recommendations" element={<AdminRecommendations />} />
              <Route path="progress" element={<ProgressTracking />} />
              <Route path="alerts" element={<AlertsCenter />} />
              <Route path="reports" element={<ReportsCenter />} />
              <Route path="insights" element={<AdminInsights />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<SettingsPage />} />
            </Route>

            {/* Faculty Routes (12 tabs) */}
            <Route
              path="/faculty"
              element={
                <RoleProtectedRoute allowedRole="Faculty">
                  <DashboardLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/faculty/dashboard" replace />} />
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="my-students" element={<MyStudents />} />
              <Route path="performance" element={<FacultyAssessments />} />
              <Route path="assessments" element={<FacultyAssessments />} />
              <Route path="attendance" element={<FacultyAttendance />} />
              <Route path="difficulty" element={<FacultyDifficulty />} />
              <Route path="roadmaps" element={<FacultyRoadmaps />} />
              <Route path="interventions" element={<FacultyInterventions />} />
              <Route path="progress" element={<FacultyProgress />} />
              <Route path="reports" element={<FacultyReports />} />
              <Route path="insights" element={<FacultyInsights />} />
              <Route path="profile" element={<FacultyDashboard />} />
              <Route path="recommendations" element={<FacultyRecommendations />} />
            </Route>

            {/* Student Routes (Complete 11-page suite) */}
            <Route
              path="/student"
              element={
                <RoleProtectedRoute allowedRole="Student">
                  <DashboardLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="performance" element={<MyPerformance />} />
              <Route path="roadmap" element={<LearningRoadmap />} />
              <Route path="weak-areas" element={<MyWeakAreas />} />
              <Route path="study-plan" element={<MyStudyPlan />} />
              <Route path="recommendations" element={<StudentRecommendations />} />
              <Route path="progress" element={<StudentProgress />} />
              <Route path="alerts" element={<StudentAlerts />} />
              <Route path="reports" element={<StudentReports />} />
              <Route path="settings" element={<StudentSettings />} />
              <Route path="calendar" element={<AcademicCalendar />} />
              <Route path="assessments" element={<StudentAssessments />} />
              <Route path="history" element={<LearningHistory />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<DashboardLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StudentProvider>
    </AuthProvider>
  )
}
