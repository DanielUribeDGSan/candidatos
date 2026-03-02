import type { Difficulty } from '@lib/types'
import type { Locale } from '@i18n/translations'
import { translations } from '@i18n/translations'
import TestDescriptionContent from '@components/TestDescriptionContent'

interface ExplanationPanelProps {
    description: string
    difficulty?: Difficulty
    locale?: Locale
    onNext?: () => void
    isEvaluationSuccess?: boolean
    hasNextTest?: boolean
}

export default function ExplanationPanel({
    description,
    difficulty,
    locale = 'en',
    onNext,
    isEvaluationSuccess,
    hasNextTest = false
}: ExplanationPanelProps) {
    const t = translations[locale]

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Header */}
            <div className="flex border-b border-white/8 shrink-0">
                <div className="px-5 py-3 text-xs font-medium text-white border-b border-white">
                    {t.tabAbout}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
                <TestDescriptionContent description={description} difficulty={difficulty} locale={locale} />
            </div>

            {/* Run / Evaluation Status Footer */}
            {isEvaluationSuccess && (
                <div className="border-t border-white/10 p-4 bg-emerald-500/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-emerald-400 font-semibold text-sm">
                                {locale === 'es' ? '¡Prueba Superada!' : 'Test Passed!'}
                            </h4>
                            <p className="text-emerald-400/70 text-xs">
                                {locale === 'es' ? 'Tu solución ha pasado todos los casos.' : 'Your solution passed all cases.'}
                            </p>
                        </div>
                    </div>
                    {hasNextTest ? (
                        <button
                            onClick={onNext}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-sm transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            {locale === 'es' ? 'Siguiente Prueba' : 'Next Test'}
                        </button>
                    ) : (
                        <div className="px-4 py-2 bg-white/10 text-emerald-400 font-semibold rounded-lg text-sm border border-emerald-500/20">
                            {locale === 'es' ? 'Pista Completada 🎉' : 'Track Completed 🎉'}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
