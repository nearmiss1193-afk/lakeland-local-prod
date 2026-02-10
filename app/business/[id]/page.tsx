import { getBusiness } from '@/lib/actions/getBusiness';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Globe, CheckCircle, Star, Navigation, Building2 } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data: business } = await getBusiness(params.id);
    if (!business) return { title: 'Business Not Found' };

    return {
        title: `${business.name} - LakelandFinds`,
        description: `${business.name} in Lakeland, FL. ${business.category || 'Local business'}. ${business.rating ? `Rated ${business.rating}/5` : ''}`,
    };
}

function StarRating({ rating, count }: { rating: number; count: number }) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars.push(<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />);
        } else if (i - 0.5 <= rating) {
            stars.push(<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />);
        } else {
            stars.push(<Star key={i} className="w-5 h-5 fill-slate-200 text-slate-200" />);
        }
    }
    return (
        <div className="flex items-center gap-2">
            <div className="flex">{stars}</div>
            <span className="text-lg font-bold text-slate-800">{Number(rating).toFixed(1)}</span>
            <span className="text-slate-400">({count} reviews)</span>
        </div>
    );
}

export default async function BusinessPage({ params }: Props) {
    const { data: business } = await getBusiness(params.id);

    if (!business) {
        notFound();
    }

    const rating = business.rating || 0;
    const totalRatings = business.totalRatings || 0;
    const googleMapsUrl = business.lat && business.lng
        ? `https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: business.name,
        address: {
            '@type': 'PostalAddress',
            streetAddress: business.address,
            addressLocality: business.city || 'Lakeland',
            addressRegion: business.state || 'FL',
        },
        telephone: business.phone,
        url: business.websiteUrl,
        aggregateRating: rating > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: totalRatings,
        } : undefined,
    };

    return (
        <div className="max-w-4xl mx-auto pb-16">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-5">
                <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
                <span className="text-slate-300">/</span>
                {business.category && (
                    <>
                        <Link href={`/search?category=${encodeURIComponent(business.category)}`} className="hover:text-brand-600 transition-colors">
                            {business.category}
                        </Link>
                        <span className="text-slate-300">/</span>
                    </>
                )}
                <span className="text-slate-700 font-medium truncate">{business.name}</span>
            </nav>

            {/* Business Header */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col gap-4">
                        {/* Category + Verified badge */}
                        <div className="flex items-center gap-2">
                            <span className="bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-brand-100">
                                {business.category || 'Local Business'}
                            </span>
                            {business.claimedStatus && (
                                <span className="flex items-center gap-1 text-blue-600 text-xs font-medium bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                                    <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                            )}
                        </div>

                        {/* Name */}
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                            {business.name}
                        </h1>

                        {/* Rating */}
                        {rating > 0 && (
                            <StarRating rating={rating} count={totalRatings} />
                        )}

                        {/* Address */}
                        <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
                            <span>{business.address}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-slate-100 px-6 md:px-8 py-4">
                    <div className="flex flex-wrap gap-3">
                        {business.phone && (
                            <a
                                href={`tel:${business.phone}`}
                                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm"
                                id="biz-call"
                            >
                                <Phone className="w-4 h-4" />
                                Call: {business.phone}
                            </a>
                        )}
                        {business.websiteUrl && (
                            <a
                                href={business.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 rounded-full transition-colors border border-slate-200"
                                id="biz-website"
                            >
                                <Globe className="w-4 h-4" />
                                Visit Website
                            </a>
                        )}
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 rounded-full transition-colors border border-slate-200"
                            id="biz-directions"
                        >
                            <Navigation className="w-4 h-4" />
                            Get Directions
                        </a>
                    </div>
                </div>
            </div>

            {/* Map Embed */}
            {business.lat && business.lng && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
                    <div className="p-4">
                        <h2 className="font-bold text-slate-900 mb-3">Location</h2>
                        <div className="rounded-xl overflow-hidden h-64">
                            <iframe
                                title="Business location on Google Maps"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyABzZ31Qqw91JbI1cDWRhU8AxvnJPhIErY&q=${business.lat},${business.lng}&zoom=15`}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Business Details */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
                <div className="p-6 md:p-8">
                    <h2 className="font-bold text-slate-900 text-lg mb-4">Business Information</h2>
                    <div className="space-y-4">
                        {business.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-sm text-slate-400">Phone</div>
                                    <a href={`tel:${business.phone}`} className="text-slate-800 font-medium hover:text-brand-600 transition-colors">
                                        {business.phone}
                                    </a>
                                </div>
                            </div>
                        )}
                        {business.websiteUrl && (
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-sm text-slate-400">Website</div>
                                    <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium hover:text-brand-700 transition-colors truncate block max-w-sm">
                                        {business.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                    </a>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <div>
                                <div className="text-sm text-slate-400">Address</div>
                                <span className="text-slate-800 font-medium">{business.address}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Claim CTA */}
            {!business.claimedStatus && (
                <div className="bg-slate-900 text-white p-8 rounded-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-15" />
                    <div className="relative z-10">
                        <Building2 className="w-10 h-10 text-brand-400 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold mb-2">Is this your business?</h3>
                        <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                            Claim this page to update your info, add photos, and reach more customers in Lakeland.
                        </p>
                        <Link
                            href="/claim"
                            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-brand-500/20 transition-all transform hover:-translate-y-0.5"
                            id="biz-claim"
                        >
                            Claim This Business
                        </Link>
                    </div>
                </div>
            )}

            {/* SEO Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </div>
    );
}
