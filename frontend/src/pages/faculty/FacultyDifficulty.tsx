import React from 'react'
import { DifficultyAnalytics } from '../admin/DifficultyAnalytics'

export const FacultyDifficulty: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold uppercase text-blue-600 block mb-1">
          Cohort Difficulty Diagnostics & Risk Analysis
        </span>
        <p className="text-xs text-slate-500">
          Analyze why specific cohort students are classified as At-Risk or Moderate Difficulty.
        </p>
      </div>
      <DifficultyAnalytics />
    </div>
  )
}
