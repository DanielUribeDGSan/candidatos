import type { Difficulty } from '@lib/types'
import type { Locale } from '@i18n/translations'
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

export interface TestDescriptionContentProps {
  description: string
  difficulty?: Difficulty
  locale?: Locale
  /** Si true, no muestra el título # ni el badge de dificultad (útil cuando el título va fuera) */
  hideTitle?: boolean
}

export default function TestDescriptionContent({
  description,
  difficulty,
  locale = 'en',
  hideTitle = false,
}: TestDescriptionContentProps) {
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

    if (!trimmed.match(/^\d+\. /)) {
      flushList()
    }

    const isFirstLineTitle = i === 0 && trimmed.startsWith('# ')
    if (isFirstLineTitle && !hideTitle) {
      elements.push(
        <div key={i} className="mb-4">
          <h3 className="text-xl font-bold text-white font-heading">{line.replace('# ', '')}</h3>
          {difficulty && (() => {
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
    } else if (isFirstLineTitle && hideTitle) {
      // Solo omitir la línea del título, no renderizar nada
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
    } else if (trimmed.match(/^\d+\. /)) {
      listItems.push(
        <li key={i} className="my-1.5 text-[13.5px] pl-2">
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, '').replace(/`([^`]+)`/g, '<code class="bg-white/10 text-sky-300 px-1 py-0.5 rounded font-mono text-xs">$1</code>') }} />
        </li>
      )
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      elements.push(
        <p key={i} className="italic text-neutral-500 my-4 text-sm">
          {line.replace(/\*/g, '')}
        </p>
      )
    } else if (!trimmed) {
      // skip
    } else {
      elements.push(
        <p key={i} className="my-2" dangerouslySetInnerHTML={{ __html: line.replace(/`([^`]+)`/g, '<code class="bg-white/10 text-sky-300 px-1 py-0.5 rounded font-mono text-xs">$1</code>') }} />
      )
    }
  })

  flushList()
  flushCodeBlock()

  return (
    <article className="text-[14px] text-neutral-300 leading-relaxed font-[inherit] [&_pre]:my-4 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-neutral-900/80 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:min-w-0 [&_pre]:max-w-full [&_pre_code]:block [&_pre_code]:font-mono [&_pre_code]:text-[13px] [&_pre_code]:leading-relaxed [&_pre_code]:text-neutral-300 [&_pre_code]:whitespace-pre [&_pre_code]:min-w-max">
      {elements}
    </article>
  )
}
