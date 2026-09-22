import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Role } from '../types'
import { api } from '../services/api'

interface AuthContextType {
  user: User | null
  token: string | null
  role: Role
  isAuthenticated: boolean
  activeStudentId: number
  login: (email: string, password: string, role?: Role) => Promise<void>
  logout: () => void
  switchRole: (role: Role) => void
  setActiveStudentId: (id: number) => void
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  setToken: React.Dispatch<React.SetStateAction<string | null>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('eduai_token'))
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('eduai_role') as Role) || 'Admin')
  const [activeStudentId, setActiveStudentIdState] = useState<number>(() => {
    return Number(localStorage.getItem('eduai_active_student_id')) || Number(localStorage.getItem('eduai_selected_student_id')) || 1
  })
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eduai_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        // quiet
      }
    }
    const defaultName = localStorage.getItem('eduai_selected_student_name') || 'Dr. K. Ramanathan (Dean)'
    return { id: 1, email: 'admin@ps52.edu', name: defaultName, role: 'Admin' }
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem('eduai_token', token)
    } else {
      localStorage.removeItem('eduai_token')
    }
  }, [token])

  useEffect(() => {
    localStorage.setItem('eduai_role', role)
  }, [role])

  useEffect(() => {
    if (user) {
      localStorage.setItem('eduai_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('eduai_user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('eduai_active_student_id', String(activeStudentId))
    localStorage.setItem('eduai_selected_student_id', String(activeStudentId))
  }, [activeStudentId])

  const setActiveStudentId = (id: number) => {
    setActiveStudentIdState(id)
    if (user && role === 'Student') {
      setUser((prev) => (prev ? { ...prev, id, student_id: id } : null))
    }
  }

  const login = async (email: string, password: string, selectedRole?: Role) => {
    try {
      const res = await api.login({ email, password, role: selectedRole })
      setToken(res.access_token)
      const assignedRole = (res.role as Role) || selectedRole || 'Admin'
      setRole(assignedRole)
      const u: User = {
        id: res.student_id || res.faculty_id || 1,
        email: res.email,
        name: res.name,
        role: assignedRole,
        student_id: res.student_id,
        faculty_id: res.faculty_id,
      }
      setUser(u)
      if (res.student_id) {
        setActiveStudentId(res.student_id)
        localStorage.setItem('eduai_selected_student_name', res.name)
      }
    } catch (err) {
      // Fallback local demo login
      const assignedRole = selectedRole || (email.includes('student') ? 'Student' : email.includes('faculty') ? 'Faculty' : 'Admin')
      const name =
        assignedRole === 'Admin'
          ? 'Dr. K. Ramanathan (Dean - Academic Affairs)'
          : assignedRole === 'Faculty'
          ? 'Dr. S. Rangarajan (Associate Professor)'
          : (localStorage.getItem('eduai_selected_student_name') || 'Student')

      setRole(assignedRole)
      setToken('mock_demo_jwt_token_ps52')
      setUser({ id: activeStudentId, email, name, role: assignedRole, student_id: activeStudentId, faculty_id: 1 })
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('eduai_token')
    localStorage.removeItem('eduai_user')
    localStorage.removeItem('eduai_role')
  }

  const switchRole = (newRole: Role) => {
    setRole(newRole)
    if (newRole === 'Admin') {
      setUser({ id: 1, email: 'admin@ps52.edu', name: 'Dr. K. Ramanathan (Dean - Academic Affairs)', role: 'Admin' })
    } else if (newRole === 'Faculty') {
      setUser({ id: 1, email: 'faculty@ps52.edu', name: 'Dr. S. Rangarajan (Associate Professor)', role: 'Faculty', faculty_id: 1 })
    } else {
      const savedName = localStorage.getItem('eduai_selected_student_name') || 'Student'
      setUser({ id: activeStudentId, email: 'student@ps52.edu', name: savedName, role: 'Student', student_id: activeStudentId })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token || !!user,
        activeStudentId,
        login,
        logout,
        switchRole,
        setActiveStudentId,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
