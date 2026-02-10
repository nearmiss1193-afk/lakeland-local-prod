import { searchBusinesses, getCategories } from '@/lib/actions/business';
import { DistanceBadge } from '@/components/business/DistanceBadge';
import { Search, MapPin, Star, Phone, Globe, ArrowRight, Navigation } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
    searchParams: { q?: string; category?: string; sort?: string; rating?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const q = searchParams.q;
    const cat = searchParams.category;
    const title = q ? `"${q}" in Lakeland, FL` : cat ? `Best ${cat} in Lakeland, FL` : 'Search Lakeland Businesses';
    return {
        title: `${title} - LakelandFinds`,
        description: `Find the best ${cat || q || 'local'} businesses in Lakeland, FL. Read reviews and compare.`,
    };
}

function StarRating({ rating, count }: { rating: number; count: number }) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
        } else if (i - 0.5 <= rating) {
            stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
        } else {
            stars.push(<Star key={i} className="w-3.5 h-3.5 fill-slate-200 text-slate-200" />);
        }
    }
    return (
        <div className="flex items-center gap-1">
            <div className="flex">{stars}</div>
            <span className="text-sm font-medium text-slate-700">{Number(rating).toFixed(1)}</span>
            <span className="text-sm text-slate-400">({count} reviews)</span>
        </div>
    );
}

export default async function SearchPage({ searchParams }: Props) {
    const query = searchParams.q || '';
    const category = searchParams.category || '';

    const { data: results } = await searchBusinesses(query, category);
    const { data: categories } = await getCategories();

    const heading = category
        ? `Best ${category} in Lakeland, FL`
        : query
            ? `"${query}" in Lakeland, FL`
            : 'All Businesses in Lakeland';

    return (
        <div className="space-y-6">
            {/* Search Header */}
            <div className="bg-white -mx-4 md:-mx-6 -mt-6 px-4 md:px-6 py-5 border-b border-slate-200">
                <form action="/search" method="GET" className="max-w-3xl mx-auto">
                    <div className="flex bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500">
                        <div className="flex-1 flex items-center">
                            <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="plumber, restaurant, haircut..."
                                className="w-full px-3 py-3 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
                                id="search-input"
                            />
                        </div>
                        <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 font-semibold text-sm transition-colors" id="search-btn">
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">{heading}</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {results?.length || 0} {(results?.length || 0) === 1 ? 'result' : 'results'}
                    </p>
                </div>
            </div>

            {/* Category Filter Pills */}
            {categories && categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/search"
                        className={`category-pill ${!category ? 'active' : ''}`}
                    >
                        All
                    </Link>
                    {categories.slice(0, 15).map((cat) => (
                        <Link
                            key={cat.category}
                            href={`/search?category=${encodeURIComponent(cat.category)}`}
                            className={`category-pill ${category === cat.category ? 'active' : ''}`}
                        >
                            {cat.category}
                        </Link>
                    ))}
                    {categories.length > 15 && (
                        <Link href="/categories" className="category-pill">
                            +{categories.length - 15} more
                        </Link>
                    )}
                </div>
            )}

            {/* Results List (Yelp-style) */}
            {results && results.length > 0 ? (
                <div className="space-y-3">
                    {results.map((biz, index) => (
                        <div key={biz.id} className="biz-list-item group" id={`result-${index}`}>
                            {/* Rank */}
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs shrink-0 mt-0.5">
                                {index + 1}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <Link href={`/business/${biz.id}`} className="block group-hover:text-brand-600">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                            {biz.name}
                                        </h3>
                                        {/* Distance badge */}
                                        <DistanceBadge bizLat={biz.lat} bizLng={biz.lng} showIcon={false} />
                                    </div>
                                </Link>

                                {biz.rating && biz.rating > 0 && (
                                    <StarRating rating={biz.rating} count={biz.totalRatings || 0} />
                                )}

                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                                    <span className="bg-slate-50 px-2 py-0.5 rounded text-xs font-medium text-slate-600">
                                        {biz.category}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-xs">{biz.address}</span>
                                    </span>
                                </div>

                                {/* Quick contact on mobile */}
                                <div className="flex gap-3 mt-2 sm:hidden">
                                    {biz.phone && (
                                        <a href={`tel:${biz.phone}`} className="text-xs text-brand-600 font-medium flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> Call
                                        </a>
                                    )}
                                    {biz.websiteUrl && (
                                        <a href={biz.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 font-medium flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> Website
                                        </a>
                                    )}
                                    {(biz.lat || biz.address) && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${biz.lat && biz.lng ? `${biz.lat},${biz.lng}` : encodeURIComponent(biz.address || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-brand-600 font-medium flex items-center gap-1"
                                        >
                                            <Navigation className="w-3 h-3" /> Directions
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Desktop sidebar */}
                            <div className="hidden sm:flex flex-col gap-2 shrink-0 text-right">
                                {biz.phone && (
                                    <a href={`tel:${biz.phone}`} className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1.5 justify-end transition-colors">
                                        <Phone className="w-3.5 h-3.5" /> {biz.phone}
                                    </a>
                                )}
                                {biz.websiteUrl && (
                                    <a href={biz.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 font-medium hover:text-brand-600 flex items-center gap-1.5 justify-end transition-colors">
                                        <Globe className="w-3.5 h-3.5" /> Website
                                    </a>
                                )}
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${biz.lat && biz.lng ? `${biz.lat},${biz.lng}` : encodeURIComponent(biz.address || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1.5 justify-end transition-colors"
                                >
                                    <Navigation className="w-3.5 h-3.5" /> Directions
                                </a>
                                <Link href={`/business/${biz.id}`} className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1 justify-end mt-1">
                                    View Details <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg font-medium mb-2">No businesses found</p>
                    <p className="text-slate-400 text-sm mb-4">Try a different search term or browse our categories</p>
                    <Link href="/categories" className="inline-block text-brand-600 font-semibold hover:underline">
                        Browse Categories →
                    </Link>
                </div>
            )}
        </div>
    );
}
