import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  UserCheck,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Search,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'
import { api } from '../../services/api'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'

export const FacultyInterventions: React.FC = () => {
  const [interventions, setInterventions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  // New Intervention Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [formData, setFormData] = useState({
    student_id: 1,
    title: '',
    intervention_type: 'Remedial Coaching',
    action_plan: '',
    target_date: '2026-10-15',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [res, statRes] = await Promise.all([
        api.getInterventions({ status: statusFilter !== 'ALL' ? statusFilter : undefined }),
        api.getInterventionStats()
      ])
      setInterventions(res.interventions || [])
      setStats(statRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const openNewModal = async () => {
    try {
      const res = await api.getStudents({ limit: 50, risk_level: 'AT_RISK' })
      setStudentsList(res.items || [])
      if (res.items && res.items.length > 0) {
        setFormData(prev => ({ ...prev, student_id: res.items[0].id }))
      }
      setModalOpen(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.createIntervention(formData)
      setModalOpen(false)
      setFormData({
        student_id: 1,
        title: '',
        intervention_type: 'Remedial Coaching',
        action_plan: '',
        target_date: '2026-10-15',
        notes: ''
      })
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.updateIntervention(id, { status: newStatus })
      await loadData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
              Faculty Academic Interventions & Remedial Tracking
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Active Mentorship
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Design, assign, and monitor corrective remedial plans, tutoring sessions, and attendance recovery for at-risk students.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Remedial Intervention</span>
        </button>
      </div>

      {/* Metric Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500">Total Interventions</span>
            <div className="text-xl font-black text-slate-900 mt-1">{stats.total_interventions}</div>
            <span className="text-[10px] text-slate-400">Logged cases</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-600">Active Direct Actions</span>
            <div className="text-xl font-black text-amber-700 mt-1">{stats.active_interventions}</div>
            <span className="text-[10px] text-amber-600/70 font-medium">Under remediation</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-blue-600">In Progress Sessions</span>
            <div className="text-xl font-black text-blue-700 mt-1">{stats.in_progress_interventions}</div>
            <span className="text-[10px] text-blue-600/70 font-medium">Tutoring ongoing</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-600">Successfully Resolved</span>
            <div className="text-xl font-black text-emerald-700 mt-1">{stats.completed_interventions}</div>
            <span className="text-[10px] text-emerald-600/70 font-medium">Marks improved</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-purple-600">At-Risk Coverage</span>
            <div className="text-xl font-black text-purple-700 mt-1">{stats.intervention_coverage_rate}%</div>
            <span className="text-[10px] text-purple-600/70 font-medium">Of {stats.at_risk_students_total} at-risk cohort</span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {['ALL', 'Active', 'In Progress', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === s ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s === 'ALL' ? 'All Interventions' : s}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{interventions.length}</strong> interventions
        </span>
      </div>

      {/* Interventions List */}
      {loading ? (
        <LoadingState message="Loading faculty interventions..." />
      ) : interventions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">No interventions found under this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventions.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {item.intervention_type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                      {item.title}
                    </h3>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                      item.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg">
                  <span className="font-semibold text-slate-900">{item.student_name}</span>
                  <span className="text-slate-400">•</span>
                  <span>{item.register_no}</span>
                  <span className="text-slate-400">•</span>
                  <span>{item.department} ({item.section})</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900">Action Plan:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{item.action_plan}</p>
                  </div>
                  {item.notes && (
                    <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100 text-[11px] text-amber-900">
                      <span className="font-bold">Faculty Notes:</span> {item.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 mt-4 border-t border-slate-100">
                <span>Target: <strong className="text-slate-700">{item.target_date}</strong></span>
                <span>Assigned by {item.faculty_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Intervention Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Create New Remedial Intervention"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Student (At-Risk Cohort)</label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.register_no || `ID #${s.id}`}) — Score: {s.learning_performance_score}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Intervention Type</label>
              <select
                value={formData.intervention_type}
                onChange={(e) => setFormData({ ...formData, intervention_type: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Remedial Coaching">Remedial Coaching (1-on-1 Tutoring)</option>
                <option value="Attendance Warning">Attendance Warning & Counseling</option>
                <option value="Practice Assignments">Supplementary Practice Assignments</option>
                <option value="Peer Mentorship">Peer Mentorship Circle</option>
                <option value="Parent Consultation">Parent Consultation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Title / Focus Objective</label>
              <input
                type="text"
                required
                placeholder="e.g. Remedial Coaching on Dynamic Programming"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specific Action Plan</label>
              <textarea
                required
                rows={3}
                placeholder="Describe specific exercises, chapters to revise, and lab tests to retake..."
                value={formData.action_plan}
                onChange={(e) => setFormData({ ...formData, action_plan: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observation Notes</label>
                <input
                  type="text"
                  placeholder="Initial observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                {submitting ? 'Creating...' : 'Save Intervention'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
