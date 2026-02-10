import { getBusinesses, getCategories, getBusinessCount } from '@/lib/actions/business';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';
import { DistanceBadge } from '@/components/business/DistanceBadge';
import { Star, MapPin, Building2, Utensils, Wrench, Car, Scissors, Heart, Dumbbell, ShoppingBag, Home as HomeIcon, Zap, Bug, Dog, TreePine, Droplets, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/* ─── Hero carousel images (Lakeland-themed Unsplash) ─── */
const HERO_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400&q=80', alt: 'Lakeland neighborhood' },
  { src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1400&q=80', alt: 'Florida downtown scene' },
  { src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80', alt: 'Local restaurant dining' },
  { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80', alt: 'Florida home services' },
];

/* ─── 12 Quick-Access Category Pills (under search bar) ─── */
const QUICK_CATEGORIES = [
  { label: 'Restaurants', icon: '🍽️', query: 'Restaurant' },
  { label: 'Home Services', icon: '🏠', query: 'Home Services' },
  { label: 'Auto Repair', icon: '🚗', query: 'Auto Repair' },
  { label: 'Shopping', icon: '🛍️', query: 'Store' },
  { label: 'Health & Medical', icon: '🏥', query: 'Health' },
  { label: 'Beauty & Spas', icon: '💇', query: 'Hair Salon' },
  { label: 'Pet Services', icon: '🐾', query: 'Pet' },
  { label: 'Nightlife', icon: '🍺', query: 'Bar' },
  { label: 'HVAC', icon: '❄️', query: 'HVAC' },
  { label: 'Electrical', icon: '⚡', query: 'Electrical' },
  { label: 'Pest Control', icon: '🪲', query: 'Pest Control' },
  { label: 'Fitness', icon: '🏋️', query: 'Gym' },
];

/* ─── Category grid icons (for "Browse by Category" section) ─── */
const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  'restaurant': { icon: <Utensils className="w-6 h-6" />, color: 'bg-red-100 text-red-600' },
  'plumb': { icon: <Droplets className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600' },
  'auto repair': { icon: <Car className="w-6 h-6" />, color: 'bg-slate-100 text-slate-600' },
  'hair salon': { icon: <Scissors className="w-6 h-6" />, color: 'bg-pink-100 text-pink-600' },
  'dentist': { icon: <Heart className="w-6 h-6" />, color: 'bg-teal-100 text-teal-600' },
  'gym': { icon: <Dumbbell className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600' },
  'store': { icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600' },
  'hvac': { icon: <Wrench className="w-6 h-6" />, color: 'bg-cyan-100 text-cyan-600' },
  'electric': { icon: <Zap className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600' },
  'pest': { icon: <Bug className="w-6 h-6" />, color: 'bg-red-100 text-red-600' },
  'landscape': { icon: <TreePine className="w-6 h-6" />, color: 'bg-green-100 text-green-600' },
  'home': { icon: <HomeIcon className="w-6 h-6" />, color: 'bg-amber-100 text-amber-600' },
  'pet': { icon: <Dog className="w-6 h-6" />, color: 'bg-violet-100 text-violet-600' },
};

function getCategoryIcon(category: string) {
  const lower = category.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return value;
  }
  return { icon: <Building2 className="w-6 h-6" />, color: 'bg-brand-100 text-brand-600' };
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Star key={i} className="w-4 h-4 star-filled" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<Star key={i} className="w-4 h-4 star-half fill-amber-400" />);
    } else {
      stars.push(<Star key={i} className="w-4 h-4 star-empty" />);
    }
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="star-rating">{stars}</div>
      <span className="text-sm font-semibold text-slate-700">{Number(rating).toFixed(1)}</span>
      <span className="text-sm text-slate-400">({count})</span>
    </div>
  );
}

/** Round count down to nearest 100 with "+" for display */
function formatBusinessCount(count: number): string {
  if (count < 100) return `${count}`;
  const rounded = Math.floor(count / 100) * 100;
  return `${rounded.toLocaleString()}+`;
}

export default async function Home() {
  const { data: businesses } = await getBusinesses(12);
  const { data: categories } = await getCategories();
  const totalBusinesses = await getBusinessCount();
  const topCategories = categories?.slice(0, 12) || [];

  return (
    <div className="space-y-12">
      {/* ═══ Hero Section with Image Carousel ═══ */}
      <section className="relative -mx-4 md:-mx-6 -mt-6 overflow-hidden rounded-b-3xl">
        {/* Background Images */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((img, i) => (
            <div
              key={i}
              className="absolute inset-0 hero-slide"
              style={{ animationDelay: `${i * 5}s` }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                priority={i === 0}
                unoptimized
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center py-20 md:py-28 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
            Find the Best Local Businesses
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-8">
            {formatBusinessCount(totalBusinesses)} businesses in Lakeland, FL — rated by real customers
          </p>

          <SearchAutocomplete />

          {/* ═══ 12 Scrollable Category Pills ═══ */}
          <div className="category-pills-scroll mt-6">
            <div className="flex gap-2 justify-center flex-wrap max-w-3xl mx-auto">
              {QUICK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/search?q=${encodeURIComponent(cat.query)}`}
                  className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/25 px-3.5 py-2 rounded-full transition-all backdrop-blur-sm whitespace-nowrap"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-sm text-brand-300 hover:text-white bg-brand-500/20 hover:bg-brand-500/40 px-3.5 py-2 rounded-full transition-all backdrop-blur-sm whitespace-nowrap font-semibold border border-brand-400/30"
              >
                More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Browse by Category Grid ═══ */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
          <Link href="/categories" className="text-brand-600 font-semibold text-sm hover:text-brand-700 flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {topCategories.map((cat) => {
            const { icon, color } = getCategoryIcon(cat.category);
            return (
              <Link
                key={cat.category}
                href={`/search?category=${encodeURIComponent(cat.category)}`}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all group"
                id={`cat-${cat.category.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className={`p-2.5 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-sm truncate">{cat.category}</div>
                  <div className="text-xs text-slate-400">{cat.count} listings</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ Top-Rated Businesses (Yelp-style list) ═══ */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Top-Rated in Lakeland</h2>
            <p className="text-slate-500 text-sm mt-0.5">Based on Google ratings and reviews</p>
          </div>
          <Link href="/search" className="text-brand-600 font-semibold text-sm hover:text-brand-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {businesses && businesses.map((biz, index) => (
            <Link
              key={biz.id}
              href={`/business/${biz.id}`}
              className="biz-list-item group"
              id={`biz-${index}`}
            >
              {/* Rank number */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm shrink-0 mt-0.5">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                    {biz.name}
                  </h3>
                  {biz.claimedStatus && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                      ✓ Verified
                    </span>
                  )}
                  {/* Distance badge */}
                  <DistanceBadge bizLat={biz.lat} bizLng={biz.lng} showIcon={false} />
                </div>

                {biz.rating && biz.rating > 0 && (
                  <StarRating rating={biz.rating} count={biz.totalRatings || 0} />
                )}

                <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-xs font-medium text-slate-600">
                    {biz.category}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {biz.address}
                  </span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="hidden sm:flex flex-col gap-2 shrink-0">
                {biz.phone && (
                  <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                    📞 {biz.phone}
                  </span>
                )}
                {biz.websiteUrl && (
                  <span className="text-xs text-brand-500 bg-brand-50 px-3 py-1.5 rounded-lg font-medium">
                    🌐 Website
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ Stats Bar ═══ */}
      <section className="grid grid-cols-3 gap-4">
        <div className="text-center py-6 bg-white rounded-xl border border-slate-100">
          <p className="text-3xl font-extrabold text-slate-900">{formatBusinessCount(totalBusinesses)}</p>
          <p className="text-sm text-slate-500 mt-1">Businesses Listed</p>
        </div>
        <div className="text-center py-6 bg-white rounded-xl border border-slate-100">
          <p className="text-3xl font-extrabold text-slate-900">{categories?.length || 0}</p>
          <p className="text-sm text-slate-500 mt-1">Categories</p>
        </div>
        <div className="text-center py-6 bg-white rounded-xl border border-slate-100">
          <p className="text-3xl font-extrabold text-brand-500">FREE</p>
          <p className="text-sm text-slate-500 mt-1">Claim Your Listing</p>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-[150px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500 rounded-full blur-[120px] opacity-10" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Own a Business in Lakeland?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">
            Claim your free listing and reach more customers.
            Stand out from the competition with a verified profile.
          </p>
          <Link
            href="/claim"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-brand-500/20 transition-all transform hover:-translate-y-1"
            id="cta-claim"
          >
            Claim Your Free Listing
          </Link>
        </div>
      </section>
    </div>
  );
}
