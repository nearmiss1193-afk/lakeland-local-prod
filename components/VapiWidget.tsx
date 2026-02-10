'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VAPI_PUBLIC_KEY = '3b065ff0-a721-4b66-8255-30b6b8d6daab';
const VAPI_ASSISTANT_ID = '1a797f12-e2dd-4f7f-b2c5-08c38c74859a';

export function VapiWidget() {
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Transcript bubble */}
            {transcript && (
                <div className="max-w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 animate-fade-in">
                    <p className="leading-relaxed">{transcript}</p>
                </div>
            )}

            {/* Tooltip */}
            {showTooltip && !isActive && !isConnecting && (
                <div className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    Talk to Sarah AI
                </div>
            )}

            {/* Main button */}
            <button
                onClick={toggleCall}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                disabled={isConnecting}
                className={`
          group relative w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300 ease-out
          hover:scale-110 hover:shadow-xl
          active:scale-95
          ${isActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : isConnecting
                            ? 'bg-amber-500 text-white animate-pulse cursor-wait'
                            : 'bg-gradient-to-br from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700'
                    }
        `}
                aria-label={isActive ? 'End call with Sarah' : 'Talk to Sarah AI'}
            >
                {isActive ? (
                    <MicOff className="w-6 h-6" />
                ) : isConnecting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Mic className="w-6 h-6" />
                )}

                {/* Pulse ring when active */}
                {isActive && (
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
                )}
            </button>
        </div>
    );
}
