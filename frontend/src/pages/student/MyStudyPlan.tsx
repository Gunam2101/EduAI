import React, { useState, useEffect } from 'react'
import {
  Clock,
  Target,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { StudyPlanCard } from '../../components/study/StudyPlanCard'
import { LoadingState } from '../../components/common/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { useStudent } from '../../context/StudentContext'
import { api } from '../../services/api'
import { StudyPlan } from '../../types'

export const MyStudyPlan: React.FC = () => {
  const { selectedStudentId } = useStudent()
  const studentId = selectedStudentId || 1

  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPlan = async () => {
    try {
      setLoading(true)
      const data = await api.getStudentStudyPlan(studentId)
      setPlan(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlan()
  }, [studentId])

  const handleToggle = async (itemId: number) => {
    try {
      await api.toggleStudyPlanItem(itemId)
      fetchPlan()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <LoadingState message="Synthesizing your 7-day schedule..." />
  if (!plan) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          My Personalized 7-Day Study Schedule
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Actionable daily milestones designed specifically to elevate your weakest academic indicators
        </p>
      </div>

      <StudyPlanCard
        plan={plan}
        onToggleItem={handleToggle}
      />
    </div>
  )
}
