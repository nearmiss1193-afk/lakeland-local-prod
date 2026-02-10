import { Building2, CheckCircle, Star, BarChart3 } from 'lucide-react';
import type { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Claim Your Business - LakelandFinds',
    description: 'Claim your free business listing on LakelandFinds. Update your info, add photos, and reach more customers in Lakeland, FL.',
};

export default function ClaimPage() {
    return (
        <div className="max-w-4xl mx-auto pb-16">
            {/* Hero */}
            <section className="text-center py-12 md:py-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-full text-brand-700 text-sm font-medium mb-6">
                    <Building2 className="w-4 h-4" />
                    For Business Owners
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                    Claim Your <span className="text-brand-500">Free</span> Listing
                </h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
                    Join {'>'}3,300 businesses already listed on LakelandFinds.
                    Take control of your business page and start reaching more customers today.
                </p>
            </section>

            {/* Benefits Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-xl border border-slate-100 p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Verified Badge</h3>
                    <p className="text-sm text-slate-500">Stand out with a verified badge that builds trust with customers.</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-6 text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Featured Placement</h3>
                    <p className="text-sm text-slate-500">Get priority placement in search results and category pages.</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-6 text-center">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-6 h-6 text-brand-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Business Insights</h3>
                    <p className="text-sm text-slate-500">See how many people are viewing and contacting your business.</p>
                </div>
            </section>

            {/* Claim Form */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-1">Get Started</h2>
                    <p className="text-slate-400 text-sm">Fill out the form below and we&apos;ll verify your business within 24 hours.</p>
                </div>

                <form action="https://1staistep.com" method="GET" className="p-6 md:p-8 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="business-name" className="block text-sm font-medium text-slate-700 mb-1">Business Name *</label>
                            <input
                                type="text"
                                id="business-name"
                                name="business_name"
                                required
                                placeholder="e.g. Joe's Plumbing"
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800"
                            />
                        </div>
                        <div>
                            <label htmlFor="owner-name" className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                            <input
                                type="text"
                                id="owner-name"
                                name="owner_name"
                                required
                                placeholder="Your full name"
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="you@business.com"
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                required
                                placeholder="(863) 555-1234"
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Anything we should know? (Optional)</label>
                        <textarea
                            id="message"
                            name="message"
                            rows={3}
                            placeholder="Tell us about your business..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
                        id="claim-submit"
                    >
                        Claim My Business — It&apos;s Free
                    </button>

                    <p className="text-xs text-slate-400 text-center">
                        By submitting, you agree to be contacted about your business listing.
                        No spam, ever.
                    </p>
                </form>
            </section>

            {/* FAQ */}
            <section className="mt-12 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Frequently Asked Questions</h2>

                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <h3 className="font-bold text-slate-900 mb-1">Is it really free?</h3>
                    <p className="text-sm text-slate-500">Yes! Claiming your basic listing is 100% free. We also offer premium features for businesses that want to stand out more.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <h3 className="font-bold text-slate-900 mb-1">How long does verification take?</h3>
                    <p className="text-sm text-slate-500">We verify most businesses within 24 hours. You&apos;ll receive an email confirmation once your listing is verified.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <h3 className="font-bold text-slate-900 mb-1">What if my business isn&apos;t listed yet?</h3>
                    <p className="text-sm text-slate-500">No problem! Fill out the form above and we&apos;ll add your business to the directory for free.</p>
                </div>
            </section>
        </div>
    );
}
