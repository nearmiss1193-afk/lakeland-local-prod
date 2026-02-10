import { getCategories } from '@/lib/actions/business';
import Link from 'next/link';
import { Wrench, Droplets, Home, Zap, TreePine, Bug, Truck, Key, Scale, Waves, Sparkle, Building2, Utensils, Car, Scissors, Heart, Dumbbell, ShoppingBag, Dog, Coffee, Pill, Briefcase, Palette, Music, Camera, Wifi, Shirt, Baby, Shield, Hammer } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Browse Categories - LakelandFinds',
    description: 'Browse 30+ local business categories in Lakeland, FL.',
};

/* ─── 30 category icon + color mappings ─── */
const categoryIcons: Record<string, React.ReactNode> = {
    'HVAC': <Wrench className="w-7 h-7" />,
    'Plumbing': <Droplets className="w-7 h-7" />,
    'Roofing': <Home className="w-7 h-7" />,
    'Electrical': <Zap className="w-7 h-7" />,
    'Landscaping': <TreePine className="w-7 h-7" />,
    'Pest Control': <Bug className="w-7 h-7" />,
    'Towing': <Truck className="w-7 h-7" />,
    'Locksmith': <Key className="w-7 h-7" />,
    'Legal Services': <Scale className="w-7 h-7" />,
    'Water Damage Restoration': <Waves className="w-7 h-7" />,
    'Cleaning Services': <Sparkle className="w-7 h-7" />,
    'Restaurant': <Utensils className="w-7 h-7" />,
    'Auto Repair': <Car className="w-7 h-7" />,
    'Hair Salon': <Scissors className="w-7 h-7" />,
    'Dentist': <Heart className="w-7 h-7" />,
    'Gym': <Dumbbell className="w-7 h-7" />,
    'Shopping': <ShoppingBag className="w-7 h-7" />,
    'Pet Services': <Dog className="w-7 h-7" />,
    'Coffee Shop': <Coffee className="w-7 h-7" />,
    'Pharmacy': <Pill className="w-7 h-7" />,
    'Insurance': <Briefcase className="w-7 h-7" />,
    'Beauty & Spas': <Palette className="w-7 h-7" />,
    'Nightlife': <Music className="w-7 h-7" />,
    'Photography': <Camera className="w-7 h-7" />,
    'Internet Services': <Wifi className="w-7 h-7" />,
    'Dry Cleaning': <Shirt className="w-7 h-7" />,
    'Childcare': <Baby className="w-7 h-7" />,
    'Security': <Shield className="w-7 h-7" />,
    'Home Services': <Hammer className="w-7 h-7" />,
    'Health & Medical': <Heart className="w-7 h-7" />,
};

const categoryColors: Record<string, string> = {
    'HVAC': 'bg-blue-100 text-blue-600',
    'Plumbing': 'bg-cyan-100 text-cyan-600',
    'Roofing': 'bg-orange-100 text-orange-600',
    'Electrical': 'bg-yellow-100 text-yellow-600',
    'Landscaping': 'bg-green-100 text-green-600',
    'Pest Control': 'bg-red-100 text-red-600',
    'Towing': 'bg-slate-200 text-slate-600',
    'Locksmith': 'bg-violet-100 text-violet-600',
    'Legal Services': 'bg-indigo-100 text-indigo-600',
    'Water Damage Restoration': 'bg-teal-100 text-teal-600',
    'Cleaning Services': 'bg-pink-100 text-pink-600',
    'Restaurant': 'bg-red-100 text-red-600',
    'Auto Repair': 'bg-slate-100 text-slate-600',
    'Hair Salon': 'bg-pink-100 text-pink-600',
    'Dentist': 'bg-teal-100 text-teal-600',
    'Gym': 'bg-orange-100 text-orange-600',
    'Shopping': 'bg-purple-100 text-purple-600',
    'Pet Services': 'bg-amber-100 text-amber-600',
    'Coffee Shop': 'bg-amber-100 text-amber-700',
    'Pharmacy': 'bg-emerald-100 text-emerald-600',
    'Insurance': 'bg-blue-100 text-blue-700',
    'Beauty & Spas': 'bg-rose-100 text-rose-600',
    'Nightlife': 'bg-violet-100 text-violet-700',
    'Photography': 'bg-gray-100 text-gray-600',
    'Internet Services': 'bg-sky-100 text-sky-600',
    'Dry Cleaning': 'bg-slate-100 text-slate-600',
    'Childcare': 'bg-pink-100 text-pink-500',
    'Security': 'bg-zinc-200 text-zinc-600',
    'Home Services': 'bg-amber-100 text-amber-600',
    'Health & Medical': 'bg-teal-100 text-teal-600',
};

export default async function CategoriesPage() {
    const { data: categories } = await getCategories();

    return (
        <div className="space-y-8">
            <section className="text-center py-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                    Browse All Categories
                </h1>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                    {categories?.length || 0}+ categories in Lakeland — find exactly what you need
                </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories && categories.map((cat) => {
                    const icon = categoryIcons[cat.category] || <Building2 className="w-7 h-7" />;
                    const colorClass = categoryColors[cat.category] || 'bg-brand-100 text-brand-600';

                    return (
                        <Link
                            key={cat.category}
                            href={`/search?category=${encodeURIComponent(cat.category)}`}
                            className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-lg transition-all group"
                        >
                            <div className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform`}>
                                {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                    {cat.category}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    {cat.count} {cat.count === 1 ? 'business' : 'businesses'}
                                </p>
                            </div>
                            <span className="text-slate-300 group-hover:text-brand-400 text-xl transition-colors">&rarr;</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
