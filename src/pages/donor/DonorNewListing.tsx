import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Utensils,
  Image as ImageIcon
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { FoodCategory, DietaryType, QuantityUnit } from '../../types';

export const DonorNewListing: React.FC = () => {
  const { organization, user } = useAuth();
  const navigate = useNavigate();

  // Helper date generators for default sensible values
  const now = new Date();
  const formatInputDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const prepDefault = formatInputDateTime(new Date(now.getTime() - 60 * 60 * 1000)); // 1h ago
  const listDefault = formatInputDateTime(now);
  const startDefault = formatInputDateTime(now);
  const deadlineDefault = formatInputDateTime(new Date(now.getTime() + 3.5 * 60 * 60 * 1000)); // 3.5h later
  const useByDefault = formatInputDateTime(new Date(now.getTime() + 5 * 60 * 60 * 1000)); // 5h later

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('COOKED_MEALS');
  const [dietaryType, setDietaryType] = useState<DietaryType>('VEGETARIAN');
  const [quantityTotal, setQuantityTotal] = useState<number>(30);
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>('portions');
  const [preparationTime, setPreparationTime] = useState(prepDefault);
  const [listingTime, setListingTime] = useState(listDefault);
  const [useByTime, setUseByTime] = useState(useByDefault);
  const [storageInstructions, setStorageInstructions] = useState('Keep warm above 60°C in insulated containers.');
  const [allergenInformation, setAllergenInformation] = useState('No nuts or dairy. Contains lentils and whole spices.');
  const [pickupAddress, setPickupAddress] = useState(organization?.demoAddress || 'Road No. 36, Jubilee Hills, Hyderabad');
  const [pickupArea, setPickupArea] = useState(organization?.serviceArea || 'Jubilee Hills');
  const [pickupStart, setPickupStart] = useState(startDefault);
  const [pickupDeadline, setPickupDeadline] = useState(deadlineDefault);
  const [imageUrl, setImageUrl] = useState('/src/assets/images/listing_biryani_1793336883211.jpg');
  const [additionalInstructions, setAdditionalInstructions] = useState('Dispatch via rear service door near staff entrance.');
  const [safetyUndertaking, setSafetyUndertaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!organization || !user) {
      setError('Active organization session required.');
      return;
    }

    // 1. Quantity validation
    if (!quantityTotal || quantityTotal <= 0) {
      setError('Total quantity must be greater than zero.');
      return;
    }

    // 2. Timeline validation
    const prepDate = new Date(preparationTime).getTime();
    const startDate = new Date(pickupStart).getTime();
    const deadlineDate = new Date(pickupDeadline).getTime();
    const useByDate = new Date(useByTime).getTime();
    const currentTime = Date.now();

    if (deadlineDate <= startDate) {
      setError('Pickup deadline must be after pickup start time.');
      return;
    }

    if (deadlineDate <= currentTime) {
      setError('Pickup deadline must be in the future.');
      return;
    }

    if (useByDate < deadlineDate) {
      setError('Use-by cutoff cannot be earlier than the pickup deadline.');
      return;
    }

    // 3. Safety undertaking check
    if (!safetyUndertaking) {
      setError('You must accept the food-safety undertaking before publishing.');
      return;
    }

    try {
      const newListing = store.createListing(organization, user, {
        title,
        description,
        category,
        dietaryType,
        quantityTotal: Number(quantityTotal),
        quantityUnit,
        preparationTime: new Date(preparationTime).toISOString(),
        listingTime: new Date(listingTime).toISOString(),
        useByTime: new Date(useByTime).toISOString(),
        storageInstructions,
        allergenInformation,
        pickupAddress,
        pickupArea,
        pickupStart: new Date(pickupStart).toISOString(),
        pickupDeadline: new Date(pickupDeadline).toISOString(),
        imageUrl,
        additionalInstructions,
      });

      navigate(`/donor/listings/${newListing.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    }
  };

  return (
    <DashboardLayout
      title="Create Surplus Food Listing"
      subtitle="Publish surplus meals for eligible community charities before safe windows close"
      requiredRole="DONOR"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/donor/listings"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Listings</span>
        </Link>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs space-y-6">
          {/* Section 1: Core Details */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-800" />
              <span>1. Food Classification & Description</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Clear dietary labeling helps recipient shelters match meals to vulnerable groups.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Food Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Vegetarian rice and dal meals, Sealed bread packets, Vegetable biryani"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FoodCategory)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="COOKED_MEALS">Cooked Meals (Warm / Cold)</option>
                  <option value="BAKERY_BREAD">Bakery & Breads</option>
                  <option value="PRODUCE_VEGGIES">Fresh Produce & Fruits</option>
                  <option value="PACKAGED_GOODS">Sealed Packaged Goods</option>
                  <option value="DAIRY_GRAINS">Dairy, Rice & Grains</option>
                  <option value="BEVERAGES">Beverages & Juices</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Dietary Classification *
                </label>
                <select
                  value={dietaryType}
                  onChange={(e) => setDietaryType(e.target.value as DietaryType)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGAN">100% Vegan</option>
                  <option value="HALAL">Halal Certified</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Detailed Food Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe meal composition, packaging state (e.g. foil packets, stainless trays, food-grade boxes), freshness, and serving readiness..."
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Quantities */}
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 mb-1">2. Quantity & Batch Size</h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter total available units. Multiple charities can submit partial claims against this batch.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Total Quantity (Numbers only) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantityTotal}
                  onChange={(e) => setQuantityTotal(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Unit of Measure *
                </label>
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value as QuantityUnit)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="portions">Portions / Individual Meals</option>
                  <option value="packets">Packets / Sealed Pouches</option>
                  <option value="boxes">Boxes / Crates</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="trays">Commercial Catering Trays</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Time Windows & Food Safety Guidance */}
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" />
              <span>3. Preparation, Pickup Timeline & Safety Storage</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enforces FSSAI adherence. Pickups after the deadline are locked to prevent temperature abuse.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Preparation Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Pickup Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupStart}
                  onChange={(e) => setPickupStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 text-emerald-950 font-semibold">
                  Pickup Deadline (Cutoff) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupDeadline}
                  onChange={(e) => setPickupDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-400 bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Storage & Holding Instructions *
                </label>
                <input
                  type="text"
                  required
                  value={storageInstructions}
                  onChange={(e) => setStorageInstructions(e.target.value)}
                  placeholder="e.g. Keep hot in steam chafer (>60°C) or refrigerate below 4°C"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Allergen Information *
                </label>
                <input
                  type="text"
                  required
                  value={allergenInformation}
                  onChange={(e) => setAllergenInformation(e.target.value)}
                  placeholder="e.g. Contains wheat gluten, peanuts, dairy, or 100% nut-free"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Location & Image */}
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 mb-1">4. Pickup Location & Photograph</h3>
            <p className="text-xs text-stone-500 mb-4">
              Designate exact dispatch bay or kitchen loading entrance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Pickup Area / Zone *
                </label>
                <input
                  type="text"
                  required
                  value={pickupArea}
                  onChange={(e) => setPickupArea(e.target.value)}
                  placeholder="e.g. Jubilee Hills, Banjara Hills, Gachibowli"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Street Pickup Address *
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Packaging & Driver Access Notes
                </label>
                <input
                  type="text"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Park van in service lane; staff will help load into vehicle"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Photo Selector */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-800" />
                  <span>Verified Photo Asset</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setImageUrl('/src/assets/images/listing_biryani_1793336883211.jpg')}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition-colors ${
                      imageUrl.includes('biryani')
                        ? 'border-emerald-800 ring-2 ring-emerald-800 bg-emerald-50/30'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <img
                      src="/src/assets/images/listing_biryani_1793336883211.jpg"
                      alt="Cooked Meals"
                      className="w-10 h-10 rounded object-cover"
                    />
                    <span className="text-xs font-medium text-stone-800">Hot Meals</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageUrl('/src/assets/images/listing_bakery_bread_1793336884616.jpg')}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition-colors ${
                      imageUrl.includes('bakery')
                        ? 'border-emerald-800 ring-2 ring-emerald-800 bg-emerald-50/30'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <img
                      src="/src/assets/images/listing_bakery_bread_1793336884616.jpg"
                      alt="Bakery & Bread"
                      className="w-10 h-10 rounded object-cover"
                    />
                    <span className="text-xs font-medium text-stone-800">Bakery Goods</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageUrl('/src/assets/images/listing_groceries_1793336884994.jpg')}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition-colors ${
                      imageUrl.includes('groceries')
                        ? 'border-emerald-800 ring-2 ring-emerald-800 bg-emerald-50/30'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <img
                      src="/src/assets/images/listing_groceries_1793336884994.jpg"
                      alt="Groceries"
                      className="w-10 h-10 rounded object-cover"
                    />
                    <span className="text-xs font-medium text-stone-800">Produce & Pantry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Undertaking */}
          <div className="pt-4 border-t border-stone-200 bg-stone-50/70 p-4 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="undertaking"
                required
                checked={safetyUndertaking}
                onChange={(e) => setSafetyUndertaking(e.target.checked)}
                className="mt-1 h-4 w-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700 cursor-pointer"
              />
              <label htmlFor="undertaking" className="text-xs text-stone-800 leading-relaxed cursor-pointer select-none">
                <strong>Mandatory Food-Safety Commitment:</strong> “I confirm that the information provided is accurate to the best of my knowledge and that the food will be handled and offered in accordance with applicable food-safety requirements.”
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              to="/donor/listings"
              className="px-4 py-2.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Listing to Network</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
