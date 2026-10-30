import React from 'react';
import {
  CheckCircle,
  Clock,
  PackageCheck,
  XCircle,
  Ban,
  AlertCircle
} from 'lucide-react';
import { ListingStatus, RequestStatus, VerificationStatus } from '../types';

interface StatusBadgeProps {
  status: ListingStatus | RequestStatus | VerificationStatus | string;
  type?: 'listing' | 'request' | 'verification';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'AVAILABLE':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Available
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
          <Clock className="w-3 h-3 text-amber-600" />
          Pending
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
          <CheckCircle className="w-3 h-3 text-blue-600" />
          Accepted (Reserved)
        </span>
      );
    case 'READY_FOR_PICKUP':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
          <PackageCheck className="w-3 h-3 text-indigo-600" />
          Ready for Pickup
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded">
          <CheckCircle className="w-3 h-3 text-emerald-700" />
          Completed
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded">
          <XCircle className="w-3 h-3 text-rose-600" />
          Rejected
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded">
          <Ban className="w-3 h-3 text-slate-500" />
          Cancelled
        </span>
      );
    case 'RESERVED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded">
          <Clock className="w-3 h-3 text-sky-600" />
          Fully Reserved
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded">
          <AlertCircle className="w-3 h-3 text-zinc-500" />
          Expired
        </span>
      );
    case 'REMOVED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-900 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded">
          <XCircle className="w-3 h-3 text-rose-700" />
          Removed by Moderation
        </span>
      );
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Verified
        </span>
      );
    default:
      return (
        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {status}
        </span>
      );
  }
};
