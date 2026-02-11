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
        <div className="flex flex-col items-center gap-2 mt-4">
            {/* Transcript bubble */}
            {transcript && (
                <div className="max-w-[360px] bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-3 text-sm text-gray-700">
                    <p className="leading-relaxed">{transcript}</p>
                </div>
            )}

            {/* Inline voice assistant button */}
            <button
                onClick={toggleCall}
                disabled={isConnecting}
                className={`
                    group relative inline-flex items-center gap-3 px-6 py-3 rounded-full
                    shadow-lg backdrop-blur-sm border
                    transition-all duration-300 ease-out
                    hover:scale-105 hover:shadow-xl
                    active:scale-95
                    ${isActive
                        ? 'bg-red-500/90 border-red-400/50 text-white'
                        : isConnecting
                            ? 'bg-amber-500/90 border-amber-400/50 text-white animate-pulse cursor-wait'
                            : 'bg-white/15 border-white/30 text-white hover:bg-white/25'
                    }
                `}
                aria-label={isActive ? 'End call' : 'Ask AI Voice Assistant'}
            >
                {/* Glowing dot indicator */}
                {!isActive && !isConnecting && (
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                    </span>
                )}

                {isActive ? (
                    <>
                        <PhoneOff className="w-5 h-5" />
                        <span className="text-sm font-semibold">End Call</span>
                        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-15" />
                    </>
                ) : isConnecting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-semibold">Connecting...</span>
                    </>
                ) : (
                    <>
                        <Headphones className="w-5 h-5" />
                        <div className="flex flex-col items-start leading-tight">
                            <span className="text-sm font-semibold">Ask AI Assistant</span>
                            <span className="text-[11px] opacity-70">Voice search — just ask!</span>
                        </div>
                    </>
                )}
            </button>
        </div>
    );
}
