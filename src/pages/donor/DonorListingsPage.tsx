import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  AlertCircle,
  UtensilsCrossed
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { CountdownBadge } from '../../components/CountdownBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { FoodCategory, ListingStatus } from '../../types';

export const DonorListingsPage: React.FC = () => {
  const { organization, user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'quantity'>('newest');

  const allListings = store
    .getListings()
    .filter((l) => l.donorOrganizationId === organization?.id);

  // Filter and sort
  const filteredListings = allListings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.pickupArea.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || l.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  filteredListings.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'deadline') {
      return new Date(a.pickupDeadline).getTime() - new Date(b.pickupDeadline).getTime();
    }
    if (sortBy === 'quantity') {
      return b.quantityAvailable - a.quantityAvailable;
    }
    return 0;
  });

  const handleRemoveListing = (id: string, title: string) => {
    if (!user) return;
    const confirm = window.confirm(`Are you sure you want to remove listing "${title}"? It will no longer be available for requests.`);
    if (confirm) {
      store.removeListing(id, user, 'Removed by donor from listings page');
    }
  };

  return (
    <DashboardLayout
      title="My Food Listings"
      subtitle="Manage your surplus inventory, active reservations, and safe collection timelines"
      requiredRole="DONOR"
      actions={
        <Link
          to="/donor/listings/new"
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-2 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Listing</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food title, area..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Fully Reserved</option>
                <option value="COMPLETED">Completed</option>
                <option value="EXPIRED">Expired</option>
                <option value="REMOVED">Removed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="ALL">All Categories</option>
                <option value="COOKED_MEALS">Cooked Meals</option>
                <option value="BAKERY_BREAD">Bakery & Bread</option>
                <option value="PRODUCE_VEGGIES">Produce & Veggies</option>
                <option value="PACKAGED_GOODS">Packaged Goods</option>
                <option value="DAIRY_GRAINS">Dairy & Grains</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="newest">Newest First</option>
                <option value="deadline">Nearest Pickup Deadline</option>
                <option value="quantity">Highest Available Quantity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Data Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          {filteredListings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <UtensilsCrossed className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">No food listings match your filter</p>
              <p className="text-xs text-stone-500">
                Create a new donation or adjust the search and status filter options above.
              </p>
              <Link
                to="/donor/listings/new"
                className="inline-block mt-2 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
              >
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-200">
                  <tr>
                    <th className="px-5 py-3">Listing Details</th>
                    <th className="px-5 py-3">Category & Diet</th>
                    <th className="px-5 py-3 text-right">Available / Total</th>
                    <th className="px-5 py-3">Pickup Window & Deadline</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredListings.map((listing) => {
                    const requestsCount = store
                      .getRequests()
                      .filter((r) => r.listingId === listing.id).length;

                    return (
                      <tr key={listing.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/donor/listings/${listing.id}`}
                            className="font-bold text-stone-900 hover:text-emerald-800 hover:underline flex items-center gap-1.5"
                          >
                            <span>{listing.title}</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </Link>
                          <span className="text-[11px] text-stone-500 block mt-0.5">
                            {listing.pickupArea} · {requestsCount} requests received
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-stone-600">
                          <div>{listing.category.replace('_', ' ')}</div>
                          <span className="text-[10px] text-stone-600 font-medium">
                            {listing.dietaryType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">
                          <span className="text-sm font-bold text-emerald-800">
                            {listing.quantityAvailable}
                          </span>
                          <span className="text-stone-600"> / {listing.quantityTotal} {listing.quantityUnit}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <CountdownBadge deadline={listing.pickupDeadline} status={listing.status} />
                          <span className="text-[10px] text-stone-600 block mt-0.5">
                            Deadline: {new Date(listing.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={listing.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <Link
                            to={`/donor/listings/${listing.id}`}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 rounded border border-emerald-200"
                          >
                            Details
                          </Link>
                          {listing.status === 'AVAILABLE' && (
                            <button
                              onClick={() => handleRemoveListing(listing.id, listing.title)}
                              className="px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
                              title="Remove listing from discovery"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
