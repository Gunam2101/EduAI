import React, { useState, useEffect } from 'react'
import {
  Settings,
  Sliders,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Save,
  Scale
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    quiz_weight: 0.20,
    exam_weight: 0.35,
    attendance_weight: 0.20,
    assignment_weight: 0.15,
    gpa_weight: 0.10,
    normal_threshold: 70.0,
    moderate_threshold: 50.0,
    critical_attendance_threshold: 50.0,
    critical_final_threshold: 40.0,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloadingDb, setReloadingDb] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const data = await api.getSettings()
        setSettings(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const currentWeightSum = (
    settings.quiz_weight +
    settings.exam_weight +
    settings.attendance_weight +
    settings.assignment_weight +
    settings.gpa_weight
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (Math.abs(currentWeightSum - 1.0) > 0.02) {
      setErrorMsg(`Weights must sum to 100% (currently ${(currentWeightSum * 100).toFixed(0)}%). Please balance the sliders.`)
      return
    }

    try {
      setSaving(true)
      const res = await api.updateSettings(settings)
      setSuccessMsg(res.message || 'Settings saved and all 300 student metrics recalculated.')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReloadDataset = async () => {
    if (!confirm('Re-run data cleaning and recalculate metrics from student_dropout_behavior_dataset.csv?')) return
    try {
      setReloadingDb(true)
      const res = await api.reloadDataset()
      setSuccessMsg(`Dataset validated and reloaded: ${res.total_students} student records updated.`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reload dataset')
    } finally {
      setReloadingDb(false)
    }
  }

  if (loading) return <LoadingState message="Loading scoring settings..." />

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          System Configuration & Scoring Calibration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure multi-factor difficulty weights, early warning thresholds, and dataset integrity
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Multi-Factor Weight Sliders */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Multi-Factor Dimension Weights
              </h3>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                Math.abs(currentWeightSum - 1.0) <= 0.02
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              Total Weight: {(currentWeightSum * 100).toFixed(0)}% / 100%
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Quiz Performance Weight</span>
                <span>{(settings.quiz_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={settings.quiz_weight}
                onChange={(e) => setSettings({ ...settings, quiz_weight: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Examinations Weight (Midterm & Final)</span>
                <span>{(settings.exam_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={settings.exam_weight}
                onChange={(e) => setSettings({ ...settings, exam_weight: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Attendance Weight (Lectures & Practical Labs)</span>
                <span>{(settings.attendance_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={settings.attendance_weight}
                onChange={(e) => setSettings({ ...settings, attendance_weight: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Assignment Completion Weight</span>
                <span>{(settings.assignment_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.05"
                value={settings.assignment_weight}
                onChange={(e) => setSettings({ ...settings, assignment_weight: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Historical Cumulative GPA Weight</span>
                <span>{(settings.gpa_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.25"
                step="0.05"
                value={settings.gpa_weight}
                onChange={(e) => setSettings({ ...settings, gpa_weight: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Risk Thresholds Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Risk Level Classification Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Normal (On Track) Minimum Score (%)
              </label>
              <input
                type="number"
                min="50"
                max="90"
                value={settings.normal_threshold}
                onChange={(e) => setSettings({ ...settings, normal_threshold: parseFloat(e.target.value) })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Moderate Difficulty Minimum Score (%)
              </label>
              <input
                type="number"
                min="30"
                max="70"
                value={settings.moderate_threshold}
                onChange={(e) => setSettings({ ...settings, moderate_threshold: parseFloat(e.target.value) })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Critical Attendance Override (%)
              </label>
              <input
                type="number"
                min="20"
                max="75"
                value={settings.critical_attendance_threshold}
                onChange={(e) => setSettings({ ...settings, critical_attendance_threshold: parseFloat(e.target.value) })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Critical Final Exam Override (%)
              </label>
              <input
                type="number"
                min="20"
                max="60"
                value={settings.critical_final_threshold}
                onChange={(e) => setSettings({ ...settings, critical_final_threshold: parseFloat(e.target.value) })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReloadDataset}
            disabled={reloadingDb}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloadingDb ? 'animate-spin' : ''}`} />
            <span>{reloadingDb ? 'Reloading...' : 'Reload & Re-Clean Primary Dataset'}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Recalculating 300 records...' : 'Save & Re-Score Dataset'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
