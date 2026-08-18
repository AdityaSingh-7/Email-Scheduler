import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { StatCards } from '../components/StatCards';
import { ScheduledTable } from '../components/ScheduledTable';
import { SentTable } from '../components/SentTable';
import { ComposeModal } from '../components/ComposeModal';
import { EmailRecord, DashboardStats, SchedulePayload } from '../types';
import { emailAPI } from '../services/api';
import { Plus, RefreshCw, Clock, Send, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [scheduledEmails, setScheduledEmails] = useState<EmailRecord[]>([]);
  const [sentEmails, setSentEmails] = useState<EmailRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmails: 0,
    totalScheduled: 0,
    totalSent: 0,
    totalFailed: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [scheduledRes, sentRes, statsRes] = await Promise.all([
        emailAPI.getScheduledEmails(),
        emailAPI.getSentEmails(),
        emailAPI.getDashboardStats(),
      ]);

      if (scheduledRes.success) setScheduledEmails(scheduledRes.data);
      if (sentRes.success) setSentEmails(sentRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh tables every 4 seconds to show live status updates
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleScheduleSubmit = async (payload: SchedulePayload) => {
    await emailAPI.scheduleEmails(payload);
    fetchDashboardData();
  };

  const handleCancelEmail = async (id: string) => {
    await emailAPI.cancelScheduledEmail(id);
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Top Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner / Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
              <span>Email Outreach Scheduler</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage and schedule your email outreach campaigns effortlessly
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardData}
              className="p-2.5 bg-white hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsComposeOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Compose New Email</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <StatCards stats={stats} />

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-gray-200 mb-6">
          <div className="flex space-x-6">
            
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-2 ${
                activeTab === 'scheduled'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Scheduled Emails</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700">
                {scheduledEmails.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sent')}
              className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-2 ${
                activeTab === 'sent'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Sent Emails Log</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700">
                {sentEmails.length}
              </span>
            </button>

          </div>

          <div className="text-[11px] text-gray-400 hidden sm:flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live status updates</span>
          </div>
        </div>

        {/* Active Tab Content */}
        {activeTab === 'scheduled' ? (
          <ScheduledTable
            emails={scheduledEmails}
            loading={loading && scheduledEmails.length === 0}
            onCancel={handleCancelEmail}
          />
        ) : (
          <SentTable
            emails={sentEmails}
            loading={loading && sentEmails.length === 0}
          />
        )}

      </main>

      {/* Compose Campaign Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSchedule={handleScheduleSubmit}
      />

    </div>
  );
};
