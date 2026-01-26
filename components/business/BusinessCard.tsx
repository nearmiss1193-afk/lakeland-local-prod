import Link from 'next/link';
import { MapPin, Phone, ExternalLink } from 'lucide-react';
import { businesses } from '@/lib/db/schema';


// Define the type based on the Drizzle schema inference, or manually
type Business = typeof businesses.$inferSelect;

interface BusinessCardProps {
    business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
    return (
        <div className="glass-panel rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-2xl flex flex-col h-full border-t-4 border-t-transparent hover:border-t-brand-500">
            <div className="flex justify-between items-start mb-2">
                {/* Category Badge */}
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 uppercase tracking-wide">
                    {business.category || 'Local Business'}
                </span>

                {business.claimedStatus && (
                    <span className="text-xs flex items-center gap-1 text-slate-400" title="Verified Owner">
                        <span className="sr-only">Verified</span>
                        ✓
                    </span>
                )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                <Link href={`/business/${business.id}`} className="hover:text-brand-600 transition-colors">
                    {business.name}
                </Link>
            </h3>

            <div className="flex items-start gap-2 text-slate-500 mb-4 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-500" />
                <span>{business.address}</span>
            </div>

            {/* AI Vibe Summary (if exists) */}
            {business.vibeSummary && (
                <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                        &quot;{business.vibeSummary}&quot;
                    </p>
                </div>
            )}

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                {/* Actions */}
                <div className="flex gap-3">
                    {business.phone && (
                        <a href={`tel:${business.phone}`} className="text-slate-400 hover:text-brand-600 transition-colors" aria-label="Call">
                            <Phone className="w-5 h-5" />
                        </a>
                    )}
                    {business.websiteUrl && (
                        <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-600 transition-colors" aria-label="Visit Website">
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    )}
                </div>

                <Link href={`/business/${business.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
                    View Details &rarr;
                </Link>
            </div>
        </div>
    );
}
