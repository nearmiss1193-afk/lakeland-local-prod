import { getBusiness } from '@/lib/actions/getBusiness';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Globe, Share2, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data: business } = await getBusiness(params.id);
    if (!business) return { title: 'Business Not Found' };

    return {
        title: `${business.name} - Lakeland Local`,
        description: business.vibeSummary || `Learn more about ${business.name} in Lakeland, FL.`,
    };
}

export default async function BusinessPage({ params }: Props) {
    const { data: business } = await getBusiness(params.id);

    if (!business) {
        notFound();
    }

    // JSON-LD for LocalBusiness
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: business.name,
        address: business.address,
        telephone: business.phone,
        url: business.websiteUrl,
        description: business.vibeSummary,
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Breadcrumbs */}
            <nav className="text-sm text-slate-500 mb-6">
                <Link href="/" className="hover:text-brand-600">Home</Link> &gt; <span>{business.name}</span>
            </nav>

            {/* Main Content */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-brand-50 p-8 border-b border-brand-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white text-brand-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-200">
                                {business.category || 'Local Gem'}
                            </span>
                            {business.claimedStatus && (
                                <span className="flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                    <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-2">{business.name}</h1>
                        <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-5 h-5 text-brand-500" />
                            <span>{business.address}</span>
                        </div>
                    </div>

                    <button className="p-3 bg-white text-slate-600 rounded-full hover:bg-slate-50 border border-slate-200 shadow-sm transition-all" aria-label="Share">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {/* Vibe Summary */}
                    {business.vibeSummary && (
                        <div className="mb-8 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-full"></div>
                            <div className="pl-6">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">The Vibe</h3>
                                <p className="text-xl text-slate-700 italic leading-relaxed">
                                    &quot;{business.vibeSummary}&quot;
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900 text-lg">Contact Info</h3>
                            {business.phone && (
                                <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-slate-600 hover:text-brand-600 p-4 bg-slate-50 rounded-xl transition-colors">
                                    <Phone className="w-5 h-5" />
                                    <span className="font-medium">{business.phone}</span>
                                </a>
                            )}
                            {business.websiteUrl && (
                                <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-brand-600 p-4 bg-slate-50 rounded-xl transition-colors">
                                    <Globe className="w-5 h-5" />
                                    <span className="font-medium">Visit Website</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Conversion CTA */}
                    {!business.claimedStatus && (
                        <div className="bg-slate-900 text-white p-8 rounded-2xl text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <h3 className="text-2xl font-bold mb-2 relative z-10">Is this your business?</h3>
                            <p className="text-slate-300 mb-6 max-w-lg mx-auto relative z-10">
                                Claim this page to update your info, respond to reviews, and reach more customers in Lakeland.
                            </p>
                            <Link href={`/claim/${business.id}`} className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-brand-500/50 transition-all transform hover:-translate-y-1 relative z-10">
                                Claim This Page Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* SEO Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </div>
    );
}
