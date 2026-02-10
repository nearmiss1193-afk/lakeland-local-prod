'use client';

import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin } from 'lucide-react';

interface DistanceBadgeProps {
    bizLat: number | null;
    bizLng: number | null;
    showIcon?: boolean;
    className?: string;
}

export function DistanceBadge({ bizLat, bizLng, showIcon = true, className = '' }: DistanceBadgeProps) {
    const { granted, getFormattedDistance, requestLocation } = useGeolocation();

    // If no business coordinates, don't render
    if (!bizLat || !bizLng) return null;

    // If location not granted yet, show a small prompt
    if (!granted) {
        return (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    requestLocation();
                }}
                className={`inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-500 transition-colors ${className}`}
                title="Click to see distance"
            >
                {showIcon && <MapPin className="w-3 h-3" />}
                <span>Distance?</span>
            </button>
        );
    }

    const distance = getFormattedDistance(bizLat, bizLng);
    if (!distance) return null;

    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full ${className}`}
            title="Distance from your location"
        >
            {showIcon && <MapPin className="w-3 h-3" />}
            {distance}
        </span>
    );
}
