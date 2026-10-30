import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Thermometer,
  Clock,
  AlertTriangle,
  Building2,
  HeartHandshake,
  CheckCircle2,
  FileText,
  Truck,
  ArrowRight
} from 'lucide-react';
import { PublicHeader, PublicFooter } from '../../components/PublicLayout';
import { useAuth } from '../../context/AuthContext';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const { quickLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
            Architecture & Workflow
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-2 tracking-tight">
            How FoodBridge Rescues Surplus Food
          </h1>
          <p className="text-sm text-stone-600 mt-3 leading-relaxed">
            A reliable, transparent coordination pipeline connecting commercial kitchens with verified shelters before safe food windows lapse.
          </p>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-amber-300 font-bold text-lg flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-bold text-stone-900">Surplus Food Listing & Safety Declaration</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                When a restaurant, hotel buffet, or caterer identifies safe leftover food, the kitchen manager logs into FoodBridge. They specify the meal title, dietary category (Vegetarian, Non-Veg, Vegan), available portions, preparation timestamp, safe storage instructions, allergen declarations, and the exact pickup cutoff time. Donors must sign the digital food-safety undertaking.
              </p>
              <div className="pt-2 text-xs text-stone-500 font-mono">
                Key Fields: quantityTotal, preparationTime, useByTime, storageInstructions, allergens
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-amber-300 font-bold text-lg flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-bold text-stone-900">Smart Discovery & Quantified Request</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Registered shelters, charities, and community kitchens search the live marketplace. Our smart matching algorithm scores each listing based on proximity corridor, dietary preferences, and shelter capacity. Recipient organizations can request the full batch or a specific partial quantity, providing vehicle and driver collection notes.
              </p>
              <div className="pt-2 text-xs text-stone-500 font-mono">
                State: PENDING (inventory remains visible until confirmed acceptance)
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-amber-300 font-bold text-lg flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-bold text-stone-900">Atomic Reservation & Double-Booking Prevention</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                When the donor clicks "Accept", the platform verifies available quantity atomically. The requested quantity is subtracted from the listing's available pool immediately. If the listing drops to 0 portions, it moves to RESERVED so no additional requests can be made.
              </p>
              <div className="pt-2 text-xs text-stone-500 font-mono">
                State: ACCEPTED (atomic inventory reservation with rollback on cancellation)
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-amber-300 font-bold text-lg flex items-center justify-center shrink-0">
              4
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-bold text-stone-900">Packaging, Dispatch & Collection Handover</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                The donor packs the food into food-grade containers and clicks "Mark Ready for Pickup". The recipient's mobile van arrives at the dispatch location. Upon checking the packages, the recipient logs the collector name and notes, confirming receipt. The transaction is sealed as COMPLETED in both audit histories.
              </p>
              <div className="pt-2 text-xs text-stone-500 font-mono">
                State: READY_FOR_PICKUP → COMPLETED (audit event logged with collector details)
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center bg-emerald-50 border border-emerald-200 p-8 rounded-2xl">
          <h3 className="text-lg font-bold text-emerald-950 mb-2">Experience the Workflow Firsthand</h3>
          <p className="text-xs text-emerald-800 max-w-xl mx-auto mb-6">
            Jump into our demonstration mode to create a donor listing, accept incoming requests, and simulate recipient pickup confirmation.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                quickLogin('DONOR');
                navigate('/donor/dashboard');
              }}
              className="px-5 py-2.5 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 transition-colors"
            >
              Start as Donor
            </button>
            <button
              onClick={() => {
                quickLogin('RECIPIENT');
                navigate('/recipient/dashboard');
              }}
              className="px-5 py-2.5 bg-white text-stone-800 border border-stone-300 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors"
            >
              Start as Recipient NGO
            </button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export const FoodSafetyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Standard Operating Procedures</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            Food Safety & Hygiene Commitments
          </h1>
          <p className="text-sm text-stone-600 mt-2">
            Donating surplus food requires strict food safety discipline. FoodBridge mandates compliance with FSSAI (Food Safety and Standards Authority of India) donation protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold">
              <Thermometer className="w-5 h-5 text-amber-500" />
              <h3 className="text-base">Temperature Control (The 2hr/4hr Rule)</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Cooked hot food must be maintained above <strong>60°C</strong> or cooled to below <strong>4°C</strong> within two hours of preparation. Food remaining between 5°C and 60°C for longer than 4 hours cannot be offered on the platform and must be safely composted.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base">Safe Pickup Windows</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every listing specifies a strict pickup deadline. If no organization collects the food before this timestamp, the listing automatically transitions to <strong>EXPIRED</strong>, prohibiting subsequent collection to protect recipients.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-base">Mandatory Allergen Disclosures</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Donors must explicitly list potential allergens (peanuts, tree nuts, dairy/ghee, gluten, soy, mustard seeds). Unpackaged food without verifiable ingredient knowledge is strictly prohibited from listing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="text-base">Food Safety Undertaking</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Before submitting any donation, donors must confirm: <em>“I confirm that the information provided is accurate to the best of my knowledge and that the food will be handled and offered in accordance with applicable food-safety requirements.”</em>
            </p>
          </div>
        </div>

        {/* What Can & Cannot Be Donated */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-base font-bold text-stone-900 mb-4">Acceptance Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Permitted for Rescue
              </span>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                <li>Unserved batch surplus from commercial buffets & banquets</li>
                <li>Freshly baked breads and pastries in food-grade packaging</li>
                <li>Sealed, unopened grocery staples, rice, lentils, and canned foods</li>
                <li>Wholesome whole fresh fruits and unblemished vegetables</li>
                <li>Properly chilled dairy products well before expiry date</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Strictly Prohibited
              </span>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                <li>Partially eaten plates or customer-returned food</li>
                <li>Food kept at room temperature for over 4 hours</li>
                <li>Swollen, rusted, or leaking cans</li>
                <li>Raw meat or unpasteurized dairy without active cold-chain verification</li>
                <li>Alcoholic beverages or tobacco items</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
            Hackathon Project HACK-P197
          </span>
          <h1 className="text-3xl font-bold text-stone-900 mt-2 tracking-tight">
            About FoodBridge
          </h1>
          <p className="text-sm text-stone-600 mt-2">
            “Rescue Food. Feed Hope.” — Building digital infrastructure to eliminate edible food waste in urban communities.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-8 space-y-6 text-xs text-stone-700 leading-relaxed shadow-xs">
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Our Vision</h3>
            <p>
              In metropolitan hubs like Hyderabad, India, hundreds of kilograms of freshly prepared meals are discarded daily from event centers, hotel buffets, and corporate cafeterias. Meanwhile, nearby orphanages, night shelters, and mobile community kitchens struggle to source nutritious meals daily.
            </p>
            <p className="mt-2">
              FoodBridge exists to solve the discovery and synchronization bottleneck. By establishing real-time inventory transparency, atomic reservations, dynamic pickup countdowns, and auditable chain-of-custody, we convert potential landfill waste into community nourishment.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-base font-bold text-stone-900 mb-2">Technical Rigor & Architecture</h3>
            <p>
              Unlike simple bulletin boards, FoodBridge addresses critical operational realities:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li><strong>Atomic Reservation Engine:</strong> Eliminates double-booking races when multiple NGOs claim surplus concurrently.</li>
              <li><strong>Dynamic Deadlines:</strong> Real-time countdown timers signal urgent pickups before safe food temperatures expire.</li>
              <li><strong>Smart Compatibility Scoring:</strong> Recommends listings according to geographical transit corridors, dietary requirements, and shelter capacities.</li>
              <li><strong>Full Lifecycle Auditing:</strong> Every action—from listing creation to handover confirmation—records timestamped immutable events.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-base font-bold text-stone-900 mb-2">Demonstration Disclaimer</h3>
            <p>
              This web application was engineered as a prototype for student hackathon demonstration (Problem ID: HACK-P197, Category: Food & Restaurant). All donor organizations, contact numbers, and addresses located in Hyderabad are fictional mock entities designed to illustrate end-to-end functionality.
            </p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};
