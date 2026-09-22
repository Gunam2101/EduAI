import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Eye,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { StatusBadge } from '../../components/common/StatusBadge'
import { SearchBar } from '../../components/common/SearchBar'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export const MyStudents: React.FC = () => {
  const { user } = useAuth()
  const facultyId = user?.faculty_id || 1
  const navigate = useNavigate()

  const [students, setStudents] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCohort = async () => {
      try {
        setLoading(true)
        const res = await api.getFacultyStudents(facultyId)
        setStudents(res.students || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCohort()
  }, [facultyId])

  useEffect(() => {
    let result = [...students]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || String(s.id).includes(q)
      )
    }
    if (riskFilter !== 'ALL') {
      result = result.filter((s) => s.risk_level === riskFilter)
    }
    setFiltered(result)
  }, [search, riskFilter, students])

  if (loading) return <LoadingState message="Loading assigned students roster..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            My Assigned Students Cohort
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active mentoring roster of {students.length} students under your academic supervision
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by name or student ID..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Risk Filter:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          >
            <option value="ALL">All Cohort Members ({students.length})</option>
            <option value="AT_RISK">At Risk Only</option>
            <option value="MODERATE">Moderate Attention</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>
      </div>

      {/* Cohort Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Age/Gen</th>
                <th className="py-3 px-4">Quiz Avg</th>
                <th className="py-3 px-4">Midterm</th>
                <th className="py-3 px-4">Final</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Performance Score</th>
                <th className="py-3 px-4">Difficulty Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">#{s.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                  <td className="py-3 px-4 text-slate-600">{s.age}y / {s.gender.charAt(0)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{s.quiz_average.toFixed(1)}/10</td>
                  <td className="py-3 px-4 text-slate-700">{s.midterm_marks.toFixed(1)}/30</td>
                  <td className="py-3 px-4 text-slate-700">{s.final_marks.toFixed(1)}/50</td>
                  <td className="py-3 px-4 font-medium">{s.overall_attendance_rate.toFixed(0)}%</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">
                    {s.learning_performance_score.toFixed(1)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={s.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
