import React from 'react';
import { EmailRecord } from '../types';
import { format } from 'date-fns';
import { CheckCircle2, AlertCircle, ExternalLink, Loader2, MailCheck } from 'lucide-react';

interface SentTableProps {
  emails: EmailRecord[];
  loading: boolean;
}

export const SentTable: React.FC<SentTableProps> = ({ emails, loading }) => {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Sent
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
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
        <p className="text-sm font-medium text-gray-600">Loading sent email logs...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">No Sent Emails Yet</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
          Emails that have been dispatched by the BullMQ worker will appear here along with their Ethereal Fake SMTP test preview links.
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
              <th className="py-3.5 px-5">Sent Timestamp</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Ethereal SMTP Preview</th>
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

                {/* Sent Timestamp */}
                <td className="py-3.5 px-5 text-gray-600 font-mono">
                  {email.sentAt ? format(new Date(email.sentAt), 'MMM d, yyyy · hh:mm:ss a') : '—'}
                </td>

                {/* Status */}
                <td className="py-3.5 px-5">
                  {getStatusBadge(email.status)}
                </td>

                {/* Ethereal Preview Link */}
                <td className="py-3.5 px-5 text-right">
                  {email.etherealPreviewUrl ? (
                    <a
                      href={email.etherealPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors border border-indigo-100"
                    >
                      <span>Preview Email</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
