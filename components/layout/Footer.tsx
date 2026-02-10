'use client';

import Link from 'next/link';
import { Building2, Mail, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const categories = [
    'HVAC', 'Plumbing', 'Roofing', 'Electrical',
    'Landscaping', 'Pest Control', 'Auto Repair', 'Hair Salon',
    'Restaurant', 'Dentist', 'Gym', 'Locksmith',
];

export function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSubscribed(localStorage.getItem('lf_newsletter') === 'true');
        }
    }, []);

    function handleSubscribe(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        localStorage.setItem('lf_newsletter', 'true');
        localStorage.setItem('lf_newsletter_email', email);
        setSubscribed(true);
    }

    return (
        <footer className="mt-20 bg-slate-900 text-slate-400">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="font-extrabold text-xl text-white flex items-center gap-1.5 mb-3">
                            <span className="text-brand-400">Lakeland</span>Finds
                        </Link>
                        <p className="text-sm leading-relaxed">
                            Lakeland&apos;s directory for local businesses. Discover, compare, and connect with the best services in town.
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Popular Categories</h4>
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <Link href={`/search?category=${encodeURIComponent(cat)}`} className="text-sm hover:text-brand-400 transition-colors">
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
                        <ul className="space-y-2">
                            <li><Link href="/search" className="text-sm hover:text-brand-400 transition-colors">Search</Link></li>
                            <li><Link href="/categories" className="text-sm hover:text-brand-400 transition-colors">All Categories</Link></li>
                            <li><Link href="/claim" className="text-sm hover:text-brand-400 transition-colors">Claim Your Business</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter + Business Owners */}
                    <div className="space-y-6">
                        {/* Newsletter */}
                        <div>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Stay Updated</h4>
                            {subscribed ? (
                                <div className="flex items-center gap-2 text-brand-400 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>You&apos;re subscribed!</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubscribe} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                                    >
                                        Join
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Business Owners CTA */}
                        <div>
                            <p className="text-sm mb-3">Own a business? Claim your free listing.</p>
                            <Link
                                href="/claim"
                                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                            >
                                <Building2 className="w-4 h-4" />
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    <p>&copy; {new Date().getFullYear()} LakelandFinds.com. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Powered by{' '}
                        <a href="https://aiserviceco.com" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors" target="_blank" rel="noopener noreferrer">
                            AI Service Co
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
