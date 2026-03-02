import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import { tests } from '../lib/tests'
import TestDescriptionContent from '@components/TestDescriptionContent'
import ReviewEditor from '@components/ReviewEditor'

const LazyEditor = lazy(() => import('@monaco-editor/react'))

interface CandidateResult {
  test_id: string
  code: string
  passed: boolean
  completed_at: string
}

interface CandidateInfo {
  email: string
  track: string
  completed: boolean
  start_time: string
  end_time: string
  inactivity_seconds?: number | null
  tab_switches?: number | null
  review?: string | null
}

const SIDEBAR_WIDTH = 260

export default function CandidateDashboard() {
  const [emailQuery, setEmailQuery] = useState('')
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null)
  const [results, setResults] = useState<CandidateResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string | 'review' | null>(null)
  const [editingReview, setEditingReview] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlEmail = params.get('email')
      if (urlEmail) {
        setEmailQuery(urlEmail)
        fetchCandidateData(urlEmail)
      }
    }
  }, [])

  useEffect(() => {
    if (results.length > 0 && selectedId === null) {
      setSelectedId(results[0].test_id)
    }
  }, [results, selectedId])

  const fetchCandidateData = async (emailToSearch: string) => {
    if (!emailToSearch) return
    setLoading(true)
    setError('')
    setCandidate(null)
    setResults([])
    setSelectedId(null)

    try {
      const { data: candData, error: candError } = await supabase
        .from('candidates')
        .select('*')
        .eq('email', emailToSearch)
        .single()

      if (candError || !candData) {
        setError('Candidato no encontrado para este email.')
        setLoading(false)
        return
      }

      setCandidate(candData)

      const { data: resData, error: resError } = await supabase
        .from('candidate_results')
        .select('*')
        .eq('email', emailToSearch)
        .order('completed_at', { ascending: true })

      if (!resError && resData) {
        setResults(resData)
      }
    } catch (err: any) {
      setError('Error al obtener datos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('email', emailQuery)
      window.history.pushState({}, '', url)
    }
    fetchCandidateData(emailQuery)
  }

  const getTestName = (testId: string) => {
    const test = tests.find((t) => t.id === testId)
    return test ? test.name : testId
  }

  const getTest = (testId: string) => tests.find((t) => t.id === testId)

  const selectedResult = selectedId && selectedId !== 'review' ? results.find((r) => r.test_id === selectedId) : null
  const isReviewSelected = selectedId === 'review'

  const handleSaveReview = async (content: string) => {
    if (!candidate) return
    await supabase
      .from('candidates')
      .update({ review: content || null })
      .eq('email', candidate.email)
      .eq('track', candidate.track)
    setCandidate((prev) => (prev ? { ...prev, review: content || null } : null))
    setEditingReview(false)
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Header - mismo estilo que test */}
      <header className="h-12 shrink-0 flex items-center justify-between px-3 md:px-5 border-b border-white/8 bg-black z-10">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-semibold text-sm tracking-tight text-white truncate">
            Dashboard de Candidatos / Candidate Dashboard
          </h1>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="email"
            value={emailQuery}
            onChange={(e) => setEmailQuery(e.target.value)}
            placeholder="email@candidato.com"
            className="w-48 md:w-64 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white/10 text-white border border-white/10 hover:bg-white/15 disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </form>
      </header>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!candidate ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-neutral-500 text-sm">
            Busca por correo para revisar los resultados del candidato.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar izquierdo: tests entregados + Revisión */}
          <div
            className="shrink-0 border-r border-white/8 bg-black flex flex-col"
            style={{ width: SIDEBAR_WIDTH }}
          >
            <div className="p-3 border-b border-white/8">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Pruebas Entregadas ({results.length})
              </p>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {results.map((res, index) => {
                const isSelected = selectedId === res.test_id
                return (
                  <button
                    key={res.test_id}
                    type="button"
                    onClick={() => setSelectedId(res.test_id)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2 border-l-2 transition-colors ${
                      isSelected
                        ? 'bg-white/5 border-l-white/30 text-white'
                        : 'border-l-transparent text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-300'
                    }`}
                  >
                    <span className="text-neutral-500 font-mono text-xs shrink-0">#{index + 1}</span>
                    <span className="truncate text-sm">{getTestName(res.test_id)}</span>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setSelectedId('review')}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-2 border-l-2 transition-colors mt-2 ${
                  isReviewSelected
                    ? 'bg-white/5 border-l-white/30 text-white'
                    : 'border-l-transparent text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-300'
                }`}
              >
                <span className="text-neutral-500 font-mono text-xs shrink-0">#</span>
                <span className="truncate text-sm">Revisión / Review</span>
              </button>
            </nav>
            <div className="p-3 border-t border-white/8 text-xs text-neutral-500 space-y-0.5">
              <p>Inicio: {new Date(candidate.start_time).toLocaleString()}</p>
              {candidate.end_time && <p>Fin: {new Date(candidate.end_time).toLocaleString()}</p>}
              {(candidate.inactivity_seconds != null && candidate.inactivity_seconds > 0) && (
                <p title="Inactividad">Inact.: {Math.floor(candidate.inactivity_seconds / 60)} min</p>
              )}
              {(candidate.tab_switches != null && candidate.tab_switches > 0) && (
                <p>Pestañas: {candidate.tab_switches}</p>
              )}
            </div>
          </div>

          {/* Contenido central: Explanation + Editor (o solo Explanation para Revisión) */}
          <div className="flex-1 flex min-w-0">
            {/* Panel Explanation - lo que se pidió o la revisión */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-white/8 bg-[#0a0a0a]">
              <div className="shrink-0 px-5 py-3 border-b border-white/8">
                <span className="text-xs font-medium text-white border-b border-white pb-0.5">Explanation</span>
              </div>
              <div className="flex-1 overflow-auto p-4 md:p-6">
                {isReviewSelected ? (
                  (candidate.review && !editingReview) ? (
                    <div className="[&_pre]:my-4 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-neutral-900/80 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre_code]:block [&_pre_code]:font-mono [&_pre_code]:text-[13px] [&_pre_code]:whitespace-pre">
                      <div className="flex justify-end mb-2">
                        <button
                          type="button"
                          onClick={() => setEditingReview(true)}
                          className="text-xs px-3 py-1.5 rounded border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                        >
                          Editar revisión
                        </button>
                      </div>
                      <TestDescriptionContent description={candidate.review} locale="es" hideTitle />
                    </div>
                  ) : (
                    <ReviewEditor
                      initialValue={candidate.review || ''}
                      onSave={handleSaveReview}
                      locale="es"
                    />
                  )
                ) : selectedResult ? (
                  (() => {
                    const test = getTest(selectedResult.test_id)
                    if (!test) return <p className="text-neutral-500 text-sm">Test no encontrado.</p>
                    return (
                      <TestDescriptionContent
                        description={test.description}
                        difficulty={test.difficulty}
                        locale="es"
                      />
                    )
                  })()
                ) : null}
              </div>
            </div>

            {/* Panel Editor - lo que respondió el usuario (solo para tests, no para Revisión) */}
            {!isReviewSelected && selectedResult && (
              <div className="w-[50%] min-w-[320px] max-w-[600px] flex flex-col border-white/8 bg-black">
                <div className="shrink-0 px-4 py-3 border-b border-white/8 flex items-center justify-between">
                  <span className="text-xs font-medium text-white">Editor</span>
                  <span className="text-[10px] text-neutral-500 font-mono">{selectedResult.test_id}</span>
                </div>
                <div className="flex-1 min-h-0">
                  <Suspense fallback={<div className="p-4 text-neutral-500 text-sm">Cargando...</div>}>
                    <LazyEditor
                      height="100%"
                      language="typescript"
                      theme="vs-dark"
                      value={selectedResult.code || '// Sin código'}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        renderLineHighlight: 'none',
                        padding: { top: 16, bottom: 16 },
                        domReadOnly: true,
                      }}
                    />
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
