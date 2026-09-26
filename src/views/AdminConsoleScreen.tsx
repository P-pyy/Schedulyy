import React, { useState, useEffect } from 'react';
import { AdminTab, ModerationTicket, ManagedUser } from '../types';
import { ADMIN_KYC_REQUESTS } from '../data/mockData';
import {
  approveKycRpc,
  resolveModerationTicketRpc,
  banUserRpc,
  updatePlatformSettingsRpc,
  getPlatformSettings
} from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';

interface AdminConsoleScreenProps {
  adminTab: AdminTab;
  onNavigateTab: (tab: AdminTab) => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const AdminConsoleScreen: React.FC<AdminConsoleScreenProps> = ({
  adminTab,
  onNavigateTab,
  onTriggerToast
}) => {
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // KYC Verification Queue state
  const [kycList, setKycList] = useState(ADMIN_KYC_REQUESTS);
  const [selectedInspection, setSelectedInspection] = useState<any | null>(null);

  // Trust & Safety Moderation Queue State
  const [activeReportFilter, setActiveReportFilter] = useState<'all' | 'high' | 'review' | 'resolved'>('all');
  const [moderationTickets, setModerationTickets] = useState<ModerationTicket[]>([
    {
      id: '#REP-1048',
      category: 'high',
      priorityLabel: 'HIGH PRIORITY',
      priorityIcon: 'flag',
      statusBadge: 'Open',
      title: 'Reported Review / Hate Speech',
      titleIcon: 'gavel',
      target: 'Northside Barber Co.',
      subtitleExtra: 'by Mark R.',
      bookingRef: false,
      reporter: 'Reported by Julian Cruz (Owner)',
      reporterIcon: 'person',
      timeAgo: '24m ago',
      quote: 'Client left defamatory unverified claim regarding staff conduct and cleanliness with targeted harassment...',
      actionMessage: '',
      isResolved: false
    },
    {
      id: '#REP-1049',
      category: 'high',
      priorityLabel: 'HIGH PRIORITY',
      priorityIcon: 'flag',
      statusBadge: 'Open',
      title: 'Suspected Coordinated Bot Review Campaign',
      titleIcon: 'gavel',
      target: 'Bella Lashes Manila',
      subtitleExtra: 'by @guest_9402',
      bookingRef: false,
      reporter: 'Automated Fraud Sentinel',
      reporterIcon: 'smart_toy',
      timeAgo: '35m ago',
      quote: 'Sudden spike of 1-star ratings originating from duplicate IP range within 15 minutes.',
      actionMessage: '',
      isResolved: false
    },
    {
      id: '#REP-1045',
      category: 'review',
      priorityLabel: 'MEDIUM PRIORITY',
      priorityIcon: 'pending_actions',
      statusBadge: 'In Review',
      title: 'No-Show Fee Dispute',
      titleIcon: 'payments',
      target: '#SC-8492',
      subtitleExtra: 'Glow Nail Studio',
      bookingRef: true,
      disputedPenalty: '₱500.00',
      reporter: 'Customer Testimony',
      reporterIcon: 'chat',
      timeAgo: '1h 10m ago',
      quote: 'Salon cancelled last minute due to brownout, yet charged fee to my saved GCash wallet without warning.',
      actionMessage: '',
      isResolved: false
    },
    {
      id: '#REP-1046',
      category: 'review',
      priorityLabel: 'MEDIUM PRIORITY',
      priorityIcon: 'pending_actions',
      statusBadge: 'In Review',
      title: 'Double Deduction on Maya Wallet Checkout',
      titleIcon: 'payments',
      target: '#SC-8471',
      subtitleExtra: 'Aura Spa & Wellness',
      bookingRef: true,
      disputedPenalty: '₱1,200.00',
      reporter: 'Customer Testimony',
      reporterIcon: 'chat',
      timeAgo: '2h 15m ago',
      quote: 'Payment timed out on salon terminal but SMS confirmation shows double charge from digital wallet.',
      actionMessage: '',
      isResolved: false
    },
    {
      id: '#REP-1041',
      category: 'resolved',
      priorityLabel: 'RESOLVED',
      priorityIcon: 'check_circle',
      statusBadge: 'Archived',
      title: 'Duplicate Business Listing',
      titleIcon: 'content_copy',
      target: 'Studio Bloom QC (Unofficial)',
      actionResolution: 'De-listed and merged into verified main branch with catalog retention.',
      isResolved: true
    },
    {
      id: '#REP-1040',
      category: 'resolved',
      priorityLabel: 'RESOLVED',
      priorityIcon: 'check_circle',
      statusBadge: 'Archived',
      title: 'Unlicensed Practitioner Photo Notice',
      titleIcon: 'badge',
      target: 'Zen Touch Spa',
      actionResolution: 'Provider uploaded renewed PRC cosmetology certification credentials.',
      isResolved: true
    },
    {
      id: '#REP-1039',
      category: 'resolved',
      priorityLabel: 'RESOLVED',
      priorityIcon: 'check_circle',
      statusBadge: 'Archived',
      title: 'Off-Platform Payment Solicitation',
      titleIcon: 'warning',
      target: 'Metro Glow Lounge',
      actionResolution: 'Merchant warned; direct booking deposit compliance re-established.',
      isResolved: true
    },
    {
      id: '#REP-1038',
      category: 'resolved',
      priorityLabel: 'RESOLVED',
      priorityIcon: 'check_circle',
      statusBadge: 'Archived',
      title: 'Disputed Cancellation Penalty',
      titleIcon: 'price_check',
      target: 'Studio Bloom',
      actionResolution: 'Refunded ₱350 fee following typhoon cancellation waiver protocol.',
      isResolved: true
    },
    {
      id: '#REP-1037',
      category: 'resolved',
      priorityLabel: 'RESOLVED',
      priorityIcon: 'check_circle',
      statusBadge: 'Archived',
      title: 'Incorrect Storefront GPS Coordinates',
      titleIcon: 'pin_drop',
      target: 'The Gentleman Cut BGC',
      actionResolution: 'Location geofence pinned to High Street 5th floor entrance.',
      isResolved: true
    },
    {
      id: '#REP-1036',
      category: 'resolved',
      priorityLabel: 'RESOLVED',
      priorityIcon: 'check_circle',
      statusBadge: 'Archived',
      title: 'Defamatory Stylist Comment',
      titleIcon: 'gavel',
      target: 'Northside Barber Co.',
      actionResolution: 'Offensive language redacted pursuant to community guidelines.',
      isResolved: true
    },
    {
      id: '#REP-1035',
      category: 'resolved',
      priorityLabel: 'RESOLVED',
      priorityIcon: 'check_circle',
      statusBadge: 'Archived',
      title: 'Expired Sanitary Inspection Tag',
      titleIcon: 'health_and_safety',
      target: 'Pure Nails Makati',
      actionResolution: '2026 City Health Department clearance validated and filed.',
      isResolved: true
    },
    {
      id: '#REP-1034',
      category: 'resolved',
      priorityLabel: 'RESOLVED',
      priorityIcon: 'check_circle',
      statusBadge: 'Archived',
      title: 'Fake Appointment Slot Holding',
      titleIcon: 'event_busy',
      target: 'Aura Spa QC',
      actionResolution: 'Unverified test account blocked and 4 calendar slots reopened.',
      isResolved: true
    }
  ]);

  const handleResolveTicket = async (ticketId: string, actionText: string, toastText: string) => {
    setModerationTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              actionMessage: actionText,
              isResolved: true,
              statusBadge: 'Resolved',
              category: 'resolved',
              actionResolution: `${actionText} by Platform Admin`
            }
          : t
      )
    );

    if (isSupabaseConfigured) {
      try {
        await resolveModerationTicketRpc(ticketId, 'resolved', actionText, actionText);
      } catch (err) {
        console.warn('Failed to resolve moderation ticket in Supabase:', err);
      }
    }

    onTriggerToast(toastText, 'verified');
  };

  const filteredTickets = moderationTickets.filter(ticket => {
    if (activeReportFilter === 'all') return true;
    return ticket.category === activeReportFilter;
  });

  // User Management State (Tab 3: Users)
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'client' | 'owner' | 'admin'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSortBy, setUserSortBy] = useState<'active' | 'spent' | 'joined' | 'name'>('active');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [banningUserId, setBanningUserId] = useState<string | null>(null);
  const [activeUserLog, setActiveUserLog] = useState<ManagedUser | null>(null);
  const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);
  const [reviewingFlaggedUser, setReviewingFlaggedUser] = useState<ManagedUser | null>(null);

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([
    {
      id: 'USR-1082',
      name: 'Alex Santos',
      email: 'alex.santos@gmail.com',
      role: 'client',
      roleBadge: 'Client',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAhsP_CgpwwfWqjcmbOrWYPsuL8tqCbSgb_a_SN0wqwyrPpO_UXZYI1Qn4a8qrfL8GknQ7EppPAX0FTi9cUn6Kt-gYW7vhNkJBuUOqYK4t9h-7aLvcL46nJRGVul2dxwSf-4TPNgSbO1n597PHUbGtjWPLInwomHPbbgtqsDy6dSRjR8HjkqPZ1-17iveAzAN0V87kPl-qdXWfdFAOb1SwrlYsLuFa4ZWSaBxnVtBbqihslfGcxGGwn2A',
      avatarBadgeIcon: 'check',
      avatarBadgeBg: 'bg-[#00702f]',
      verified: true,
      joinedDate: 'Joined Oct 2025',
      searchTerms: 'alex santos alex.santos@gmail.com client',
      metric1Label: 'Completed Bookings',
      metric1Value: '14 sessions',
      metric1Icon: 'event_available',
      metric2Label: 'Lifetime Spent',
      metric2Value: '₱7,850',
      metric2Icon: 'payments'
    },
    {
      id: 'USR-2041',
      name: 'Jamie Lim',
      email: 'jamie@studiobloom.ph',
      role: 'owner',
      roleBadge: 'Business Owner',
      subBadge: 'PRO',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBFi0771SBiC7BhF0xn65Z2R-8dGmT2cFuWpEzJplxuKFRVz6IgFyERCX95bbrUtKmfXYgfS7t3YMnOGXd_aZV0yPvNSaeUgaPRzWNjJvbSJDKzV0AS7ehHmz5V7UnsNEUIBJeJtf66Wy98MyCYOZ7iclLMa_TbR_A4WEc-XdWPOze3M8iN8PCCOC-D0c0j3pO0qjZmQr-e5LdhJA_2EcwUR2so6QscrWUEsxKZ6eBWKmmPcKt1PcWMhQ',
      avatarBadgeIcon: 'storefront',
      avatarBadgeBg: 'bg-[#4f46e5]',
      verified: true,
      joinedDate: 'Joined Jan 2025',
      searchTerms: 'jamie lim jamie@studiobloom.ph studio bloom bgc owner business',
      businessName: 'Studio Bloom BGC',
      businessIcon: 'spa',
      businessMeta: '4 Stylists',
      businessPipeline: '38 this week'
    },
    {
      id: 'USR-2099',
      name: 'Julian Cruz',
      email: 'julian@northsidebarber.co',
      role: 'owner',
      roleBadge: 'Business Owner',
      initials: 'JC',
      avatarBadgeIcon: 'storefront',
      avatarBadgeBg: 'bg-[#4f46e5]',
      verified: true,
      joinedDate: 'Joined Feb 2025',
      searchTerms: 'julian cruz julian@northsidebarber.co northside barber co owner',
      businessName: 'Northside Barber Co.',
      businessIcon: 'content_cut',
      businessMeta: 'Verified Studio'
    },
    {
      id: 'USR-1150',
      name: 'Camille David',
      email: 'camille.d@gmail.com',
      role: 'client',
      roleBadge: 'Client - VIP',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAot_IE9FRNnmqjUB3vZjxaD8VRjocWGqqrEkMpVnP4woj_3MV_YZ3FkoFpWNQr-KqfxrNLY8DdQRYqYntp1yIDLefghAHkCgrieLonTGLA-_NTx-HYxksQAiahQ4mkZEv6IxwPT0a-8mVuXm61_opqomdI55nuEtO_tJF8xvANgKZBxXps7VXm5_74WtTnhqTYgYB1ZnOuV7NCQ0tJlnPxP6nYkcg2lXVHRDqzoiIdBgvio-g0MXq9PA',
      avatarBadgeIcon: 'star',
      avatarBadgeBg: 'bg-[#3525cd]',
      verified: true,
      joinedDate: 'Joined Mar 2025',
      searchTerms: 'camille david camille.d@gmail.com vip client',
      metric1Label: 'Bookings Count',
      metric1Value: '8 premium',
      metric1Icon: 'event_note',
      metric2Label: 'Total Spend',
      metric2Value: '₱18,400',
      metric2Icon: 'payments'
    },
    {
      id: 'USR-9921',
      name: 'SpamAccount_921',
      email: 'bot839@tempmail.com',
      role: 'flagged',
      roleBadge: 'Flagged User',
      verified: false,
      joinedDate: 'Joined Today',
      searchTerms: 'spamaccount_921 bot839@tempmail.com flagged suspicious spam',
      fraudWarning: '12 rapid failed SMS verifications',
      fraudWarningIcon: 'sms_failed',
      fraudTag: 'Suspicious Activity',
      fraudSubtext: '0 successful bookings • IP: Manila DC-Proxy',
      isBanned: false
    },
    {
      id: 'USR-0001',
      name: 'Sophia Vance',
      email: 'sophia.vance@scheduly.internal',
      role: 'admin',
      roleBadge: 'Platform Admin',
      subBadge: 'Lead Dev',
      avatarUrl: '/images/owner_profile.jpg',
      avatarBadgeIcon: 'verified_user',
      avatarBadgeBg: 'bg-[#3525cd]',
      verified: true,
      joinedDate: 'Founder since 2024',
      searchTerms: 'sophia vance admin platform root',
      metric1Label: 'Admin Scope',
      metric1Value: 'Root Operations',
      metric1Icon: 'shield',
      metric2Label: 'Audit Log Status',
      metric2Value: 'MFA Enforced',
      metric2Icon: 'lock'
    }
  ]);

  const handleBanUser = async (userId: string, userName: string) => {
    setBanningUserId(userId);
    if (isSupabaseConfigured) {
      try {
        await banUserRpc(userId, 'Banned by platform super administrator');
      } catch (err) {
        console.warn('Failed to ban user in Supabase:', err);
      }
    }
    setTimeout(() => {
      setManagedUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, isBanned: true } : u))
      );
      setBanningUserId(null);
      onTriggerToast(`User ${userName} restricted and banned from API access 🚫`, 'block');
    }, 700);
  };

  const filteredUsers = managedUsers
    .filter(user => {
      if (userRoleFilter === 'client') {
        if (user.role !== 'client') return false;
      } else if (userRoleFilter === 'owner') {
        if (user.role !== 'owner') return false;
      } else if (userRoleFilter === 'admin') {
        if (user.role !== 'admin') return false;
      }

      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase().trim();
        const match =
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.searchTerms.toLowerCase().includes(q) ||
          user.id.toLowerCase().includes(q) ||
          (user.businessName && user.businessName.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (userSortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (userSortBy === 'spent') {
        const spendA = parseInt(a.metric2Value?.replace(/[^0-9]/g, '') || '0');
        const spendB = parseInt(b.metric2Value?.replace(/[^0-9]/g, '') || '0');
        return spendB - spendA;
      }
      if (userSortBy === 'joined') {
        return b.id.localeCompare(a.id);
      }
      return 0;
    });

  // Settings Tab State (Tab 5: Platform Settings)
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(2.5);
  const [platformFeeFixed, setPlatformFeeFixed] = useState<number>(15);
  const [tempFeePercent, setTempFeePercent] = useState<number>(2.5);
  const [tempFeeFixed, setTempFeeFixed] = useState<number>(15);
  const [autoCancelTimeout, setAutoCancelTimeout] = useState<number>(120);
  const [smsBalance, setSmsBalance] = useState<number>(14850.0);
  const [isSmsRefreshing, setIsSmsRefreshing] = useState<boolean>(false);
  const [toggleGcash, setToggleGcash] = useState<boolean>(true);
  const [toggleVip, setToggleVip] = useState<boolean>(true);
  const [toggleCommission, setToggleCommission] = useState<boolean>(true);
  const [toggleMaintenance, setToggleMaintenance] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isEditFeeModalOpen, setIsEditFeeModalOpen] = useState<boolean>(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState<boolean>(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState<boolean>(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState<boolean>(false);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'AUD-901',
      action: 'Platform Fee Adjusted',
      author: 'Sophia Vance',
      role: 'Super Admin',
      timestamp: '2 hours ago',
      details: 'Take-rate calibrated to 2.5% + ₱15 gateway fee for Q4 promotion.',
      icon: 'payments',
      badgeColor: 'text-[#3525cd] bg-[#e9edff]'
    },
    {
      id: 'AUD-902',
      action: 'Semaphore SMS Pool Reload',
      author: 'System Auto-Replenish',
      role: 'Cron Daemon',
      timestamp: '1 day ago',
      details: '+₱5,000 credit buffer topped up via Maya Enterprise Merchant Rail.',
      icon: 'sms',
      badgeColor: 'text-[#005522] bg-[#7ffc97]/20'
    },
    {
      id: 'AUD-903',
      action: 'DPA-2012 Compliance Cycle',
      author: 'Compliance Sentinel',
      role: 'Security Engine',
      timestamp: '2 days ago',
      details: 'Automatic 90-day PII log masking and token purge completed (1,420 sanitized).',
      icon: 'policy',
      badgeColor: 'text-[#005522] bg-[#7ffc97]/20'
    },
    {
      id: 'AUD-904',
      action: '2FA Policy Enforcement',
      author: 'Sophia Vance',
      role: 'Super Admin',
      timestamp: '5 days ago',
      details: 'Mandatory TOTP/SMS two-factor challenge enabled across 1,420 merchant owners.',
      icon: 'lock',
      badgeColor: 'text-[#3525cd] bg-[#e9edff]'
    },
    {
      id: 'AUD-905',
      action: 'Escrow Auto-Cancel Rule',
      author: 'DevOps Lead',
      role: 'Platform Architect',
      timestamp: '14 days ago',
      details: 'Slot release window defined to 120 minutes prior to reservation.',
      icon: 'timer',
      badgeColor: 'text-[#5a5e69] bg-[#dee2ef]'
    }
  ]);

  const handleSaveGlobalSettings = async () => {
    setSaveStatus('saving');

    if (isSupabaseConfigured) {
      try {
        await updatePlatformSettingsRpc({
          platform_fee_percent: platformFeePercent,
          platform_fee_fixed: platformFeeFixed,
          auto_cancel_timeout_minutes: autoCancelTimeout,
          sms_balance: smsBalance,
          toggle_gcash: toggleGcash,
          toggle_vip: toggleVip,
          toggle_commission: toggleCommission,
          toggle_maintenance: toggleMaintenance
        });
      } catch (err) {
        console.warn('Failed to update platform settings in Supabase:', err);
      }
    }

    setTimeout(() => {
      setSaveStatus('saved');
      onTriggerToast('Global parameters successfully synchronized across all platform nodes! ⚡', 'check_circle');

      setAuditLogs(prev => [
        {
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          action: 'Global Settings Synced',
          author: 'Sophia Vance',
          role: 'Super Admin',
          timestamp: 'Just now',
          details: `Fee: ${platformFeePercent}% + ₱${platformFeeFixed} | Timeout: ${autoCancelTimeout}m | Maint: ${toggleMaintenance ? 'ON' : 'OFF'}`,
          icon: 'save',
          badgeColor: 'text-[#3525cd] bg-[#e9edff]'
        },
        ...prev
      ]);

      setTimeout(() => {
        setSaveStatus('idle');
      }, 2200);
    }, 700);
  };

  const handleRefreshSmsGateway = () => {
    setIsSmsRefreshing(true);
    setTimeout(() => {
      setIsSmsRefreshing(false);
      onTriggerToast('Semaphore SMS Gateway re-verified: 99.8% delivery health (API responsive 18ms) 📱', 'sms');
    }, 600);
  };

  const handleApplyFeeChange = () => {
    setPlatformFeePercent(tempFeePercent);
    setPlatformFeeFixed(tempFeeFixed);
    setIsEditFeeModalOpen(false);
    onTriggerToast(`Platform fee updated to ${tempFeePercent}% + ₱${tempFeeFixed} gateway fee! 💳`, 'payments');
  };

  const handleTopUpBalance = (amt: number) => {
    setSmsBalance(prev => prev + amt);
    setIsTopUpModalOpen(false);
    onTriggerToast(`Added ₱${amt.toLocaleString()} to SMS gateway pool! New balance: ₱${(smsBalance + amt).toLocaleString()} ✉️`, 'payments');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onTriggerToast('Platform telemetry re-synchronized with live nodes (24ms) ⚡', 'refresh');
    }, 500);
  };

  const handleApprove = async (id: string, name: string) => {
    setKycList(prev => prev.map(k => k.id === id ? { ...k, status: 'Verified & Active' } : k));
    if (isSupabaseConfigured) {
      try {
        await approveKycRpc(id, 'verified');
      } catch (err) {
        console.warn('Failed to approve KYC in Supabase:', err);
      }
    }
    onTriggerToast(`Verified & Approved partner: ${name}! 🛡️`, 'verified');
    if (selectedInspection?.id === id) {
      setSelectedInspection(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setKycList(prev => prev.filter(k => k.id !== id));
    if (isSupabaseConfigured) {
      try {
        await approveKycRpc(id, 'rejected', 'Document correction requested');
      } catch (err) {
        console.warn('Failed to reject KYC in Supabase:', err);
      }
    }
    onTriggerToast(`Requested document correction for: ${name}`, 'report');
    if (selectedInspection?.id === id) {
      setSelectedInspection(null);
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-8 max-w-7xl mx-auto lg:px-6">
      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (PLATFORM PULSE) - EXACT MATCH TO PROVIDED SCREENSHOT */}
      {/* ========================================================================= */}
      {adminTab === 'overview' && (
        <div className="flex flex-col w-full px-4 lg:px-0 pt-4 pb-4 space-y-4">
          {/* Platform System Live Status Bar */}
          <div className="w-full bg-white p-2.5 rounded-xl shadow-xs flex items-center justify-between border border-[#e9edff]">
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7ffc97] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00702f]"></span>
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#141b2b] truncate">
                  Platform Health: All Systems Operational
                </p>
                <p className="text-[12px] text-[#464555] flex items-center space-x-1">
                  <span>Server Uptime 99.98%</span>
                  <span>•</span>
                  <span>Latency 24ms</span>
                </p>
              </div>
            </div>
            <span
              className="material-symbols-outlined text-[#00702f] text-[20px] shrink-0 ml-1"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
          </div>

          {/* Header Controls: Timeframe Filter & Quick Refresh */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-[18px] font-semibold text-[#141b2b] font-display">
                Platform Pulse
              </h1>
              <p className="text-[12px] text-[#464555]">Real-time multisite booking telemetry</p>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0 relative">
              <button
                onClick={() => setShowTimeframeMenu(!showTimeframeMenu)}
                className="flex items-center space-x-1 bg-[#f1f3ff] hover:bg-[#e9edff] px-2.5 py-1.5 rounded-lg text-[#141b2b] text-[12px] font-medium active:bg-[#e9edff] transition-colors shadow-xs cursor-pointer"
              >
                <span>{timeframe}</span>
                <span className="material-symbols-outlined text-[16px] text-[#464555]">
                  expand_more
                </span>
              </button>

              {showTimeframeMenu && (
                <div className="absolute right-10 top-10 z-40 bg-white rounded-xl shadow-lg border border-[#e9edff] py-1 min-w-[130px]">
                  {['Today', 'Last 7 Days', 'Last 30 Days', 'This Quarter', 'All Time'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setTimeframe(opt);
                        setShowTimeframeMenu(false);
                        onTriggerToast(`Filtered metrics for ${opt}`, 'filter_alt');
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#f1f3ff] ${
                        timeframe === opt ? 'text-[#3525cd] font-bold' : 'text-[#141b2b]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleRefresh}
                aria-label="Refresh Data"
                className="w-8 h-8 rounded-lg bg-[#f1f3ff] flex items-center justify-center text-[#464555] hover:text-[#3525cd] active:scale-95 transition-all shadow-xs cursor-pointer"
                id="refreshBtn"
              >
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform duration-500 ${
                    isRefreshing ? 'rotate-180 text-[#3525cd]' : ''
                  }`}
                >
                  refresh
                </span>
              </button>
            </div>
          </div>

          {/* Urgent Action Module: Pending Approvals Alert Card */}
          <div className="w-full bg-[#3525cd]/5 rounded-xl p-4 flex items-center justify-between shadow-xs relative overflow-hidden border border-[#3525cd]/10">
            <div className="flex items-start space-x-2.5 z-10 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-[14px] font-semibold text-[#141b2b] truncate">
                  6 Business Applications
                </p>
                <p className="text-[12px] text-[#464555]">
                  Verification queue awaiting KYC review
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onNavigateTab('businesses');
                onTriggerToast('Opened KYC Verification Queue 🛡️', 'shield');
              }}
              className="inline-flex items-center space-x-1 bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[12px] font-medium px-2.5 py-2 rounded-lg shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span>Queue</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* 2x2 Top Level Metric Cards (4 cols on laptop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Card 1: Total GMV */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e9edff] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[#464555] uppercase tracking-wider">
                  Gross GMV
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">
                  payments
                </span>
              </div>
              <div className="my-1">
                <p className="text-[20px] font-bold text-[#141b2b] font-display">₱4.82M</p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center text-[10px] font-semibold bg-[#7ffc97]/30 text-[#00702f] px-1 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>+18.4%
                </span>
                <span className="text-[11px] text-[#464555]">vs mo</span>
              </div>
            </div>

            {/* Card 2: Active Businesses */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e9edff] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[#464555] uppercase tracking-wider">
                  Merchants
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">
                  storefront
                </span>
              </div>
              <div className="my-1">
                <p className="text-[20px] font-bold text-[#141b2b] font-display">1,420</p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center text-[10px] font-semibold bg-[#7ffc97]/30 text-[#00702f] px-1 py-0.5 rounded">
                  +64
                </span>
                <span className="text-[11px] text-[#464555]">this month</span>
              </div>
            </div>

            {/* Card 3: Total Appointments */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e9edff] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[#464555] uppercase tracking-wider">
                  Bookings
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">
                  calendar_month
                </span>
              </div>
              <div className="my-1">
                <p className="text-[20px] font-bold text-[#141b2b] font-display">38,940</p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center text-[10px] font-semibold bg-[#7ffc97]/30 text-[#00702f] px-1 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>12.1%
                </span>
                <span className="text-[11px] text-[#464555]">fulfillment</span>
              </div>
            </div>

            {/* Card 4: Platform Revenue */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e9edff] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[#464555] uppercase tracking-wider">
                  Revenue
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">
                  account_balance_wallet
                </span>
              </div>
              <div className="my-1">
                <p className="text-[20px] font-bold text-[#141b2b] font-display">₱385.6k</p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center text-[10px] font-semibold bg-[#7ffc97]/30 text-[#00702f] px-1 py-0.5 rounded">
                  +15.2%
                </span>
                <span className="text-[11px] text-[#464555]">take-rate</span>
              </div>
            </div>
          </div>

          {/* Charts Grid: 2 Columns on Laptop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Booking Velocity SVG Chart Tile */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e9edff] flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-[#141b2b]">Bookings Velocity</p>
                <p className="text-[12px] text-[#464555]">Hourly reservation volume trends</p>
              </div>
              <span className="bg-[#e9edff] px-2 py-0.5 rounded text-[11px] text-[#3525cd] font-medium">
                Weekend Peak 1,840 appts
              </span>
            </div>

            {/* Clean Vector Chart Container */}
            <div className="relative w-full h-32 pt-2">
              <svg
                aria-label="Bookings velocity chart"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 320 90"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Subtle Grid Lines */}
                <line
                  stroke="#dce2f7"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  x1="0"
                  x2="320"
                  y1="20"
                  y2="20"
                />
                <line
                  stroke="#dce2f7"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  x1="0"
                  x2="320"
                  y1="55"
                  y2="55"
                />
                {/* Fill Area */}
                <path
                  d="M 0,75 C 40,65 70,72 100,50 C 130,28 160,60 190,45 C 220,30 240,10 270,12 C 295,15 310,32 320,38 L 320,88 L 0,88 Z"
                  fill="url(#chartGradient)"
                />
                {/* Line Stroke */}
                <path
                  d="M 0,75 C 40,65 70,72 100,50 C 130,28 160,60 190,45 C 220,30 240,10 270,12 C 295,15 310,32 320,38"
                  fill="none"
                  stroke="#4f46e5"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                {/* Peak Milestone Dot */}
                <circle cx="270" cy="12" fill="#3525cd" r="4" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between items-center text-[#464555] text-[11px] pt-1 font-semibold">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span className="text-[#3525cd] font-bold">Week 4 (Peak)</span>
            </div>
          </div>

          {/* Top Performing Categories */}
          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e9edff] flex flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#141b2b]">Top Business Verticals</p>
              <span className="text-[11px] text-[#464555] font-semibold">GMV Share</span>
            </div>
            {/* Multi-segment Stacked Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#e9edff]">
              <div className="h-full bg-[#3525cd]" style={{ width: '44%' }}></div>
              <div className="h-full bg-[#c3c0ff]" style={{ width: '28%' }}></div>
              <div className="h-full bg-[#dce2f7]" style={{ width: '18%' }}></div>
              <div className="h-full bg-[#c2c6d3]" style={{ width: '10%' }}></div>
            </div>
            {/* Category Line Items */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd]"></span>
                  <span className="text-[13px] text-[#141b2b]">Salons &amp; Esthetics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[13px] font-bold text-[#141b2b]">₱2.10M</span>
                  <span className="text-[11px] text-[#464555] w-8 text-right font-medium">44%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c3c0ff]"></span>
                  <span className="text-[13px] text-[#141b2b]">Barbershops &amp; Grooming</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[13px] font-bold text-[#141b2b]">₱1.35M</span>
                  <span className="text-[11px] text-[#464555] w-8 text-right font-medium">28%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dce2f7]"></span>
                  <span className="text-[13px] text-[#141b2b]">Spas &amp; Wellness</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[13px] font-bold text-[#141b2b]">₱860k</span>
                  <span className="text-[11px] text-[#464555] w-8 text-right font-medium">18%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c2c6d3]"></span>
                  <span className="text-[13px] text-[#141b2b]">Freelance &amp; Tutors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[13px] font-bold text-[#141b2b]">₱480k</span>
                  <span className="text-[11px] text-[#464555] w-8 text-right font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Recent Platform Activity Feed */}
          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e9edff] flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#141b2b]">Live Event Stream</p>
              <span className="text-[11px] text-[#3525cd] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00702f] animate-pulse"></span>
                Real-time
              </span>
            </div>
            <div className="space-y-3">
              {/* Item 1: Studio Bloom */}
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#7ffc97]/30 text-[#00702f] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">loyalty</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#141b2b] leading-tight">
                    <span className="font-semibold text-[#3525cd]">Studio Bloom</span> upgraded to Business Plan{' '}
                    <span className="text-[#464555] font-medium">(₱2,999/mo)</span>
                  </p>
                  <span className="text-[11px] text-[#464555]">12m ago</span>
                </div>
              </div>
              {/* Item 2: Northside Barber Co. */}
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">price_check</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#141b2b] leading-tight">
                    <span className="font-semibold text-[#141b2b]">Northside Barber Co.</span> batch payout settled{' '}
                    <span className="text-[#464555] font-medium">(₱48,200)</span>
                  </p>
                  <span className="text-[11px] text-[#464555]">45m ago</span>
                </div>
              </div>
              {/* Item 3: Flagged Provider */}
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">flag</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#141b2b] leading-tight">
                    <span className="font-semibold text-[#ba1a1a]">Bella Lashes Manila</span> flagged for document re-submission
                  </p>
                  <span className="text-[11px] text-[#464555]">2h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUSINESSES (KYC VERIFICATION QUEUE & MERCHANT ROSTER) */}
      {/* ========================================================================= */}
      {adminTab === 'businesses' && (
        <div className="flex flex-col w-full px-4 pt-4 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#3525cd] text-[18px]">gshield</span>
                <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider">
                  Verification Queue
                </span>
              </div>
              <h1 className="text-[20px] font-bold text-[#141b2b] font-display">
                KYC &amp; Partner Approvals
              </h1>
            </div>
            <button
              onClick={() => onNavigateTab('overview')}
              className="px-3 py-1.5 rounded-lg bg-[#e9edff] text-[#3525cd] text-[12px] font-bold hover:bg-[#dce2f7]"
            >
              ← Back to Pulse
            </button>
          </div>

          {/* Pending Applications List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kycList.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#e9edff] shrink-0">
                      <img referrerPolicy="no-referrer"  src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#141b2b]">{item.name}</h3>
                      <p className="text-[12px] text-[#464555]">{item.location}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status.includes('Verified')
                        ? 'bg-[#7ffc97] text-[#002109]'
                        : 'bg-[#ffe8b3] text-[#78350f]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {item.issue ? (
                  <div className="p-2.5 rounded-xl bg-[#fff8e6] border border-[#ffe8b3]/70 text-[12px] text-[#464555]">
                    <strong className="text-[#141b2b] block">{item.issue}</strong>
                    <span>{item.issueDetail}</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#f1f3ff] text-[12px] flex items-center justify-between text-[#464555]">
                    <span>TIN: <strong className="text-[#141b2b]">{item.tin || '402-981-114'}</strong></span>
                    <span className="text-[#00702f] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      DTI &amp; BIR Matched
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-[#f1f3ff]">
                  <button
                    onClick={() => setSelectedInspection(item)}
                    className="flex-1 py-2 rounded-xl bg-[#f1f3ff] text-[#141b2b] text-[12px] font-semibold hover:bg-[#e9edff] flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Inspect Docs</span>
                  </button>

                  <button
                    onClick={() => handleApprove(item.id, item.name)}
                    className="flex-1 py-2 rounded-xl bg-[#3525cd] text-white text-[12px] font-semibold hover:bg-[#4f46e5] flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Approve Partner</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USERS (CLIENT DIRECTORY & ADMIN ROLES) */}
      {/* ========================================================================= */}
      {adminTab === 'users' && (
        <div className="flex flex-col w-full">
          {/* Top Stat Panel */}
          <div className="px-4 pt-4 pb-2 flex flex-col gap-2">
            <div className="bg-[#f1f3ff] rounded-xl p-4 shadow-xs flex flex-col gap-1 relative overflow-hidden border border-[#e9edff]/80">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#464555] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#3525cd]">groups</span>
                  Platform Population
                </span>
                <span className="inline-flex items-center gap-1 bg-[#00702f] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  +340 today
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <h1 className="text-[30px] font-bold text-[#141b2b] tracking-tight font-display leading-tight">
                    84,210
                  </h1>
                  <p className="text-[12px] text-[#464555]">Total Registered Accounts</p>
                </div>
                {/* Live activity mini chart sparkline */}
                <div className="w-24 h-9 flex items-end gap-1 pb-1">
                  <div className="flex-1 bg-[#3525cd]/20 rounded-t h-[45%]"></div>
                  <div className="flex-1 bg-[#3525cd]/30 rounded-t h-[60%]"></div>
                  <div className="flex-1 bg-[#3525cd]/25 rounded-t h-[40%]"></div>
                  <div className="flex-1 bg-[#3525cd]/45 rounded-t h-[75%]"></div>
                  <div className="flex-1 bg-[#3525cd]/60 rounded-t h-[65%]"></div>
                  <div className="flex-1 bg-[#3525cd] rounded-t h-[95%]"></div>
                </div>
              </div>
            </div>

            {/* Segment Filter Pills (Scrollable) */}
            <div
              className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar -mx-4 px-4"
              id="role-filter-container"
            >
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRoleFilter === 'all'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#e9edff] text-[#464555] hover:text-[#141b2b] hover:bg-[#dce2f7]'
                }`}
              >
                <span>All Users</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    userRoleFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#dce2f7] text-[#464555]'
                  }`}
                >
                  84.2k
                </span>
              </button>
              <button
                onClick={() => setUserRoleFilter('client')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRoleFilter === 'client'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#e9edff] text-[#464555] hover:text-[#141b2b] hover:bg-[#dce2f7]'
                }`}
              >
                <span>Clients</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    userRoleFilter === 'client' ? 'bg-white/20 text-white' : 'bg-[#dce2f7] text-[#464555]'
                  }`}
                >
                  82.1k
                </span>
              </button>
              <button
                onClick={() => setUserRoleFilter('owner')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRoleFilter === 'owner'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#e9edff] text-[#464555] hover:text-[#141b2b] hover:bg-[#dce2f7]'
                }`}
              >
                <span>Business Owners</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    userRoleFilter === 'owner' ? 'bg-white/20 text-white' : 'bg-[#dce2f7] text-[#464555]'
                  }`}
                >
                  2.1k
                </span>
              </button>
              <button
                onClick={() => setUserRoleFilter('admin')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRoleFilter === 'admin'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#e9edff] text-[#464555] hover:text-[#141b2b] hover:bg-[#dce2f7]'
                }`}
              >
                <span>Platform Admins</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    userRoleFilter === 'admin' ? 'bg-white/20 text-white' : 'bg-[#dce2f7] text-[#464555]'
                  }`}
                >
                  8
                </span>
              </button>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col gap-2 pt-1 relative">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464555] text-[20px]">
                  search
                </span>
                <input
                  type="search"
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="Search name, email, or user ID..."
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#f1f3ff] text-[#141b2b] placeholder:text-[#5a5e69] text-[14px] outline-none focus:bg-[#e9edff] transition-all border border-transparent focus:border-[#3525cd]/30"
                />
                {userSearchQuery && (
                  <button
                    onClick={() => setUserSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5e69] hover:text-[#141b2b] w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="relative flex items-center gap-1.5 text-[#464555] text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Sorted by:</span>
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="text-[#3525cd] text-[12px] font-semibold inline-flex items-center gap-0.5 cursor-pointer hover:underline"
                  >
                    {userSortBy === 'active'
                      ? 'Most Active'
                      : userSortBy === 'spent'
                      ? 'Lifetime Spend'
                      : userSortBy === 'joined'
                      ? 'Recently Joined'
                      : 'Alphabetical'}
                    <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                  </button>

                  {showSortMenu && (
                    <div className="absolute top-7 left-14 z-30 bg-white border border-[#e9edff] rounded-xl shadow-lg py-1 min-w-[150px]">
                      <button
                        onClick={() => {
                          setUserSortBy('active');
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#f1f3ff] ${
                          userSortBy === 'active' ? 'text-[#3525cd] font-bold' : 'text-[#141b2b]'
                        }`}
                      >
                        Most Active
                      </button>
                      <button
                        onClick={() => {
                          setUserSortBy('spent');
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#f1f3ff] ${
                          userSortBy === 'spent' ? 'text-[#3525cd] font-bold' : 'text-[#141b2b]'
                        }`}
                      >
                        Lifetime Spend
                      </button>
                      <button
                        onClick={() => {
                          setUserSortBy('joined');
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#f1f3ff] ${
                          userSortBy === 'joined' ? 'text-[#3525cd] font-bold' : 'text-[#141b2b]'
                        }`}
                      >
                        Recently Joined
                      </button>
                      <button
                        onClick={() => {
                          setUserSortBy('name');
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#f1f3ff] ${
                          userSortBy === 'name' ? 'text-[#3525cd] font-bold' : 'text-[#141b2b]'
                        }`}
                      >
                        Alphabetical (A-Z)
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-[#5a5e69] font-medium" id="match-counter">
                  {filteredUsers.length} of 84,210
                </span>
              </div>
            </div>
          </div>

          {/* User Card Feed */}
          <div className="px-4 lg:px-0 grid grid-cols-1 md:grid-cols-2 gap-4 pb-4" id="users-card-list">
            {filteredUsers.map(user => {
              const isFlagged = user.role === 'flagged';
              return (
                <div
                  key={user.id}
                  className={`user-card rounded-xl p-4 shadow-xs transition-all duration-300 relative border ${
                    isFlagged
                      ? 'bg-[#ffdad6]/20 border-[#ba1a1a]/30'
                      : 'bg-white border-[#e9edff] hover:shadow-md'
                  } ${user.isBanned ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                >
                  {/* Top Row: User Avatar & Info + Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {user.avatarUrl ? (
                          <img referrerPolicy="no-referrer" 
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : user.initials ? (
                          <div className="w-12 h-12 rounded-full bg-[#dee2ef] text-[#60646f] flex items-center justify-center text-[18px] font-semibold font-display">
                            {user.initials}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#ba1a1a]/15 text-[#ba1a1a] flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-[24px]">warning</span>
                          </div>
                        )}

                        {/* Corner Avatar Badge */}
                        {user.avatarBadgeIcon && (
                          <span
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${
                              user.avatarBadgeBg || 'bg-[#00702f]'
                            } text-white flex items-center justify-center`}
                          >
                            <span className="material-symbols-outlined text-[10px] font-bold">
                              {user.avatarBadgeIcon}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Name & Role Badge & Email */}
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[16px] font-semibold text-[#141b2b] truncate">
                            {user.name}
                          </span>

                          {/* Specific Role Badges */}
                          {user.role === 'client' && (
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5 ${
                                user.roleBadge.includes('VIP')
                                  ? 'bg-[#3525cd]/10 text-[#3525cd]'
                                  : 'bg-[#e1e8fd] text-[#464555]'
                              }`}
                            >
                              {user.roleBadge.includes('VIP') && (
                                <span className="material-symbols-outlined text-[12px]">
                                  workspace_premium
                                </span>
                              )}
                              {user.roleBadge}
                            </span>
                          )}

                          {user.role === 'owner' && (
                            <>
                              <span className="bg-[#e2dfff] text-[#3323cc] text-[11px] px-2 py-0.5 rounded-full font-semibold">
                                {user.roleBadge}
                              </span>
                              {user.subBadge && (
                                <span className="bg-[#dce2f7] text-[#464555] text-[11px] px-1.5 py-0.2 rounded font-bold uppercase">
                                  {user.subBadge}
                                </span>
                              )}
                            </>
                          )}

                          {user.role === 'admin' && (
                            <span className="bg-[#3525cd]/10 text-[#3525cd] text-[11px] px-2 py-0.5 rounded-full font-bold">
                              {user.roleBadge}
                            </span>
                          )}

                          {user.role === 'flagged' && (
                            <span className="bg-[#ba1a1a] text-white text-[11px] px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
                              <span className="material-symbols-outlined text-[12px]">gshield</span>
                              {user.roleBadge}
                            </span>
                          )}
                        </div>
                        <span className="text-[12px] text-[#464555] truncate">{user.email}</span>
                      </div>
                    </div>

                    {/* Meatballs menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveUserMenu(activeUserMenu === user.id ? null : user.id)
                        }
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff] transition-colors shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>

                      {activeUserMenu === user.id && (
                        <div className="absolute right-0 top-8 z-30 bg-white border border-[#e9edff] rounded-xl shadow-lg py-1 min-w-[170px]">
                          <button
                            onClick={() => {
                              setActiveUserLog(user);
                              setActiveUserMenu(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-[12px] text-[#141b2b] hover:bg-[#f1f3ff] flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#3525cd]">
                              visibility
                            </span>
                            View Full Log
                          </button>
                          <button
                            onClick={() => {
                              setActiveUserMenu(null);
                              onTriggerToast(`Password reset link dispatched to ${user.email}`, 'mail');
                            }}
                            className="w-full px-3 py-1.5 text-left text-[12px] text-[#141b2b] hover:bg-[#f1f3ff] flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#464555]">
                              key
                            </span>
                            Reset Credentials
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => {
                                setActiveUserMenu(null);
                                handleBanUser(user.id, user.name);
                              }}
                              className="w-full px-3 py-1.5 text-left text-[12px] text-[#ba1a1a] hover:bg-[#ffdad6]/20 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px]">block</span>
                              Suspend Account
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content 1: Metrics Strip (for clients/VIP) */}
                  {user.metric1Label && !user.businessName && !isFlagged && (
                    <div className="grid grid-cols-2 gap-2 mt-3 bg-[#f1f3ff] p-2.5 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#464555]">{user.metric1Label}</span>
                        <span className="text-[14px] font-semibold text-[#141b2b] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-[#3525cd]">
                            {user.metric1Icon}
                          </span>
                          {user.metric1Value}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#464555]">{user.metric2Label}</span>
                        <span className="text-[14px] font-semibold text-[#141b2b] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-[#00702f]">
                            {user.metric2Icon}
                          </span>
                          {user.metric2Value}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Body Content 2: Business details block (for owners) */}
                  {user.businessName && (
                    <div className="flex flex-col gap-1.5 mt-3 bg-[#f1f3ff] p-2.5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-[#141b2b] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#3525cd]">
                            {user.businessIcon}
                          </span>
                          {user.businessName}
                        </span>
                        {user.businessMeta && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full ${
                              user.businessMeta.includes('Verified')
                                ? 'text-[#005522] bg-[#e9edff] font-medium'
                                : 'text-[#464555] bg-[#e9edff]'
                            }`}
                          >
                            {user.businessMeta}
                          </span>
                        )}
                      </div>
                      {user.businessPipeline && (
                        <div className="flex items-center justify-between text-[#464555] text-[12px] pt-0.5">
                          <span>Active Bookings Pipeline</span>
                          <span className="text-[#3525cd] text-[12px] font-semibold">
                            {user.businessPipeline}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body Content 3: Fraud Alert Signals (for flagged users) */}
                  {isFlagged && (
                    <div className="flex flex-col gap-1 mt-3 bg-white p-2.5 rounded-lg border border-[#ffdad6]">
                      <div className="flex items-center justify-between text-[#ba1a1a] text-[12px] font-medium">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">
                            {user.fraudWarningIcon}
                          </span>
                          {user.fraudWarning}
                        </span>
                        <span className="bg-[#ffdad6] text-[#93000a] text-[11px] px-1.5 py-0.5 rounded font-semibold">
                          {user.fraudTag}
                        </span>
                      </div>
                      <span className="text-[12px] text-[#464555]">{user.fraudSubtext}</span>
                    </div>
                  )}

                  {/* Footer & Action Row */}
                  {!isFlagged ? (
                    <div className="flex items-center justify-between mt-3 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-[#e9edff] text-[#005522] text-[11px] px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#005522]"></span>
                          {user.verified ? 'Verified' : 'Active'}
                        </span>
                        <span className="text-[12px] text-[#464555]">{user.joinedDate}</span>
                      </div>
                      {user.role === 'owner' && user.businessPipeline ? (
                        <button
                          onClick={() => onNavigateTab('businesses')}
                          className="px-3 py-1.5 rounded-lg bg-[#e9edff] text-[#3525cd] hover:bg-[#3525cd] hover:text-white text-[12px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">store</span>
                          Manage
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveUserLog(user)}
                          className="px-3 py-1.5 rounded-lg bg-[#e9edff] text-[#3525cd] hover:bg-[#3525cd] hover:text-white text-[12px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          View Log
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-3 pt-1">
                      <span className="text-[12px] text-[#ba1a1a] flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[15px]">lock_clock</span>
                        Restricted Auth
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReviewingFlaggedUser(user)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#e9edff] text-[#464555] text-[12px] font-medium hover:text-[#141b2b] transition-all cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          disabled={banningUserId === user.id || user.isBanned}
                          onClick={() => handleBanUser(user.id, user.name)}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer ${
                            user.isBanned
                              ? 'bg-[#5a5e69] text-white cursor-not-allowed'
                              : 'bg-[#ba1a1a] hover:bg-[#ba1a1a]/90 text-white'
                          }`}
                        >
                          {banningUserId === user.id ? (
                            <>
                              <span className="material-symbols-outlined text-[16px] animate-spin">
                                progress_activity
                              </span>
                              Banning...
                            </>
                          ) : user.isBanned ? (
                            <>
                              <span className="material-symbols-outlined text-[16px]">done</span>
                              Banned
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[16px]">block</span>
                              Ban User
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-12 px-4 text-center bg-[#f1f3ff] rounded-xl"
                id="users-empty-state"
              >
                <div className="w-14 h-14 rounded-full bg-[#e9edff] flex items-center justify-center text-[#464555] mb-2">
                  <span className="material-symbols-outlined text-[28px]">person_search</span>
                </div>
                <h3 className="text-[18px] font-semibold text-[#141b2b] font-display">
                  No users match criteria
                </h3>
                <p className="text-[12px] text-[#464555] mt-1 max-w-xs">
                  Try adjusting your filter category or searching with a different name or email fragment.
                </p>
                <button
                  onClick={() => {
                    setUserRoleFilter('all');
                    setUserSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[12px] font-semibold cursor-pointer shadow-xs"
                  id="reset-filter-btn"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* User Quick Stats Banner (Administrative bottom glance) */}
          <div className="px-4 pb-6">
            <button
              onClick={() => onNavigateTab('overview')}
              className="w-full bg-[#e1e8fd] hover:bg-[#dce2f7] rounded-xl p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">insights</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-semibold text-[#141b2b]">Platform Pulse</span>
                  <span className="text-[12px] text-[#464555]">
                    Active DAU: <strong className="text-[#141b2b] font-semibold">14,800</strong> •
                    Verification rate: <strong className="text-[#005522] font-semibold">97.4%</strong>
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#464555] text-[18px] shrink-0">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive User Audit Log Modal */}
      {activeUserLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e9edff] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">shield_person</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#141b2b] leading-tight">
                    {activeUserLog.name} Audit Log
                  </h3>
                  <p className="text-[11px] text-[#5a5e69] font-mono">{activeUserLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveUserLog(null)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-[12px]">
              <div className="p-3 rounded-xl bg-[#f1f3ff] flex justify-between items-center">
                <span className="text-[#464555]">Email Contact</span>
                <span className="font-semibold text-[#141b2b]">{activeUserLog.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f1f3ff] flex justify-between items-center">
                <span className="text-[#464555]">Registration Timestamp</span>
                <span className="font-semibold text-[#141b2b]">{activeUserLog.joinedDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f1f3ff] flex justify-between items-center">
                <span className="text-[#464555]">Identity Verification</span>
                <span className="font-semibold text-[#00702f] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Level 2 Verified (PhilSys ID)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#f1f3ff] flex justify-between items-center">
                <span className="text-[#464555]">Last Authenticated Session</span>
                <span className="font-semibold text-[#141b2b] font-mono">119.93.42.10 (BGC Manila)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onTriggerToast(`Audit records for ${activeUserLog.name} exported to CSV 📄`, 'download');
                  setActiveUserLog(null);
                }}
                className="flex-1 h-10 rounded-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                Export Ledger
              </button>
              <button
                onClick={() => setActiveUserLog(null)}
                className="px-4 h-10 rounded-lg bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] text-[12px] font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flagged User Review Modal */}
      {reviewingFlaggedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#ffdad6] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#ba1a1a]/15 text-[#ba1a1a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#141b2b] leading-tight">
                    Security Review: {reviewingFlaggedUser.name}
                  </h3>
                  <p className="text-[11px] text-[#ba1a1a] font-mono">High Risk Sentinel Alert</p>
                </div>
              </div>
              <button
                onClick={() => setReviewingFlaggedUser(null)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-[#ffdad6]/20 border border-[#ba1a1a]/30 rounded-xl text-[12px] text-[#464555] flex flex-col gap-1.5">
              <span className="font-bold text-[#ba1a1a] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">security</span>
                Sentinel Fraud Detection Report
              </span>
              <p>
                This account generated 12 SMS OTP generation bursts within 3 minutes from an automated
                datacenter proxy in Manila. No verified Philippine phone number was attached.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  handleBanUser(reviewingFlaggedUser.id, reviewingFlaggedUser.name);
                  setReviewingFlaggedUser(null);
                }}
                className="flex-1 h-10 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">block</span>
                Confirm Ban &amp; Block IP
              </button>
              <button
                onClick={() => {
                  setReviewingFlaggedUser(null);
                  onTriggerToast(`Security warning dismissed for ${reviewingFlaggedUser.name}`, 'info');
                }}
                className="px-3 h-10 rounded-lg bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] text-[12px] font-medium cursor-pointer"
              >
                Dismiss Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REPORTS (TRUST & SAFETY SUITE: MODERATION QUEUE) */}
      {/* ========================================================================= */}
      {adminTab === 'reports' && (
        <div className="flex flex-col w-full px-4 pt-2 pb-6">
          {/* Header & Live Feed Indicator */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#5a5e69] uppercase tracking-wider block">
                  Trust &amp; Safety Suite
                </span>
                <h1 className="text-[22px] text-[#141b2b] font-bold font-display leading-tight">
                  Moderation Queue
                </h1>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold animate-pulse shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                Live Feed
              </span>
            </div>

            {/* Quick Metric Pills */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="p-2.5 rounded-xl bg-[#f1f3ff] shadow-xs flex items-center gap-2.5 border border-[#e9edff]/80">
                <div className="w-10 h-10 rounded-lg bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">inbox</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[18px] text-[#141b2b] font-bold truncate font-display">
                    {activeReportFilter === 'all'
                      ? `${moderationTickets.filter(t => !t.isResolved).length} Open`
                      : activeReportFilter === 'high'
                      ? `${moderationTickets.filter(t => t.category === 'high' && !t.isResolved).length} High`
                      : activeReportFilter === 'review'
                      ? `${moderationTickets.filter(t => t.category === 'review' && !t.isResolved).length} In Review`
                      : `${moderationTickets.filter(t => t.category === 'resolved' || t.isResolved).length} Resolved`}
                  </p>
                  <p className="text-[12px] text-[#5a5e69] truncate">Tickets waiting</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f1f3ff] shadow-xs flex items-center gap-2.5 border border-[#e9edff]/80">
                <div className="w-10 h-10 rounded-lg bg-[#62df7d]/40 text-[#005522] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">timer</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[18px] text-[#141b2b] font-bold truncate font-display">1.8 hrs</p>
                  <p className="text-[12px] text-[#5a5e69] truncate">Avg. resolution</p>
                </div>
              </div>
            </div>
          </div>

          {/* Priority / Status Horizontal Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3.5 no-scrollbar">
            <button
              onClick={() => setActiveReportFilter('all')}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                activeReportFilter === 'all'
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7]'
              }`}
            >
              All ({moderationTickets.length})
            </button>
            <button
              onClick={() => setActiveReportFilter('high')}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12px] transition-all cursor-pointer ${
                activeReportFilter === 'high'
                  ? 'bg-[#3525cd] text-white font-semibold shadow-xs'
                  : 'bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] font-medium'
              }`}
            >
              High Priority ({moderationTickets.filter(t => t.category === 'high').length})
            </button>
            <button
              onClick={() => setActiveReportFilter('review')}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12px] transition-all cursor-pointer ${
                activeReportFilter === 'review'
                  ? 'bg-[#3525cd] text-white font-semibold shadow-xs'
                  : 'bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] font-medium'
              }`}
            >
              In Review ({moderationTickets.filter(t => t.category === 'review').length})
            </button>
            <button
              onClick={() => setActiveReportFilter('resolved')}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12px] transition-all cursor-pointer ${
                activeReportFilter === 'resolved'
                  ? 'bg-[#3525cd] text-white font-semibold shadow-xs'
                  : 'bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] font-medium'
              }`}
            >
              Resolved ({moderationTickets.filter(t => t.category === 'resolved').length})
            </button>
          </div>

          {/* Ticket Feed Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="tickets-container">
            {filteredTickets.map(ticket => (
              <article
                key={ticket.id}
                className={`ticket-card rounded-xl bg-white shadow-xs p-4 flex flex-col gap-2 relative overflow-hidden transition-all duration-200 border border-[#e9edff] ${
                  ticket.category === 'resolved' ? 'opacity-85 hover:opacity-100' : ''
                }`}
              >
                {/* Inline Action Resolved Feedback Banner */}
                {ticket.actionMessage && (
                  <div className="p-2 rounded-lg bg-[#00702f] text-white text-[12px] font-semibold flex items-center justify-between gap-2 shadow-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#78f591]">
                        check_circle
                      </span>
                      {ticket.actionMessage}
                    </span>
                    <span className="text-[11px] text-[#78f591] font-mono">Logged</span>
                  </div>
                )}

                {/* Card Header: Badges & ID */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        ticket.category === 'high'
                          ? 'bg-[#ba1a1a]/15 text-[#ba1a1a]'
                          : ticket.category === 'review'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-[#005522]/15 text-[#005522]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {ticket.priorityIcon}
                      </span>
                      {ticket.priorityLabel}
                    </span>
                    <span className="text-[11px] text-[#5a5e69] font-mono">{ticket.id}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      ticket.statusBadge === 'In Review'
                        ? 'bg-[#3525cd]/10 text-[#3525cd]'
                        : ticket.statusBadge === 'Archived'
                        ? 'bg-[#e9edff] text-[#5a5e69]'
                        : 'bg-[#e1e8fd] text-[#464555]'
                    }`}
                  >
                    {ticket.statusBadge}
                  </span>
                </div>

                {/* Title & Target */}
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-[16px] text-[#141b2b] font-semibold flex items-center gap-1.5">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        ticket.category === 'high'
                          ? 'text-[#ba1a1a]'
                          : ticket.category === 'review'
                          ? 'text-[#3525cd]'
                          : 'text-[#005522]'
                      }`}
                    >
                      {ticket.titleIcon}
                    </span>
                    {ticket.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#5a5e69]">
                    <span>{ticket.bookingRef ? 'Booking:' : 'Target:'}</span>
                    <span
                      className={`font-medium text-[#141b2b] truncate ${
                        ticket.bookingRef ? 'font-mono' : ''
                      }`}
                    >
                      {ticket.target}
                    </span>
                    {ticket.subtitleExtra && (
                      <>
                        <span>•</span>
                        <span className="text-[#464555]">{ticket.subtitleExtra}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Financial Dispute Metric (if applicable) */}
                {ticket.disputedPenalty && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f1f3ff]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#5a5e69] text-[20px]">
                        receipt_long
                      </span>
                      <span className="text-[12px] text-[#5a5e69]">Disputed Penalty</span>
                    </div>
                    <span className="text-[24px] text-[#ba1a1a] font-bold font-display">
                      {ticket.disputedPenalty}
                    </span>
                  </div>
                )}

                {/* Snippet / Testimony / Reporter Quote Box */}
                {ticket.quote && (
                  <div className="p-2.5 rounded-lg bg-[#f1f3ff] text-[#464555] text-[12px] italic flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] not-italic text-[#5a5e69]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          {ticket.reporterIcon || 'person'}
                        </span>
                        {ticket.reporter}
                      </span>
                      <span>{ticket.timeAgo}</span>
                    </div>
                    <p className="line-clamp-2 leading-relaxed">"{ticket.quote}"</p>
                  </div>
                )}

                {/* Action Resolution Box (for resolved items) */}
                {ticket.actionResolution && (
                  <div className="p-2.5 rounded-lg bg-[#f1f3ff] flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#005522] text-[18px] mt-0.5 shrink-0">
                      verified
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[#5a5e69] font-medium">
                        Action Resolution
                      </span>
                      <span className="text-[12px] text-[#141b2b] leading-tight">
                        {ticket.actionResolution}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Panel for High Priority */}
                {ticket.category === 'high' && !ticket.isResolved && (
                  <div className="pt-1 flex flex-col gap-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() =>
                          handleResolveTicket(
                            ticket.id,
                            'Review Removed',
                            'Review deleted & 1 strike issued to client 🛡️'
                          )
                        }
                        className="h-11 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 active:opacity-90 shadow-xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete_forever
                        </span>
                        Remove Review
                      </button>
                      <button
                        onClick={() =>
                          handleResolveTicket(
                            ticket.id,
                            'Report Dismissed',
                            'Report dismissed as non-violating'
                          )
                        }
                        className="h-11 rounded-lg bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        Dismiss Report
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        handleResolveTicket(
                          ticket.id,
                          'Warning Sent to Mark R.',
                          'Formal platform policy violation warning dispatched'
                        )
                      }
                      className="h-10 rounded-lg bg-[#f1f3ff] text-[#141b2b] hover:bg-[#e9edff] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#5a5e69]">
                        warning
                      </span>
                      Issue Warning to Mark R.
                    </button>
                  </div>
                )}

                {/* Action Panel for Medium Priority (In Review) */}
                {ticket.category === 'review' && !ticket.isResolved && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() =>
                        handleResolveTicket(
                          ticket.id,
                          'Refunded ₱500 via GCash',
                          'Refund of ₱500.00 credited back to GCash wallet ⚡'
                        )
                      }
                      className="h-11 rounded-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 active:opacity-90 shadow-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                      Issue Refund (GCash)
                    </button>
                    <button
                      onClick={() =>
                        handleResolveTicket(
                          ticket.id,
                          'Salon Contacted',
                          'Direct priority ticket dispatched to Glow Nail Studio'
                        )
                      }
                      className="h-11 rounded-lg bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">phone</span>
                      Contact Salon
                    </button>
                  </div>
                )}
              </article>
            ))}

            {/* Empty state fallback */}
            {filteredTickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <div className="w-16 h-16 rounded-full bg-[#e9edff] flex items-center justify-center text-[#5a5e69]">
                  <span className="material-symbols-outlined text-[32px]">task_alt</span>
                </div>
                <p className="text-[16px] text-[#141b2b] font-semibold">Queue Clear in this Filter</p>
                <p className="text-[12px] text-[#5a5e69] max-w-xs">
                  All reported tickets under this category have been properly triaged or resolved.
                </p>
              </div>
            )}
          </div>

          {/* Audit Trail Footer */}
          <footer className="mt-4 p-2.5 rounded-xl bg-[#f1f3ff] shadow-xs flex items-center gap-2.5 border border-[#e9edff]/80">
            <div className="w-8 h-8 rounded-lg bg-[#e9edff] flex items-center justify-center text-[#5a5e69] shrink-0">
              <span className="material-symbols-outlined text-[18px]">shield_person</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[#141b2b] font-medium truncate">
                Audit Ledger Active
              </p>
              <p className="text-[12px] text-[#5a5e69] truncate">
                All actions logged to immutable Admin Audit Ledger v2.6
              </p>
            </div>
            <span
              className="w-2 h-2 rounded-full bg-[#005522] shrink-0"
              title="Sync Status: Green"
            ></span>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SETTINGS (PLATFORM SYSTEM CONFIG) - EXACT MATCH TO PROVIDED DESIGN */}
      {/* ========================================================================= */}
      {adminTab === 'settings' && (
        <div className="flex flex-col w-full px-4 lg:px-0 pt-2 pb-8 space-y-4">
          {/* Header Context Badge & Visual Status Pill */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00702f] animate-pulse"></span>
              <span className="text-[11px] text-[#005522] font-semibold uppercase tracking-wider">
                Production Engine • Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e1e8fd] text-[#464555] text-[11px] font-semibold shadow-xs">
              <span className="material-symbols-outlined text-[14px] text-[#3525cd]">verified_user</span>
              <span>v2.8.4-manila</span>
            </div>
          </div>

          {/* Hero Master Summary Banner */}
          <div className="relative overflow-hidden rounded-xl bg-white shadow-xs p-4 flex flex-col gap-2 border border-[#e9edff]/80">
            <div className="flex items-start justify-between">
              <div className="flex gap-2.5 items-center">
                <div className="w-10 h-10 rounded-xl bg-[#3525cd]/10 flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-[24px]">tune</span>
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#141b2b] font-display">
                    Platform Settings
                  </h2>
                  <p className="text-[12px] text-[#464555]">
                    Global rules, payout rails, and operational toggles
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#00702f]/15 text-[#005522] text-[11px] font-semibold">
                All Systems Normal
              </span>
            </div>

            {/* Quick Health Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 pt-1 mt-1 bg-[#f1f3ff] rounded-lg p-2.5">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-[#464555]">SMS Gateway</span>
                <span className="text-[14px] font-semibold text-[#141b2b]">99.8%</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-[#464555]">Base Rail</span>
                <span className="text-[14px] font-semibold text-[#141b2b]">InstaPay</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-[#464555]">Policy</span>
                <span className="text-[14px] font-semibold text-[#005522]">DPA-2012</span>
              </div>
            </div>
          </div>

          {/* Settings Sections Grid: 2 Columns on Laptop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SECTION 1: Platform Global Config */}
            <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">payments</span>
                <h3 className="text-[14px] font-semibold text-[#141b2b] uppercase tracking-wide">
                  Platform Global Config
                </h3>
              </div>
              <span className="text-[11px] text-[#464555]">Tier 1 Parameters</span>
            </div>

            <div className="rounded-xl bg-white shadow-xs overflow-hidden flex flex-col border border-[#e9edff]/80">
              {/* Item 1: Fee Rate */}
              <div className="p-4 flex flex-col gap-1 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#464555]">Platform Fee Rate</p>
                    <p className="text-[16px] font-semibold text-[#141b2b] mt-0.5">
                      {platformFeePercent}%{' '}
                      <span className="text-[12px] font-normal text-[#464555]">per booking</span> +
                      ₱{platformFeeFixed}{' '}
                      <span className="text-[12px] font-normal text-[#464555]">gateway fee</span>
                    </p>
                    <p className="text-[12px] text-[#464555] mt-1">
                      Split seamlessly at checkout via automated Escrow hold.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTempFeePercent(platformFeePercent);
                      setTempFeeFixed(platformFeeFixed);
                      setIsEditFeeModalOpen(true);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#e9edff] hover:bg-[#dce2f7] text-[#3525cd] text-[12px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit Fee</span>
                  </button>
                </div>
              </div>

              {/* Item 2: Payout Schedule */}
              <div className="p-4 flex flex-col gap-1 bg-[#f1f3ff] border-t border-b border-[#e9edff]/60">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] text-[#464555]">Merchant Payout Schedule</p>
                    <p className="text-[14px] font-semibold text-[#141b2b] mt-0.5">
                      Daily GCash / Maya &amp; Weekly Bank Wire
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#e1e8fd] text-[#464555] text-[11px] font-semibold">
                        PESONet
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#e1e8fd] text-[#464555] text-[11px] font-semibold">
                        InstaPay Realtime
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[#464555] mt-1">
                    account_balance_wallet
                  </span>
                </div>
              </div>

              {/* Item 3: Auto-Cancel Timeout */}
              <div className="p-4 flex items-center justify-between gap-2 bg-white">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#464555]">Auto-Cancel Timeout</p>
                  <p className="text-[14px] font-semibold text-[#141b2b] mt-0.5">
                    {autoCancelTimeout >= 60 ? `${autoCancelTimeout / 60} hours` : `${autoCancelTimeout} mins`} prior to slot
                  </p>
                  <p className="text-[12px] text-[#464555]">
                    Releases unconfirmed client reservations to public waitlist.
                  </p>
                </div>
                <button
                  onClick={() => setIsTimeoutModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e1e8fd] text-[#141b2b] text-[14px] font-semibold hover:bg-[#dce2f7] transition-colors cursor-pointer"
                  title="Adjust timeout duration"
                >
                  <span>{autoCancelTimeout}m</span>
                  <span className="material-symbols-outlined text-[16px] text-[#464555]">timer</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Regional & Currency */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">public</span>
                <h3 className="text-[14px] font-semibold text-[#141b2b] uppercase tracking-wide">
                  Regional &amp; Currency
                </h3>
              </div>
              <span className="text-[11px] text-[#005522] font-medium">PH Region Node</span>
            </div>

            <div className="rounded-xl bg-white shadow-xs p-4 flex flex-col gap-3 border border-[#e9edff]/80">
              {/* Currency & Timezone Compact Mosaic */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-[#f1f3ff] flex flex-col gap-1">
                  <span className="text-[11px] text-[#464555]">Primary Currency</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[18px] font-semibold text-[#3525cd] font-display">₱</span>
                    <span className="text-[14px] font-semibold text-[#141b2b]">PHP</span>
                  </div>
                  <span className="text-[11px] text-[#464555] truncate">Philippine Peso</span>
                </div>
                <div className="p-3 rounded-lg bg-[#f1f3ff] flex flex-col gap-1">
                  <span className="text-[11px] text-[#464555]">Standard Timezone</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3525cd]">
                      schedule
                    </span>
                    <span className="text-[14px] font-semibold text-[#141b2b]">GMT+8</span>
                  </div>
                  <span className="text-[11px] text-[#464555] truncate">Asia/Manila</span>
                </div>
              </div>

              {/* SMS Gateway Card with Detailed Provider State */}
              <div className="p-3.5 rounded-xl bg-[#e9edff] flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#3525cd] shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">sms</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#141b2b]">Semaphore SMS Gateway</p>
                      <p className="text-[11px] text-[#005522] flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00702f]"></span>
                        API Connected • 99.8% Delivery
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshSmsGateway}
                    className="text-[#3525cd] hover:text-[#141b2b] p-1 cursor-pointer transition-transform active:scale-90"
                    type="button"
                    title="Refresh SMS health ping"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isSmsRefreshing ? 'animate-spin' : ''
                      }`}
                    >
                      refresh
                    </span>
                  </button>
                </div>

                <div className="mt-1 pt-2 flex items-center justify-between bg-white px-3 py-2 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#464555]">Prepaid Pool Balance</span>
                    <span className="text-[16px] font-bold text-[#141b2b]">
                      ₱{smsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="px-2.5 py-1 rounded-md bg-[#3525cd] text-white text-[11px] font-semibold shadow-xs hover:bg-[#4f46e5] transition-colors cursor-pointer"
                    type="button"
                  >
                    Top Up Credits
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Feature Toggles */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">toggle_on</span>
                <h3 className="text-[14px] font-semibold text-[#141b2b] uppercase tracking-wide">
                  Feature Toggles
                </h3>
              </div>
              <span className="text-[11px] text-[#464555]">Real-time Deployment</span>
            </div>

            <div className="rounded-xl bg-white shadow-xs overflow-hidden flex flex-col border border-[#e9edff]/80">
              {/* Toggle 1: Instant Online Booking with GCash */}
              <div className="p-4 flex items-center justify-between gap-2 bg-white">
                <div className="min-w-0 flex-1 pr-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#141b2b]">
                      Instant Online Booking with GCash
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-[#e2dfff] text-[#3323cc] text-[10px] font-bold">
                      DIRECT
                    </span>
                  </div>
                  <p className="text-[12px] text-[#464555] mt-0.5">
                    Allows clients to immediately secure slots with 100% instant payment verification.
                  </p>
                </div>
                <button
                  aria-pressed={toggleGcash}
                  onClick={() => {
                    const next = !toggleGcash;
                    setToggleGcash(next);
                    onTriggerToast(
                      next ? 'GCash Instant Booking turned ON' : 'GCash Instant Booking turned OFF',
                      'payments'
                    );
                  }}
                  className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    toggleGcash ? 'bg-[#4f46e5] justify-end' : 'bg-[#dee2ef] justify-start'
                  }`}
                  type="button"
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-sm block transform transition-transform"></span>
                </button>
              </div>

              {/* Toggle 2: Client VIP Tier Recognition */}
              <div className="p-4 flex items-center justify-between gap-2 bg-[#f1f3ff] border-t border-b border-[#e9edff]/60">
                <div className="min-w-0 flex-1 pr-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#141b2b]">
                      Client VIP Tier Recognition
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      hotel_class
                    </span>
                  </div>
                  <p className="text-[12px] text-[#464555] mt-0.5">
                    Highlights high-frequency spenders during barber &amp; stylist schedule view.
                  </p>
                </div>
                <button
                  aria-pressed={toggleVip}
                  onClick={() => {
                    const next = !toggleVip;
                    setToggleVip(next);
                    onTriggerToast(
                      next ? 'VIP Tier highlights enabled in schedules' : 'VIP Tier highlights hidden',
                      'workspace_premium'
                    );
                  }}
                  className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    toggleVip ? 'bg-[#4f46e5] justify-end' : 'bg-[#dee2ef] justify-start'
                  }`}
                  type="button"
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-sm block transform transition-transform"></span>
                </button>
              </div>

              {/* Toggle 3: Staff Commission Tracking */}
              <div className="p-4 flex items-center justify-between gap-2 bg-white">
                <div className="min-w-0 flex-1 pr-1">
                  <span className="text-[14px] font-semibold text-[#141b2b]">
                    Staff Commission Tracking
                  </span>
                  <p className="text-[12px] text-[#464555] mt-0.5">
                    Enables automated commission splits &amp; daily tips calculation for business managers.
                  </p>
                </div>
                <button
                  aria-pressed={toggleCommission}
                  onClick={() => {
                    const next = !toggleCommission;
                    setToggleCommission(next);
                    onTriggerToast(
                      next ? 'Staff commission tracker module active' : 'Staff commission module paused',
                      'tune'
                    );
                  }}
                  className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    toggleCommission ? 'bg-[#4f46e5] justify-end' : 'bg-[#dee2ef] justify-start'
                  }`}
                  type="button"
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-sm block transform transition-transform"></span>
                </button>
              </div>

              {/* Toggle 4: Maintenance Mode */}
              <div className="p-4 flex items-center justify-between gap-2 bg-[#ffdad6]/20 border-t border-[#ba1a1a]/20">
                <div className="min-w-0 flex-1 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-semibold text-[#ba1a1a]">
                      Maintenance Mode
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">
                      warning
                    </span>
                  </div>
                  <p className="text-[12px] text-[#464555] mt-0.5">
                    Emergency read-only switch. Blocks all consumer checkouts &amp; bookings.
                  </p>
                </div>
                <button
                  aria-pressed={toggleMaintenance}
                  onClick={() => {
                    const next = !toggleMaintenance;
                    setToggleMaintenance(next);
                    if (next) {
                      onTriggerToast('⚠️ Platform set to MAINTENANCE READ-ONLY MODE', 'warning');
                    } else {
                      onTriggerToast('Maintenance Mode deactivated. Bookings live! 🟢', 'check_circle');
                    }
                  }}
                  className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    toggleMaintenance ? 'bg-[#ba1a1a] justify-end' : 'bg-[#dee2ef] justify-start'
                  }`}
                  type="button"
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-sm block transform transition-transform"></span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: Security & Compliance */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">security</span>
                <h3 className="text-[14px] font-semibold text-[#141b2b] uppercase tracking-wide">
                  Security &amp; Compliance
                </h3>
              </div>
              <span className="text-[11px] text-[#005522] font-medium">NPC Certified</span>
            </div>

            <div className="rounded-xl bg-white shadow-xs p-4 flex flex-col gap-2 border border-[#e9edff]/80">
              {/* 2FA Compliance Row */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f1f3ff]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#e9edff] flex items-center justify-center text-[#3525cd] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">encrypted</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#141b2b]">
                      Two-Factor Authentication (2FA)
                    </p>
                    <p className="text-[12px] text-[#464555]">
                      Mandatory for all registered Business Owners
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3525cd]/10 text-[#3525cd] text-[11px] font-semibold shrink-0">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>Enforced</span>
                </div>
              </div>

              {/* DPA Compliance Row */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f1f3ff]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#e9edff] flex items-center justify-center text-[#005522] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">policy</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#141b2b]">
                      Data Privacy Act (DPA 2012)
                    </p>
                    <p className="text-[12px] text-[#464555]">
                      Automated log purge &amp; client PII masking
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00702f]/15 text-[#005522] text-[11px] font-semibold shrink-0">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Active</span>
                </div>
              </div>

              {/* Compliance Audit Meta Snippet */}
              <div className="flex items-center justify-between pt-1 px-1 text-[#464555]">
                <span className="text-[12px]">Last external security audit:</span>
                <span className="text-[11px] text-[#141b2b] font-semibold">
                  14 days ago (Passed 100%)
                </span>
              </div>
            </div>
          </div>
        </div>

          {/* SECTION 5: Visual Brand/Platform Trust Banner */}
          <div className="rounded-xl overflow-hidden shadow-xs relative p-4 bg-[#e9edff] flex items-center justify-between border border-[#dce2f7]">
            <div className="flex flex-col max-w-[75%]">
              <span className="text-[11px] text-[#3525cd] font-bold uppercase tracking-wider">
                Cloud Infrastructure
              </span>
              <p className="text-[14px] font-semibold text-[#141b2b] mt-0.5">
                Automated Backups Running
              </p>
              <p className="text-[12px] text-[#464555]">
                Encrypted snapshot scheduled at 03:00 GMT+8
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#3525cd] shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[24px]">cloud_sync</span>
            </div>
          </div>

          {/* Bottom Global Actions */}
          <div className="flex flex-col items-center gap-2 pt-1 pb-4">
            <button
              onClick={handleSaveGlobalSettings}
              disabled={saveStatus !== 'idle'}
              className={`w-full h-12 rounded-xl text-white text-[14px] font-semibold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer ${
                saveStatus === 'saved'
                  ? 'bg-[#00702f] hover:bg-[#005522]'
                  : 'bg-[#3525cd] hover:bg-[#3323cc]'
              }`}
              id="save-btn"
              type="button"
            >
              {saveStatus === 'saving' ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                  <span>Applying Parameters...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Global Parameters Synced!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>Save Global Changes</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsAuditLogModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 text-[#3525cd] hover:text-[#141b2b] text-[14px] font-medium transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>Audit Log History →</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal 1: Edit Platform Fee Rate */}
      {isEditFeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e9edff] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">price_change</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#141b2b]">Edit Platform Take-Rate</h3>
                  <p className="text-[11px] text-[#5a5e69]">Escrow Transaction Split Parameters</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditFeeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-semibold text-[#141b2b] block mb-1">
                  Percentage Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    value={tempFeePercent}
                    onChange={e => setTempFeePercent(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 px-3 rounded-xl bg-[#f1f3ff] border border-transparent focus:border-[#3525cd] text-[#141b2b] font-semibold text-[15px] outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#464555] text-[13px] font-bold">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#141b2b] block mb-1">
                  Fixed Gateway Surcharge (PHP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464555] font-bold text-[14px]">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={tempFeeFixed}
                    onChange={e => setTempFeeFixed(parseInt(e.target.value) || 0)}
                    className="w-full h-11 pl-8 pr-3 rounded-xl bg-[#f1f3ff] border border-transparent focus:border-[#3525cd] text-[#141b2b] font-semibold text-[15px] outline-none"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-[#464555] font-medium">Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTempFeePercent(1.8);
                    setTempFeeFixed(10);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] text-[11px] font-semibold"
                >
                  1.8% + ₱10
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempFeePercent(2.5);
                    setTempFeeFixed(15);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] text-[11px] font-semibold"
                >
                  2.5% + ₱15 (Std)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempFeePercent(3.5);
                    setTempFeeFixed(20);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] text-[11px] font-semibold"
                >
                  3.5% + ₱20
                </button>
              </div>

              <div className="p-3 bg-[#e9edff]/60 rounded-xl text-[12px] text-[#464555]">
                <p>
                  <strong>Example:</strong> For a ₱1,000 booking, the platform retains{' '}
                  <strong className="text-[#3525cd]">
                    ₱{((1000 * tempFeePercent) / 100 + tempFeeFixed).toFixed(2)}
                  </strong>
                  , and releases{' '}
                  <strong className="text-[#00702f]">
                    ₱{(1000 - ((1000 * tempFeePercent) / 100 + tempFeeFixed)).toFixed(2)}
                  </strong>{' '}
                  to the merchant escrow.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleApplyFeeChange}
                className="flex-1 h-10 rounded-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                Apply Fee Structure
              </button>
              <button
                onClick={() => setIsEditFeeModalOpen(false)}
                className="px-4 h-10 rounded-lg bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] text-[12px] font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Top Up SMS Credits */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e9edff] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#00702f]/10 text-[#00702f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">sms</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#141b2b]">Reload SMS Pool</h3>
                  <p className="text-[11px] text-[#5a5e69]">Semaphore Corporate Gateway Provider</p>
                </div>
              </div>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3.5 bg-[#f1f3ff] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#464555]">Active Pool Balance</span>
                <p className="text-[18px] font-bold text-[#141b2b]">
                  ₱{smsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <span className="text-[12px] text-[#00702f] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00702f]"></span>
                Healthy (~29,700 SMS)
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-[#141b2b]">
                Select Recharge Amount (GCash / Maya Corporate)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[1000, 3000, 5000, 10000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleTopUpBalance(amt)}
                    className="p-3 rounded-xl border border-[#e9edff] hover:border-[#3525cd] hover:bg-[#f1f3ff] text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[15px] font-bold text-[#141b2b] group-hover:text-[#3525cd] block">
                      +₱{amt.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#464555]">
                      ~{(amt / 0.5).toLocaleString()} SMS Credits
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="px-4 h-10 rounded-lg bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] text-[12px] font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Auto-Cancel Timeout Adjuster */}
      {isTimeoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e9edff] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">timer</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#141b2b]">Auto-Cancel Window</h3>
                  <p className="text-[11px] text-[#5a5e69]">Slot Release Policy Configuration</p>
                </div>
              </div>
              <button
                onClick={() => setIsTimeoutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-[#464555]">
                Define how long before an unconfirmed reservation the appointment is automatically
                cancelled and refunded to release stylist capacity.
              </p>

              {[
                { min: 60, label: '1 hour prior (Strict & Fast Pace)' },
                { min: 120, label: '2 hours prior (Recommended Platform Standard)' },
                { min: 180, label: '3 hours prior (Grace Window)' },
                { min: 240, label: '4 hours prior (Relaxed Merchant Window)' }
              ].map(item => (
                <button
                  key={item.min}
                  onClick={() => {
                    setAutoCancelTimeout(item.min);
                    setIsTimeoutModalOpen(false);
                    onTriggerToast(`Auto-cancel timeout configured to ${item.min} minutes! ⏱️`, 'timer');
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    autoCancelTimeout === item.min
                      ? 'border-[#3525cd] bg-[#e9edff]/40 text-[#141b2b] font-semibold'
                      : 'border-[#e9edff] hover:bg-[#f1f3ff] text-[#464555]'
                  }`}
                >
                  <span className="text-[13px]">{item.label}</span>
                  <span className="text-[13px] font-mono font-bold text-[#3525cd]">{item.min}m</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Audit Log History */}
      {isAuditLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-[#e9edff] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#141b2b]">Platform Parameter Audit Log</h3>
                  <p className="text-[11px] text-[#5a5e69]">Tamper-Proof Administrative Ledger</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditLogModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1 max-h-[50vh]">
              {auditLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#f1f3ff] border border-[#e9edff] flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#141b2b] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#3525cd]">
                        {log.icon}
                      </span>
                      {log.action}
                    </span>
                    <span className="text-[11px] text-[#464555]">{log.timestamp}</span>
                  </div>
                  <p className="text-[12px] text-[#464555]">{log.details}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#5a5e69] border-t border-[#e9edff]/50">
                    <span>
                      Actor: <strong>{log.author}</strong> ({log.role})
                    </span>
                    <span className="font-mono">{log.id}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e9edff]">
              <button
                onClick={() => {
                  onTriggerToast('Audit ledger exported to platform-audit-2026.csv 📄', 'download');
                  setIsAuditLogModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export Ledger (CSV)
              </button>
              <button
                onClick={() => setIsAuditLogModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] text-[12px] font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspector Modal Simulation */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div>
                <h3 className="text-[17px] font-bold text-[#141b2b]">{selectedInspection.name}</h3>
                <span className="text-[11px] text-[#464555]">Document Inspector Audit</span>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#e9edff] h-48 bg-gray-100 relative">
              <img referrerPolicy="no-referrer" 
                src={selectedInspection.image}
                alt="Document proof"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] px-2 py-1 rounded-md">
                Certified City Health &amp; Sanitary Permit 2026
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f1f3ff] text-[12px] flex flex-col gap-1 text-[#464555]">
              <div>
                DTI Registration: <strong className="text-[#141b2b]">Valid &amp; In Good Standing</strong>
              </div>
              <div>
                BIR Certificate of Registration (2303): <strong className="text-[#141b2b]">Verified</strong>
              </div>
              <div>
                Storefront GPS Confirmation: <strong className="text-[#141b2b]">Active Location</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#e9edff]">
              <button
                onClick={() => handleReject(selectedInspection.id, selectedInspection.name)}
                className="flex-1 py-2.5 rounded-xl bg-[#dee2ef] text-[#ba1a1a] text-[13px] font-semibold hover:bg-[#ffe5e5]"
              >
                Reject / Flag
              </button>
              <button
                onClick={() => handleApprove(selectedInspection.id, selectedInspection.name)}
                className="flex-1 py-2.5 rounded-xl bg-[#3525cd] text-white text-[13px] font-semibold hover:bg-[#4f46e5]"
              >
                Approve &amp; Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
