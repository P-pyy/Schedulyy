import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { ASSETS, INITIAL_STYLISTS, INITIAL_SERVICES } from '../data/mockData';
import { getMerchantKyc, submitMerchantKyc, getBusinessByOwnerId } from '../lib/database';
import { DbKycRequest } from '../lib/database.types';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';

interface BusinessOverviewScreenProps {
  bookings: Booking[];
  onNavigateTab: (tab: any) => void;
  onCheckInToggle: (bookingId: string) => void;
  onAddBooking?: (newBooking: Booking) => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const BusinessOverviewScreen: React.FC<BusinessOverviewScreenProps> = ({
  bookings,
  onNavigateTab,
  onCheckInToggle,
  onAddBooking,
  onTriggerToast
}) => {
  const { user } = useAuth();
  const [storeIsOpen, setStoreIsOpen] = useState(true);

  // Authenticated Business Owner Context
  const [ownerBusinessId, setOwnerBusinessId] = useState<string>('00000000-0000-0000-0000-000000000001');
  const [ownerBusinessName, setOwnerBusinessName] = useState<string>('Studio Bloom');

  // Modals
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);

  // KYC Verification State
  const [kycData, setKycData] = useState<DbKycRequest | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycTin, setKycTin] = useState('284-918-331-000');
  const [kycDti, setKycDti] = useState(true);
  const [kycMayorsPermit, setKycMayorsPermit] = useState(true);
  const [kycDocUrl, setKycDocUrl] = useState('https://scheduly.ph/docs/kyc/studio-bloom-mayors-permit-2026.pdf');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadKycAndBusiness() {
      let bizId = '00000000-0000-0000-0000-000000000001';
      let bizName = 'Studio Bloom';

      if (user?.id && isSupabaseConfigured) {
        try {
          const ownerBiz = await getBusinessByOwnerId(user.id);
          if (ownerBiz?.id) {
            bizId = ownerBiz.id;
            bizName = ownerBiz.name;
            if (isMounted) {
              setOwnerBusinessId(ownerBiz.id);
              setOwnerBusinessName(ownerBiz.name);
            }
          }
        } catch (e) {
          console.warn('Error resolving business for owner in overview:', e);
        }
      }

      try {
        const data = await getMerchantKyc(bizId);
        if (isMounted && data) {
          setKycData(data);
          if (data.tin) setKycTin(data.tin);
          setKycDti(data.dti_verified);
          setKycMayorsPermit(data.mayors_permit);
          if (data.document_url) setKycDocUrl(data.document_url);
        }
      } catch (err) {
        console.warn('Failed to load merchant KYC in overview:', err);
      }
    }
    loadKycAndBusiness();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kycData?.status === 'verified') {
      onTriggerToast('Business is already KYC verified.', 'verified');
      return;
    }
    if (!kycTin.trim()) {
      onTriggerToast('Please enter your business Tax Identification Number (TIN)', 'warning');
      return;
    }
    setIsSubmittingKyc(true);
    try {
      const updated = await submitMerchantKyc({
        business_id: ownerBusinessId,
        tin: kycTin.trim(),
        dti_verified: kycDti,
        mayors_permit: kycMayorsPermit,
        document_url: kycDocUrl.trim() || undefined
      });
      setKycData(updated);
      setIsKycModalOpen(false);
      onTriggerToast('Merchant verification documents submitted for compliance review! 🛡️', 'verified');
    } catch (err: any) {
      console.warn('Failed to submit KYC:', err);
      onTriggerToast(err.message || 'Failed to submit verification documents', 'error');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // New Booking Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('+63 9');
  const [newServiceTitle, setNewServiceTitle] = useState(INITIAL_SERVICES[0].title);
  const [newStylistName, setNewStylistName] = useState(INITIAL_STYLISTS[0].name);
  const [newTime, setNewTime] = useState('11:30 AM');
  const [newFee, setNewFee] = useState(INITIAL_SERVICES[0].price);

  // Block Time State
  const [blockStylist, setBlockStylist] = useState(INITIAL_STYLISTS[0].name);
  const [blockDuration, setBlockDuration] = useState('45 mins');
  const [blockReason, setBlockReason] = useState('Staff Lunch Break');

  const fillRates = [
    { day: 'Mon', rate: 78 },
    { day: 'Tue', rate: 84, active: true },
    { day: 'Wed', rate: 62 },
    { day: 'Thu', rate: 91 },
    { day: 'Fri', rate: 96 },
    { day: 'Sat', rate: 100 },
    { day: 'Sun', rate: 0, closed: true }
  ];

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      onTriggerToast('Please enter client name', 'error');
      return;
    }

    const matchedStylist = INITIAL_STYLISTS.find(s => s.name === newStylistName) || INITIAL_STYLISTS[0];
    const generatedId = `SC-${Math.floor(2000 + Math.random() * 8000)}`;

    const newBookingObj: Booking = {
      id: generatedId,
      bookingNumber: generatedId,
      clientName: newClientName.trim(),
      clientPhone: newClientPhone.trim() || '+63 900 000 0000',
      clientInitials: newClientName.trim().charAt(0).toUpperCase(),
      serviceTitle: newServiceTitle,
      stylistName: matchedStylist.name,
      stylistAvatar: matchedStylist.avatar,
      date: 'Tuesday, Oct 20, 2026',
      time: newTime,
      duration: '45 mins',
      fee: newFee,
      status: 'confirmed',
      paymentStatus: 'Unpaid',
      paymentMethod: 'Pay at Venue (Cash / GCash / Card)',
      location: 'Unit 302, High Street South, BGC, Taguig',
      businessName: 'Studio Bloom'
    };

    if (onAddBooking) {
      onAddBooking(newBookingObj);
    }
    setIsNewBookingModalOpen(false);
    setNewClientName('');
    onTriggerToast(`Appointment #${generatedId} booked for ${newClientName} at ${newTime}! ✂️`, 'check_circle');
  };

  const handleConfirmBlockTime = () => {
    setIsBlockTimeModalOpen(false);
    onTriggerToast(`Blocked ${blockDuration} for ${blockStylist} (${blockReason}) 🛑`, 'block');
  };

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-8 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Studio Header & Status Pill */}
      <section className="pt-4 pb-2">
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={ASSETS.ownerProfile}
                alt="Jamie Lim"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#3525cd]/20 shadow-xs"
              />
              <img
                src={ASSETS.studioLogo}
                alt="Studio Bloom"
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover absolute -bottom-0.5 -right-0.5 ring-2 ring-white shadow-xs"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[17px] font-bold text-[#141b2b] font-display">Jamie Lim</h1>
                <span className="text-[11px] font-semibold text-[#464555]">{ownerBusinessName}</span>
                {/* Merchant KYC Verification Pill */}
                <button
                  onClick={() => setIsKycModalOpen(true)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                    kycData?.status === 'verified'
                      ? 'bg-[#eafaf1] text-[#00702f] hover:bg-[#d5f5e3]'
                      : kycData?.status === 'rejected'
                      ? 'bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca]'
                      : 'bg-[#e9edff] text-[#3525cd] hover:bg-[#dce2f7]'
                  }`}
                  title="Click to view Merchant KYC verification status"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {kycData?.status === 'verified'
                      ? 'verified'
                      : kycData?.status === 'rejected'
                      ? 'warning'
                      : 'hourglass_top'}
                  </span>
                  <span>
                    {kycData?.status === 'verified'
                      ? 'KYC Verified'
                      : kycData?.status === 'rejected'
                      ? 'KYC Action Req.'
                      : 'KYC Pending'}
                  </span>
                </button>
              </div>
              <p className="text-[12px] text-[#464555]">High Street South BGC • Flagship</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsKycModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-[#e9edff] text-[12px] font-semibold text-[#464555] hover:text-[#141b2b] hover:bg-[#f1f3ff] transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#3525cd]">shield_with_heart</span>
              <span>Verification</span>
            </button>

            <button
              onClick={() => {
                setStoreIsOpen(!storeIsOpen);
                onTriggerToast(storeIsOpen ? 'Store set to Closed for Walk-ins' : 'Store is OPEN for online bookings! 🟢', 'storefront');
              }}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                storeIsOpen ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#dee2ef] text-[#424751]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${storeIsOpen ? 'bg-[#005522] animate-pulse' : 'bg-[#5a5e69]'}`}></span>
              <span>{storeIsOpen ? 'Open Now' : 'Paused'}</span>
            </button>
          </div>
        </div>

        {/* KYC Attention Banner if rejected */}
        {kycData?.status === 'rejected' && (
          <div className="mt-2 p-3 rounded-xl bg-[#fee2e2] border border-[#fecaca] flex items-center justify-between gap-3 text-[12px] text-[#991b1b]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>
                <strong>Verification Attention Needed:</strong> {kycData.issue_note || 'Document renewal needed'}.
              </span>
            </div>
            <button
              onClick={() => setIsKycModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[#ba1a1a] text-white text-[11px] font-bold hover:bg-[#93000a] cursor-pointer"
            >
              Fix Documents
            </button>
          </div>
        )}
      </section>

      {/* Quick Business Actions Row */}
      <section className="pt-2">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <button
            onClick={() => setIsNewBookingModalOpen(true)}
            className="p-3 rounded-xl bg-[#3525cd] text-white flex flex-col items-center justify-center gap-1 shadow-xs hover:bg-[#4f46e5] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span className="text-[12px] font-semibold">New Booking</span>
          </button>

          <button
            onClick={() => setIsBlockTimeModalOpen(true)}
            className="p-3 rounded-xl bg-white border border-[#e9edff] text-[#141b2b] flex flex-col items-center justify-center gap-1 shadow-xs hover:bg-[#f1f3ff] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#3525cd]">pause_circle</span>
            <span className="text-[12px] font-semibold">Block Time</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText('https://scheduly.ph/studiobloom');
              onTriggerToast('Public booking URL copied: scheduly.ph/studiobloom 🔗', 'content_copy');
            }}
            className="p-3 rounded-xl bg-white border border-[#e9edff] text-[#141b2b] flex flex-col items-center justify-center gap-1 shadow-xs hover:bg-[#f1f3ff] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#3525cd]">share</span>
            <span className="text-[12px] font-semibold">Share Link</span>
          </button>
        </div>
      </section>

      {/* KPI Metrics Quad Grid */}
      <section className="pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Metric 1 */}
          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#464555]">
              <span className="text-[12px] font-semibold">Today's Revenue</span>
              <span className="material-symbols-outlined text-[18px] text-[#00702f]">trending_up</span>
            </div>
            <div className="text-[22px] font-bold text-[#141b2b] font-display">₱14,850</div>
            <span className="text-[11px] text-[#00702f] font-semibold flex items-center gap-0.5">
              <span>+18.4%</span>
              <span className="text-[#464555] font-normal">vs last Tue</span>
            </span>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#464555]">
              <span className="text-[12px] font-semibold">Appointments</span>
              <span className="material-symbols-outlined text-[18px] text-[#3525cd]">calendar_today</span>
            </div>
            <div className="text-[22px] font-bold text-[#141b2b] font-display">{bookings.length}</div>
            <span className="text-[11px] text-[#3525cd] font-semibold">{bookings.filter(b => !b.isCheckedIn).length} remaining today</span>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#464555]">
              <span className="text-[12px] font-semibold">Chair Fill Rate</span>
              <span className="material-symbols-outlined text-[18px] text-[#3525cd]">donut_large</span>
            </div>
            <div className="text-[22px] font-bold text-[#141b2b] font-display">84%</div>
            <span className="text-[11px] text-[#00702f] font-semibold">+6% optimal</span>
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#464555]">
              <span className="text-[12px] font-semibold">Avg Ticket</span>
              <span className="material-symbols-outlined text-[18px] text-[#3525cd]">receipt</span>
            </div>
            <div className="text-[22px] font-bold text-[#141b2b] font-display">₱1,238</div>
            <span className="text-[11px] text-[#464555]">Across 3 specialists</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Schedule (Left) & Analytics/Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Today's Agenda Timeline */}
        <section className="lg:col-span-7 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#141b2b] font-display">Today's Schedule</h3>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-[12px] font-semibold text-[#3525cd] hover:underline cursor-pointer"
            >
              Full Calendar →
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {bookings.map(b => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#3525cd]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center w-14 shrink-0 bg-[#f1f3ff] p-1.5 rounded-xl border border-[#e9edff]">
                    <span className="text-[13px] font-bold text-[#141b2b] block">{b.time.split(' ')[0]}</span>
                    <span className="text-[10px] uppercase font-bold text-[#777587] block leading-none">
                      {b.time.split(' ')[1]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[14px] font-bold text-[#141b2b]">{b.clientName}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-[#7ffc97] text-[#002109]'
                            : b.status === 'pending'
                            ? 'bg-[#ffe8b3] text-[#78350f]'
                            : 'bg-[#e9edff] text-[#464555]'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#464555]">
                      {b.serviceTitle} • {b.stylistName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f3ff]">
                  <span className="text-[14px] font-bold text-[#141b2b] font-display">
                    ₱{b.fee.toLocaleString()}
                  </span>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(b.clientPhone);
                      onTriggerToast(`Client phone copied: ${b.clientPhone} 📞`, 'call');
                    }}
                    className="p-2 rounded-xl bg-[#f1f3ff] text-[#464555] hover:text-[#3525cd] cursor-pointer"
                    title="Call / Copy Phone"
                  >
                    <span className="material-symbols-outlined text-[17px]">call</span>
                  </button>

                  <button
                    onClick={() => onCheckInToggle(b.id)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      b.isCheckedIn
                        ? 'bg-[#7ffc97] text-[#002109]'
                        : 'bg-[#e9edff] text-[#3525cd] hover:bg-[#dce2f7]'
                    }`}
                    title={b.isCheckedIn ? 'Checked in' : 'Click to check in'}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {b.isCheckedIn ? 'how_to_reg' : 'person_check'}
                    </span>
                    <span>{b.isCheckedIn ? 'Arrived' : 'Check In'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Analytics & Chair Live Status */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Weekly Fill Rate Visual Chart */}
          <section className="flex flex-col">
            <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-[#141b2b]">Weekly Fill Rate</h3>
                  <p className="text-[11px] text-[#464555]">Floor capacity utilization</p>
                </div>
                <span className="text-[14px] font-bold text-[#3525cd]">Avg: 85%</span>
              </div>

              <div className="h-28 flex items-end justify-between gap-2 pt-2">
                {fillRates.map((f, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-semibold text-[#464555]">
                      {f.closed ? 'Off' : `${f.rate}%`}
                    </span>
                    <div className="w-full bg-[#f1f3ff] rounded-lg h-20 relative flex items-end overflow-hidden">
                      <div
                        style={{ height: `${f.rate}%` }}
                        className={`w-full rounded-t transition-all duration-500 ${
                          f.active ? 'bg-[#3525cd]' : f.closed ? 'bg-transparent' : 'bg-[#3525cd]/40'
                        }`}
                      ></div>
                    </div>
                    <span className={`text-[11px] font-bold ${f.active ? 'text-[#3525cd]' : 'text-[#777587]'}`}>
                      {f.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Floor / Chair Live Status */}
          <section className="flex flex-col">
            <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#141b2b]">Chair &amp; Station Status</h3>
                <span className="text-[11px] text-[#00702f] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00702f]"></span>
                  Live Sync
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-[#e9edff] flex flex-col gap-1 text-center">
                  <span className="text-[11px] font-semibold text-[#464555]">Chair 1 (Maria)</span>
                  <span className="text-[12px] font-bold text-[#3525cd]">In Service</span>
                  <span className="text-[10px] text-[#464555] truncate">Alex Santos</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#fff8e6] flex flex-col gap-1 text-center">
                  <span className="text-[11px] font-semibold text-[#464555]">Chair 2 (Jamie)</span>
                  <span className="text-[12px] font-bold text-amber-700">Prep Station</span>
                  <span className="text-[10px] text-[#464555] truncate">Balayage setup</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#eafaf1] flex flex-col gap-1 text-center">
                  <span className="text-[11px] font-semibold text-[#464555]">Chair 3 (Julian)</span>
                  <span className="text-[12px] font-bold text-[#00702f]">Available</span>
                  <span className="text-[10px] text-[#00702f] font-medium">Walk-ins open</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#f1f3ff]">
                <span className="text-[11px] text-[#464555]">Staff schedule synchronized</span>
                <button
                  onClick={() => onNavigateTab('services')}
                  className="text-[12px] font-semibold text-[#3525cd] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Team &amp; Working Hours →</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ================= MODAL: QUICK WALK-IN / NEW BOOKING ================= */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[22px]">add_circle</span>
                <h3 className="text-[16px] font-bold text-[#141b2b]">New Appointment / Walk-In</h3>
              </div>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#464555] hover:text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Christine Gomez"
                  className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Client Mobile Number
                </label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+63 917 555 0192"
                  className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Service
                  </label>
                  <select
                    value={newServiceTitle}
                    onChange={(e) => {
                      setNewServiceTitle(e.target.value);
                      const svc = INITIAL_SERVICES.find(s => s.title === e.target.value);
                      if (svc) setNewFee(svc.price);
                    }}
                    className="w-full mt-1 px-2 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[12px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  >
                    {INITIAL_SERVICES.map(s => (
                      <option key={s.id} value={s.title}>{s.title} (₱{s.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Stylist / Specialist
                  </label>
                  <select
                    value={newStylistName}
                    onChange={(e) => setNewStylistName(e.target.value)}
                    className="w-full mt-1 px-2 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[12px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  >
                    {INITIAL_STYLISTS.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Time Slot
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full mt-1 px-2 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[12px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  >
                    {['09:30 AM', '10:45 AM', '11:30 AM', '01:15 PM', '02:30 PM', '04:00 PM', '05:30 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Fee (₱)
                  </label>
                  <input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(Number(e.target.value))}
                    className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#e9edff] mt-2">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-[#e9edff] text-[#464555] text-[13px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold shadow-xs cursor-pointer"
                >
                  Confirm &amp; Add Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BLOCK TIME ================= */}
      {isBlockTimeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[22px]">pause_circle</span>
                <h3 className="text-[16px] font-bold text-[#141b2b]">Block Schedule Slot</h3>
              </div>
              <button
                onClick={() => setIsBlockTimeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#464555] hover:text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Staff Member
                </label>
                <select
                  value={blockStylist}
                  onChange={(e) => setBlockStylist(e.target.value)}
                  className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none"
                >
                  <option value="All Staff">All Staff (Entire Salon)</option>
                  {INITIAL_STYLISTS.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Duration
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['30 mins', '45 mins', '1 hour', '2 hours'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setBlockDuration(d)}
                      className={`py-2 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${
                        blockDuration === d
                          ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs'
                          : 'bg-white text-[#141b2b] border-[#e9edff] hover:bg-[#f1f3ff]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Reason
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none"
                >
                  <option>Staff Lunch Break</option>
                  <option>Sanitizing & Equipment Cleaning</option>
                  <option>Team Huddle / Training</option>
                  <option>Private VIP Booking</option>
                  <option>Emergency Maintenance</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#e9edff]">
                <button
                  type="button"
                  onClick={() => setIsBlockTimeModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-[#e9edff] text-[#464555] text-[13px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlockTime}
                  className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Block
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: MERCHANT KYC VERIFICATION ================= */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[22px]">verified_user</span>
                <h3 className="text-[16px] font-bold text-[#141b2b]">Business Verification (KYC)</h3>
              </div>
              <button
                onClick={() => setIsKycModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#464555] hover:text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Current KYC Status Banner */}
            <div
              className={`p-3 rounded-2xl border flex flex-col gap-1 ${
                kycData?.status === 'verified'
                  ? 'bg-[#eafaf1] border-[#7ffc97] text-[#002109]'
                  : kycData?.status === 'rejected'
                  ? 'bg-[#fff0f0] border-[#ffb4ab] text-[#ba1a1a]'
                  : 'bg-[#e9edff] border-[#c8d5ff] text-[#141b2b]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[13px]">
                <span className="material-symbols-outlined text-[18px]">
                  {kycData?.status === 'verified'
                    ? 'verified'
                    : kycData?.status === 'rejected'
                    ? 'error'
                    : 'hourglass_top'}
                </span>
                <span>
                  {kycData?.status === 'verified'
                    ? 'Status: Verified & Active Partner'
                    : kycData?.status === 'rejected'
                    ? 'Status: Action Required (Rejected)'
                    : 'Status: Pending Verification'}
                </span>
              </div>
              <div className="text-[12px] opacity-90 leading-relaxed">
                {kycData?.status === 'verified' ? (
                  <p>{ownerBusinessName} is verified. Cleared for instant digital checkouts, directory discovery, and daily payouts.</p>
                ) : kycData?.status === 'rejected' ? (
                  <div className="flex flex-col gap-0.5">
                    <p>
                      <strong>{kycData.issue_note || 'Correction Needed'}:</strong> {kycData.issue_detail || 'Please update and resubmit your valid business permits.'}
                    </p>
                    <p className="text-[11px] opacity-80">Correct the fields below and resubmit for compliance re-examination.</p>
                  </div>
                ) : (
                  <p>Your verification documents are queued for automated & supervisory compliance review.</p>
                )}
              </div>
            </div>

            {/* KYC Submission Form */}
            <form onSubmit={handleSubmitKyc} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  BIR Tax Identification Number (TIN) *
                </label>
                <input
                  type="text"
                  required
                  disabled={kycData?.status === 'verified'}
                  value={kycTin}
                  onChange={e => setKycTin(e.target.value)}
                  placeholder="e.g. 284-918-331-000"
                  className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] font-mono focus:outline-none focus:border-[#3525cd] disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#f9f9ff] border border-[#e9edff]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Regulatory Permits &amp; Clearances
                </span>

                <label className={`flex items-center justify-between gap-3 ${kycData?.status === 'verified' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}>
                  <span className="text-[13px] font-medium text-[#141b2b]">
                    DTI Certificate of Registration
                  </span>
                  <input
                    type="checkbox"
                    disabled={kycData?.status === 'verified'}
                    checked={kycDti}
                    onChange={e => setKycDti(e.target.checked)}
                    className="w-5 h-5 text-[#3525cd] rounded cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>

                <label className={`flex items-center justify-between gap-3 ${kycData?.status === 'verified' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}>
                  <span className="text-[13px] font-medium text-[#141b2b]">
                    2026 Mayor's / LGU Business Permit
                  </span>
                  <input
                    type="checkbox"
                    disabled={kycData?.status === 'verified'}
                    checked={kycMayorsPermit}
                    onChange={e => setKycMayorsPermit(e.target.checked)}
                    className="w-5 h-5 text-[#3525cd] rounded cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Document Storage URL / PDF Permit Link
                  </label>
                  {kycDocUrl && (
                    <a
                      href={kycDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-[#3525cd] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Preview</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  disabled={kycData?.status === 'verified'}
                  value={kycDocUrl}
                  onChange={e => setKycDocUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[12px] text-[#141b2b] font-mono focus:outline-none focus:border-[#3525cd] disabled:opacity-70 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-[11px] text-[#777587] leading-tight">
                  Direct file upload requires a Supabase Storage bucket. You can provide a direct secure link (Google Drive, cloud PDF, Dropbox, or hosted file) above.
                </p>
              </div>

              {kycData?.status === 'verified' && (
                <div className="p-2.5 rounded-xl bg-[#eafaf1] text-[#00702f] text-[11px] flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[15px]">lock</span>
                  <span>Compliance records are verified and locked. Contact support for regulatory amendments.</span>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-[#e9edff]">
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-[#e9edff] text-[#464555] text-[13px] font-semibold cursor-pointer"
                >
                  Close
                </button>
                {kycData?.status === 'verified' ? (
                  <div className="flex-1 py-2.5 rounded-xl bg-[#eafaf1] text-[#00702f] border border-[#7ffc97] text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-default">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Verified Partner</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmittingKyc}
                    className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingKyc ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span>Submitting...</span>
                      </>
                    ) : kycData?.status === 'rejected' ? (
                      <span>Resubmit KYC Documents</span>
                    ) : kycData?.status === 'pending' ? (
                      <span>Update KYC Documents</span>
                    ) : (
                      <span>Submit Verification Documents</span>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
