import React from 'react'
import { ProgressTracking } from '../admin/ProgressTracking'

export const FacultyProgress: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold uppercase text-blue-600 block mb-1">
          Cohort Learning Progress & Trajectory Monitoring
        </span>
        <p className="text-xs text-slate-500">
          Observe learning velocity and performance improvement over the semester weeks.
        </p>
      </div>
      <ProgressTracking />
    </div>
  )
}
