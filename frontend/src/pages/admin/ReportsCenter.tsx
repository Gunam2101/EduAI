import React, { useState, useEffect } from 'react'
import {
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  Table,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'

export const ReportsCenter: React.FC = () => {
  const [reportType, setReportType] = useState('overall')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const reportOptions = [
    { id: 'overall', name: 'Overall Student Performance Report', desc: 'Composite learning performance, quiz averages, GPA, and difficulty index' },
    { id: 'attendance', name: 'Student Attendance & Compliance Report', desc: 'Theory lectures, practical lab sessions, and critical attendance flags' },
    { id: 'assessment', name: 'Comprehensive Assessment Report', desc: 'Individual breakdown for Quiz 1, 2, 3, Midterm, and Final examination' },
    { id: 'difficulty', name: 'Academic Difficulty & Risk Analysis Report', desc: 'Multi-factor risk status, trigger reasons, and weak indicators' },
    { id: 'at_risk', name: 'High-Attention At-Risk Student Dossier', desc: 'Filtered list of students requiring immediate academic intervention' },
    { id: 'progress', name: 'Progress & Improvement Delta Report', desc: 'Baseline vs current performance change and trajectory status' },
  ]

  const fetchReport = async () => {
    try {
      setLoading(true)
      const data = await api.getReportData(reportType)
      setReportData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportType])

  const handleExportCsv = () => {
    window.open(api.getExportCsvUrl(reportType), '_blank')
  }

  const handleExportPdf = () => {
    window.open(api.getExportPdfUrl(reportType), '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Institutional Reports & Accreditation Exports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Export authentic dataset analytics to formatted CSV or printable PDF documents
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {reportOptions.map((opt) => (
          <div
            key={opt.id}
            onClick={() => setReportType(opt.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              reportType === opt.id
                ? 'bg-blue-50/80 border-blue-500/50 shadow-xs'
                : 'bg-white border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-slate-900">{opt.name}</h4>
              <div
                className={`w-2 h-2 rounded-full ${
                  reportType === opt.id ? 'bg-blue-600' : 'bg-transparent'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
          </div>
        ))}
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {reportOptions.find((r) => r.id === reportType)?.name} Preview ({reportData?.total_records || 0} Records)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Filtered from 300 students
          </span>
        </div>

        {loading ? (
          <LoadingState message="Generating structured report data..." />
        ) : !reportData?.data || reportData.data.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No records to display.</div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <tr>
                  {Object.keys(reportData.data[0]).map((colKey) => (
                    <th key={colKey} className="py-3 px-3 capitalize">
                      {colKey.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.data.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {Object.entries(row).map(([key, val]: any, i) => (
                      <td key={i} className="py-2.5 px-3 text-slate-700">
                        {String(val)}
                      </td>
                    ))}
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
