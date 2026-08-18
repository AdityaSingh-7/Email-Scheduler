import React, { useState, ChangeEvent } from 'react';
import { SchedulePayload } from '../types';
import { X, Upload, Send, Users, Clock, Zap, AlertCircle } from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (payload: SchedulePayload) => Promise<void>;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSchedule }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientsInput, setRecipientsInput] = useState('');
  const [recipientsList, setRecipientsList] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState('');
  const [delayBetween, setDelayBetween] = useState(2000);
  const [hourlyLimit, setHourlyLimit] = useState(200);
  const [senderEmail, setSenderEmail] = useState('reachinbox-demo@ethereal.email');
  
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Helper to extract valid email addresses from text / CSV string
  const parseEmailsFromText = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    // Deduplicate emails
    return Array.from(new Set(matches.map((e) => e.toLowerCase())));
  };

  // Handle direct text typing in lead textarea
  const handleRecipientsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRecipientsInput(text);
    const parsed = parseEmailsFromText(text);
    setRecipientsList(parsed);
  };

  // Handle File Upload (.csv or .txt)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseEmailsFromText(content);
        setRecipientsList(parsed);
        setRecipientsInput(parsed.join('\n'));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (recipientsList.length === 0) {
      setError('Please enter or upload at least one valid recipient email address.');
      return;
    }

    if (!subject.trim()) {
      setError('Subject line is required.');
      return;
    }

    if (!body.trim()) {
      setError('Email body is required.');
      return;
    }

    try {
      setLoading(true);
      await onSchedule({
        recipients: recipientsList,
        subject,
        body,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : new Date().toISOString(),
        delayBetween,
        hourlyLimit,
        senderEmail,
      });

      // Reset Form and Close Modal
      setSubject('');
      setBody('');
      setRecipientsInput('');
      setRecipientsList([]);
      setFileName('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to schedule emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Send className="w-5 h-5" />
            <h2 className="text-lg font-bold">Compose New Outreach Campaign</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Lead Email Input & File Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Recipient Lead List</span>
              </label>

              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {recipientsList.length} Lead{recipientsList.length !== 1 ? 's' : ''} Detected
              </span>
            </div>

            <textarea
              rows={3}
              placeholder="Paste email addresses here (separated by comma, space, or newline)..."
              value={recipientsInput}
              onChange={handleRecipientsChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400 font-mono"
            />

            {/* CSV File Uploader */}
            <div className="mt-2 flex items-center space-x-3">
              <label className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg cursor-pointer transition-colors border border-gray-200">
                <Upload className="w-3.5 h-3.5 text-gray-500" />
                <span>Upload Leads CSV/TXT</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {fileName && <span className="text-xs text-gray-500 font-medium">Uploaded: {fileName}</span>}
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Subject Line
            </label>
            <input
              type="text"
              placeholder="e.g. Quick question regarding your cold outreach workflow"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Body
            </label>
            <textarea
              rows={4}
              placeholder="Write your email body text..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            />
          </div>

          {/* Settings Grid: Start Time, Delay, Hourly Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            
            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Schedule Start</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400">Leave blank for immediate</span>
            </div>

            {/* Minimum Delay */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Delay (ms)</span>
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={delayBetween}
                onChange={(e) => setDelayBetween(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400">Delay between emails</span>
            </div>

            {/* Hourly Rate Limit */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hourly Limit</span>
              </label>
              <input
                type="number"
                min="1"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(parseInt(e.target.value, 10) || 200)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400">Max emails per hour</span>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Scheduling...' : 'Schedule Campaign'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
