-- ========================================================
-- FOODBRIDGE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Hackathon Problem ID: HACK-P197 (Food & Restaurant)
-- PostgreSQL / Supabase Compatible
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- A. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('DONOR', 'RECIPIENT', 'ADMIN')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    organization_type TEXT NOT NULL CHECK (
        organization_type IN (
            'RESTAURANT', 'HOTEL', 'BAKERY', 'CATERER', 'GROCERY', 
            'COMMUNITY_KITCHEN', 'NGO', 'SHELTER', 'CHARITY', 'COMMUNITY_ORG'
        )
    ),
    description TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Hyderabad',
    service_area TEXT NOT NULL,
    demo_address TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        verification_status IN ('VERIFIED', 'PENDING', 'REJECTED')
    ),
    preferred_dietary TEXT[] DEFAULT ARRAY['VEGETARIAN'],
    typical_capacity_portions INT DEFAULT 100,
    contact_person TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. FOOD_LISTINGS TABLE
CREATE TABLE IF NOT EXISTS food_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN ('COOKED_MEALS', 'BAKERY_BREAD', 'PRODUCE_VEGGIES', 'PACKAGED_GOODS', 'DAIRY_GRAINS', 'BEVERAGES')
    ),
    dietary_type TEXT NOT NULL CHECK (
        dietary_type IN ('VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'HALAL')
    ),
    quantity_total INT NOT NULL CHECK (quantity_total > 0),
    quantity_available INT NOT NULL CHECK (quantity_available >= 0),
    quantity_unit TEXT NOT NULL CHECK (
        quantity_unit IN ('portions', 'packets', 'boxes', 'kg', 'trays')
    ),
    preparation_time TIMESTAMPTZ NOT NULL,
    listing_time TIMESTAMPTZ DEFAULT NOW(),
    use_by_time TIMESTAMPTZ NOT NULL,
    storage_instructions TEXT NOT NULL,
    allergen_information TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_area TEXT NOT NULL,
    pickup_start TIMESTAMPTZ NOT NULL,
    pickup_deadline TIMESTAMPTZ NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (
        status IN ('AVAILABLE', 'RESERVED', 'COMPLETED', 'EXPIRED', 'REMOVED')
    ),
    additional_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_quantity_valid CHECK (quantity_available <= quantity_total),
    CONSTRAINT chk_pickup_window CHECK (pickup_deadline > pickup_start)
);

-- D. DONATION_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS donation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE RESTRICT,
    recipient_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requested_quantity INT NOT NULL CHECK (requested_quantity > 0),
    quantity_unit TEXT NOT NULL,
    recipient_notes TEXT,
    collector_name TEXT,
    collector_notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'ACCEPTED', 'READY_FOR_PICKUP', 'COMPLETED', 'REJECTED', 'CANCELLED')
    ),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. DONATION_EVENTS TABLE (IMMUTABLE AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS donation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id TEXT NOT NULL,
    request_id TEXT,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (
        reason IN ('Suspicious listing', 'Inaccurate information', 'Unsafe handling concerns', 'Inappropriate content', 'Other')
    ),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (
        status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED')
    ),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. ORGANIZATION_VERIFICATION_REQUESTS
CREATE TABLE IF NOT EXISTS organization_verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    notes TEXT
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_listings_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_pickup_deadline ON food_listings(pickup_deadline);
CREATE INDEX IF NOT EXISTS idx_listings_area ON food_listings(pickup_area);
CREATE INDEX IF NOT EXISTS idx_requests_listing ON donation_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON donation_requests(status);
CREATE INDEX IF NOT EXISTS idx_events_listing ON donation_events(listing_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_verification_requests ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Food Listings Policies
CREATE POLICY "Public active listings are discoverable" 
ON food_listings FOR SELECT USING (status != 'REMOVED');

CREATE POLICY "Donors can manage own listings" 
ON food_listings FOR ALL TO authenticated 
USING (
    donor_organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
);

-- 3. Donation Requests Policies
CREATE POLICY "Recipients view their own requests" 
ON donation_requests FOR SELECT TO authenticated 
USING (
    recipient_organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Donors view requests for their listings" 
ON donation_requests FOR SELECT TO authenticated 
USING (
    listing_id IN (
        SELECT fl.id FROM food_listings fl
        JOIN organizations o ON fl.donor_organization_id = o.id
        WHERE o.owner_id = auth.uid()
    )
);

-- ATOMIC DOUBLE BOOKING PREVENTION DATABASE FUNCTION
CREATE OR REPLACE FUNCTION accept_donation_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_req RECORD;
    v_listing RECORD;
BEGIN
    -- Row-level lock on the request
    SELECT * INTO v_req FROM donation_requests WHERE id = p_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    IF v_req.status != 'PENDING' THEN
        RAISE EXCEPTION 'Request is not pending (status: %)', v_req.status;
    END IF;

    -- Row-level lock on the listing
    SELECT * INTO v_listing FROM food_listings WHERE id = v_req.listing_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Listing not found';
    END IF;

    IF v_listing.status != 'AVAILABLE' THEN
        RAISE EXCEPTION 'Listing is not available for reservation';
    END IF;

    -- Verify atomic inventory sufficiency
    IF v_req.requested_quantity > v_listing.quantity_available THEN
        RAISE EXCEPTION 'Insufficient quantity available. Requested: %, Available: %', 
            v_req.requested_quantity, v_listing.quantity_available;
    END IF;

    -- Decrement inventory
    UPDATE food_listings 
    SET quantity_available = quantity_available - v_req.requested_quantity,
        status = CASE WHEN (quantity_available - v_req.requested_quantity) = 0 THEN 'RESERVED' ELSE 'AVAILABLE' END,
        updated_at = NOW()
    WHERE id = v_listing.id;

    -- Update request status
    UPDATE donation_requests
    SET status = 'ACCEPTED',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;

    RETURN jsonb_build_object(
        'success', true,
        'reserved_quantity', v_req.requested_quantity,
        'remaining_quantity', v_listing.quantity_available - v_req.requested_quantity
    );
END;
$$;
