import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import type { Monaco } from '@monaco-editor/react'

const LazyEditor = lazy(() => import('@monaco-editor/react'))

interface EditableCodePanelProps {
    initialCode: string
    locale?: string
    onEvaluationResult?: (success: boolean) => void
    onCompleteTask?: (code: string) => void
    evaluationRegex?: string
    testId?: string
}

export default function EditableCodePanel({ initialCode, locale = 'en', onEvaluationResult, onCompleteTask, evaluationRegex, testId }: EditableCodePanelProps) {
    const [code, setCode] = useState(initialCode)
    const [consoleOutput, setConsoleOutput] = useState<string[]>([])
    const [isMounted, setIsMounted] = useState(false)
    const [editorReady, setEditorReady] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    // Update code when test changes (using testId to ensure reset even if initialCode is identical)
    useEffect(() => {
        setCode(initialCode)
        setConsoleOutput([])
    }, [initialCode, testId])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleEditorDidMount = useCallback((editor: any, monacoInstance: Monaco) => {
        monacoInstance.editor.defineTheme('algoviz-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#000000',
                'editor.lineHighlightBackground': '#ffffff06',
                'editorLineNumber.foreground': '#333',
                'editorLineNumber.activeForeground': '#facc15',
            },
        })
        monacoInstance.editor.setTheme('algoviz-dark')
        setEditorReady(true)

        // Disable pasting
        const domNode = editor.getDomNode()
        if (domNode) {
            domNode.addEventListener('paste', (e: ClipboardEvent) => {
                e.preventDefault()
                e.stopPropagation()
                alert(locale === 'es' ? 'Pegar código no está permitido en esta prueba.' : 'Pasting code is disabled for this test.')
            }, true)
        }

        // Block keyboard shortcuts
        editor.onKeyDown((e: any) => {
            // monaco KeyCode.KeyV is 52
            // We can also just check if ctrlKey or metaKey and keyCode == 52
            if ((e.ctrlKey || e.metaKey) && e.keyCode === 52) {
                e.preventDefault()
                e.stopPropagation()
            }
        })
    }, [locale])

    const runCode = () => {
        const logs: string[] = []

        // Create an iframe to safely evaluate code
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        document.body.appendChild(iframe)

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <!-- Include React -->
                <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
                <!-- Include Babel Standalone for JSX/ES6 -->
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            </head>
            <body>
                <div id="root"></div>
                <script>
                    // Intercept Console
                    const logs = [];
                    window.parentLogs = logs;
                    console.log = (...args) => {
                       logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                       window.parent.postMessage({ type: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
                    };
                    console.error = (...args) => {
                       logs.push('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                       window.parent.postMessage({ type: 'error', message: 'ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
                    };
                    console.warn = (...args) => {
                       const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                       if (msg.includes('in-browser Babel transformer')) return;
                       logs.push('WARN: ' + msg);
                       window.parent.postMessage({ type: 'warn', message: 'WARN: ' + msg }, '*');
                    };
                    
                    // Allow faux imports by replacing them with global React
                    window.require = function(modulePath) {
                       if(modulePath === 'react') return React;
                       if(modulePath === 'react-dom') return ReactDOM;
                       return {};
                    };
                </script>
                <script type="text/babel" data-type="module">
                    try {
                        const code = ${JSON.stringify(code)};
                        // Basic import transformation for the browser
                        // Replaces import React, { useState } from 'react'
                        // with const React = window.React; const { useState } = window.React;
                        const transformedCode = code
                            .replace(/import\\s+(?:(?:React\\s*,\\s*)?{([^}]+)}\\s+from\\s+['"]react['"]|React\\s+from\\s+['"]react['"])/g, (match, hooks) => {
                                let replacement = 'const React = window.React;\\n';
                                if (hooks) {
                                  replacement += \`const {\${hooks}} = React;\\n\`;
                                }
                                return replacement;
                            })
                            .replace(/import.*from\\s+['"]react.*['"];?/g, '');
                            
                        // Use Babel to compile JSX
                        const transpiledCode = Babel.transform(transformedCode, { presets: ['react', 'es2015'] }).code;
                        
                        // Execute
                        eval(transpiledCode);
                        
                        if (logs.length === 0) {
                            console.log('Execution finished with no output. Use console.log to print.');
                        }
                    } catch(e) {
                        console.error(e.message);
                    }
                    window.parent.postMessage({ type: 'done' }, '*');
                </script>
            </body>
            </html>
        `;

        // Listen for messages from iframe
        const messageHandler = (event: MessageEvent) => {
            if (event.data && event.data.type) {
                if (['log', 'error', 'warn'].includes(event.data.type)) {
                    logs.push(event.data.message)
                } else if (event.data.type === 'done') {
                    window.removeEventListener('message', messageHandler)
                    finalizeExecution()
                }
            }
        }

        window.addEventListener('message', messageHandler)

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();
        }

        // Fallback cleanup if iframe gets stuck
        const timeout = setTimeout(() => {
            window.removeEventListener('message', messageHandler)
            finalizeExecution()
        }, 3000)

        const finalizeExecution = () => {
            clearTimeout(timeout)
            setConsoleOutput([...logs])
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe)
            }

            const hasErrors = logs.some(log => log.startsWith('ERROR:'))
            const fullOutput = logs.join('\n')

            let passed = !hasErrors
            if (passed && evaluationRegex) {
                const regex = new RegExp(evaluationRegex, 'i')
                passed = regex.test(fullOutput)
            }

            if (onEvaluationResult) {
                onEvaluationResult(passed)
            }
        }
    }

    return (
        <>
            {showConfirmModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 rounded-xl">
                    <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6 relative">
                        <div className="mb-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {locale === 'es' ? '¿Confirmar Entrega?' : 'Confirm Submission?'}
                            </h3>
                            <p className="text-sm text-neutral-400">
                                {locale === 'es' ? '¿Estás seguro de que quieres completar y enviar esta tarea? No podrás editarla después.' : 'Are you sure you want to complete and submit this task? You won\'t be able to edit it afterwards.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg text-sm transition-colors"
                            >
                                {locale === 'es' ? 'Cancelar' : 'Cancel'}
                            </button>
                            <button
                                onClick={() => {
                                    if (code.trim() === initialCode.trim()) {
                                        alert(locale === 'es' ? 'Debes modificar el código antes de completar la tarea.' : 'You must modify the code before completing the task.')
                                        return
                                    }
                                    setShowConfirmModal(false)
                                    if (onCompleteTask) onCompleteTask(code)
                                }}
                                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-sm transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                {locale === 'es' ? 'Confirmar' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col h-full bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
                <div className="px-4 py-3 flex items-center justify-between border-b border-white/8 bg-white/5 shrink-0 z-10">
                    <h3 className="text-sm font-semibold text-white font-heading">Editor</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-md transition-colors border border-white/10"
                        >
                            {locale === 'es' ? 'Completar Tarea' : 'Complete Task'}
                        </button>
                        {evaluationRegex && (
                            <button
                                onClick={runCode}
                                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-md transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                {locale === 'es' ? 'Ejecutar' : 'Run Code'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden min-h-[300px]">
                    <div
                        className="flex flex-col overflow-hidden transition-opacity duration-500 ease-in-out"
                        style={{ opacity: editorReady ? 1 : 0, height: evaluationRegex ? '65%' : '100%' }}
                    >
                        {isMounted && (
                            <Suspense fallback={<div className="h-full flex items-center justify-center text-white/50">Loading editor...</div>}>
                                <LazyEditor
                                    defaultLanguage="javascript"
                                    value={code}
                                    onChange={(v) => setCode(v || '')}
                                    theme="vs-dark"
                                    onMount={handleEditorDidMount}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                                        padding: { top: 16, bottom: 16 },
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            </Suspense>
                        )}
                    </div>

                    {/* Console output panel: solo cuando se puede ejecutar código (evaluationRegex) */}
                    {evaluationRegex && (
                        <div className="shrink-0 border-t border-white/10 bg-[#0a0a0a] flex flex-col" style={{ height: '35%' }}>
                            <div className="px-4 py-2 flex items-center gap-2 shrink-0 border-b border-white/5">
                                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                                    Console Output
                                </span>
                            </div>
                            <div className="px-4 py-3 overflow-auto flex-1 h-full max-h-full">
                                {consoleOutput.length === 0 ? (
                                    <span className="text-[13px] text-neutral-600 font-mono italic shadow-none border-none outline-none">No output yet...</span>
                                ) : (
                                    consoleOutput.map((line, i) => (
                                        <div key={i} className={`font-mono text-[13px] leading-relaxed ${line.startsWith('ERROR') ? 'text-red-400' : 'text-neutral-300'}`}>
                                            {line}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
