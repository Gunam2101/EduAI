import React, { useState, useEffect } from 'react'
import {
  Compass,
  CheckCircle2,
  Clock,
  PlayCircle,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  FileCheck,
  ChevronRight,
  Layers,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useStudent } from '../../context/StudentContext'
import { api } from '../../services/api'
import { StudentRoadmap, RoadmapStep, PracticeQuestion } from '../../types'

export const LearningRoadmap: React.FC = () => {
  const { selectedStudentId, setSelectedStudentId, allStudents } = useStudent()
  const studentId = selectedStudentId || 1

  const [roadmap, setRoadmap] = useState<StudentRoadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingStep, setTogglingStep] = useState<number | null>(null)

  // Interactive Practice Modal State
  const [showPracticeModal, setShowPracticeModal] = useState(false)
  const [activePracticeStep, setActivePracticeStep] = useState<RoadmapStep | null>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submittedAnswer, setSubmittedAnswer] = useState(false)
  const [practiceScore, setPracticeScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  const fetchRoadmap = async () => {
    try {
      setLoading(true)
      const data = await api.getStudentRoadmap(studentId)
      setRoadmap(data)
    } catch (err) {
      console.error('Error fetching learning roadmap:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoadmap()
  }, [studentId])

  const handleToggleStep = async (stepNumber: number) => {
    try {
      setTogglingStep(stepNumber)
      await api.toggleRoadmapStep(studentId, stepNumber)
      await fetchRoadmap()
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingStep(null)
    }
  }

  const handleOpenPractice = (step: RoadmapStep) => {
    setActivePracticeStep(step)
    setCurrentQuestionIdx(0)
    setSelectedOption(null)
    setSubmittedAnswer(false)
    setPracticeScore(0)
    setQuizFinished(false)
    setShowPracticeModal(true)
  }

  const handleAnswerSubmit = () => {
    if (selectedOption === null || !roadmap) return
    setSubmittedAnswer(true)
    const q = roadmap.practice_questions[currentQuestionIdx]
    if (selectedOption === q.correct) {
      setPracticeScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (!roadmap) return
    if (currentQuestionIdx + 1 < roadmap.practice_questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1)
      setSelectedOption(null)
      setSubmittedAnswer(false)
    } else {
      setQuizFinished(true)
      // Automatically advance roadmap step if passed
      if (activePracticeStep) {
        handleToggleStep(activePracticeStep.step_number)
      }
    }
  }

  if (loading) return <LoadingState message="Formulating your 5-stage personalized learning roadmap..." />
  if (!roadmap) return null

  return (
    <div className="space-y-6">
      {/* Student Cohort Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50/80 border border-blue-200/80 p-3.5 rounded-2xl gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
          <Compass className="w-4 h-4 text-blue-600" />
          <span>Switch Student to Inspect Differentiated Academic Roadmaps:</span>
        </div>
        <select
          value={studentId}
          onChange={(e) => setSelectedStudentId(Number(e.target.value))}
          className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 shadow-2xs max-w-sm truncate"
        >
          {allStudents.length > 0 ? (
            allStudents.map((s) => (
              <option key={s.id} value={s.id}>
                Roll #{s.roll_number || s.id} — {s.name} ({s.department || 'B.Tech'})
              </option>
            ))
          ) : (
            <option value={studentId}>Loading students...</option>
          )}
        </select>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Personalized Learning Roadmap
              </span>
              <StatusBadge status={roadmap.risk_level} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              {roadmap.student_name} — Academic Learning Journey
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Based on your continuous assessment diagnostics, this 5-stage personalized roadmap guides you through foundational revision, concept reinforcement, guided problem sets, and internal assessments.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-400">
              <span>Department: <strong className="text-slate-200">{roadmap.department}</strong></span>
              <span>•</span>
              <span>Year & Semester: <strong className="text-slate-200">{roadmap.year}, {roadmap.semester} ({roadmap.section})</strong></span>
              <span>•</span>
              <span>Primary Weak Area: <strong className="text-amber-300">{roadmap.primary_weak_subject}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Roadmap Completion</span>
              <span className="text-3xl font-black text-white">
                {roadmap.overall_progress_percentage}%
              </span>
              <span className="block text-[10px] text-emerald-400 font-semibold mt-0.5">
                {roadmap.steps.filter((s) => s.status === 'COMPLETED').length} of 5 Stages Mastered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Journey Stepper (Section 11) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Visual Learning Journey
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Flow: Student Data → Performance Analysis → Weak Areas → Subject Mapping → Practice → Assessment → Progress
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            Current Stage: <strong className="text-blue-700">{roadmap.current_step.stage}</strong>
          </span>
        </div>

        {/* Stepper Timeline Bar */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {roadmap.steps.map((step) => {
              const isCompleted = step.status === 'COMPLETED'
              const isCurrent = step.status === 'CURRENT'
              const isNotStarted = step.status === 'NOT_STARTED'

              return (
                <div
                  key={step.step_number}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : isCompleted
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step.step_number}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? 'Completed' : isCurrent ? 'Active' : 'Locked'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {step.stage}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{step.subject}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detailed Stage Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Personalized Academic Stages & Exercises
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Subject: <strong className="text-slate-800">{roadmap.primary_weak_subject}</strong> & {roadmap.secondary_weak_subject}
          </span>
        </div>

        {roadmap.steps.map((step) => {
          const isCompleted = step.status === 'COMPLETED'
          const isCurrent = step.status === 'CURRENT'

          return (
            <div
              key={step.step_number}
              className={`p-6 rounded-3xl border transition-all ${
                isCurrent
                  ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10'
                  : isCompleted
                  ? 'bg-white border-slate-200/90 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-90'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                      STEP {step.step_number}
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {step.stage}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {step.subject}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto sm:ml-0">
                      <Clock className="w-3.5 h-3.5" />
                      {step.estimated_effort}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-heading">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {step.learning_activity}
                    </p>
                  </div>

                  {/* Topics List */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">Topics covered:</span>
                    {step.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Integrated Recommendation Section */}
                  {step.recommendation_tip && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong className="font-bold text-amber-900">Personalized Faculty Tip: </strong>
                        <span>{step.recommendation_tip}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Action Section */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Stage Status</span>
                    <span
                      className={`text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-full mt-1 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCurrent
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {step.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.action_type === 'practice' || step.action_type === 'quiz' ? (
                      <button
                        onClick={() => handleOpenPractice(step)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{step.action_label}</span>
                      </button>
                    ) : (
                      <button
                        disabled={togglingStep === step.step_number}
                        onClick={() => handleToggleStep(step.step_number)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>{isCompleted ? 'Mark In Progress' : 'Mark Completed'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Interactive Practice & Quiz Modal */}
      {showPracticeModal && activePracticeStep && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {activePracticeStep.subject}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 font-heading">
                  {activePracticeStep.title} — Practice Assessment
                </h3>
              </div>
              <button
                onClick={() => setShowPracticeModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!quizFinished ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Question {currentQuestionIdx + 1} of {roadmap.practice_questions.length}</span>
                  <span>Score: {practiceScore} correct</span>
                </div>

                {/* Question */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    {roadmap.practice_questions[currentQuestionIdx]?.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {roadmap.practice_questions[currentQuestionIdx]?.options.map((opt, oIdx) => {
                    const isSelected = selectedOption === oIdx
                    const isCorrect = oIdx === roadmap.practice_questions[currentQuestionIdx].correct

                    let btnStyle = 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-800'
                    if (submittedAnswer) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-50 border-rose-500 text-rose-900'
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={submittedAnswer}
                        onClick={() => setSelectedOption(oIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {submittedAnswer && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                        {submittedAnswer && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600" />}
                      </button>
                    )
                  })}
                </div>

                {/* Explanation */}
                {submittedAnswer && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 leading-relaxed">
                    <strong>Explanation: </strong>
                    {roadmap.practice_questions[currentQuestionIdx]?.explanation}
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Continuous Assessment Drill</span>
                  {!submittedAnswer ? (
                    <button
                      disabled={selectedOption === null}
                      onClick={handleAnswerSubmit}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{currentQuestionIdx + 1 < roadmap.practice_questions.length ? 'Next Question' : 'Complete Quiz'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 font-heading">
                    Practice Assessment Completed!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    You scored {practiceScore} out of {roadmap.practice_questions.length} questions correctly.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold max-w-sm mx-auto">
                  ✓ Milestone verified! Stage {activePracticeStep.step_number} has been updated in your roadmap trajectory.
                </div>
                <button
                  onClick={() => setShowPracticeModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-md"
                >
                  Return to Learning Roadmap
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
