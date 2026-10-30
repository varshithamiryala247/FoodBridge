/**
 * FoodBridge Core Type Definitions
 * Complete Food Donation & Rescue Platform
 */

export type UserRole = 'DONOR' | 'RECIPIENT' | 'ADMIN';

export type OrganizationType =
  | 'RESTAURANT'
  | 'HOTEL'
  | 'BAKERY'
  | 'CATERER'
  | 'GROCERY'
  | 'COMMUNITY_KITCHEN'
  | 'NGO'
  | 'SHELTER'
  | 'CHARITY'
  | 'COMMUNITY_ORG';

export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export type FoodCategory =
  | 'COOKED_MEALS'
  | 'BAKERY_BREAD'
  | 'PRODUCE_VEGGIES'
  | 'PACKAGED_GOODS'
  | 'DAIRY_GRAINS'
  | 'BEVERAGES';

export type DietaryType = 'VEGETARIAN' | 'NON_VEGETARIAN' | 'VEGAN' | 'HALAL';

export type QuantityUnit = 'portions' | 'packets' | 'boxes' | 'kg' | 'trays';

export type ListingStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REMOVED';

export type RequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type ReportReason =
  | 'Suspicious listing'
  | 'Inaccurate information'
  | 'Unsafe handling concerns'
  | 'Inappropriate content'
  | 'Other';

export type ReportStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  ownerId: string;
  organizationName: string;
  organizationType: OrganizationType;
  description: string;
  city: string;
  serviceArea: string;
  demoAddress: string;
  verificationStatus: VerificationStatus;
  preferredDietary?: DietaryType[];
  typicalCapacityPortions?: number;
  contactPerson?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodListing {
  id: string;
  donorOrganizationId: string;
  donorName: string;
  donorType: OrganizationType;
  title: string;
  description: string;
  category: FoodCategory;
  dietaryType: DietaryType;
  quantityTotal: number;
  quantityAvailable: number;
  quantityUnit: QuantityUnit;
  preparationTime: string;
  listingTime: string;
  useByTime: string;
  storageInstructions: string;
  allergenInformation: string;
  pickupAddress: string;
  pickupArea: string;
  pickupStart: string;
  pickupDeadline: string;
  imageUrl: string;
  status: ListingStatus;
  additionalInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImageUrl?: string;
  donorOrganizationId: string;
  donorName: string;
  recipientOrganizationId: string;
  recipientName: string;
  recipientContact?: string;
  requestedQuantity: number;
  quantityUnit: QuantityUnit;
  recipientNotes: string;
  pickupAddress: string;
  pickupDeadline: string;
  status: RequestStatus;
  requestedAt: string;
  acceptedAt?: string;
  readyAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  updatedAt: string;
  collectorName?: string;
  collectorNotes?: string;
}

export interface DonationEvent {
  id: string;
  listingId: string;
  requestId?: string;
  actorId: string;
  actorName: string;
  eventType:
    | 'LISTING_CREATED'
    | 'LISTING_MODIFIED'
    | 'REQUEST_SUBMITTED'
    | 'REQUEST_ACCEPTED'
    | 'REQUEST_REJECTED'
    | 'MARKED_READY'
    | 'COLLECTION_CONFIRMED'
    | 'REQUEST_CANCELLED'
    | 'LISTING_REMOVED'
    | 'REPORT_FILED'
    | 'REPORT_RESOLVED'
    | 'ORG_VERIFIED';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ListingReport {
  id: string;
  reporterId: string;
  reporterName: string;
  listingId: string;
  listingTitle: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface OrganizationVerificationRequest {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface MatchRecommendation {
  score: number; // 0 - 100
  reasons: string[];
  areaMatch: boolean;
  dietaryMatch: boolean;
  quantityFit: boolean;
  urgencyLevel: 'URGENT' | 'MODERATE' | 'FLEXIBLE';
}
