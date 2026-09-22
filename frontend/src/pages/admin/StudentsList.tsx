import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Edit2,
  BarChart2,
  Plus,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronDown
} from 'lucide-react'
import { StatusBadge } from '../../components/common/StatusBadge'
import { SearchBar } from '../../components/common/SearchBar'
import { Pagination } from '../../components/common/Pagination'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'
import { Modal } from '../../components/common/Modal'
import { api } from '../../services/api'
import { StudentListItem, RiskLevel } from '../../types'

export const StudentsList: React.FC = () => {
  const navigate = useNavigate()

  // State
  const [students, setStudents] = useState<StudentListItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [genderFilter, setGenderFilter] = useState('ALL')
  const [genderCounts, setGenderCounts] = useState({ total: 300, male: 145, female: 155 })
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res: any = await api.getStudents({
        search,
        risk_level: riskFilter,
        gender: genderFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        limit,
      })
      setStudents(res.items)
      setTotal(res.total)
      setTotalPages(res.total_pages)
      if (res.gender_counts) {
        setGenderCounts(res.gender_counts)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [page, limit, riskFilter, genderFilter, sortBy, sortOrder])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchStudents()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handleOpenEdit = async (studentId: number) => {
    try {
      const detail = await api.getStudent(studentId)
      setEditingStudent({
        id: detail.id,
        name: detail.name,
        age: detail.age,
        gender: detail.gender,
        quiz1_marks: detail.metrics.quiz1_marks,
        quiz2_marks: detail.metrics.quiz2_marks,
        quiz3_marks: detail.metrics.quiz3_marks,
        midterm_marks: detail.metrics.midterm_marks,
        final_marks: detail.metrics.final_marks,
        previous_gpa: detail.metrics.previous_gpa,
        lectures_attended: detail.metrics.lectures_attended,
        labs_attended: detail.metrics.labs_attended,
        assignments_submitted: detail.metrics.assignments_submitted,
      })
      setEditModalOpen(true)
    } catch (err) {
      alert('Failed to load student details')
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return
    try {
      setSavingEdit(true)
      await api.updateStudent(editingStudent.id, editingStudent)
      setEditModalOpen(false)
      fetchStudents()
    } catch (err) {
      alert('Failed to update student')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Student Academic Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Loaded from <span className="font-semibold text-slate-700">student_dropout_behavior_dataset.csv</span> (300 records)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.open(api.getExportCsvUrl('overall'), '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by student name or ID..."
            className="w-full lg:w-96"
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* Risk Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value)
                  setPage(1)
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Statuses ({total})</option>
                <option value="AT_RISK">At Risk</option>
                <option value="MODERATE">Moderate Difficulty</option>
                <option value="NORMAL">Normal (On Track)</option>
              </select>
            </div>

            {/* Gender Filter Pills with Accurate Counts */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setGenderFilter('ALL')
                  setPage(1)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  genderFilter === 'ALL'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({genderCounts.total})
              </button>
              <button
                type="button"
                onClick={() => {
                  setGenderFilter('Male')
                  setPage(1)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  genderFilter === 'Male'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Male ({genderCounts.male})
              </button>
              <button
                type="button"
                onClick={() => {
                  setGenderFilter('Female')
                  setPage(1)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  genderFilter === 'Female'
                    ? 'bg-pink-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Female ({genderCounts.female})
              </button>
            </div>

            {/* Rows Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState message="Filtering student records..." />
        ) : students.length === 0 ? (
          <EmptyState
            title="No matching students found"
            description="Try adjusting your search query or reset the risk level filter."
            actionText="Reset Filters"
            onAction={() => {
              setSearch('')
              setRiskFilter('ALL')
              setGenderFilter('ALL')
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th
                    onClick={() => handleSort('id')}
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Age/Gen</th>
                  <th
                    onClick={() => handleSort('quiz_average')}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Quiz Avg</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('midterm_marks')}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Midterm</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('final_marks')}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Final</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('previous_gpa')}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>GPA</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('overall_attendance_rate')}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Att %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('assignment_completion_rate')}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Assign %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('learning_performance_score')}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Score</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Difficulty Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-blue-50/40 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">#{student.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/admin/students/${student.id}`)}>
                        {student.name}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {student.age}y / {student.gender.charAt(0)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {student.quiz_average.toFixed(1)} / 10
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {student.midterm_marks.toFixed(1)} / 30
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <span className={student.final_marks < 25 ? 'font-bold text-rose-600' : 'font-medium'}>
                        {student.final_marks.toFixed(1)} / 50
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {student.previous_gpa.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          student.overall_attendance_rate < 60
                            ? 'text-rose-600'
                            : student.overall_attendance_rate < 75
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {student.overall_attendance_rate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {student.assignment_completion_rate.toFixed(0)}%
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-slate-900">
                        {student.learning_performance_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={student.risk_level} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}`)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Complete Profile & Study Plan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit Marks"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}`)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Analytics Drilldown"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={limit}
          onPageChange={setPage}
        />
      </div>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Student #${editingStudent?.id} — ${editingStudent?.name}`}
        subtitle="Modifying marks will trigger dynamic recalculation of learning score and difficulty status."
        maxWidth="2xl"
      >
        {editingStudent && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={editingStudent.gender}
                  onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz 1 (Max 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editingStudent.quiz1_marks}
                  onChange={(e) => setEditingStudent({ ...editingStudent, quiz1_marks: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz 2 (Max 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editingStudent.quiz2_marks}
                  onChange={(e) => setEditingStudent({ ...editingStudent, quiz2_marks: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz 3 (Max 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editingStudent.quiz3_marks}
                  onChange={(e) => setEditingStudent({ ...editingStudent, quiz3_marks: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Midterm (Max 30)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  value={editingStudent.midterm_marks}
                  onChange={(e) => setEditingStudent({ ...editingStudent, midterm_marks: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Final Exam (Max 50)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={editingStudent.final_marks}
                  onChange={(e) => setEditingStudent({ ...editingStudent, final_marks: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prior GPA (Max 4.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={editingStudent.previous_gpa}
                  onChange={(e) => setEditingStudent({ ...editingStudent, previous_gpa: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lectures Attended (/12)</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={editingStudent.lectures_attended}
                  onChange={(e) => setEditingStudent({ ...editingStudent, lectures_attended: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Labs Attended (/6)</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={editingStudent.labs_attended}
                  onChange={(e) => setEditingStudent({ ...editingStudent, labs_attended: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignments Done (/5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={editingStudent.assignments_submitted}
                  onChange={(e) => setEditingStudent({ ...editingStudent, assignments_submitted: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                {savingEdit ? 'Recalculating...' : 'Save & Recalculate'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
