import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Filter,
  Bookmark,
  Award
} from 'lucide-react'
import { api } from '../../services/api'
import { LoadingState } from '../../components/common/LoadingState'

export const AcademicCalendar: React.FC = () => {
  const [calendarData, setCalendarData] = useState<any>(null)
  const [filterType, setFilterType] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true)
        const res = await api.getMyCalendar()
        setCalendarData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCalendar()
  }, [])

  if (loading || !calendarData) {
    return <LoadingState message="Loading your semester academic schedule..." />
  }

  const events = calendarData.events || []
  const filteredEvents = filterType === 'ALL'
    ? events
    : events.filter((e: any) => e.type.toLowerCase().includes(filterType.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {calendarData.current_semester}
              </span>
              <span className="text-xs text-slate-300">
                Academic Session {calendarData.academic_session}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight font-heading">
              Continuous Assessment & Examination Calendar
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Official timeline for Continuous Internal Assessments (CIA 1 & 2), practical viva evaluations, model exams, and Anna University end-semester examinations.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">Total Milestones</span>
            <div className="text-2xl font-black text-white">{calendarData.total_events} Scheduled</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
        {[
          { id: 'ALL', label: 'All Events' },
          { id: 'Internal', label: 'Internal Exams (CIA)' },
          { id: 'Assignment', label: 'Assignments' },
          { id: 'Lab', label: 'Lab Practical & Viva' },
          { id: 'Quiz', label: 'Online Quizzes' },
          { id: 'Exam', label: 'Model & University Exams' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Timeline Cards */}
      <div className="space-y-3">
        {filteredEvents.map((evt: any) => {
          let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200'
          if (evt.type.includes('Internal')) badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200'
          if (evt.type.includes('Lab')) badgeColor = 'bg-teal-50 text-teal-700 border-teal-200'
          if (evt.type.includes('Assignment')) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200'
          if (evt.type.includes('University') || evt.type.includes('Model')) badgeColor = 'bg-purple-50 text-purple-700 border-purple-200'

          return (
            <div
              key={evt.id}
              className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {/* Date block */}
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-base font-black text-slate-900 leading-tight">
                    {new Date(evt.date).getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                      {evt.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      Weightage: {evt.weightage}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium">
                    {evt.subject}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Syllabus Scope:</span> {evt.syllabus}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  evt.status === 'Upcoming'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : evt.status === 'Pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {evt.status}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {evt.date}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
