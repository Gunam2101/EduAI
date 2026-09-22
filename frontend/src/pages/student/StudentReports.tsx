import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  Award,
  BookOpen,
  Printer
} from 'lucide-react'
import { useStudent } from '../../context/StudentContext'
import { api } from '../../services/api'
import { LoadingState } from '../../components/common/LoadingState'

export const StudentReports: React.FC = () => {
  const { selectedStudent, studentName, loading } = useStudent()
  const [downloading, setDownloading] = useState(false)

  if (loading) return <LoadingState message="Loading academic report..." />
  if (!selectedStudent) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
        No report data available for the selected student.
      </div>
    )
  }

  const { metrics, difficulty } = selectedStudent

  const handleDownloadCsv = () => {
    setDownloading(true)
    const url = api.getExportCsvUrl('comprehensive')
    window.open(url, '_blank')
    setTimeout(() => setDownloading(false), 1000)
  }

  const handleDownloadPdf = () => {
    setDownloading(true)
    const url = api.getExportPdfUrl('comprehensive')
    window.open(url, '_blank')
    setTimeout(() => setDownloading(false), 1000)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            Academic Performance Report &amp; Transcript
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official semester evaluation report, continuous assessment scorecard, and learning difficulty analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Official Student Transcript Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Student Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Anna University Autonomous Regulation 2021
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2 font-heading">{studentName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll No / Student ID: <strong className="text-slate-800 font-mono">#{selectedStudent.id}</strong> • Register No:{' '}
              <strong className="text-slate-800 font-mono">
                {selectedStudent.register_no || `2022AD${selectedStudent.id.toString().padStart(4, '0')}`}
              </strong>
            </p>
          </div>

          <div className="text-right sm:border-l sm:pl-6 border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Standing</span>
            <span className="text-2xl font-black text-slate-900">
              {metrics ? `${metrics.learning_performance_score.toFixed(1)}%` : 'N/A'}
            </span>
            <span className="block text-[11px] font-semibold text-emerald-600 mt-0.5">
              {difficulty?.risk_level === 'NORMAL'
                ? 'Good Standing'
                : difficulty?.risk_level === 'MODERATE'
                ? 'Academic Watch'
                : 'Remedial Priority'}
            </span>
          </div>
        </div>

        {/* Assessment Scorecard Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            Continuous Internal Assessment (CIA) &amp; Examination Breakdown
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Evaluation Metric</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Marks Scored</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4 text-right">Proficiency Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Continuous Quiz 1</td>
                  <td className="py-3 px-4">10.0</td>
                  <td className="py-3 px-4">{metrics?.quiz1_marks.toFixed(1) || '0.0'}</td>
                  <td className="py-3 px-4">{metrics ? ((metrics.quiz1_marks / 10) * 100).toFixed(0) : '0'}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Completed</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Continuous Quiz 2</td>
                  <td className="py-3 px-4">10.0</td>
                  <td className="py-3 px-4">{metrics?.quiz2_marks.toFixed(1) || '0.0'}</td>
                  <td className="py-3 px-4">{metrics ? ((metrics.quiz2_marks / 10) * 100).toFixed(0) : '0'}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Completed</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Continuous Quiz 3</td>
                  <td className="py-3 px-4">10.0</td>
                  <td className="py-3 px-4">{metrics?.quiz3_marks.toFixed(1) || '0.0'}</td>
                  <td className="py-3 px-4">{metrics ? ((metrics.quiz3_marks / 10) * 100).toFixed(0) : '0'}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Completed</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Midterm Internal Examination (IA)</td>
                  <td className="py-3 px-4">30.0</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{metrics?.midterm_marks.toFixed(1) || '0.0'}</td>
                  <td className="py-3 px-4">{metrics ? ((metrics.midterm_marks / 30) * 100).toFixed(0) : '0'}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">Evaluated</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">End Semester University Examination</td>
                  <td className="py-3 px-4">50.0</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{metrics?.final_marks.toFixed(1) || '0.0'}</td>
                  <td className="py-3 px-4">{metrics ? ((metrics.final_marks / 50) * 100).toFixed(0) : '0'}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Certified</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Cumulative Prior GPA</td>
                  <td className="py-3 px-4">4.00</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{metrics?.previous_gpa.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-4">{metrics ? ((metrics.previous_gpa / 4) * 100).toFixed(0) : '0'}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Official</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Attendance (Theory &amp; Laboratory Practicals)</td>
                  <td className="py-3 px-4">100%</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{metrics?.overall_attendance_rate.toFixed(0) || '0'}%</td>
                  <td className="py-3 px-4">{metrics?.overall_attendance_rate.toFixed(0) || '0'}%</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (metrics?.overall_attendance_rate || 0) >= 75
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {(metrics?.overall_attendance_rate || 0) >= 75 ? 'Eligible' : 'Shortage'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnosis & Recommendations Summary */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-900 block">Accreditation Diagnostic Notes</span>
          <p className="text-xs text-slate-600 leading-relaxed">
            {difficulty?.reasons && difficulty.reasons.length > 0
              ? difficulty.reasons.join('; ')
              : 'Student is maintaining consistent performance across CIA evaluations and practical sessions.'}
          </p>
        </div>
      </div>
    </div>
  )
}
