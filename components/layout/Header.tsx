'use client';

import Link from 'next/link';
import { Search, Menu, X, Building2 } from 'lucide-react';
import { useState } from 'react';

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-6">
                <Link href="/" className="font-extrabold text-xl tracking-tight flex items-center gap-1.5" id="header-logo">
                    <span className="text-brand-500">Lakeland</span>
                    <span className="text-slate-800">Finds</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link href="/categories" className="text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg transition-all">
                        Categories
                    </Link>
                    <Link href="/search" className="text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg transition-all">
                        Search
                    </Link>
                </nav>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
                <Link href="/claim" className="text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    For Businesses
                </Link>
                <Link href="/claim" className="text-sm font-semibold bg-brand-500 text-white px-5 py-2 rounded-full hover:bg-brand-600 transition-colors shadow-sm hover:shadow-md" id="header-claim">
                    Claim Listing
                </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-3 md:hidden">
                <Link href="/search" className="p-2 text-slate-600 hover:bg-slate-100 rounded-full" aria-label="Search">
                    <Search className="w-5 h-5" />
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"
                    aria-label="Menu"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl md:hidden z-50">
                    <nav className="flex flex-col p-4 gap-1">
                        <Link href="/categories" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                            Categories
                        </Link>
                        <Link href="/search" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                            Search
                        </Link>
                        <Link href="/claim" onClick={() => setMobileOpen(false)} className="mt-2 text-center bg-brand-500 text-white px-5 py-3 rounded-xl font-medium hover:bg-brand-600 transition-colors">
                            Claim Your Business
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
