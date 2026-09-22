import React from 'react'
import { RiskLevel } from '../../types'
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

interface StatusBadgeProps {
  status: RiskLevel | string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const norm = (status || '').toUpperCase()

  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  let label = 'Normal'
  let Icon = CheckCircle2

  if (norm === 'AT_RISK' || norm === 'AT RISK' || norm === 'HIGH') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200'
    label = 'At Risk'
    Icon = AlertCircle
  } else if (norm === 'MODERATE' || norm === 'MEDIUM') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200'
    label = 'Moderate'
    Icon = AlertTriangle
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses[size]} transition-colors`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  )
}
