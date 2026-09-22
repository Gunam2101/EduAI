import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const NotFound: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-rose-50 text-rose-600 rounded-full mb-4">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The requested portal page or resource does not exist.
      </p>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  )
}
