import { useState, useEffect, useCallback, useRef } from 'react'
import type { Locale } from '@i18n/translations'
import { translations } from '@i18n/translations'
import { tracks, categories } from '@lib/tests'
import { useResizablePanel } from '@hooks/useResizablePanel'
import Header from '@components/Header'
import Sidebar from '@components/Sidebar'
import WelcomeScreen from '@components/WelcomeScreen'
import EditableCodePanel from '@components/EditableCodePanel'
import ExplanationPanel from '@components/ExplanationPanel'
import EmailCaptureModal from '@components/EmailCaptureModal'
import type { Test, Track } from '@lib/types'
import { supabase } from '@lib/supabase'

const SIDEBAR_MAX = 260
const CODEPANEL_MAX = 420
const COLLAPSE_THRESHOLD = 100
const MOBILE_BREAKPOINT = 768

interface AlgoVizProps {
  initialTrackId?: string
  locale?: Locale
}

export default function AlgoViz({ initialTrackId, locale = 'en' }: AlgoVizProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [candidateEmail, setCandidateEmail] = useState<string | null>(null)
  const [evaluationSuccess, setEvaluationSuccess] = useState(false)

  const [completedTestIds, setCompletedTestIds] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [allTestsCompleted, setAllTestsCompleted] = useState(false)

  // Anti-cheating: inactividad (sin mouse/teclado 1 min) y cambios de pestaña (solo refs; se persisten en Supabase)
  const lastActivityAt = useRef(Date.now())
  const inactivitySecondsRef = useRef(0)
  const tabSwitchesRef = useRef(0)

  // Track state
  const activeTrack = tracks.find((t) => t.id === initialTrackId) || null
  const [selectedTest, setSelectedTest] = useState<Test | null>(() => {
    return activeTrack ? activeTrack.tests[0] : null
  })

  // Helpers
  const currentTestIndex =
    selectedTest && activeTrack ? activeTrack.tests.findIndex((t) => t.id === selectedTest.id) : -1
  const hasNextTest = activeTrack ? currentTestIndex < activeTrack.tests.length - 1 : false

  // Resize hooks
  const {
    width: sidebarWidth,
    collapsed: sidebarCollapsed,
    isDragging: isDraggingSidebar,
    handleDragStart: handleSidebarResize,
    expand: expandSidebar,
    collapse: collapseSidebar,
  } = useResizablePanel({
    maxWidth: SIDEBAR_MAX,
    collapseThreshold: COLLAPSE_THRESHOLD,
    side: 'left',
  })

  const {
    width: explanationPanelWidth,
    collapsed: explanationPanelCollapsed,
    isDragging: isDraggingExplanationPanel,
    handleDragStart: handleExplanationPanelResize,
    expand: expandExplanationPanel,
    collapse: collapseExplanationPanel,
  } = useResizablePanel({
    maxWidth: CODEPANEL_MAX,
    collapseThreshold: COLLAPSE_THRESHOLD,
    side: 'right',
  })

  // Mobile state handlers
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileCodePanelOpen, setMobileCodePanelOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      if (mobile) {
        collapseSidebar()
        collapseExplanationPanel()
      } else {
        if (window.innerWidth < 1024) collapseSidebar()
        else expandSidebar()

        if (window.innerWidth < 1280) collapseExplanationPanel()
        else expandExplanationPanel()
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [collapseSidebar, collapseExplanationPanel, expandSidebar, expandExplanationPanel])

  useEffect(() => {
    if (initialTrackId) {
      const track = tracks.find((t) => t.id === initialTrackId)
      if (track) {
        setSelectedTest(track.tests[0])
      }
    }
  }, [initialTrackId])

  // Fetch candidate Data (timer always from Supabase; if exam was reset, clear local and ask for email again)
  useEffect(() => {
    if (!candidateEmail || !activeTrack) return

    const fetchCandidateData = async () => {
      const { data: candidateInfo, error } = await supabase
        .from('candidates')
        .select('start_time, completed, inactivity_seconds, tab_switches')
        .eq('email', candidateEmail)
        .eq('track', activeTrack.id)
        .maybeSingle()

      const noCandidate = error?.code === 'PGRST116' || (!error && !candidateInfo)
      const hasNoStartTime =
        candidateInfo && candidateInfo.start_time == null && !candidateInfo.completed

      if (noCandidate || hasNoStartTime) {
        localStorage.removeItem(`algodev_test_email_${activeTrack.id}`)
        localStorage.removeItem(`candidate_drafts_${candidateEmail}_${activeTrack.id}`)
        setCandidateEmail(null)
        setTimeRemaining(null)
        setCompletedTestIds([])
        return
      }

      if (candidateInfo) {
        inactivitySecondsRef.current = candidateInfo.inactivity_seconds ?? 0
        tabSwitchesRef.current = candidateInfo.tab_switches ?? 0
        lastActivityAt.current = Date.now()

        if (candidateInfo.completed) {
          setAllTestsCompleted(true)
        } else if (candidateInfo.start_time) {
          const durationMs = 50 * 60 * 1000 // 50 mins
          const start = new Date(candidateInfo.start_time).getTime()
          const now = Date.now()
          const elapsed = now - start

          if (elapsed >= durationMs) {
            setIsTimeUp(true)
            setTimeRemaining(0)
          } else {
            setTimeRemaining(Math.floor((durationMs - elapsed) / 1000))
          }
        }
      }

      const { data: results } = await supabase
        .from('candidate_results')
        .select('test_id, code, passed')
        .eq('email', candidateEmail)
        .eq('track', activeTrack.id)

      const draftKey = `candidate_drafts_${candidateEmail}_${activeTrack.id}`
      const existingDrafts = JSON.parse(localStorage.getItem(draftKey) || '[]')
      const mergedDrafts = [...existingDrafts]

      if (results) {
        results.forEach((dbRes: any) => {
          if (!mergedDrafts.some((d: any) => d.test_id === dbRes.test_id)) {
            mergedDrafts.push(dbRes)
          }
        })
      }

      localStorage.setItem(draftKey, JSON.stringify(mergedDrafts))
      setCompletedTestIds(mergedDrafts.map((r: any) => r.test_id))
    }

    fetchCandidateData()
  }, [candidateEmail, activeTrack])

  const handleFinalSubmission = useCallback(async () => {
    if (!candidateEmail || !activeTrack) return
    const draftKey = `candidate_drafts_${candidateEmail}_${activeTrack.id}`
    const finalDrafts = JSON.parse(localStorage.getItem(draftKey) || '[]')

    // Only send to Supabase if they completed 8 or more tests
    if (finalDrafts.length >= 8) {
      const insertData = finalDrafts.map((d: any) => ({
        email: candidateEmail,
        track: activeTrack.id,
        test_id: d.test_id,
        code: d.code,
        passed: d.passed,
      }))

      const { error } = await supabase
        .from('candidate_results')
        .upsert(insertData, { onConflict: 'email,track,test_id' })
      if (error) console.error('Error saving final results:', error)
    }

    await supabase
      .from('candidates')
      .update({
        completed: true,
        end_time: new Date().toISOString(),
        inactivity_seconds: inactivitySecondsRef.current,
        tab_switches: tabSwitchesRef.current,
      })
      .eq('email', candidateEmail)
      .eq('track', activeTrack.id)
  }, [candidateEmail, activeTrack])

  // Timer Countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isTimeUp || allTestsCompleted) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null
        if (prev <= 1) {
          clearInterval(interval)
          setIsTimeUp(true)
          handleFinalSubmission()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, isTimeUp, allTestsCompleted, handleFinalSubmission])

  // Detección inactividad (1 min sin mouse/teclado) y cambios de pestaña → solo en estado/refs; se envían a Supabase en el envío final
  useEffect(() => {
    if (!candidateEmail || !activeTrack || !selectedTest || isTimeUp || allTestsCompleted) return

    const INACTIVITY_MS = 60 * 1000

    const onActivity = () => {
      lastActivityAt.current = Date.now()
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'click', 'scroll']
    events.forEach((e) => window.addEventListener(e, onActivity))

    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastActivityAt.current >= INACTIVITY_MS) {
        lastActivityAt.current = now
        inactivitySecondsRef.current += 60
      }
    }, INACTIVITY_MS)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        tabSwitchesRef.current += 1
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [candidateEmail, activeTrack, selectedTest, isTimeUp, allTestsCompleted])

  const handleSelectTest = useCallback(
    (testId: string, force = false) => {
      if (!activeTrack) return
      if (!force && completedTestIds.includes(testId)) return // Disallow moving back to completed normally
      const test = activeTrack.tests.find((t) => t.id === testId)
      if (test) {
        setSelectedTest(test)
        setEvaluationSuccess(false) // Reset on new test
      }
      if (isMobile) {
        setMobileSidebarOpen(false)
        setMobileCodePanelOpen(false)
      }
    },
    [isMobile, activeTrack, completedTestIds],
  )

  const handleNextTest = useCallback(() => {
    if (!activeTrack || currentTestIndex === -1 || !hasNextTest) return
    const nextTest = activeTrack.tests[currentTestIndex + 1]
    handleSelectTest(nextTest.id)
  }, [activeTrack, currentTestIndex, hasNextTest, handleSelectTest])

  const handleToggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev)
    if (!mobileSidebarOpen && mobileCodePanelOpen) {
      setMobileCodePanelOpen(false)
    }
  }, [mobileSidebarOpen, mobileCodePanelOpen])

  const handleToggleMobileCodePanel = useCallback(() => {
    setMobileCodePanelOpen((prev) => !prev)
    if (!mobileCodePanelOpen && mobileSidebarOpen) {
      setMobileSidebarOpen(false)
    }
  }, [mobileCodePanelOpen, mobileSidebarOpen])

  const handleCompleteTask = async (code: string) => {
    if (!candidateEmail || !selectedTest || !activeTrack) return

    try {
      // Save visually to localStorage
      const draftKey = `candidate_drafts_${candidateEmail}_${activeTrack.id}`
      const existingDrafts = JSON.parse(localStorage.getItem(draftKey) || '[]')
      const newDraftInfo = {
        test_id: selectedTest.id,
        code: code,
        passed: evaluationSuccess,
      }

      const existingIdx = existingDrafts.findIndex((d: any) => d.test_id === selectedTest.id)
      if (existingIdx >= 0) {
        existingDrafts[existingIdx] = newDraftInfo
      } else {
        existingDrafts.push(newDraftInfo)
      }
      localStorage.setItem(draftKey, JSON.stringify(existingDrafts))
    } catch (err) {
      console.error('Unexpected error saving local result:', err)
    }

    setCompletedTestIds((prev) => {
      if (prev.includes(selectedTest.id)) return prev
      return [...prev, selectedTest.id]
    })

    // Auto-advance logic
    const currIndex = activeTrack.tests.findIndex((t) => t.id === selectedTest.id)
    let nextIndex = currIndex + 1
    let foundNext = false
    const currentCompleted = [...completedTestIds, selectedTest.id]

    while (nextIndex < activeTrack.tests.length) {
      const nextTest = activeTrack.tests[nextIndex]
      if (!currentCompleted.includes(nextTest.id)) {
        handleSelectTest(nextTest.id, true) // Force selection even if appena added to completed
        foundNext = true
        break
      }
      nextIndex++
    }

    if (!foundNext) {
      const missedTest = activeTrack.tests.find((t) => !currentCompleted.includes(t.id))
      if (missedTest) {
        handleSelectTest(missedTest.id, true)
      } else {
        setAllTestsCompleted(true)
        handleFinalSubmission()
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white font-[family-name:var(--font-geist-sans)] overflow-hidden">
      {/* Top Header */}
      <Header
        locale={locale}
        t={translations[locale]}
        selectedTest={selectedTest}
        sidebarCollapsed={sidebarCollapsed}
        codePanelCollapsed={explanationPanelCollapsed}
        onExpandSidebar={expandSidebar}
        onExpandCodePanel={expandExplanationPanel}
        isMobile={isMobile}
        onToggleMobileSidebar={handleToggleMobileSidebar}
        onToggleMobileCodePanel={handleToggleMobileCodePanel}
        timeRemaining={timeRemaining}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        {/* Desktop Sidebar */}
        {!isMobile && (
          <>
            <div
              className={`shrink-0 h-full border-r border-white/8 bg-black transition-[width,transform] duration-300 ease-in-out z-10 ${
                sidebarCollapsed ? 'w-0 -translate-x-full' : ''
              }`}
              style={{ width: sidebarCollapsed ? 0 : sidebarWidth }}
            >
              <div
                className="w-[var(--sidebar-width)] h-full overflow-hidden"
                style={{ '--sidebar-width': `${sidebarWidth}px` } as any}
              >
                <Sidebar
                  categories={categories}
                  activeTrackId={initialTrackId || null}
                  activeTestId={selectedTest?.id || null}
                  onSelectTest={handleSelectTest}
                  locale={locale}
                  completedTestIds={completedTestIds}
                />
              </div>
            </div>

            {/* Resize Handle - Right */}
            {!sidebarCollapsed && (
              <div
                className="w-1.5 shrink-0 bg-transparent hover:bg-white/10 cursor-col-resize active:bg-white/20 transition-colors z-20 group relative"
                onMouseDown={handleSidebarResize}
              >
                <div className="absolute inset-y-0 -left-1 -right-1" />
                <div
                  className={`absolute inset-y-0 left-1/2 -ml-[0.5px] w-[1px] ${
                    isDraggingSidebar ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/10'
                  }`}
                />
              </div>
            )}
          </>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileSidebarOpen && (
          <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="absolute inset-y-0 left-0 w-4/5 max-w-[300px] bg-black border-r border-white/10 shadow-2xl flex flex-col">
              <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                <span className="font-semibold text-sm">Tests</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/70"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Sidebar
                  categories={categories}
                  activeTrackId={initialTrackId || null}
                  activeTestId={selectedTest?.id || null}
                  onSelectTest={handleSelectTest}
                  locale={locale}
                  completedTestIds={completedTestIds}
                />
              </div>
            </div>
          </div>
        )}

        {/* Center Canvas */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-[#000000]">
          {/* Email Capture Modal */}
          {activeTrack && !candidateEmail && (
            <EmailCaptureModal
              trackId={activeTrack.id}
              onSuccess={(email) => setCandidateEmail(email)}
            />
          )}

          {isTimeUp ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black z-30">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">⏱️</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {locale === 'es' ? '¡El tiempo terminó!' : "Time's Up!"}
              </h2>
              <p className="text-neutral-400 text-center max-w-md cursor-default">
                {locale === 'es'
                  ? 'El límite de tiempo para este módulo interactivo ha expirado. Tus respuestas guardadas se han registrado.'
                  : 'The time limit for this test track has expired. Any completed tests have been saved successfully.'}
              </p>
            </div>
          ) : allTestsCompleted ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black z-30">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {locale === 'es' ? '¡Prueba Completada!' : 'All Tests Completed!'}
              </h2>
              <p className="text-neutral-400 text-center max-w-md cursor-default mb-8">
                {locale === 'es'
                  ? '¡Felicidades! Has completado con éxito todas las pruebas de esta etapa. Tus resultados han sido registrados.'
                  : 'Congratulations! You have successfully completed all tests in this track. Your results have been recorded.'}
              </p>
              <button
                onClick={handleFinalSubmission}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-black font-bold rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {locale === 'es' ? 'Verificar y Finalizar' : 'Verify and Finish'}
              </button>
            </div>
          ) : selectedTest && candidateEmail ? (
            <div className="absolute inset-0 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
              <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                <EditableCodePanel
                  initialCode={selectedTest.initialCode}
                  testId={selectedTest.id}
                  locale={locale}
                  onEvaluationResult={setEvaluationSuccess}
                  onCompleteTask={handleCompleteTask}
                  evaluationRegex={selectedTest.evaluationRegex}
                />
              </div>
            </div>
          ) : !activeTrack ? (
            <WelcomeScreen
              t={translations[locale]}
              locale={locale}
              onSelectTest={(test) => {
                // If WelcomeScreen returns a Test, but it actually shouldn't for tracks?
                // Let's redirect to a track.
                window.location.href = `/${test.id}`
              }}
            />
          ) : null}

          {/* Gradients */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent opacity-80" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent opacity-80" />
        </div>

        {/* Right Sidebar */}
        {/* Desktop Explanation Panel */}
        {!isMobile && selectedTest && (
          <>
            {!explanationPanelCollapsed && (
              <div
                className="w-1.5 shrink-0 bg-transparent hover:bg-white/10 cursor-col-resize active:bg-white/20 transition-colors z-20 group relative border-l border-white/5"
                onMouseDown={handleExplanationPanelResize}
              >
                <div className="absolute inset-y-0 -left-1 -right-1" />
                <div
                  className={`absolute inset-y-0 left-1/2 -ml-[0.5px] w-[1px] ${
                    isDraggingExplanationPanel
                      ? 'bg-white/20'
                      : 'bg-transparent group-hover:bg-white/10'
                  }`}
                />
              </div>
            )}

            <div
              className={`shrink-0 h-full bg-[#0a0a0a] transition-[width,transform] duration-300 ease-in-out z-10 ${
                explanationPanelCollapsed
                  ? 'w-0 translate-x-full border-0'
                  : 'border-l border-white/8 shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.5)]'
              }`}
              style={{ width: explanationPanelCollapsed ? 0 : explanationPanelWidth }}
            >
              <div className="w-full h-full overflow-hidden relative">
                <ExplanationPanel
                  description={selectedTest.description}
                  difficulty={selectedTest.difficulty}
                  locale={locale}
                  isEvaluationSuccess={evaluationSuccess}
                  hasNextTest={hasNextTest}
                  onNext={handleNextTest}
                />
              </div>
            </div>
          </>
        )}

        {/* Mobile Explanation Panel Overlay */}
        {isMobile && selectedTest && mobileCodePanelOpen && (
          <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="absolute inset-y-0 right-0 w-[85%] max-w-[400px] bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col">
              <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                <span className="font-semibold text-sm">Explanation</span>
                <button
                  onClick={() => setMobileCodePanelOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/70"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <ExplanationPanel
                  description={selectedTest.description}
                  difficulty={selectedTest.difficulty}
                  locale={locale}
                  isEvaluationSuccess={evaluationSuccess}
                  hasNextTest={hasNextTest}
                  onNext={handleNextTest}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
