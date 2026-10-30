# FoodBridge — Rescue Food. Feed Hope.
**Hackathon Problem ID:** HACK-P197  
**Category:** Food & Restaurant  
**Region Pilot:** Hyderabad Metro, India  

FoodBridge is a full-stack surplus food donation and rescue platform connecting restaurants, hotels, bakeries, caterers, and grocery supermarkets with eligible NGOs, charities, shelters, and community kitchens.

---

## 🌟 Key Features

1. **Atomic Double-Booking Prevention:**
   - When a donor accepts an NGO request, portion inventory is locked and decremented atomically in a transactional block.
   - Concurrently arriving claims cannot over-subscribe or exceed available inventory.
   - If an accepted reservation is cancelled, reserved portions are automatically restored back to the available inventory exactly once.

2. **Smart Matching Recommendation Algorithm:**
   - Transparent, deterministic compatibility scoring ($0 - 100\%$) based on:
     - Geographical transit corridors (e.g. Jubilee Hills, Banjara Hills, Gachibowli, Madhapur).
     - Dietary compatibility (Vegetarian, Non-Vegetarian, Vegan, Halal).
     - Organization distribution capacity.
     - Pickup deadline urgency ($<2\text{ hours}$ vs. flexible).

3. **Live Pickup Countdowns & Expiry Governance:**
   - Real-time countdown badges warning when collection windows are nearing cutoff.
   - Automatically transitions uncollected donations to `EXPIRED` once the safety threshold lapses.

4. **Digital Food Safety Undertaking & Traceability:**
   - FSSAI 2hr/4hr temperature holding guidance ($>60^\circ\text{C}$ / $<4^\circ\text{C}$).
   - Mandatory allergen disclosures and digital undertakings.
   - Two-sided collection handover confirmation requiring collector identification and condition inspection notes.

5. **Full Multi-Role Dashboards & Administration:**
   - **Donor Portal:** Listing creation, active batch monitoring, incoming request acceptance/rejection, dispatch readiness, and ESG impact exports.
   - **Recipient Portal:** Searchable marketplace, filterable by diet and area, partial volume requests, driver handover confirmation, and distribution history.
   - **Admin Console:** Platform oversight, listing moderation with recorded justifications, NGO regulatory verification approvals, and immutable audit trail.

---

## 🚀 Judge Quick-Access Credentials

The application includes an instant **Judge Demo Switcher** in the sidebar and on the login/landing screens:

| Role | Account Email | Representing Organization | Quick Actions |
|---|---|---|---|
| **Donor** | `demo.donor@foodbridge.test` | Green Plate Kitchen (Jubilee Hills) | Create surplus listing, accept incoming requests, stage dispatch |
| **Recipient** | `demo.ngo@foodbridge.test` | Hope Community Kitchen (Ameerpet) | Search marketplace, claim meal portions, confirm collection handover |
| **Admin** | `demo.admin@foodbridge.test` | Dr. Suresh Reddy (Platform Admin) | Review flags, moderate listings, verify organization licenses |

*A "Reset Demo Data" button is available in the sidebar to return the platform to its initial Hyderabad seed state at any time.*

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, React Router
- **Backend / Store:** Transactional in-memory & local persistent store with ACID-style inventory transitions and audit logging
- **Database Schema:** PostgreSQL / Supabase compatible DDL with Row Level Security (RLS) policies (`/supabase/schema.sql`)
- **Typography:** Plus Jakarta Sans & JetBrains Mono

---

## 📂 Project Structure

```
/src
  ├── assets/images/       # High-fidelity food rescue & listing photography
  ├── components/          # Reusable UI (DashboardLayout, StatusBadge, CountdownBadge, Layout)
  ├── context/             # AuthContext (multi-role RBAC, judge shortcuts)
  ├── data/                # Realistic Hyderabad seed data (10 listings, 7 orgs, requests, reports)
  ├── pages/
  │    ├── public/         # LandingPage, HowItWorks, FoodSafety, About
  │    ├── auth/           # LoginPage, RegisterPage
  │    ├── donor/          # Dashboard, Listings, NewListing, ListingDetail, Requests, History
  │    ├── recipient/      # Dashboard, AvailableMarketplace, ListingDetail, Requests, History
  │    └── admin/          # Dashboard, ListingsModeration, Organizations, Reports, Activity
  ├── services/            # store.ts (Atomic reservation engine, matching algorithm)
  └── types/               # TypeScript interfaces and domain enums
/supabase
  └── schema.sql           # Complete PostgreSQL tables, foreign keys, RLS, and stored function
```

---

## 🏃 Local Setup & Development

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build
```
