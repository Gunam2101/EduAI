import React from 'react'
import { AttendanceAnalytics } from '../admin/AttendanceAnalytics'

export const FacultyAttendance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold uppercase text-blue-600 block mb-1">
          Cohort Attendance Tracking & Lab Participation
        </span>
        <p className="text-xs text-slate-500">
          Supervise lecture and laboratory attendance. Identify students falling below 75% institutional requirement.
        </p>
      </div>
      <AttendanceAnalytics />
    </div>
  )
}
