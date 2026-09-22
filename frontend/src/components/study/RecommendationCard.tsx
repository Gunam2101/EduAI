import React from 'react'
import { Sparkles, CheckCircle, ArrowRight } from 'lucide-react'

interface RecommendationCardProps {
  recommendations: string[]
  title?: string
  subtitle?: string
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendations,
  title = 'Personalized Learning Recommendations',
  subtitle = 'Actionable diagnostic steps tailored to the student’s specific academic indicators',
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 pb-4 mb-3 border-b border-slate-100">
        <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No specific recommendations recorded.</p>
        ) : (
          recommendations.map((rec, index) => {
            const [heading, ...bodyParts] = rec.split(':')
            const body = bodyParts.join(':').trim()

            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 transition-colors"
              >
                <div className="pt-0.5 text-blue-600 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  {body ? (
                    <>
                      <h4 className="text-xs font-bold text-slate-900">{heading}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{body}</p>
                    </>
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{rec}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
