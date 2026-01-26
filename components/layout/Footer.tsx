import { MapPin, Phone, Home } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <>
            {/* Desktop Footer */}
            <footer className="hidden md:block bg-white border-t border-slate-200 py-12 px-4 md:px-6 mt-auto">
                <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8">
                    <div className="col-span-1">
                        <h3 className="font-bold text-lg mb-4 text-brand-900">LakelandLocal</h3>
                        <p className="text-sm text-slate-500">
                            Connecting you with the best local businesses in Lakeland, FL.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Discover</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link href="/categories">Categories</Link></li>
                            <li><Link href="/trending">Trending</Link></li>
                            <li><Link href="/new">New Arrivals</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Community</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link href="/add-business">Add a Business</Link></li>
                            <li><Link href="/claim">Claim Listing</Link></li>
                        </ul>
                    </div>
                    {/* Legal/Links etc */}
                </div>
                <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} Lakeland Local. All rights reserved.
                </div>
            </footer>

            {/* Mobile Sticky Footer - "Thumb Zone" Optimization */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-50 pb-safe">
                <Link href="/" className="flex flex-col items-center gap-1 text-brand-600 p-2">
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>
                <Link href="/map" className="flex flex-col items-center gap-1 text-slate-400 hover:text-brand-600 p-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Map</span>
                </Link>
                <Link href="/contact" className="flex flex-col items-center gap-1 text-slate-400 hover:text-brand-600 p-2">
                    <Phone className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Contact</span>
                </Link>
            </div>
        </>
    );
}
