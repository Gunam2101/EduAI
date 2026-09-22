import React, { useState, useEffect } from 'react'
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Printer
} from 'lucide-react'
import { api } from '../../services/api'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'

export const FacultyReports: React.FC = () => {
  const [reportType, setReportType] = useState('overall')
  const [genderFilter, setGenderFilter] = useState('ALL')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [data, setData] = useState<any[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(true)

  const reportTypes = [
    { id: 'overall', label: 'Overall Academic Performance', desc: 'Composite view of GPA, attendance, quiz and exam scores' },
    { id: 'attendance', label: 'Attendance Shortage (<75%)', desc: 'Students at risk of exam debarment due to low lecture or lab attendance' },
    { id: 'assessment', label: 'Continuous Internal Assessment (CIA)', desc: 'Detailed breakdown across Quiz 1, 2, 3 and Midterm scores' },
    { id: 'at_risk', label: 'At-Risk Early Warning Report', desc: 'Identified learning difficulties requiring immediate faculty intervention' },
    { id: 'progress', label: 'Roadmap & GPA Improvement Tracking', desc: 'Longitudinal comparison between baseline GPA and current performance' },
  ]

  const fetchReport = async () => {
    try {
      setLoading(true)
      const res = await api.getReportData(reportType, {
        gender: genderFilter !== 'ALL' ? genderFilter : undefined,
        risk_level: riskFilter !== 'ALL' ? riskFilter : undefined,
        search: search || undefined
      })
      setData(res.data || [])
      setTotalRecords(res.total_records || 0)
    } catch (err) {
      console.error('Error fetching report:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportType, genderFilter, riskFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReport()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleExportCsv = () => {
    const url = api.getExportCsvUrl(reportType, {
      gender: genderFilter !== 'ALL' ? genderFilter : undefined,
      risk_level: riskFilter !== 'ALL' ? riskFilter : undefined,
      search: search || undefined
    })
    window.open(url, '_blank')
  }

  const handleExportPdf = () => {
    const url = api.getExportPdfUrl(reportType, {
      gender: genderFilter !== 'ALL' ? genderFilter : undefined,
      risk_level: riskFilter !== 'ALL' ? riskFilter : undefined,
      search: search || undefined
    })
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
              Faculty Academic Reports & Exports
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Anna Univ / Autonomous Format
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export institutional academic analytics, attendance registers, and risk dossiers for your assigned cohort.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {reportTypes.map((t) => {
          const active = reportType === t.id
          return (
            <button
              key={t.id}
              onClick={() => setReportType(t.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                active
                  ? 'bg-blue-50/70 border-blue-500/50 shadow-xs ring-2 ring-blue-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileSpreadsheet className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${active ? 'text-blue-900' : 'text-slate-800'}`}>
                  {t.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                {t.desc}
              </p>
            </button>
          )
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or register no..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Gender Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setGenderFilter('ALL')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  genderFilter === 'ALL' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setGenderFilter('Male')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  genderFilter === 'Male' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setGenderFilter('Female')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  genderFilter === 'Female' ? 'bg-pink-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                Female
              </button>
            </div>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="AT_RISK">At Risk</option>
              <option value="MODERATE">Moderate Difficulty</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>
        </div>

        {/* Live Filter Count Banner */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Displaying <strong className="text-slate-800 font-semibold">{totalRecords}</strong> matching records for current query
          </span>
          <span className="text-slate-400">
            Click export to download complete dataset with current active filters
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-12">
            <LoadingState message="Generating live academic report..." />
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No student records found matching the specified filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  {Object.keys(data[0] || {}).map((colKey) => (
                    <th key={colKey} className="py-3 px-3.5">
                      {colKey.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    {Object.entries(row).map(([k, val]: any, cIdx) => {
                      if (k === 'risk_level') {
                        return (
                          <td key={cIdx} className="py-2.5 px-3.5">
                            <StatusBadge status={val} />
                          </td>
                        )
                      }
                      return (
                        <td key={cIdx} className="py-2.5 px-3.5 text-slate-700">
                          {String(val)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
