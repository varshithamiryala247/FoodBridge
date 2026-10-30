/**
 * FoodBridge Transactional Data Store
 * Handles ACID-style state transitions, double-booking prevention,
 * transparent smart matching, and audit logging.
 */

import {
  Profile,
  Organization,
  FoodListing,
  DonationRequest,
  DonationEvent,
  ListingReport,
  OrganizationVerificationRequest,
  MatchRecommendation,
  RequestStatus,
  ListingStatus,
  ReportReason
} from '../types';

import {
  INITIAL_PROFILES,
  INITIAL_ORGANIZATIONS,
  INITIAL_FOOD_LISTINGS,
  INITIAL_REQUESTS,
  INITIAL_EVENTS,
  INITIAL_REPORTS,
  INITIAL_VERIFICATION_REQUESTS
} from '../data/seedData';

const STORAGE_KEY_PREFIX = 'foodbridge_';

function load<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse storage item:', key, e);
    return defaultValue;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save storage item:', key, e);
  }
}

class Store {
  private profiles: Profile[];
  private organizations: Organization[];
  private listings: FoodListing[];
  private requests: DonationRequest[];
  private events: DonationEvent[];
  private reports: ListingReport[];
  private verificationRequests: OrganizationVerificationRequest[];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.profiles = load('profiles', INITIAL_PROFILES);
    this.organizations = load('organizations', INITIAL_ORGANIZATIONS);
    this.listings = load('listings', INITIAL_FOOD_LISTINGS);
    this.requests = load('requests', INITIAL_REQUESTS);
    this.events = load('events', INITIAL_EVENTS);
    this.reports = load('reports', INITIAL_REPORTS);
    this.verificationRequests = load('verifications', INITIAL_VERIFICATION_REQUESTS);

    this.checkExpirations();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  private persist() {
    save('profiles', this.profiles);
    save('organizations', this.organizations);
    save('listings', this.listings);
    save('requests', this.requests);
    save('events', this.events);
    save('reports', this.reports);
    save('verifications', this.verificationRequests);
    this.notify();
  }

  public resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'profiles');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'organizations');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'listings');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'requests');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'events');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'reports');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'verifications');

    this.profiles = [...INITIAL_PROFILES];
    this.organizations = [...INITIAL_ORGANIZATIONS];
    this.listings = [...INITIAL_FOOD_LISTINGS];
    this.requests = [...INITIAL_REQUESTS];
    this.events = [...INITIAL_EVENTS];
    this.reports = [...INITIAL_REPORTS];
    this.verificationRequests = [...INITIAL_VERIFICATION_REQUESTS];

    this.persist();
  }

  // Auto-expire listings whose deadline has passed
  private checkExpirations() {
    const nowTime = Date.now();
    let modified = false;

    this.listings.forEach((listing) => {
      if (listing.status === 'AVAILABLE' || listing.status === 'RESERVED') {
        const deadline = new Date(listing.pickupDeadline).getTime();
        if (nowTime > deadline && listing.quantityAvailable > 0) {
          listing.status = 'EXPIRED';
          listing.updatedAt = new Date().toISOString();
          modified = true;
        }
      }
    });

    if (modified) {
      this.persist();
    }
  }

  // Getters
  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  public getOrganizations(): Organization[] {
    return [...this.organizations];
  }

  public getOrganizationById(id: string): Organization | undefined {
    return this.organizations.find((o) => o.id === id);
  }

  public getOrganizationByOwnerId(ownerId: string): Organization | undefined {
    return this.organizations.find((o) => o.ownerId === ownerId);
  }

  public getListings(): FoodListing[] {
    this.checkExpirations();
    return [...this.listings];
  }

  public getListingById(id: string): FoodListing | undefined {
    this.checkExpirations();
    return this.listings.find((l) => l.id === id);
  }

  public getRequests(): DonationRequest[] {
    return [...this.requests];
  }

  public getRequestById(id: string): DonationRequest | undefined {
    return this.requests.find((r) => r.id === id);
  }

  public getEvents(listingId?: string, limit: number = 30): DonationEvent[] {
    let filtered = [...this.events];
    if (listingId) {
      filtered = filtered.filter((e) => e.listingId === listingId);
    }
    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  public getReports(): ListingReport[] {
    return [...this.reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getVerificationRequests(): OrganizationVerificationRequest[] {
    return [...this.verificationRequests];
  }

  // Core Actions

  // 1. Create Listing
  public createListing(
    donorOrg: Organization,
    actorProfile: Profile,
    data: Omit<FoodListing, 'id' | 'donorOrganizationId' | 'donorName' | 'donorType' | 'quantityAvailable' | 'status' | 'createdAt' | 'updatedAt'>
  ): FoodListing {
    const id = 'list_' + Math.random().toString(36).substring(2, 9);
    const nowIso = new Date().toISOString();

    const newListing: FoodListing = {
      ...data,
      id,
      donorOrganizationId: donorOrg.id,
      donorName: donorOrg.organizationName,
      donorType: donorOrg.organizationType,
      quantityAvailable: data.quantityTotal,
      status: 'AVAILABLE',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.listings.unshift(newListing);

    // Record Event
    this.recordEvent({
      listingId: id,
      actorId: actorProfile.id,
      actorName: `${actorProfile.fullName} (${donorOrg.organizationName})`,
      eventType: 'LISTING_CREATED',
      description: `Created surplus food listing: ${newListing.quantityTotal} ${newListing.quantityUnit} of ${newListing.title}.`,
      metadata: { initialQuantity: newListing.quantityTotal },
    });

    this.persist();
    return newListing;
  }

  // 2. Update Listing
  public updateListing(
    id: string,
    actorProfile: Profile,
    updates: Partial<FoodListing>
  ): FoodListing {
    const listing = this.listings.find((l) => l.id === id);
    if (!listing) throw new Error('Listing not found');

    Object.assign(listing, updates, { updatedAt: new Date().toISOString() });

    this.recordEvent({
      listingId: id,
      actorId: actorProfile.id,
      actorName: actorProfile.fullName,
      eventType: 'LISTING_MODIFIED',
      description: `Updated listing details for ${listing.title}.`,
      metadata: updates,
    });

    this.persist();
    return listing;
  }

  // 3. Remove Listing (Donor or Admin)
  public removeListing(id: string, actorProfile: Profile, reason?: string): void {
    const listing = this.listings.find((l) => l.id === id);
    if (!listing) throw new Error('Listing not found');

    listing.status = 'REMOVED';
    listing.updatedAt = new Date().toISOString();

    this.recordEvent({
      listingId: id,
      actorId: actorProfile.id,
      actorName: actorProfile.fullName,
      eventType: 'LISTING_REMOVED',
      description: `Listing ${listing.title} was removed.${reason ? ` Reason: ${reason}` : ''}`,
      metadata: { reason },
    });

    this.persist();
  }

  // 4. Create Request (Recipient requests food)
  public createRequest(
    recipientOrg: Organization,
    actorProfile: Profile,
    listingId: string,
    requestedQuantity: number,
    recipientNotes: string
  ): DonationRequest {
    const listing = this.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error('Listing not found');

    if (listing.status !== 'AVAILABLE') {
      throw new Error(`This listing is currently ${listing.status.toLowerCase()} and cannot be requested.`);
    }

    if (requestedQuantity <= 0) {
      throw new Error('Requested quantity must be greater than zero.');
    }

    if (requestedQuantity > listing.quantityAvailable) {
      throw new Error(
        `Requested quantity (${requestedQuantity}) exceeds available quantity (${listing.quantityAvailable} ${listing.quantityUnit}).`
      );
    }

    // Check if pickup deadline passed
    if (new Date().getTime() > new Date(listing.pickupDeadline).getTime()) {
      listing.status = 'EXPIRED';
      this.persist();
      throw new Error('This donation listing has reached its pickup deadline and is expired.');
    }

    const id = 'req_' + Math.random().toString(36).substring(2, 9);
    const nowIso = new Date().toISOString();

    const request: DonationRequest = {
      id,
      listingId: listing.id,
      listingTitle: listing.title,
      listingImageUrl: listing.imageUrl,
      donorOrganizationId: listing.donorOrganizationId,
      donorName: listing.donorName,
      recipientOrganizationId: recipientOrg.id,
      recipientName: recipientOrg.organizationName,
      recipientContact: `${actorProfile.fullName} (${actorProfile.phone || recipientOrg.phone || 'Phone not listed'})`,
      requestedQuantity,
      quantityUnit: listing.quantityUnit,
      recipientNotes,
      pickupAddress: listing.pickupAddress,
      pickupDeadline: listing.pickupDeadline,
      status: 'PENDING',
      requestedAt: nowIso,
      updatedAt: nowIso,
    };

    this.requests.unshift(request);

    this.recordEvent({
      listingId: listing.id,
      requestId: id,
      actorId: actorProfile.id,
      actorName: `${actorProfile.fullName} (${recipientOrg.organizationName})`,
      eventType: 'REQUEST_SUBMITTED',
      description: `Submitted request for ${requestedQuantity} ${listing.quantityUnit} of ${listing.title}.`,
      metadata: { requestedQuantity },
    });

    this.persist();
    return request;
  }

  // 5. Accept Request (ATOMIC DOUBLE-BOOKING PREVENTION)
  // Ensures requestedQuantity <= quantityAvailable at exact moment of acceptance.
  public acceptRequest(
    requestId: string,
    donorActor: Profile
  ): { request: DonationRequest; listing: FoodListing } {
    const request = this.requests.find((r) => r.id === requestId);
    if (!request) throw new Error('Request not found');

    if (request.status !== 'PENDING') {
      throw new Error(`Cannot accept request in status ${request.status}. Only PENDING requests can be accepted.`);
    }

    const listing = this.listings.find((l) => l.id === request.listingId);
    if (!listing) throw new Error('Listing not found');

    if (listing.status === 'EXPIRED' || listing.status === 'REMOVED') {
      throw new Error(`Cannot accept request for a ${listing.status.toLowerCase()} listing.`);
    }

    // ATOMIC RESERVATION CHECK
    if (request.requestedQuantity > listing.quantityAvailable) {
      throw new Error(
        `Insufficient available food! Requested: ${request.requestedQuantity} ${request.quantityUnit}, but only ${listing.quantityAvailable} remains available.`
      );
    }

    // Atomic decrement
    listing.quantityAvailable -= request.requestedQuantity;
    if (listing.quantityAvailable === 0) {
      listing.status = 'RESERVED';
    }

    const nowIso = new Date().toISOString();
    request.status = 'ACCEPTED';
    request.acceptedAt = nowIso;
    request.updatedAt = nowIso;
    listing.updatedAt = nowIso;

    this.recordEvent({
      listingId: listing.id,
      requestId: request.id,
      actorId: donorActor.id,
      actorName: `${donorActor.fullName} (${listing.donorName})`,
      eventType: 'REQUEST_ACCEPTED',
      description: `Accepted request for ${request.requestedQuantity} ${request.quantityUnit}. Reserved inventory updated. Remaining: ${listing.quantityAvailable} ${listing.quantityUnit}.`,
      metadata: {
        reserved: request.requestedQuantity,
        remaining: listing.quantityAvailable,
      },
    });

    this.persist();
    return { request, listing };
  }

  // 6. Reject Request
  public rejectRequest(requestId: string, donorActor: Profile, reason?: string): DonationRequest {
    const request = this.requests.find((r) => r.id === requestId);
    if (!request) throw new Error('Request not found');

    if (request.status !== 'PENDING') {
      throw new Error(`Cannot reject request in status ${request.status}.`);
    }

    const nowIso = new Date().toISOString();
    request.status = 'REJECTED';
    request.updatedAt = nowIso;

    this.recordEvent({
      listingId: request.listingId,
      requestId: request.id,
      actorId: donorActor.id,
      actorName: donorActor.fullName,
      eventType: 'REQUEST_REJECTED',
      description: `Rejected request from ${request.recipientName}.${reason ? ` Reason: ${reason}` : ''}`,
      metadata: { reason },
    });

    this.persist();
    return request;
  }

  // 7. Mark Ready for Pickup (Donor)
  public markReadyForPickup(requestId: string, donorActor: Profile): DonationRequest {
    const request = this.requests.find((r) => r.id === requestId);
    if (!request) throw new Error('Request not found');

    if (request.status !== 'ACCEPTED') {
      throw new Error(`Only ACCEPTED requests can be marked ready for pickup (current status: ${request.status}).`);
    }

    const nowIso = new Date().toISOString();
    request.status = 'READY_FOR_PICKUP';
    request.readyAt = nowIso;
    request.updatedAt = nowIso;

    this.recordEvent({
      listingId: request.listingId,
      requestId: request.id,
      actorId: donorActor.id,
      actorName: donorActor.fullName,
      eventType: 'MARKED_READY',
      description: `Food packaging verified & staged for pickup: ${request.requestedQuantity} ${request.quantityUnit} of ${request.listingTitle}.`,
    });

    this.persist();
    return request;
  }

  // 8. Confirm Collection (Recipient)
  public confirmCollection(
    requestId: string,
    recipientActor: Profile,
    collectorName: string,
    collectorNotes?: string
  ): { request: DonationRequest; listing: FoodListing } {
    const request = this.requests.find((r) => r.id === requestId);
    if (!request) throw new Error('Request not found');

    if (request.status !== 'ACCEPTED' && request.status !== 'READY_FOR_PICKUP') {
      throw new Error(`Cannot confirm collection for request in status ${request.status}. Must be ACCEPTED or READY_FOR_PICKUP.`);
    }

    const listing = this.listings.find((l) => l.id === request.listingId);
    if (!listing) throw new Error('Listing not found');

    const nowIso = new Date().toISOString();
    request.status = 'COMPLETED';
    request.completedAt = nowIso;
    request.updatedAt = nowIso;
    request.collectorName = collectorName;
    request.collectorNotes = collectorNotes;

    // Check if listing is fully completed (no available food left and all accepted requests completed)
    const otherActiveRequests = this.requests.filter(
      (r) =>
        r.listingId === listing.id &&
        r.id !== request.id &&
        (r.status === 'ACCEPTED' || r.status === 'READY_FOR_PICKUP' || r.status === 'PENDING')
    );

    if (listing.quantityAvailable === 0 && otherActiveRequests.length === 0) {
      listing.status = 'COMPLETED';
      listing.updatedAt = nowIso;
    }

    this.recordEvent({
      listingId: listing.id,
      requestId: request.id,
      actorId: recipientActor.id,
      actorName: `${recipientActor.fullName} (${request.recipientName})`,
      eventType: 'COLLECTION_CONFIRMED',
      description: `Collection confirmed by ${collectorName}: ${request.requestedQuantity} ${request.quantityUnit} received successfully.`,
      metadata: { collectorName, collectorNotes },
    });

    this.persist();
    return { request, listing };
  }

  // 9. Cancel Request (Supports atomic restoration of reserved food if previously ACCEPTED or READY)
  public cancelRequest(
    requestId: string,
    actorProfile: Profile,
    cancelReason?: string
  ): { request: DonationRequest; restoredQuantity: number } {
    const request = this.requests.find((r) => r.id === requestId);
    if (!request) throw new Error('Request not found');

    if (request.status === 'COMPLETED') {
      throw new Error('Cannot cancel an already completed pickup.');
    }

    if (request.status === 'CANCELLED') {
      throw new Error('Request is already cancelled.');
    }

    let restoredQuantity = 0;
    const wasReserved = request.status === 'ACCEPTED' || request.status === 'READY_FOR_PICKUP';

    if (wasReserved) {
      const listing = this.listings.find((l) => l.id === request.listingId);
      if (listing) {
        // Restore quantity exactly once
        listing.quantityAvailable += request.requestedQuantity;
        if (listing.status === 'RESERVED' && listing.quantityAvailable > 0) {
          listing.status = 'AVAILABLE';
        }
        listing.updatedAt = new Date().toISOString();
        restoredQuantity = request.requestedQuantity;
      }
    }

    const nowIso = new Date().toISOString();
    request.status = 'CANCELLED';
    request.cancelledAt = nowIso;
    request.updatedAt = nowIso;

    this.recordEvent({
      listingId: request.listingId,
      requestId: request.id,
      actorId: actorProfile.id,
      actorName: actorProfile.fullName,
      eventType: 'REQUEST_CANCELLED',
      description: `Request cancelled.${restoredQuantity > 0 ? ` Restored ${restoredQuantity} ${request.quantityUnit} back to available inventory.` : ''}${cancelReason ? ` Reason: ${cancelReason}` : ''}`,
      metadata: { restoredQuantity, cancelReason },
    });

    this.persist();
    return { request, restoredQuantity };
  }

  // 10. File Report
  public fileReport(
    reporter: Profile,
    listingId: string,
    reason: ReportReason,
    description: string
  ): ListingReport {
    const listing = this.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error('Listing not found');

    const id = 'rep_' + Math.random().toString(36).substring(2, 9);
    const nowIso = new Date().toISOString();

    const report: ListingReport = {
      id,
      reporterId: reporter.id,
      reporterName: reporter.fullName,
      listingId: listing.id,
      listingTitle: listing.title,
      reason,
      description,
      status: 'OPEN',
      createdAt: nowIso,
    };

    this.reports.unshift(report);

    this.recordEvent({
      listingId: listing.id,
      actorId: reporter.id,
      actorName: reporter.fullName,
      eventType: 'REPORT_FILED',
      description: `Report filed for "${listing.title}": ${reason}.`,
      metadata: { reason, description },
    });

    this.persist();
    return report;
  }

  // 11. Resolve Report (Admin)
  public resolveReport(
    reportId: string,
    adminProfile: Profile,
    status: 'UNDER_REVIEW' | 'RESOLVED',
    resolutionNotes: string
  ): ListingReport {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) throw new Error('Report not found');

    report.status = status;
    report.reviewedBy = `${adminProfile.fullName} (Admin)`;
    report.reviewedAt = new Date().toISOString();
    report.resolutionNotes = resolutionNotes;

    this.recordEvent({
      listingId: report.listingId,
      actorId: adminProfile.id,
      actorName: adminProfile.fullName,
      eventType: 'REPORT_RESOLVED',
      description: `Admin marked report ${status}: "${resolutionNotes}"`,
      metadata: { reportId, status, resolutionNotes },
    });

    this.persist();
    return report;
  }

  // 12. Verify Organization (Admin)
  public verifyOrganization(
    orgId: string,
    adminProfile: Profile,
    status: 'APPROVED' | 'REJECTED',
    notes: string
  ): Organization {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) throw new Error('Organization not found');

    org.verificationStatus = status === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
    org.updatedAt = new Date().toISOString();

    // Update pending verification request if present
    const req = this.verificationRequests.find((v) => v.organizationId === orgId);
    if (req) {
      req.status = status;
      req.reviewedBy = `${adminProfile.fullName} (Admin)`;
      req.reviewedAt = new Date().toISOString();
      req.notes = notes;
    }

    this.recordEvent({
      listingId: 'system',
      actorId: adminProfile.id,
      actorName: adminProfile.fullName,
      eventType: 'ORG_VERIFIED',
      description: `Admin ${status.toLowerCase()} verification for ${org.organizationName}. Notes: ${notes}`,
    });

    this.persist();
    return org;
  }

  // 13. Update Organization Profile
  public updateOrganization(orgId: string, updates: Partial<Organization>): Organization {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) throw new Error('Organization not found');

    Object.assign(org, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return org;
  }

  // 14. Smart Donation Matching Algorithm (Transparent, Deterministic)
  public calculateMatch(listing: FoodListing, recipientOrg?: Organization): MatchRecommendation {
    if (!recipientOrg) {
      return {
        score: 75,
        reasons: ['Surplus food available in active collection window'],
        areaMatch: false,
        dietaryMatch: true,
        quantityFit: true,
        urgencyLevel: 'MODERATE',
      };
    }

    let score = 20; // base score for active donation
    const reasons: string[] = [];

    // 1. Pickup Area Match (approximate zone matching: 35 points)
    const listingAreaClean = listing.pickupArea.toLowerCase();
    const recipientAreaClean = (recipientOrg.serviceArea || recipientOrg.city).toLowerCase();

    const areaMatch =
      recipientAreaClean.includes(listingAreaClean) ||
      listingAreaClean.includes('jubilee') && recipientAreaClean.includes('banjara') ||
      listingAreaClean.includes('banjara') && recipientAreaClean.includes('jubilee') ||
      listingAreaClean.includes('madhapur') && recipientAreaClean.includes('gachibowli') ||
      listingAreaClean.includes('gachibowli') && recipientAreaClean.includes('madhapur');

    if (areaMatch) {
      score += 35;
      reasons.push(`Pickup area (${listing.pickupArea}) is within your direct delivery corridor`);
    } else {
      reasons.push(`Located in ${listing.pickupArea} (${recipientOrg.city} transit area)`);
    }

    // 2. Dietary Compatibility (25 points)
    const orgDietary = recipientOrg.preferredDietary || ['VEGETARIAN'];
    const dietaryMatch =
      orgDietary.includes(listing.dietaryType) ||
      (listing.dietaryType === 'VEGAN' && orgDietary.includes('VEGETARIAN'));

    if (dietaryMatch) {
      score += 25;
      reasons.push(`Dietary classification (${listing.dietaryType.replace('_', ' ')}) matches recipient preferences`);
    } else {
      score += 10;
      reasons.push(`Contains ${listing.dietaryType.replace('_', ' ')} food`);
    }

    // 3. Quantity Compatibility (15 points)
    const orgCapacity = recipientOrg.typicalCapacityPortions || 100;
    const quantityFit = listing.quantityAvailable <= orgCapacity * 1.5;

    if (quantityFit) {
      score += 15;
      reasons.push(
        `Available volume (${listing.quantityAvailable} ${listing.quantityUnit}) fits distribution capacity`
      );
    } else {
      reasons.push(`High batch volume (${listing.quantityAvailable} ${listing.quantityUnit}) - partial requests welcome`);
    }

    // 4. Pickup Deadline Urgency (5-10 points)
    const msLeft = new Date(listing.pickupDeadline).getTime() - Date.now();
    const hoursLeft = msLeft / (1000 * 3600);

    let urgencyLevel: 'URGENT' | 'MODERATE' | 'FLEXIBLE' = 'FLEXIBLE';
    if (hoursLeft <= 2) {
      urgencyLevel = 'URGENT';
      score += 10;
      reasons.push(`High rescue urgency: pickup closes in less than 2 hours`);
    } else if (hoursLeft <= 6) {
      urgencyLevel = 'MODERATE';
      score += 8;
      reasons.push(`Collection window open for next ${Math.round(hoursLeft)} hours`);
    } else {
      score += 5;
      reasons.push(`Flexible collection window (${Math.round(hoursLeft)}h remaining)`);
    }

    const finalScore = Math.min(Math.max(score, 45), 98);

    return {
      score: finalScore,
      reasons,
      areaMatch,
      dietaryMatch,
      quantityFit,
      urgencyLevel,
    };
  }

  // Event recording
  private recordEvent(eventData: Omit<DonationEvent, 'id' | 'createdAt'>) {
    const event: DonationEvent = {
      ...eventData,
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.events.unshift(event);
  }
}

export const store = new Store();
