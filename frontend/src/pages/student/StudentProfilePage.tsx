import React, { useState, useEffect } from 'react'
import {
  UserCircle2,
  Mail,
  GraduationCap,
  Calendar,
  Building,
  Award,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Hash,
  School
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useStudent } from '../../context/StudentContext'
import { api } from '../../services/api'
import { StudentDetail } from '../../types'

export const StudentProfilePage: React.FC = () => {
  const { selectedStudentId, setSelectedStudentId, allStudents } = useStudent()
  const studentId = selectedStudentId || 1

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const det = await api.getStudent(studentId)
        setStudent(det)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [studentId])

  if (loading) return <LoadingState message="Loading your official student record..." />
  if (!student) return null

  const { metrics, difficulty } = student

  const enrolledSubjects = [
    { code: 'CS3301', name: 'Data Structures & Algorithms', credits: 4, type: 'Theory + Practical Lab' },
    { code: 'CS3492', name: 'Database Management Systems', credits: 3, type: 'Theory + Laboratory' },
    { code: 'MA3354', name: 'Engineering Mathematics', credits: 4, type: 'Core Theory' },
    { code: 'CS3451', name: 'Operating Systems', credits: 3, type: 'Theory + Practical' },
    { code: 'AI3401', name: 'Machine Learning', credits: 4, type: 'Professional Elective' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Student Switcher for Tester */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50/80 border border-blue-200/80 p-3.5 rounded-2xl gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span>Switch Student Profile to Inspect Roll & Department Details:</span>
        </div>
        <select
          value={studentId}
          onChange={(e) => setSelectedStudentId(Number(e.target.value))}
          className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 shadow-2xs max-w-sm truncate"
        >
          {allStudents.length > 0 ? (
            allStudents.map((s) => (
              <option key={s.id} value={s.id}>
                Roll #{s.roll_number || s.id} — {s.name} ({s.department || 'B.Tech'})
              </option>
            ))
          ) : (
            <option value={studentId}>Loading students...</option>
          )}
        </select>
      </div>

      <div>
        <h1 className="page-title">
          Student Profile & Academic Record
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official institutional roll sheet and affiliated degree curriculum registration
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 shrink-0">
              {student.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
                <StatusBadge status={difficulty.risk_level} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Register No: <span className="font-mono font-bold text-slate-800">{student.register_no || `2022AD${student.id.toString().padStart(4, '0')}`}</span> • Department of {student.department || 'Artificial Intelligence & Data Science'}
              </p>
            </div>
          </div>
        </div>

        {/* Indian Academic Terminology Bio Grid (Section 13) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1">Year & Semester</span>
            <span className="font-bold text-slate-900">{student.year || '3rd Year'} • {student.semester || 'Semester VI'}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">{student.section || 'Section A'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1">Cumulative CGPA</span>
            <span className="font-bold text-slate-900">{metrics.previous_gpa.toFixed(2)} / 4.00</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Prior Academic Standing</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1">Attendance Compliance</span>
            <span className="font-bold text-slate-900">{metrics.overall_attendance_rate.toFixed(1)}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">{metrics.lectures_attended + metrics.labs_attended}/18 Theory + Lab sessions</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1">Faculty Mentor</span>
            <span className="font-bold text-slate-900">Dr. S. Rangarajan</span>
            <span className="text-[10px] text-blue-600 block mt-0.5">Assigned Counselor</span>
          </div>
        </div>

        {/* Degree & Regulation */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-1">
          <div className="font-bold text-sm">B.Tech in {student.department || 'Artificial Intelligence & Data Science'}</div>
          <p className="text-slate-600">
            Autonomous Engineering College • Affiliated with State Technical University • Aligned with AICTE Model Engineering Curriculum
          </p>
        </div>

        {/* Enrolled Courses */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
            Enrolled Academic Courses & Credits (Semester VI)
          </h3>
          <div className="space-y-2">
            {enrolledSubjects.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-blue-700">
                    {sub.code}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{sub.name}</span>
                    <span className="text-[11px] text-slate-500">{sub.type}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                  {sub.credits} Credits
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
