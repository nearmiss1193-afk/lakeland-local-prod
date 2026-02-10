import Link from 'next/link';
import { MapPin, Phone, ExternalLink, Star } from 'lucide-react';
import { businesses } from '@/lib/db/schema';

type Business = typeof businesses.$inferSelect;

interface BusinessCardProps {
    business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
    const rating = business.rating || 0;
    const totalRatings = business.totalRatings || 0;

    return (
        <div className="glass-panel rounded-2xl p-6 card-hover gradient-border flex flex-col h-full group">
            <div className="flex justify-between items-start mb-3">
                {/* Category Badge */}
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 uppercase tracking-wide border border-brand-100">
                    {business.category || 'Local Business'}
                </span>

                {/* Star Rating */}
                {rating > 0 && (
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-slate-800">{Number(rating).toFixed(1)}</span>
                        {totalRatings > 0 && (
                            <span className="text-xs text-slate-400">({totalRatings})</span>
                        )}
                    </div>
                )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight group-hover:text-brand-600 transition-colors">
                <Link href={`/business/${business.id}`}>
                    {business.name}
                </Link>
            </h3>

            <div className="flex items-start gap-2 text-slate-500 mb-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-500" />
                <span>{business.address}</span>
            </div>

            {/* AI Vibe Summary */}
            {business.vibeSummary && (
                <div className="bg-gradient-to-r from-slate-50 to-brand-50/30 p-3 rounded-xl mb-4 border border-slate-100">
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                        &quot;{business.vibeSummary}&quot;
                    </p>
                </div>
            )}

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                <div className="flex gap-3">
                    {business.phone && (
                        <a href={`tel:${business.phone}`} className="text-slate-400 hover:text-brand-600 transition-colors p-2 hover:bg-brand-50 rounded-lg" aria-label="Call">
                            <Phone className="w-4 h-4" />
                        </a>
                    )}
                    {business.websiteUrl && (
                        <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-600 transition-colors p-2 hover:bg-brand-50 rounded-lg" aria-label="Visit Website">
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>

                <Link href={`/business/${business.id}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </Link>
            </div>
        </div>
    );
}
