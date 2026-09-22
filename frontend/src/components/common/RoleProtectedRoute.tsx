import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Role } from '../../types'

interface RoleProtectedRouteProps {
  allowedRole: Role
  children?: React.ReactNode
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRole,
  children,
}) => {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role !== allowedRole) {
    // Redirect to the user's authorized role dashboard
    if (role === 'Admin') return <Navigate to="/admin/dashboard" replace />
    if (role === 'Faculty') return <Navigate to="/faculty/dashboard" replace />
    return <Navigate to="/student/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
