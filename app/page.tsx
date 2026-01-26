import { getBusinesses } from '@/lib/actions/business';
import { BusinessCard } from '@/components/business/BusinessCard';
import { Search } from 'lucide-react';

export default async function Home() {
  const { success, data: businesses } = await getBusinesses();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 relative overflow-hidden">
        {/* Decorative elements could go here */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
          Discover <span className="text-brand-600">Lakeland&apos;s</span> Best
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          The curated guide to the finest local businesses, cafes, and services in Lakeland, FL. verified by locals, enhanced by AI.
        </p>

        {/* Search Bar (Visual Only for now) */}
        <div className="max-w-md mx-auto relative group">
          <div className="absolute inset-0 bg-brand-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white shadow-xl rounded-full flex items-center p-2 pl-6 border border-slate-100">
            <Search className="text-slate-400 w-5 h-5 mr-3" />
            <input
              type="text"
              placeholder="What are you looking for?"
              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400"
            />
            <button className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured / Recent Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recently Added</h2>
          <a href="/categories" className="text-brand-600 font-medium hover:underline">View All Categories</a>
        </div>

        {success && businesses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No businesses found. Be the first to add one!</p>
          </div>
        )}
      </section>
    </div>
  );
}
