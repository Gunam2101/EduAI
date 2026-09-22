import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  Mail,
  Building,
  GraduationCap,
  Users,
  Clock,
  BookOpen,
  ArrowRight,
  Send
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { api } from '../../services/api'
import { FacultyMember } from '../../types'

export const FacultyDirectory: React.FC = () => {
  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null)
  const [message, setMessage] = useState('')
  const [sentSuccess, setSentSuccess] = useState(false)

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true)
        const data = await api.getFacultyList()
        setFaculty(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchFaculty()
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    setSentSuccess(true)
    setTimeout(() => {
      setSentSuccess(false)
      setContactModalOpen(false)
      setMessage('')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Academic Faculty Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty mentors overseeing student cohorts, curriculum assessments, and study interventions
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading faculty roster..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {faculty.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {f.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{f.name}</h3>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {f.designation}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{f.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px]">{f.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {f.assigned_students_count} Assigned Students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500">{f.office_hours}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Cohort Advisor</span>
                <button
                  onClick={() => {
                    setSelectedFaculty(f)
                    setContactModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Memo</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Memo Modal */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title={`Dispatch Faculty Intervention Memo — ${selectedFaculty?.name}`}
        subtitle={`Notify faculty advisor regarding student progress or alert escalation`}
      >
        {sentSuccess ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
              <UserCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Intervention Memo Dispatched</h4>
            <p className="text-xs text-slate-500 mt-1">
              Faculty member notified with student cohort summary.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient Email
              </label>
              <input
                type="text"
                readOnly
                value={selectedFaculty?.email || ''}
                className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject / Topic
              </label>
              <input
                type="text"
                required
                defaultValue="Urgent: Review of Cohort At-Risk Students"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action Instructions
              </label>
              <textarea
                rows={4}
                required
                placeholder="Specify required office-hour consultations or study-plan check-ins..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Send Notification
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
