import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Soup,
  ChevronRight
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { CountdownBadge } from '../../components/CountdownBadge';
import { SafeImage } from '../../components/SafeImage';
import { FoodCategory, DietaryType } from '../../types';

export const RecipientAvailableMarketplace: React.FC = () => {
  const { organization } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [dietaryFilter, setDietaryFilter] = useState<string>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [minQuantity, setMinQuantity] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'match' | 'quantity'>('match');

  const allListings = store.getListings().filter(
    (l) => l.status === 'AVAILABLE' && l.quantityAvailable > 0
  );

  // Available areas in Hyderabad
  const availableAreas = Array.from(new Set(allListings.map((l) => l.pickupArea)));

  // Filter listings
  const filteredListings = allListings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.donorName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || l.category === categoryFilter;
    const matchesDietary = dietaryFilter === 'ALL' || l.dietaryType === dietaryFilter;
    const matchesArea = areaFilter === 'ALL' || l.pickupArea === areaFilter;
    const matchesQuantity = l.quantityAvailable >= minQuantity;

    return matchesSearch && matchesCategory && matchesDietary && matchesArea && matchesQuantity;
  });

  // Attach match scores
  const scoredListings = filteredListings.map((l) => ({
    listing: l,
    match: store.calculateMatch(l, organization || undefined),
  }));

  // Sort
  scoredListings.sort((a, b) => {
    if (sortBy === 'match') {
      return b.match.score - a.match.score;
    }
    if (sortBy === 'deadline') {
      return new Date(a.listing.pickupDeadline).getTime() - new Date(b.listing.pickupDeadline).getTime();
    }
    if (sortBy === 'newest') {
      return new Date(b.listing.createdAt).getTime() - new Date(a.listing.createdAt).getTime();
    }
    if (sortBy === 'quantity') {
      return b.listing.quantityAvailable - a.listing.quantityAvailable;
    }
    return 0;
  });

  return (
    <DashboardLayout
      title="Find Food Marketplace"
      subtitle="Discover safe surplus meals across Hyderabad, check smart match compatibility, and claim portions"
      requiredRole="RECIPIENT"
    >
      <div className="space-y-6">
        {/* Filters and Search Bar */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food title, restaurant name, ingredients..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="match">Smart Match Compatibility</option>
                <option value="deadline">Nearest Pickup Deadline</option>
                <option value="newest">Recently Listed</option>
                <option value="quantity">Highest Available Quantity</option>
              </select>
            </div>
          </div>

          {/* Secondary Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-100 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-stone-200 bg-white"
              >
                <option value="ALL">All Categories</option>
                <option value="COOKED_MEALS">Cooked Meals</option>
                <option value="BAKERY_BREAD">Bakery & Breads</option>
                <option value="PRODUCE_VEGGIES">Fresh Produce</option>
                <option value="PACKAGED_GOODS">Packaged Goods</option>
                <option value="DAIRY_GRAINS">Dairy & Grains</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Dietary:</span>
              <select
                value={dietaryFilter}
                onChange={(e) => setDietaryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-stone-200 bg-white"
              >
                <option value="ALL">All Dietary Types</option>
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="VEGAN">Vegan</option>
                <option value="HALAL">Halal</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Hyderabad Area:</span>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-stone-200 bg-white"
              >
                <option value="ALL">All Areas</option>
                {availableAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Min Quantity:</span>
              <input
                type="number"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1.5 rounded-md border border-stone-200 text-center"
              />
            </div>

            {(categoryFilter !== 'ALL' || dietaryFilter !== 'ALL' || areaFilter !== 'ALL' || minQuantity > 0 || search) && (
              <button
                onClick={() => {
                  setCategoryFilter('ALL');
                  setDietaryFilter('ALL');
                  setAreaFilter('ALL');
                  setMinQuantity(0);
                  setSearch('');
                }}
                className="text-xs text-rose-700 hover:underline font-medium ml-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {scoredListings.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-stone-200 text-center space-y-3">
            <Search className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-700">No surplus food currently matches your search</p>
            <p className="text-xs text-stone-500">
              Try broadening your category or area filters to see all active donations across Hyderabad.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scoredListings.map(({ listing, match }) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Photo & Badges */}
                <div className="h-44 relative bg-stone-100 overflow-hidden">
                  <SafeImage
                    src={listing.imageUrl}
                    alt={listing.title}
                    fallbackCategory={listing.category.replace('_', ' ')}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-900 bg-white/95 px-2.5 py-0.5 rounded shadow-xs">
                      {listing.dietaryType.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100/95 px-2.5 py-0.5 rounded shadow-xs">
                      Match {match.score}%
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <CountdownBadge deadline={listing.pickupDeadline} compact={false} />
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span className="font-medium text-stone-700">{listing.donorName}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {listing.pickupArea}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 line-clamp-1">{listing.title}</h3>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>

                    {/* Match explanation */}
                    <div className="mt-3 p-2 bg-stone-50 rounded-lg border border-stone-100 text-[11px] text-stone-600 space-y-1">
                      <div className="font-semibold text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Why this matches your charity:</span>
                      </div>
                      {match.reasons.slice(0, 2).map((r, i) => (
                        <div key={i} className="line-clamp-1">· {r}</div>
                      ))}
                    </div>
                  </div>

                  {/* Available Quantity & CTA */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Available</span>
                      <span className="text-sm font-bold text-emerald-800 tabular-nums">
                        {listing.quantityAvailable} {listing.quantityUnit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/recipient/available/${listing.id}`}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Request Food</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
