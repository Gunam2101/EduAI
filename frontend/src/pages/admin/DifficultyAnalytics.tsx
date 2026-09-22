import React, { useState, useEffect } from 'react'
import {
  BrainCircuit,
  Sliders,
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { ChartCard } from '../../components/common/ChartCard'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'

export const DifficultyAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await api.getDifficultyAnalytics()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingState message="Calculating model difficulty metrics & feature importances..." />
  if (!data) return null

  const { status_summary, scoring_formula, feature_importances, risk_factors } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Learning Difficulty & ML Analytics Engine
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Transparent multi-factor difficulty index formula, ML feature importances, and explainability breakdown
        </p>
      </div>

      {/* Model Formula Documentation Card (Section 7 & 19 Requirement) */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {scoring_formula.formula_name}
            </h3>
            <p className="text-xs text-slate-300">
              Deterministic, explainable baseline for collegiate & academic accreditation standards
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 font-mono text-xs text-blue-300 overflow-x-auto">
          <code>{scoring_formula.equation}</code>
          <div className="mt-1 text-slate-400 text-[11px]">
            <code>{scoring_formula.difficulty_equation}</code>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <span className="font-bold text-emerald-400 block mb-1">NORMAL (ON TRACK)</span>
            <p className="text-slate-300 text-[11px]">Learning Score ≥ 70% (Difficulty ≤ 30)</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
            <span className="font-bold text-amber-400 block mb-1">MODERATE ATTENTION</span>
            <p className="text-slate-300 text-[11px]">50% ≤ Learning Score &lt; 70% (Difficulty 30–50)</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
            <span className="font-bold text-rose-400 block mb-1">AT RISK (HIGH ATTENTION)</span>
            <p className="text-slate-300 text-[11px]">
              Score &lt; 50% OR Critical Override (Attendance &lt; 50% or Final &lt; 40%)
            </p>
          </div>
        </div>
      </div>

      {/* Scikit-Learn Feature Importances & Risk Factors Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Feature Importances */}
        <ChartCard
          title="Scikit-Learn ML Feature Importances"
          subtitle="Relative contribution of academic indicators to difficulty classification (RandomForest surrogate)"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={feature_importances}
                margin={{ top: 15, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${val}% feature weight`, 'Importance']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Primary Contributing Risk Factors */}
        <ChartCard
          title="Prevalence of Specific Risk Triggers"
          subtitle="Number of students in the 300 cohort exhibiting each specific deficiency"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={risk_factors}
                margin={{ top: 15, right: 30, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="factor" type="category" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number, _, props: any) => [`${val} students (${props.payload.pct}%)`, 'Deficiency Count']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Explainability Walkthrough Box */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Machine Learning Pipeline & Ethical AI Architecture
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The system implements a transparent hybrid pipeline: Raw CSV Data → Data Cleaning (Engagement-correlated Imputation for assignments) → Feature Scaling (StandardScaler) → Baseline Multi-Factor Scoring → Unsupervised K-Means Behavioral Clustering → Random Forest Surrogate Interpretation.
          As outlined in Section 20, because the raw benchmark dataset does not carry human-labeled ground truth dropout labels, we maintain 100% transparency by not falsely marketing black-box accuracy numbers, while providing a modular architecture ready for supervised training when post-semester institutional labels become available.
        </p>
      </div>
    </div>
  )
}
