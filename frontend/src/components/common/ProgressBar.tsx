import React from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'auto'
  size?: 'sm' | 'md' | 'lg'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'auto',
  size = 'md',
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100)

  let barColor = 'bg-blue-600'
  if (color === 'auto') {
    if (percentage >= 70) barColor = 'bg-emerald-500'
    else if (percentage >= 50) barColor = 'bg-amber-500'
    else barColor = 'bg-rose-500'
  } else {
    const colorMap = {
      blue: 'bg-blue-600',
      emerald: 'bg-emerald-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
      purple: 'bg-purple-600',
    }
    barColor = colorMap[color]
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-semibold text-slate-800">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${barColor} ${heightClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
