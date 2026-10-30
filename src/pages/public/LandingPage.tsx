import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  Soup,
  Scale,
  Users,
  ChevronRight,
  Flame,
  HelpCircle
} from 'lucide-react';
import { PublicHeader, PublicFooter } from '../../components/PublicLayout';
import { store } from '../../services/store';
import { CountdownBadge } from '../../components/CountdownBadge';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { quickLogin } = useAuth();
  const activeListings = store
    .getListings()
    .filter((l) => l.status === 'AVAILABLE' && l.quantityAvailable > 0)
    .slice(0, 3);

  const totalPortionsAvailable = activeListings.reduce((sum, item) => sum + item.quantityAvailable, 0);

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col">
      <PublicHeader />

      {/* Judge Quick-Start Banner */}
      <div className="bg-emerald-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <span className="font-bold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            Hackathon Demo
          </span>
          <span className="text-emerald-100">
            Problem HACK-P197 · Instant Judge Mode:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              quickLogin('DONOR');
              navigate('/donor/dashboard');
            }}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-medium transition-colors"
          >
            Demo Donor (Green Plate)
          </button>
          <button
            onClick={() => {
              quickLogin('RECIPIENT');
              navigate('/recipient/dashboard');
            }}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-medium transition-colors"
          >
            Demo Recipient (Hope Kitchen)
          </button>
          <button
            onClick={() => {
              quickLogin('ADMIN');
              navigate('/admin/dashboard');
            }}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-medium transition-colors"
          >
            Demo Admin Console
          </button>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 overflow-hidden border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Value Prop & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Surplus Food Rescue & Redistribution Network</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-[1.1] text-balance">
                  Good Food Deserves a <span className="text-emerald-800">Second Chance.</span>
                </h1>

                <p className="text-lg text-stone-600 leading-relaxed max-w-2xl">
                  Connect surplus food with communities that need it. FoodBridge makes food donation easier, more transparent, and more reliable through atomic reservation, safety tracking, and rapid pickup coordination.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => {
                      quickLogin('DONOR');
                      navigate('/donor/listings/new');
                    }}
                    className="px-6 py-3.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <span>Donate Surplus Food</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      quickLogin('RECIPIENT');
                      navigate('/recipient/available');
                    }}
                    className="px-6 py-3.5 text-sm font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg shadow-xs transition-colors flex items-center gap-2"
                  >
                    <span>Find Available Food</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                </div>

                {/* Trust markers */}
                <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center gap-6 text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>FSSAI Hygiene Compliant</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>Zero Double-Booking Guarantee</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Live Pickup Countdowns</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-100">
                  <img
                    src="/src/assets/images/hero_food_rescue_1793336883624.jpg"
                    alt="Community volunteers packing warm surplus meals into food containers"
                    className="w-full h-[400px] object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Active Hyderabad Corridor</span>
                    </div>
                    <p className="text-sm font-medium text-stone-100 leading-snug">
                      Over {totalPortionsAvailable}+ wholesome portions currently available for immediate rescue across Jubilee Hills, Gachibowli, and Madhapur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem & Solution Statement */}
        <section className="py-16 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                The Challenge & Our Mission
              </span>
              <h2 className="text-3xl font-bold text-stone-900 mt-2 tracking-tight">
                Every Day, Wholesome Prepared Food is Wasted While Shelters Struggle to Feed
              </h2>
              <p className="text-stone-600 text-sm mt-3 leading-relaxed">
                Restaurants and banquets produce safe, high-quality surplus meals that must be consumed within hours. Without a structured platform, coordination takes hours of phone calls, risking expiry. FoodBridge bridges this critical window with transactional speed.
              </p>
            </div>

            {/* Three-step Rescue Workflow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border border-stone-200 bg-[#F8FAF7] space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h3 className="text-base font-bold text-stone-900">Commercial Donors List Safe Surplus</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Kitchens log quantity, preparation timestamp, safe storage parameters, allergens, and exact pickup windows in under two minutes.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-stone-200 bg-[#F8FAF7] space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h3 className="text-base font-bold text-stone-900">NGOs Request Specific Quantities</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Verified shelters discover compatible food listings nearby, submit requests for exact portions needed, and track approval status.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-stone-200 bg-[#F8FAF7] space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h3 className="text-base font-bold text-stone-900">Atomic Reservation & Handover</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Inventory decrements transactionally to eliminate double-booking. Donors stage orders and recipients confirm collection upon arrival.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Marketplace Preview Section */}
        <section className="py-16 bg-[#F8FAF7] border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                  Live Available Listings
                </span>
                <h2 className="text-2xl font-bold text-stone-900 mt-1 tracking-tight">
                  Surplus Food Waiting for Community Pickup
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Active donations in Hyderabad ready for immediate reservation.
                </p>
              </div>

              <Link
                to="/recipient/available"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                <span>View all marketplace listings ({store.getListings().length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="h-44 relative bg-stone-100 overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-semibold text-stone-900 bg-white/95 px-2.5 py-1 rounded shadow-xs">
                        {listing.dietaryType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <CountdownBadge deadline={listing.pickupDeadline} compact={false} />
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-stone-500 mb-1 flex items-center justify-between">
                        <span>{listing.donorName}</span>
                        <span>{listing.pickupArea}</span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 line-clamp-1">{listing.title}</h3>
                      <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 block">Available</span>
                        <span className="text-sm font-bold text-emerald-800 tabular-nums">
                          {listing.quantityAvailable} {listing.quantityUnit}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          quickLogin('RECIPIENT');
                          navigate(`/recipient/available/${listing.id}`);
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      >
                        Request Food
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Comparison Grid */}
        <section className="py-16 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Tailored for Both Sides
              </span>
              <h2 className="text-3xl font-bold text-stone-900 mt-2 tracking-tight">
                Why Food Donors and Recipient Charities Choose FoodBridge
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* For Donors */}
              <div className="p-6 rounded-xl border border-stone-200 bg-[#F8FAF7] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                    <Building className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">For Food Donors</h3>
                    <p className="text-xs text-stone-500">Restaurants, Bakeries, Caterers & Supermarkets</p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-700 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>Rapid 2-Minute Listing:</strong> Standardized form with storage protocols and allergen declarations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>Verified Non-Profit Partners:</strong> Only legally vetted NGOs and shelters can request and collect.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>Zero Double-Bookings:</strong> Transactional portion decrement ensures you never over-commit surplus.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>CSR & ESG Audit Trail:</strong> Automated analytics track portions rescued, carbon saved, and impact.</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      quickLogin('DONOR');
                      navigate('/donor/dashboard');
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                  >
                    <span>Launch Donor Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* For NGOs */}
              <div className="p-6 rounded-xl border border-stone-200 bg-[#F8FAF7] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                    <Soup className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">For Recipient NGOs</h3>
                    <p className="text-xs text-stone-500">Shelters, Community Kitchens & Charities</p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-700 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>Transparent Food Safety Details:</strong> Prep times, use-by limits, and storage temperatures visible upfront.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>Smart Compatibility Scoring:</strong> Matching engine highlights meals aligned with your capacity and dietary needs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>Partial Quantity Claims:</strong> Request 20 portions even if a caterer lists 50, without blocking others.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>Dynamic Pickup Alerts:</strong> Countdown timers ensure your collection van arrives before the window closes.</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      quickLogin('RECIPIENT');
                      navigate('/recipient/dashboard');
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                  >
                    <span>Launch Recipient Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Statistics Section (Clearly identified demonstration metrics) */}
        <section className="py-16 bg-emerald-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                Demonstration Impact Metrics
              </span>
              <h2 className="text-3xl font-bold mt-2 tracking-tight">
                Measurable Social and Environmental Impact
              </h2>
              <p className="text-xs text-stone-300 mt-2">
                Simulated platform activity across Hyderabad Metro test accounts.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 bg-emerald-900/50 rounded-xl border border-emerald-800/80">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 tabular-nums">
                  3,480+
                </div>
                <div className="text-xs text-stone-300 mt-1 font-medium">Wholesome Portions Rescued</div>
              </div>

              <div className="p-6 bg-emerald-900/50 rounded-xl border border-emerald-800/80">
                <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                  28
                </div>
                <div className="text-xs text-stone-300 mt-1 font-medium">Partner Food Donors</div>
              </div>

              <div className="p-6 bg-emerald-900/50 rounded-xl border border-emerald-800/80">
                <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                  19
                </div>
                <div className="text-xs text-stone-300 mt-1 font-medium">Vetted Recipient Shelters</div>
              </div>

              <div className="p-6 bg-emerald-900/50 rounded-xl border border-emerald-800/80">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tabular-nums">
                  1.74 t
                </div>
                <div className="text-xs text-stone-300 mt-1 font-medium">CO₂e Landfill Emissions Prevented</div>
              </div>
            </div>
          </div>
        </section>

        {/* Food Safety & FAQ */}
        <section className="py-16 bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Common Questions
              </span>
              <h2 className="text-2xl font-bold text-stone-900 mt-1">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-stone-200 bg-[#F8FAF7]">
                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  How does FoodBridge prevent double-booking surplus food?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  FoodBridge enforces atomic database reservation. When a donor accepts an NGO’s request, the available quantity is decremented immediately in a transactional block. If two NGOs submit requests concurrently, the second acceptance will reject if remaining volume is insufficient.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-stone-200 bg-[#F8FAF7]">
                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  What happens if an accepted pickup is cancelled?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  If an NGO cancels an accepted reservation prior to pickup, FoodBridge restores the reserved portions back to the available inventory exactly once, reopening discovery for other nearby organizations.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-stone-200 bg-[#F8FAF7]">
                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  What food safety standards are required?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Donors must adhere to FSSAI guidelines: food must have been prepared in licensed commercial kitchens, held above 60°C or below 4°C, packed in food-grade containers, and clearly tagged with preparation time and allergens.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
