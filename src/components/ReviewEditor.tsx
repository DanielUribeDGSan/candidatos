import { useState, useRef } from 'react'

interface ReviewEditorProps {
  initialValue: string
  onSave: (content: string) => Promise<void>
  locale?: 'es' | 'en'
}

const toolbar = [
  { label: 'H2', prefix: '## ', suffix: '' },
  { label: 'H3', prefix: '### ', suffix: '' },
  { label: 'B', prefix: '**', suffix: '**' },
  { label: 'Code', prefix: '`', suffix: '`' },
  { label: 'Block', prefix: '\n```\n', suffix: '\n```\n' },
  { label: '• List', prefix: '\n- ', suffix: '' },
  { label: '1. List', prefix: '\n1. ', suffix: '' },
]

export default function ReviewEditor({ initialValue, onSave, locale = 'es' }: ReviewEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertAtCursor = (prefix: string, suffix: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const before = value.slice(0, start)
    const selected = value.slice(start, end)
    const after = value.slice(end)
    const newText = before + prefix + selected + suffix + after
    setValue(newText)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
    }, 0)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await onSave(value)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-white/10 px-3 py-2 bg-white/[0.02]">
        <div className="flex flex-wrap gap-1">
          {toolbar.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => insertAtCursor(btn.prefix, btn.suffix)}
              className="px-2 py-1.5 text-xs font-medium rounded border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 text-xs font-semibold rounded border border-white/20 bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 transition-colors"
        >
          {saving ? (locale === 'es' ? 'Guardando...' : 'Saving...') : saved ? (locale === 'es' ? 'Guardado' : 'Saved') : (locale === 'es' ? 'Guardar revisión' : 'Save review')}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={locale === 'es' ? 'Escribe la revisión aquí. Usa **negrita**, `código`, ```bloques```, listas con - o 1.' : 'Write the review here. Use **bold**, `code`, ```blocks```, lists with - or 1.'}
        className="flex-1 min-h-[200px] w-full resize-none bg-transparent p-4 text-sm text-neutral-300 font-mono border-0 outline-none placeholder-neutral-600"
        spellCheck="false"
      />
    </div>
  )
}
