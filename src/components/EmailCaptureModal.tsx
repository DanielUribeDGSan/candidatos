import { useState, useEffect } from 'react'
import { supabase } from '@lib/supabase'

interface EmailCaptureModalProps {
    onSuccess: (email: string) => void
    trackId: string
}

export default function EmailCaptureModal({ onSuccess, trackId }: EmailCaptureModalProps) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const storedEmail = localStorage.getItem(`algodev_test_email_${trackId}`)
        if (!storedEmail) {
            setIsVisible(true)
            return
        }

        // Verify with Supabase: if exam was reset or candidate removed, clear local and show modal again
        let cancelled = false
        const verifyAndEnter = async () => {
            const { data, error } = await supabase
                .from('candidates')
                .select('start_time, completed')
                .eq('email', storedEmail)
                .eq('track', trackId)
                .maybeSingle()

            if (cancelled) return

            const noCandidate = error?.code === 'PGRST116' || (!error && !data)
            const alreadyCompleted = data?.completed === true

            if (noCandidate || alreadyCompleted) {
                localStorage.removeItem(`algodev_test_email_${trackId}`)
                localStorage.removeItem(`candidate_drafts_${storedEmail}_${trackId}`)
                setIsVisible(true)
                return
            }

            onSuccess(storedEmail)
        }
        verifyAndEnter()
        return () => { cancelled = true }
    }, [trackId, onSuccess])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address.')
            setLoading(false)
            return
        }

        try {
            // Check if user exists in the candidates table
            let { data, error: fetchError } = await supabase
                .from('candidates')
                .select('*')
                .eq('email', email)
                .eq('track', trackId)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Supabase fetch error:', fetchError)
                setError('Error checking database. We will let you proceed anyway for this demo.')
                localStorage.setItem(`algodev_test_email_${trackId}`, email)
                onSuccess(email)
                return
            }

            if (data) {
                // Candidate already exists for this track
                if (data.completed) {
                    setError('This email has already completed this test track.')
                    setLoading(false)
                    return
                }
            } else {
                // Candidate does not exist, insert them
                const { error: insertError } = await supabase
                    .from('candidates')
                    .insert([{
                        email,
                        track: trackId,
                        completed: false
                    }])

                if (insertError) {
                    console.warn('Could not insert candidate record:', insertError)
                }
            }

            // Success
            localStorage.setItem(`algodev_test_email_${trackId}`, email)
            setIsVisible(false)
            onSuccess(email)

        } catch (err) {
            console.error('Unexpected error:', err)
            setError('An unexpected error occurred. Continuing locally.')
            localStorage.setItem(`algodev_test_email_${trackId}`, email)
            setIsVisible(false)
            onSuccess(email)
        } finally {
            setLoading(false)
        }
    }

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Candidate Evaluation</h2>
                    <p className="text-sm text-neutral-400">
                        Please enter your email to begin the {trackId} test track.
                        Your progress will be saved automatically.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="candidate@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-neutral-600"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-xs text-red-400 font-medium text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Verifying...' : 'Begin Test Track'}
                    </button>
                </form>
            </div>
        </div>
    )
}
