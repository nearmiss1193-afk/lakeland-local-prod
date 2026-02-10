'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
    lat: number | null;
    lng: number | null;
    error: string | null;
    loading: boolean;
    granted: boolean;
}

const STORAGE_KEY = 'lakelandfinds_user_location';

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Haversine formula — calculates straight-line distance in miles
 * between two lat/lng points on Earth's surface.
 */
export function getDistanceMiles(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 3958.8; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Format distance for display:
 *  - Under 0.1 mi → "Nearby"
 *  - Under 10 mi → "0.8 mi"
 *  - 10+ mi → "12 mi"
 */
export function formatDistance(miles: number): string {
    if (miles < 0.1) return 'Nearby';
    if (miles < 10) return `${miles.toFixed(1)} mi`;
    return `${Math.round(miles)} mi`;
}

/**
 * Build a Google Maps directions URL using user's live location.
 */
export function getDirectionsUrl(
    userLat: number | null,
    userLng: number | null,
    bizLat: number | null,
    bizLng: number | null,
    bizAddress?: string
): string {
    const destination = bizLat && bizLng
        ? `${bizLat},${bizLng}`
        : encodeURIComponent(bizAddress || '');

    const origin = userLat && userLng
        ? `${userLat},${userLng}`
        : '';

    if (origin) {
        return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export function useGeolocation(): GeolocationState & {
    requestLocation: () => void;
    getDistance: (bizLat: number, bizLng: number) => number | null;
    getFormattedDistance: (bizLat: number, bizLng: number) => string | null;
    getDirections: (bizLat: number | null, bizLng: number | null, bizAddress?: string) => string;
} {
    const [state, setState] = useState<GeolocationState>({
        lat: null,
        lng: null,
        error: null,
        loading: false,
        granted: false,
    });

    // Load cached location from localStorage on mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) {
                const { lat, lng } = JSON.parse(cached);
                if (lat && lng) {
                    setState((prev) => ({
                        ...prev,
                        lat,
                        lng,
                        granted: true,
                    }));
                }
            }
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                error: 'Geolocation not supported',
            }));
            return;
        }

        setState((prev) => ({ ...prev, loading: true }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setState({
                    lat: latitude,
                    lng: longitude,
                    error: null,
                    loading: false,
                    granted: true,
                });
                // Cache to avoid re-prompting
                try {
                    localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify({ lat: latitude, lng: longitude })
                    );
                } catch {
                    // Ignore
                }
            },
            (error) => {
                setState((prev) => ({
                    ...prev,
                    error: error.message,
                    loading: false,
                }));
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    }, []);

    const getDistance = useCallback(
        (bizLat: number, bizLng: number): number | null => {
            if (state.lat === null || state.lng === null) return null;
            return getDistanceMiles(state.lat, state.lng, bizLat, bizLng);
        },
        [state.lat, state.lng]
    );

    const getFormattedDistance = useCallback(
        (bizLat: number, bizLng: number): string | null => {
            const dist = getDistance(bizLat, bizLng);
            if (dist === null) return null;
            return formatDistance(dist);
        },
        [getDistance]
    );

    const getDirections = useCallback(
        (bizLat: number | null, bizLng: number | null, bizAddress?: string): string => {
            return getDirectionsUrl(state.lat, state.lng, bizLat, bizLng, bizAddress);
        },
        [state.lat, state.lng]
    );

    return {
        ...state,
        requestLocation,
        getDistance,
        getFormattedDistance,
        getDirections,
    };
}
