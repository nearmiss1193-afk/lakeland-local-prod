'use client';

import { useEffect, useRef, useState } from 'react';
import { Headphones, PhoneOff } from 'lucide-react';

const VAPI_PUBLIC_KEY = '3b065ff0-a721-4b66-8255-30b6b8d6daab';
const VAPI_ASSISTANT_ID = 'd19cae13-d11b-499b-a9e7-2e113efe1112';

export function VapiWidget() {
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [transcript, setTranscript] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vapiRef = useRef<any>(null);

    // Lazy-load the Vapi SDK
    async function getVapi() {
        if (vapiRef.current) return vapiRef.current;
        const { default: Vapi } = await import('@vapi-ai/web');
        vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vapiRef.current.on('call-start', () => {
            setIsConnecting(false);
            setIsActive(true);
        });

        vapiRef.current.on('call-end', () => {
            setIsActive(false);
            setIsConnecting(false);
            setTranscript('');
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vapiRef.current.on('message', (msg: any) => {
            if (msg.type === 'transcript' && msg.transcriptType === 'final') {
                setTranscript(msg.transcript);
                setTimeout(() => setTranscript(''), 4000);
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vapiRef.current.on('error', (err: any) => {
            console.error('Vapi error:', err);
            setIsActive(false);
            setIsConnecting(false);
        });

        return vapiRef.current;
    }

    async function toggleCall() {
        const vapi = await getVapi();
        if (isActive) {
            vapi.stop();
        } else {
            setIsConnecting(true);
            try {
                await vapi.start(VAPI_ASSISTANT_ID);
            } catch (err) {
                console.error('Failed to start Vapi call:', err);
                setIsConnecting(false);
            }
        }
    }

    useEffect(() => {
        return () => {
            if (vapiRef.current) {
                try { vapiRef.current.stop(); } catch { /* cleanup */ }
            }
        };
    }, []);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
            {/* Transcript bubble */}
            {transcript && (
                <div className="max-w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 animate-fade-in">
                    <p className="leading-relaxed">{transcript}</p>
                </div>
            )}

            {/* Main button — centered pill with label */}
            <button
                onClick={toggleCall}
                disabled={isConnecting}
                className={`
                    group relative flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-lg
                    transition-all duration-300 ease-out
                    hover:scale-105 hover:shadow-xl
                    active:scale-95
                    ${isActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : isConnecting
                            ? 'bg-amber-500 text-white animate-pulse cursor-wait'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                    }
                `}
                aria-label={isActive ? 'End call with Sarah' : 'Ask Sarah — AI Voice Assistant'}
            >
                {isActive ? (
                    <>
                        <PhoneOff className="w-5 h-5" />
                        <span className="text-sm font-semibold">End Call</span>
                    </>
                ) : isConnecting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-semibold">Connecting...</span>
                    </>
                ) : (
                    <>
                        <Headphones className="w-5 h-5" />
                        <span className="text-sm font-semibold">Ask Sarah AI</span>
                        <span className="text-xs opacity-75 hidden sm:inline">— Voice Assistant</span>
                    </>
                )}

                {/* Pulse ring when active */}
                {isActive && (
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
                )}

                {/* Subtle glow effect when idle */}
                {!isActive && !isConnecting && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse opacity-10" />
                )}
            </button>
        </div>
    );
}
