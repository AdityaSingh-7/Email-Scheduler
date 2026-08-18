import React from 'react';
import { EmailRecord } from '../types';
import { format } from 'date-fns';
import { Clock, Ban, Loader2, Calendar } from 'lucide-react';

interface ScheduledTableProps {
  emails: EmailRecord[];
  loading: boolean;
  onCancel: (id: string) => Promise<void>;
}

export const ScheduledTable: React.FC<ScheduledTableProps> = ({ emails, loading, onCancel }) => {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Sending...
          </span>
        );
      case 'RATE_LIMITED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
            <Clock className="w-3 h-3 mr-1" />
            Throttled (Next Hour)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600">Loading scheduled emails queue...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">No Scheduled Emails</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
          Your scheduled email queue is currently empty. Click "Compose New Email" above to queue up a new outreach campaign.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Recipient Lead</th>
              <th className="py-3.5 px-5">Subject Line</th>
              <th className="py-3.5 px-5">Scheduled Send Time</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {emails.map((email) => (
              <tr key={email.id} className="hover:bg-indigo-50/30 transition-colors">
                
                {/* Recipient */}
                <td className="py-3.5 px-5 font-semibold text-gray-900">
                  {email.recipient}
                </td>

                {/* Subject */}
                <td className="py-3.5 px-5 font-medium text-gray-800 max-w-xs truncate">
                  {email.subject}
                </td>

                {/* Scheduled Time */}
                <td className="py-3.5 px-5 text-gray-600 font-mono">
                  {format(new Date(email.scheduledFor), 'MMM d, yyyy · hh:mm a')}
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-5">
                  {getStatusBadge(email.status)}
                </td>

                {/* Cancel Action */}
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => onCancel(email.id)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                    title="Cancel Email"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
