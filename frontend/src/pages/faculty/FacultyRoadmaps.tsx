import React, { useState, useEffect } from 'react'
import {
  Compass,
  Users,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  Award
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { ProgressBar } from '../../components/common/ProgressBar'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'

export const FacultyRoadmaps: React.FC = () => {
  const { user, setActiveStudentId } = useAuth()
  const facultyId = user?.faculty_id || 1
  const navigate = useNavigate()

  const [cohort, setCohort] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')

  useEffect(() => {
    const fetchCohort = async () => {
      try {
        setLoading(true)
        const res = await api.getFacultyCohortRoadmaps(facultyId)
        setCohort(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCohort()
  }, [facultyId])

  if (loading) return <LoadingState message="Aggregating student learning roadmaps across your mentored cohort..." />
  if (!cohort) return null

  const filteredStudents = (cohort.students || []).filter((s: any) => {
    const matchesSearch = s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.register_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.weak_subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = riskFilter === 'ALL' || s.risk_level === riskFilter
    return matchesSearch && matchesRisk
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">
            Cohort Learning Roadmaps
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor and mentor individual student learning journeys, diagnosed weak engineering subjects, and active milestones
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            Mentor: <strong className="text-blue-700">{cohort.faculty_name}</strong>
          </span>
          <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            Cohort: <strong className="text-slate-900">{cohort.total_mentored} Students</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Intervention</span>
            <span className="text-2xl font-black text-rose-600">{cohort.needing_intervention}</span>
            <span className="text-[11px] text-slate-500 block">Requires 1-on-1 Mentoring</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Moderate Follow-Up</span>
            <span className="text-2xl font-black text-amber-600">{cohort.moderate_followup}</span>
            <span className="text-[11px] text-slate-500 block">In Concept Building Stage</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">On Track (Good Standing)</span>
            <span className="text-2xl font-black text-emerald-600">
              {cohort.total_mentored - cohort.needing_intervention - cohort.moderate_followup}
            </span>
            <span className="text-[11px] text-slate-500 block">Advancing Assessment Stages</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, register no, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['ALL', 'AT_RISK', 'MODERATE', 'NORMAL'].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  riskFilter === r
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r === 'ALL' ? 'All' : r === 'AT_RISK' ? 'Critical' : r === 'MODERATE' ? 'Moderate' : 'Normal'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Students Roadmap Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Student & Roll No</th>
                <th className="py-3.5 px-4">Department & Section</th>
                <th className="py-3.5 px-4">Diagnosed Weak Subject</th>
                <th className="py-3.5 px-4">Learning Status</th>
                <th className="py-3.5 px-4">Active Milestone</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s: any) => (
                  <tr key={s.student_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.student_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{s.register_no} (ID #{s.student_id})</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 font-medium block">{s.department}</span>
                      <span className="text-[10px] text-slate-500">{s.section}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        {s.weak_subject}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.risk_level} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-indigo-700">{s.current_step}</span>
                    </td>
                    <td className="py-3.5 px-4 w-32">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={s.progress_percentage} size="sm" />
                        <span className="font-bold text-slate-900 text-[11px]">{s.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveStudentId(s.student_id)
                          navigate('/student/roadmap')
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
