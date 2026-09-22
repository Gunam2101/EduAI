import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Plus,
  Layers,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  Clock,
  Trash2,
  CheckCircle2,
  Info
} from 'lucide-react'
import { Modal } from '../../components/common/Modal'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'
import { Subject, SubjectTopic } from '../../types'

export const SubjectsAndTopics: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  // Subject Modal
  const [subjectModalOpen, setSubjectModalOpen] = useState(false)
  const [newSubjCode, setNewSubjCode] = useState('')
  const [newSubjName, setNewSubjName] = useState('')
  const [newSubjCredits, setNewSubjCredits] = useState(4)
  const [newSubjDesc, setNewSubjDesc] = useState('')

  // Topic Modal
  const [topicModalOpen, setTopicModalOpen] = useState(false)
  const [selectedSubjId, setSelectedSubjId] = useState<number | null>(null)
  const [topicName, setTopicName] = useState('')
  const [unitNumber, setUnitNumber] = useState(1)
  const [diffLevel, setDiffLevel] = useState('Intermediate')
  const [recHours, setRecHours] = useState(3.0)

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const data = await api.getSubjects()
      setSubjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createSubject({
        code: newSubjCode,
        name: newSubjName,
        credits: newSubjCredits,
        description: newSubjDesc,
      })
      setSubjectModalOpen(false)
      setNewSubjCode('')
      setNewSubjName('')
      setNewSubjDesc('')
      fetchSubjects()
    } catch (err: any) {
      alert(err.message || 'Failed to create subject')
    }
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjId) return
    try {
      await api.createTopic({
        subject_id: selectedSubjId,
        unit_number: unitNumber,
        name: topicName,
        difficulty_level: diffLevel,
        recommended_hours: recHours,
      })
      setTopicModalOpen(false)
      setTopicName('')
      fetchSubjects()
    } catch (err: any) {
      alert(err.message || 'Failed to add topic')
    }
  }

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Are you sure you want to remove this subject?')) return
    try {
      await api.deleteSubject(id)
      fetchSubjects()
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      {/* Notice Banner explaining Indian Engineering College Academic Layer */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 leading-relaxed">
          <span className="font-bold">Indian Engineering College Academic Layer:</span> The continuous assessment indicators are evaluated from the authentic 300-student dataset (<code>student_dropout_behavior_dataset.csv</code>). This academic structure provides an application-level mapping layer for an Indian Engineering College (Anna University / VTU / AICTE Model Curriculum aligned) featuring the 12 core engineering subjects and unit-level topics for diagnostic roadmap routing.
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Curriculum & Topic Mapping Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchical curriculum structure for mapped learning outcomes and diagnostic topics
          </p>
        </div>

        <button
          onClick={() => setSubjectModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects & Topics Tree */}
      {loading ? (
        <LoadingState message="Loading curriculum tree..." />
      ) : (
        <div className="space-y-4">
          {subjects.map((subj) => (
            <div
              key={subj.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* Subject Header */}
              <div className="p-5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{subj.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        {subj.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">({subj.credits} Credits)</span>
                    </div>
                    {subj.description && (
                      <p className="text-xs text-slate-500 mt-1">{subj.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSubjId(subj.id)
                      setTopicModalOpen(true)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Add Topic</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subj.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Topics Grid */}
              <div className="p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Syllabus Units & Diagnostic Topics ({subj.topics.length})</span>
                </h4>

                {subj.topics.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No topics mapped yet. Click 'Add Topic' above to configure units.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subj.topics.map((top) => (
                      <div
                        key={top.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-200 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                            Unit {top.unit_number}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              top.difficulty_level === 'Hard'
                                ? 'bg-rose-100 text-rose-700'
                                : top.difficulty_level === 'Intermediate'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {top.difficulty_level}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 leading-snug">{top.name}</h5>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {top.recommended_hours}h Recommended
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-blue-600">
                            <ClipboardList className="w-3 h-3" />
                            {top.assessments_count} Assessments
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title="Register New Curriculum Subject"
        subtitle="Expands course catalog for future diagnostic mapping"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
              <input
                type="text"
                required
                placeholder="e.g. CS504"
                value={newSubjCode}
                onChange={(e) => setNewSubjCode(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="6"
                value={newSubjCredits}
                onChange={(e) => setNewSubjCredits(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Computing & Cloud Infrastructure"
              value={newSubjName}
              onChange={(e) => setNewSubjName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Key concepts, goals, and learning outcomes..."
              value={newSubjDesc}
              onChange={(e) => setNewSubjDesc(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubjectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Create Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        isOpen={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        title="Add Unit & Topic to Subject"
        subtitle="Define learning unit, target difficulty, and recommended study duration"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Number</label>
              <input
                type="number"
                min="1"
                max="8"
                value={unitNumber}
                onChange={(e) => setUnitNumber(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
              <select
                value={diffLevel}
                onChange={(e) => setDiffLevel(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Easy">Easy (Foundational)</option>
                <option value="Intermediate">Intermediate (Core)</option>
                <option value="Hard">Hard (Advanced / Complex)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Asynchronous Consensus & Raft Algorithm"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recommended Study Duration (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="20"
              value={recHours}
              onChange={(e) => setRecHours(Number(e.target.value))}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTopicModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Add Topic
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
