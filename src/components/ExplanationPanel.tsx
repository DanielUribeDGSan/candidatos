import type { Difficulty } from '@lib/types'
import type { Locale } from '@i18n/translations'
import { translations } from '@i18n/translations'
import React from 'react'

const DIFFICULTY_CONFIG: Record<Difficulty, { en: string; es: string; color: string; bg: string }> = {
    easy: {
        en: 'Easy',
        es: 'Fácil',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10 border-emerald-400/20',
    },
    medium: {
        en: 'Medium',
        es: 'Medio',
        color: 'text-amber-400',
        bg: 'bg-amber-400/10 border-amber-400/20',
    },
    intermediate: {
        en: 'Intermediate',
        es: 'Intermedio',
        color: 'text-amber-400',
        bg: 'bg-amber-400/10 border-amber-400/20',
    },
    advanced: {
        en: 'Advanced',
        es: 'Avanzado',
        color: 'text-red-400',
        bg: 'bg-red-400/10 border-red-400/20',
    },
}

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
                <article className="text-[14px] text-neutral-300 leading-relaxed font-[inherit] [&_pre]:my-4 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-neutral-900/80 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre_code]:block [&_pre_code]:font-mono [&_pre_code]:text-[13px] [&_pre_code]:leading-relaxed [&_pre_code]:text-neutral-300 [&_pre_code]:whitespace-pre">
                    {(() => {
                        const lines = description.split('\n')
                        const elements: React.ReactElement[] = []
                        let listItems: React.ReactElement[] = []
                        let inCodeBlock = false
                        let codeBlockLines: string[] = []
                        let codeBlockKey = 0

                        const flushList = () => {
                            if (listItems.length > 0) {
                                elements.push(
                                    <ol key={`list-${elements.length}`} className="list-decimal ml-6 my-2 text-neutral-400">
                                        {listItems}
                                    </ol>
                                )
                                listItems = []
                            }
                        }

                        const flushCodeBlock = () => {
                            if (codeBlockLines.length > 0) {
                                elements.push(
                                    <pre key={`code-${codeBlockKey++}`}>
                                        <code>{codeBlockLines.join('\n')}</code>
                                    </pre>
                                )
                                codeBlockLines = []
                            }
                            inCodeBlock = false
                        }

                        lines.forEach((line, i) => {
                            const trimmed = line.trim()

                            // Fenced code block: start or end
                            if (trimmed.startsWith('```')) {
                                if (!inCodeBlock) {
                                    flushList()
                                    inCodeBlock = true
                                    codeBlockLines = []
                                } else {
                                    flushCodeBlock()
                                }
                                return
                            }

                            if (inCodeBlock) {
                                codeBlockLines.push(line)
                                return
                            }

                            if (!trimmed.match(/^[0-9]+\. /)) {
                                flushList()
                            }

                            if (i === 0 && trimmed.startsWith('# ')) {
                                elements.push(
                                    <div key={i} className="mb-4">
                                        <h3 className="text-xl font-bold text-white font-heading">{line.replace('# ', '')}</h3>
                                        {difficulty &&
                                            (() => {
                                                const cfg = DIFFICULTY_CONFIG[difficulty]
                                                const label = locale === 'es' ? cfg.es : cfg.en
                                                return (
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${cfg.bg} ${cfg.color}`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${difficulty === 'easy' ? 'bg-emerald-400' : (difficulty === 'medium' || difficulty === 'intermediate') ? 'bg-amber-400' : 'bg-red-400'}`}
                                                        />
                                                        {label}
                                                    </span>
                                                )
                                            })()}
                                    </div>
                                )
                            } else if (trimmed.startsWith('### ')) {
                                elements.push(
                                    <h4 key={i} className="text-base font-semibold text-neutral-200 mt-6 mb-3 font-heading">
                                        {line.replace('### ', '')}
                                    </h4>
                                )
                            } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                                elements.push(
                                    <p key={i} className="text-sm font-semibold text-white my-3">
                                        {line.replace(/\*\*/g, '')}
                                    </p>
                                )
                            } else if (trimmed.match(/^[0-9]+\. /)) {
                                listItems.push(
                                    <li key={i} className="my-1.5 text-[13.5px] pl-2">
                                        <span dangerouslySetInnerHTML={{ __html: line.replace(/^[0-9]+\. /, '').replace(/`([^`]+)`/g, '<code class="bg-white/10 text-sky-300 px-1 py-0.5 rounded font-mono text-xs">$1</code>') }} />
                                    </li>
                                )
                            } else if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
                                elements.push(
                                    <p key={i} className="italic text-neutral-500 my-4 text-sm">
                                        {line.replace(/\*/g, '')}
                                    </p>
                                )
                            } else if (!trimmed) {
                                // skip empty spacing
                            } else {
                                elements.push(
                                    <p key={i} className="my-2" dangerouslySetInnerHTML={{ __html: line.replace(/`([^`]+)`/g, '<code class="bg-white/10 text-sky-300 px-1 py-0.5 rounded font-mono text-xs">$1</code>') }} />
                                )
                            }
                        })

                        flushList()
                        flushCodeBlock()

                        return elements
                    })()}
                </article>
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
