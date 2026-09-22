import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { StudentDetail, StudentListItem } from '../types'
import { api } from '../services/api'
import { useAuth } from './AuthContext'

interface StudentContextType {
  selectedStudentId: number
  selectedStudent: StudentDetail | null
  studentName: string
  loading: boolean
  allStudents: StudentListItem[]
  setSelectedStudentId: (id: number) => Promise<void>
  refreshStudent: () => Promise<void>
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, setToken } = useAuth() as any

  const [selectedStudentId, setSelectedStudentIdState] = useState<number>(() => {
    const saved = localStorage.getItem('eduai_selected_student_id') || localStorage.getItem('eduai_active_student_id')
    return saved ? Number(saved) : 1
  })

  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null)
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('eduai_selected_student_name') || ''
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [allStudents, setAllStudents] = useState<StudentListItem[]>([])

  // Load cohort list on mount
  useEffect(() => {
    let mounted = true
    const loadAllStudents = async () => {
      try {
        const res = await api.getStudents({ limit: 100 })
        if (mounted && res && res.items) {
          setAllStudents(res.items)
        }
      } catch (err) {
        console.warn('Could not prefetch cohort students:', err)
      }
    }
    loadAllStudents()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch student details whenever selectedStudentId changes
  const fetchStudentData = useCallback(async (id: number) => {
    try {
      setLoading(true)
      const detail = await api.getStudent(id)
      setSelectedStudent(detail)
      if (detail && detail.name) {
        setStudentName(detail.name)
        localStorage.setItem('eduai_selected_student_name', detail.name)
        // Also update AuthContext user if currently in Student role
        if (user && user.role === 'Student' && setUser) {
          setUser({
            ...user,
            id: detail.id,
            name: detail.name,
            student_id: detail.id,
          })
        }
      }
    } catch (err) {
      console.error(`Failed to fetch student #${id} data:`, err)
    } finally {
      setLoading(false)
    }
  }, [user, setUser])

  useEffect(() => {
    fetchStudentData(selectedStudentId)
  }, [selectedStudentId, fetchStudentData])

  const setSelectedStudentId = async (id: number) => {
    setSelectedStudentIdState(id)
    localStorage.setItem('eduai_selected_student_id', String(id))
    localStorage.setItem('eduai_active_student_id', String(id))

    try {
      // Sync with backend to get a valid token for this student
      const tokenRes = await api.selectStudent(id)
      if (tokenRes && tokenRes.access_token) {
        if (setToken) {
          setToken(tokenRes.access_token)
        }
        localStorage.setItem('eduai_token', tokenRes.access_token)
        if (tokenRes.name) {
          setStudentName(tokenRes.name)
          localStorage.setItem('eduai_selected_student_name', tokenRes.name)
        }
        if (setUser && user) {
          setUser({
            ...user,
            id,
            student_id: id,
            name: tokenRes.name || user.name,
            role: 'Student',
          })
        }
      }
    } catch (e) {
      console.warn('Backend select-student fallback:', e)
    }

    await fetchStudentData(id)
  }

  const refreshStudent = async () => {
    await fetchStudentData(selectedStudentId)
  }

  return (
    <StudentContext.Provider
      value={{
        selectedStudentId,
        selectedStudent,
        studentName: selectedStudent?.name || studentName || 'Student',
        loading,
        allStudents,
        setSelectedStudentId,
        refreshStudent,
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export const useStudent = () => {
  const ctx = useContext(StudentContext)
  if (!ctx) {
    throw new Error('useStudent must be used within a StudentProvider')
  }
  return ctx
}
