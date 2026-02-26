import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import { tests } from '../lib/tests'

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
}

export default function CandidateDashboard() {
    const [emailQuery, setEmailQuery] = useState('')
    const [candidate, setCandidate] = useState<CandidateInfo | null>(null)
    const [results, setResults] = useState<CandidateResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        // Check if email is in the URL search params initially
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const urlEmail = params.get('email')
            if (urlEmail) {
                setEmailQuery(urlEmail)
                fetchCandidateData(urlEmail)
            }
        }
    }, [])

    const fetchCandidateData = async (emailToSearch: string) => {
        if (!emailToSearch) return
        setLoading(true)
        setError('')
        setCandidate(null)
        setResults([])

        try {
            // 1. Fetch Candidate Record
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

            // 2. Fetch Results
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
        // Update URL without reloading page
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.set('email', emailQuery)
            window.history.pushState({}, '', url)
        }
        fetchCandidateData(emailQuery)
    }

    const getTestName = (testId: string) => {
        const test = tests.find(t => t.id === testId)
        return test ? test.name : testId
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-12">
            <header className="mb-12">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Dashboard de Candidatos
                </h1>
                <p className="text-neutral-400 mt-2">
                    Busca por correo electrónico para revisar el código entregado por los candidatos.
                </p>
            </header>

            <form onSubmit={handleSearch} className="flex gap-4 mb-12 max-w-xl">
                <input
                    type="email"
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                    placeholder="email@candidato.com"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-8">
                    {error}
                </div>
            )}

            {candidate && (
                <div className="space-y-8">
                    {/* Candidate Info Card */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{candidate.email}</h2>
                            <div className="flex gap-3 mt-2">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-emerald-400">
                                    Track: {candidate.track.toUpperCase()}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    Estado: {candidate.completed ? 'Completado' : 'En progreso'}
                                </span>
                            </div>
                        </div>
                        <div className="text-sm text-neutral-400 space-y-1">
                            <p>Iniciado: {new Date(candidate.start_time).toLocaleString()}</p>
                            {candidate.end_time && (
                                <p>Finalizado: {new Date(candidate.end_time).toLocaleString()}</p>
                            )}
                            {(candidate.inactivity_seconds != null && candidate.inactivity_seconds > 0) && (
                                <p className="text-amber-400/90" title="Tiempo sin movimiento de ratón ni teclado (umbral 1 min)">
                                    Inactividad: {Math.floor(candidate.inactivity_seconds / 60)} min
                                </p>
                            )}
                            {(candidate.tab_switches != null && candidate.tab_switches > 0) && (
                                <p className="text-amber-400/90" title="Veces que cambió de pestaña o perdió el foco">
                                    Cambios de pestaña: {candidate.tab_switches}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Results List */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6">Pruebas Entregadas ({results.length})</h3>

                        {results.length === 0 ? (
                            <p className="text-neutral-500">Aún no hay pruebas completadas para mostrar.</p>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {results.map((res, index) => (
                                    <div key={res.test_id} className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                                        <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/10">
                                            <div>
                                                <span className="text-emerald-500/80 font-mono text-sm mr-3">#{index + 1}</span>
                                                <span className="font-bold text-white">{getTestName(res.test_id)}</span>
                                                <span className="text-neutral-500 text-sm ml-2 font-mono border border-white/10 rounded px-2 py-0.5">{res.test_id}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-neutral-500">
                                                    {new Date(res.completed_at).toLocaleTimeString()}
                                                </span>
                                                {res.passed ? (
                                                    <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Pasó (Auto)
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        Revisión Manual
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-0 border-t border-white/10">
                                            <Suspense fallback={<div className="p-6 text-sm text-neutral-500 font-mono">Cargando editor...</div>}>
                                                <LazyEditor
                                                    height="300px"
                                                    language="typescript"
                                                    theme="vs-dark"
                                                    value={res.code || '// Sin código (vacío)'}
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
                                                        domReadOnly: true
                                                    }}
                                                />
                                            </Suspense>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
