import Link from 'next/link';
import { Search, Menu } from 'lucide-react';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full glass-panel border-b-0 rounded-none px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {/* Logo Placeholder - Text based for now */}
                <Link href="/" className="font-bold text-xl tracking-tight text-brand-900 flex items-center gap-1">
                    <span className="text-brand-600">Lakeland</span>Local
                </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
                <Link href="/categories" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                    Categories
                </Link>
                <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                    About
                </Link>
                <Link href="/add-business" className="text-sm font-medium bg-brand-50 text-brand-700 px-4 py-2 rounded-full hover:bg-brand-100 transition-colors">
                    Add Business
                </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center gap-4 md:hidden">
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full" aria-label="Search">
                    <Search className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full" aria-label="Menu">
                    <Menu className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
