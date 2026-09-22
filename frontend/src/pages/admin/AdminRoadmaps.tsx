import React, { useState, useEffect } from 'react'
import {
  Compass,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Search,
  BookOpen,
  ArrowRight
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { ProgressBar } from '../../components/common/ProgressBar'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export const AdminRoadmaps: React.FC = () => {
  const { setActiveStudentId } = useAuth()
  const navigate = useNavigate()

  const [overview, setOverview] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [ovRes, stRes] = await Promise.all([
          api.getInstitutionalRoadmapsOverview(),
          api.getStudents({ limit: 50, sort_by: 'difficulty_score', sort_order: 'desc' }),
        ])
        setOverview(ovRes)
        setStudents(stRes.items || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingState message="Aggregating institutional learning roadmap trajectories across 300 student records..." />
  if (!overview) return null

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.register_no && s.register_no.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Institutional Learning Roadmaps Overview
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Campus-wide 5-stage personalized learning roadmap metrics mapped across 12 Indian Engineering subjects
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active Roadmaps</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{overview.total_active_roadmaps}</div>
          <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">300 Enrolled Students</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Foundation Stage</span>
          <div className="text-3xl font-black text-rose-600 mt-1">{overview.foundation_stage}</div>
          <span className="text-[11px] text-slate-500 block">Requiring Active Mentorship</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Concept Building</span>
          <div className="text-3xl font-black text-amber-600 mt-1">{overview.concept_building_stage}</div>
          <span className="text-[11px] text-slate-500 block">Solving Problem Sets</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Advanced / Assessment</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{overview.advanced_assessment_stage}</div>
          <span className="text-[11px] text-slate-500 block">Honor Roll & Good Standing</span>
        </div>
      </div>

      {/* Curriculum Mapping Banner */}
      <div className="p-4 rounded-3xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-blue-900">
          <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <strong className="font-bold">12 Indian Engineering Subjects Formally Mapped: </strong>
            <span>Engg Mathematics, DSA, DBMS, Python, OOP, Networks, OS, Machine Learning, AI, Statistics, Big Data, NLP.</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/subjects')}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm"
        >
          View Subjects & Topics →
        </button>
      </div>

      {/* Search & Student List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Student Learning Roadmaps Directory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by academic difficulty score to prioritize institutional intervention
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Indian student name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-4">Department & Section</th>
                <th className="py-3 px-4">Risk Status</th>
                <th className="py-3 px-4">Overall Score</th>
                <th className="py-3 px-4">Difficulty Index</th>
                <th className="py-3 px-4 text-right">Inspect Roadmap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.slice(0, 15).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{s.register_no || `2022AD${s.id.toString().padStart(4, '0')}`} (ID #{s.id})</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-800 font-medium">{s.department || 'AI & Data Science'}</span>
                    <span className="text-[10px] text-slate-400 block">{s.section || 'Section A'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={s.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {s.learning_performance_score.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-600">
                    {s.difficulty_score.toFixed(1)}/100
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setActiveStudentId(s.id)
                        navigate('/student/roadmap')
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs cursor-pointer"
                    >
                      <span>Open Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
