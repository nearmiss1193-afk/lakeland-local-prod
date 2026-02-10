'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Building2, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AutocompleteResult {
    categories: Array<{ category: string; count: number }>;
    businesses: Array<{
        id: string;
        name: string;
        category: string | null;
        rating: number | null;
        address: string;
    }>;
}

export function SearchAutocomplete() {
    const [query, setQuery] = useState('');
    const [location] = useState('Lakeland, FL');
    const [results, setResults] = useState<AutocompleteResult | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults(null);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
                setIsOpen(true);
                setActiveIndex(-1);
            } catch {
                setResults(null);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
        }
    }, [query, router]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || !results) return;

        const totalItems = (results.categories?.length || 0) + (results.businesses?.length || 0);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % totalItems);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + totalItems) % totalItems);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            const catLen = results.categories?.length || 0;
            if (activeIndex < catLen) {
                const cat = results.categories[activeIndex];
                router.push(`/search?category=${encodeURIComponent(cat.category)}`);
            } else {
                const biz = results.businesses[activeIndex - catLen];
                router.push(`/business/${biz.id}`);
            }
            setIsOpen(false);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const totalResults = results
        ? (results.categories?.length || 0) + (results.businesses?.length || 0)
        : 0;

    return (
        <div ref={wrapperRef} className="relative w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
                    {/* What field */}
                    <div className="flex-1 flex items-center border-r border-slate-200">
                        <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => { if (results && totalResults > 0) setIsOpen(true); }}
                            placeholder="plumber, restaurant, haircut..."
                            className="w-full px-3 py-4 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                            autoComplete="off"
                            id="search-what"
                        />
                    </div>

                    {/* Where field */}
                    <div className="hidden sm:flex items-center flex-shrink-0 w-48">
                        <MapPin className="w-4 h-4 text-brand-500 ml-3 shrink-0" />
                        <input
                            type="text"
                            value={location}
                            readOnly
                            className="w-full px-2 py-4 bg-transparent outline-none text-slate-600 text-sm"
                            id="search-where"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-4 font-semibold transition-colors shrink-0"
                        id="search-submit"
                    >
                        <Search className="w-5 h-5 sm:hidden" />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                </div>
            </form>

            {/* Autocomplete Dropdown */}
            {isOpen && results && totalResults > 0 && (
                <div className="autocomplete-dropdown">
                    {/* Category results */}
                    {results.categories?.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Categories
                            </div>
                            {results.categories.map((cat, i) => (
                                <button
                                    key={cat.category}
                                    className={`autocomplete-item w-full text-left ${activeIndex === i ? 'active' : ''}`}
                                    onClick={() => {
                                        router.push(`/search?category=${encodeURIComponent(cat.category)}`);
                                        setIsOpen(false);
                                    }}
                                    onMouseEnter={() => setActiveIndex(i)}
                                >
                                    <Tag className="w-4 h-4 text-brand-500 shrink-0" />
                                    <span className="flex-1 font-medium text-slate-800">{cat.category}</span>
                                    <span className="text-xs text-slate-400">{cat.count} businesses</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Business results */}
                    {results.businesses?.length > 0 && (
                        <div>
                            {results.categories?.length > 0 && <div className="border-t border-slate-100" />}
                            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Businesses
                            </div>
                            {results.businesses.map((biz, i) => {
                                const idx = (results.categories?.length || 0) + i;
                                return (
                                    <button
                                        key={biz.id}
                                        className={`autocomplete-item w-full text-left ${activeIndex === idx ? 'active' : ''}`}
                                        onClick={() => {
                                            router.push(`/business/${biz.id}`);
                                            setIsOpen(false);
                                        }}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                    >
                                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-800 truncate">{biz.name}</div>
                                            <div className="text-xs text-slate-400 truncate">{biz.category} · {biz.address}</div>
                                        </div>
                                        {biz.rating && biz.rating > 0 && (
                                            <div className="flex items-center gap-1 text-xs">
                                                <span className="text-amber-500">★</span>
                                                <span className="text-slate-600">{Number(biz.rating).toFixed(1)}</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
