import React from 'react'
import { AlertTriangle, AlertCircle, Info, Check } from 'lucide-react'
import { Alert } from '../../types'

interface AlertCardProps {
  alert: Alert
  onDismiss?: (id: number) => void
  onAction?: (studentId: number) => void
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onDismiss,
  onAction,
}) => {
  const isHigh = alert.priority === 'HIGH'
  const isMedium = alert.priority === 'MEDIUM'

  const border = isHigh
    ? 'border-rose-200 bg-rose-50/50'
    : isMedium
    ? 'border-amber-200 bg-amber-50/50'
    : 'border-blue-200 bg-blue-50/50'

  const iconColor = isHigh
    ? 'text-rose-600'
    : isMedium
    ? 'text-amber-600'
    : 'text-blue-600'

  const Icon = isHigh ? AlertCircle : isMedium ? AlertTriangle : Info

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 shadow-sm ${border} ${
        alert.is_read ? 'opacity-70 bg-white border-slate-200' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-1.5 rounded-lg bg-white shadow-xs ${iconColor} mt-0.5`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900">{alert.title}</h4>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isHigh
                    ? 'bg-rose-100 text-rose-800'
                    : isMedium
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {alert.priority} PRIORITY
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <span className="font-semibold text-slate-700">Trigger:</span> {alert.trigger_reason}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onAction && (
            <button
              onClick={() => onAction(alert.student_id)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
            >
              Inspect Student
            </button>
          )}
          {onDismiss && !alert.is_read && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 p-1 rounded-md hover:bg-white/80"
              title="Acknowledge & Dismiss"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
