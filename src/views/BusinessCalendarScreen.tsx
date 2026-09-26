import React, { useState } from 'react';
import { Booking } from '../types';
import { INITIAL_STYLISTS, ASSETS } from '../data/mockData';

interface BusinessCalendarScreenProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onAddAppointment: () => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

interface CalendarEvent {
  id: string;
  time: string;
  clientName?: string;
  clientPhone?: string;
  serviceTitle?: string;
  specialist?: string;
  chair?: string;
  duration?: string;
  fee?: number;
  status?: string;
  statusLabel?: string;
  statusBg?: string;
  dotColor?: string;
  ringColor?: string;
  barColor?: string;
  paymentNote?: string;
  stylistId?: string;
  avatar?: string;
  isWalkinSlot?: boolean;
  isBuffer?: boolean;
  label?: string;
  isHighlighted?: boolean;
}

export const BusinessCalendarScreen: React.FC<BusinessCalendarScreenProps> = ({
  bookings,
  onSelectBooking,
  onAddAppointment,
  onTriggerToast
}) => {
  const [activeView, setActiveView] = useState<'day' | '3day' | 'week'>('day');
  const [selectedStylist, setSelectedStylist] = useState<string>('all');
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // 1 = Tuesday Oct 20 (Today)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [inspectBooking, setInspectBooking] = useState<CalendarEvent | null>(null);

  const datesList = [
    { label: 'Monday', short: 'Mon', day: '19', full: 'Monday, Oct 19, 2026', isToday: false },
    { label: 'Tuesday', short: 'Tue', day: '20', full: 'Tuesday, Oct 20, 2026', isToday: true },
    { label: 'Wednesday', short: 'Wed', day: '21', full: 'Wednesday, Oct 21, 2026', isToday: false },
    { label: 'Thursday', short: 'Thu', day: '22', full: 'Thursday, Oct 22, 2026', isToday: false },
    { label: 'Friday', short: 'Fri', day: '23', full: 'Friday, Oct 23, 2026', isToday: false },
    { label: 'Saturday', short: 'Sat', day: '24', full: 'Saturday, Oct 24, 2026', isToday: false },
    { label: 'Sunday', short: 'Sun', day: '25', full: 'Sunday, Oct 25, 2026', isToday: false },
  ];

  const currentDate = datesList[selectedDateIndex];

  // Base schedule events for Tuesday Oct 20
  const defaultEvents: CalendarEvent[] = [
    {
      id: 'evt-1',
      time: '09:30 AM',
      clientName: 'Sarah Tan',
      clientPhone: '+63 919 333 1122',
      serviceTitle: 'Styling & Blowout',
      specialist: 'Maria Santos',
      chair: 'Chair 1',
      duration: '35m',
      fee: 380,
      status: 'completed',
      statusLabel: 'Completed',
      statusBg: 'bg-[#e9edff] text-[#00702f]',
      dotColor: 'bg-[#00702f]',
      ringColor: 'ring-[#7ffc97]/40',
      barColor: 'bg-[#7ffc97]',
      paymentNote: 'Paid via GCash',
      stylistId: 'st-1',
      avatar: ASSETS.mayaAvatar
    },
    {
      id: 'evt-2',
      time: '10:45 AM',
      clientName: 'Alex Santos',
      clientPhone: '+63 917 555 0192',
      serviceTitle: 'Signature Haircut & Wash',
      specialist: 'Maria Santos',
      chair: 'Chair 1',
      duration: '45m',
      fee: 450,
      status: 'arriving',
      statusLabel: 'Arriving Next',
      statusBg: 'bg-[#7ffc97] text-[#002109]',
      dotColor: 'bg-[#3525cd]',
      ringColor: 'ring-[#3525cd]/30',
      barColor: 'bg-[#3525cd]',
      paymentNote: 'Pay at Venue',
      stylistId: 'st-1',
      avatar: ASSETS.alexAvatar,
      isHighlighted: true
    },
    {
      id: 'evt-slot-walkin',
      time: '11:30 AM',
      isWalkinSlot: true,
      duration: '30m',
      label: '30-min Walk-in Slot Open'
    },
    {
      id: 'evt-lunch',
      time: '12:00 PM',
      isBuffer: true,
      duration: '45m',
      label: 'Staff Lunch Rotation Buffer (45 mins)'
    },
    {
      id: 'evt-3',
      time: '01:15 PM',
      clientName: 'Camille David',
      clientPhone: '+63 928 444 8812',
      serviceTitle: 'Balayage & Gloss Treatment',
      specialist: 'Jamie Lim',
      chair: 'Chair 2',
      duration: '120m',
      fee: 2400,
      status: 'deposit_paid',
      statusLabel: 'Deposit Paid',
      statusBg: 'bg-[#e2dfff] text-[#3323cc]',
      dotColor: 'bg-[#4f46e5]',
      ringColor: 'ring-[#4f46e5]/30',
      barColor: 'bg-[#4f46e5]',
      paymentNote: '₱1,200 balance due',
      stylistId: 'st-2',
      avatar: ASSETS.camilleAvatar
    },
    {
      id: 'evt-4',
      time: '03:30 PM',
      clientName: 'Paolo Roxas',
      clientPhone: '+63 905 111 9283',
      serviceTitle: 'Classic Fade & Beard Trim',
      specialist: 'Julian Cruz',
      chair: 'Chair 3',
      duration: '45m',
      fee: 450,
      status: 'pending',
      statusLabel: 'Needs Action',
      statusBg: 'bg-[#ffe8b3] text-[#78350f]',
      dotColor: 'bg-amber-500',
      ringColor: 'ring-amber-300/40',
      barColor: 'bg-amber-400',
      paymentNote: 'Pending approval',
      stylistId: 'st-3',
      avatar: ASSETS.marcoAvatar
    }
  ];

  // Dynamic additional bookings from user actions
  const extraBookings: CalendarEvent[] = bookings
    .filter(b => b.id !== 'SC-8921' && b.id !== 'SC-8920' && b.id !== 'SC-8919' && b.id !== 'SC-8918')
    .map(b => ({
      id: b.id,
      time: b.time || '04:30 PM',
      clientName: b.clientName,
      clientPhone: b.clientPhone || '+63 917 000 0000',
      serviceTitle: b.serviceTitle,
      specialist: b.stylistName || 'Maria Santos',
      chair: 'Chair 1',
      duration: b.duration || '45m',
      fee: b.fee,
      status: b.status,
      statusLabel: b.status === 'confirmed' ? 'Confirmed' : 'Pending',
      statusBg: b.status === 'confirmed' ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffe8b3] text-[#78350f]',
      dotColor: 'bg-[#3525cd]',
      ringColor: 'ring-[#3525cd]/30',
      barColor: 'bg-[#3525cd]',
      paymentNote: b.paymentStatus || 'Pay at Venue',
      stylistId: b.stylistName?.includes('Jamie') ? 'st-2' : b.stylistName?.includes('Julian') ? 'st-3' : 'st-1',
      avatar: b.clientAvatar || ASSETS.alexAvatar
    }));

  const allDayEvents: CalendarEvent[] = [...defaultEvents, ...extraBookings];

  // Filter by selected stylist
  const filteredEvents = allDayEvents.filter(evt => {
    if (selectedStylist === 'all') return true;
    if (evt.isBuffer || evt.isWalkinSlot) return true;
    return evt.stylistId === selectedStylist;
  });

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-12 max-w-7xl mx-auto px-4 lg:px-8">
      {/* ================= CALENDAR CONTROL CARD (SAME STANDARD AS OVERVIEW & CLIENTS) ================= */}
      <section className="pt-4 pb-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex flex-col gap-4">
          {/* Top Row: Date Navigator, View Switcher & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Date selector with arrows */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedDateIndex(prev => Math.max(0, prev - 1))}
                disabled={selectedDateIndex === 0}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#464555] hover:bg-[#e9edff] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer border border-[#e9edff]"
                title="Previous Day"
              >
                <span className="material-symbols-outlined text-[19px]">chevron_left</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#e9edff] border border-[#e9edff] transition-colors cursor-pointer group text-left"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-[#3525cd]">calendar_today</span>
                      <h1 className="text-[15px] sm:text-[17px] font-bold text-[#141b2b] font-display whitespace-nowrap">
                        {currentDate.label}, Oct {currentDate.day}
                      </h1>
                      <span className="material-symbols-outlined text-[16px] text-[#777587] group-hover:text-[#3525cd]">
                        keyboard_arrow_down
                      </span>
                    </div>
                  </div>
                </button>

                {/* Date Dropdown Quick Menu */}
                {isDatePickerOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl p-2.5 shadow-xl border border-[#e9edff] z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[11px] font-bold text-[#777587] uppercase tracking-wider px-3 py-1.5">
                      Select Schedule Date
                    </div>
                    <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                      {datesList.map((d, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedDateIndex(idx);
                            setIsDatePickerOpen(false);
                            onTriggerToast(`Viewing schedule for ${d.full}`, 'calendar_today');
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${
                            idx === selectedDateIndex
                              ? 'bg-[#3525cd] text-white'
                              : 'hover:bg-[#f1f3ff] text-[#141b2b]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{d.short}, Oct {d.day}</span>
                            {d.isToday && (
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${idx === selectedDateIndex ? 'bg-white/20 text-white' : 'bg-[#7ffc97] text-[#002109]'}`}>
                                Today
                              </span>
                            )}
                          </div>
                          {idx === selectedDateIndex && (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedDateIndex(prev => Math.min(datesList.length - 1, prev + 1))}
                disabled={selectedDateIndex === datesList.length - 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#464555] hover:bg-[#e9edff] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer border border-[#e9edff]"
                title="Next Day"
              >
                <span className="material-symbols-outlined text-[19px]">chevron_right</span>
              </button>

              {!currentDate.isToday ? (
                <button
                  onClick={() => {
                    setSelectedDateIndex(1);
                    onTriggerToast('Jumped to Today 📅', 'today');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#e9edff] text-[#3525cd] text-[11px] font-bold hover:bg-[#dce2f7] transition-all cursor-pointer"
                >
                  Back to Today
                </button>
              ) : (
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-xl bg-[#7ffc97]/40 text-[#004d1f] text-[11px] font-bold items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00702f] animate-pulse"></span>
                  Live Today
                </span>
              )}
            </div>

            {/* Right: View Switcher (Day / 3-Day / Week) & Add Button */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <div className="flex items-center bg-[#f1f3ff] p-1 rounded-xl border border-[#e9edff]">
                <button
                  onClick={() => {
                    setActiveView('day');
                    onTriggerToast('Switched to Single Day view', 'view_day');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    activeView === 'day' ? 'bg-[#3525cd] text-white shadow-xs' : 'text-[#464555] hover:text-[#141b2b]'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => {
                    setActiveView('3day');
                    onTriggerToast('Switched to 3-Day multi-column view', 'view_column');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    activeView === '3day' ? 'bg-[#3525cd] text-white shadow-xs' : 'text-[#464555] hover:text-[#141b2b]'
                  }`}
                >
                  3-Day
                </button>
                <button
                  onClick={() => {
                    setActiveView('week');
                    onTriggerToast('Switched to 7-Day Weekly Overview', 'view_week');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    activeView === 'week' ? 'bg-[#3525cd] text-white shadow-xs' : 'text-[#464555] hover:text-[#141b2b]'
                  }`}
                >
                  Week
                </button>
              </div>

              <button
                onClick={onAddAppointment}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3525cd] text-white text-[12px] font-bold hover:bg-[#4f46e5] active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>New Booking</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Staff Filter Pills & Metrics Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-[#f1f3ff]">
            {/* Specialist filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => {
                  setSelectedStylist('all');
                  onTriggerToast('Showing all specialist schedules', 'group');
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                  selectedStylist === 'all'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e9edff]'
                }`}
              >
                All Specialists (3)
              </button>

              {INITIAL_STYLISTS.map(st => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedStylist(st.id);
                    onTriggerToast(`Filtered schedule for ${st.name}`, 'person');
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                    selectedStylist === st.id
                      ? 'bg-[#3525cd] text-white shadow-xs'
                      : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e9edff]'
                  }`}
                >
                  <img referrerPolicy="no-referrer"  src={st.avatar} alt={st.name} className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white" />
                  <span>{st.name}</span>
                </button>
              ))}
            </div>

            {/* Quick Metrics Badge on Desktop */}
            <div className="hidden lg:flex items-center gap-3 text-[12px] text-[#464555]">
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00702f]"></span>
                <span>3 Chairs Active</span>
              </span>
              <span className="text-[#dee2ef]">•</span>
              <span className="font-semibold text-[#141b2b]">12 Appointments</span>
              <span className="text-[#dee2ef]">•</span>
              <span className="font-bold text-[#3525cd] font-display">₱14,850 Revenue</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VIEW 1: DAY TIMELINE VIEW ================= */}
      {activeView === 'day' && (
        <section className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left & Center: Full-Width Timeline (lg:col-span-8 xl:col-span-9) */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-2">
              
              {/* Event 1: 09:30 AM (Sarah Tan) - FULLY VISIBLE, NEVER CROPPED */}
              {filteredEvents.some(e => e.id === 'evt-1') && (
                <div className="flex items-start gap-2.5 sm:gap-4 group">
                  <div className="w-16 sm:w-20 shrink-0 text-right pt-3 font-mono text-[12px] sm:text-[13px] font-bold text-[#464555]">
                    09:30 AM
                  </div>

                  <div className="flex flex-col items-center self-stretch shrink-0 relative w-4">
                    <div className="w-3 h-3 rounded-full mt-4 z-10 shrink-0 bg-[#00702f] ring-4 ring-[#7ffc97]/40" />
                    <div className="w-[2px] bg-[#e1e5f2] flex-1 my-0.5" />
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div
                      onClick={() => {
                        setInspectBooking(defaultEvents[0]);
                        onTriggerToast('Sarah Tan appointment completed at 10:05 AM', 'check_circle');
                      }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex items-center justify-between gap-3 hover:border-[#3525cd] hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img referrerPolicy="no-referrer" 
                          src={ASSETS.mayaAvatar}
                          alt="Sarah Tan"
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#7ffc97]/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[14px] sm:text-[15px] font-bold text-[#141b2b] truncate">
                              Sarah Tan
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-[#e9edff] text-[#00702f] text-[10px] sm:text-[11px] font-bold shrink-0">
                              Completed
                            </span>
                          </div>
                          <p className="text-[12px] text-[#464555] font-medium truncate">
                            Styling &amp; Blowout (35m)
                          </p>
                          <p className="text-[11px] text-[#777587] truncate">
                            Specialist: Maria Santos • Chair 1
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[15px] sm:text-[16px] font-bold text-[#141b2b] font-display">₱380</span>
                        <span className="block text-[10px] text-[#00702f] font-semibold whitespace-nowrap">
                          Paid via GCash
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= LIVE TIME INDICATOR (10:20 AM NOW) ================= */}
              {currentDate.isToday && (
                <div className="flex items-center gap-2.5 sm:gap-4 my-2 py-1.5">
                  <div className="w-16 sm:w-20 shrink-0 text-right font-mono text-[11px] sm:text-[12px] font-bold text-[#ba1a1a]">
                    10:20 AM
                  </div>

                  <div className="flex items-center justify-center shrink-0 w-4">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#ba1a1a] ring-4 ring-[#ba1a1a]/30 shrink-0 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-[2px] bg-[#ba1a1a] flex-1 min-w-[20px]" />
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-[#ba1a1a] text-white text-[10px] sm:text-[11px] font-bold font-mono tracking-tight shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      10:20 AM CURRENT TIME
                    </span>
                  </div>
                </div>
              )}

              {/* Event 2: 10:45 AM (Alex Santos - Arriving Next) */}
              {filteredEvents.some(e => e.id === 'evt-2') && (
                <div className="flex items-start gap-2.5 sm:gap-4 group">
                  <div className="w-16 sm:w-20 shrink-0 text-right pt-3 font-mono text-[12px] sm:text-[13px] font-bold text-[#3525cd]">
                    10:45 AM
                  </div>

                  <div className="flex flex-col items-center self-stretch shrink-0 relative w-4">
                    <div className="w-3.5 h-3.5 rounded-full mt-4 z-10 shrink-0 bg-[#3525cd] ring-4 ring-[#3525cd]/25" />
                    <div className="w-[2px] bg-[#e1e5f2] flex-1 my-0.5" />
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div
                      onClick={() => {
                        setInspectBooking(defaultEvents[1]);
                        onTriggerToast('Alex Santos: Confirmed for Signature Haircut (Maria Santos)', 'content_cut');
                      }}
                      className="p-4 rounded-2xl bg-white border-2 border-[#3525cd] shadow-md flex items-center justify-between gap-3 hover:shadow-lg transition-all cursor-pointer ring-4 ring-[#3525cd]/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img referrerPolicy="no-referrer" 
                          src={ASSETS.alexAvatar}
                          alt="Alex Santos"
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-[#3525cd]/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[14px] sm:text-[16px] font-bold text-[#141b2b] truncate">
                              Alex Santos
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-md bg-[#7ffc97] text-[#002109] text-[10px] sm:text-[11px] font-bold shrink-0">
                              Arriving Next
                            </span>
                          </div>
                          <p className="text-[12px] sm:text-[13px] font-semibold text-[#3525cd] truncate">
                            Signature Haircut &amp; Wash (45m)
                          </p>
                          <p className="text-[11px] text-[#464555] truncate">
                            Specialist: Maria Santos • Chair 1 • Clean tools prepped
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[16px] sm:text-[18px] font-bold text-[#141b2b] font-display">₱450</span>
                        <span className="block text-[10px] sm:text-[11px] text-[#00702f] font-semibold whitespace-nowrap">
                          Pay at Venue
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event 3: 11:30 AM (Walk-in Slot Open) */}
              {filteredEvents.some(e => e.id === 'evt-slot-walkin') && (
                <div className="flex items-start gap-2.5 sm:gap-4 group">
                  <div className="w-16 sm:w-20 shrink-0 text-right pt-3 font-mono text-[12px] sm:text-[13px] font-bold text-[#777587]">
                    11:30 AM
                  </div>

                  <div className="flex flex-col items-center self-stretch shrink-0 relative w-4">
                    <div className="w-2.5 h-2.5 rounded-full mt-4 z-10 shrink-0 bg-[#c7c4d8]" />
                    <div className="w-[2px] bg-[#e1e5f2] flex-1 my-0.5" />
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div className="p-3 sm:p-4 rounded-2xl border-2 border-dashed border-[#c7c4d8] bg-[#f9f9ff] flex items-center justify-between gap-3 hover:border-[#3525cd] hover:bg-white transition-all">
                      <div className="flex items-center gap-2.5 text-[#464555] min-w-0">
                        <span className="material-symbols-outlined text-[22px] text-[#00702f] shrink-0">add_circle</span>
                        <div>
                          <span className="text-[12px] sm:text-[13px] font-bold text-[#141b2b] block truncate">
                            30-min Walk-in Slot Open
                          </span>
                          <span className="text-[11px] text-[#777587] block truncate">
                            Available with Maria Santos or Julian Cruz
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={onAddAppointment}
                        className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#3525cd] text-white text-[12px] font-bold hover:bg-[#4f46e5] active:scale-95 transition-all cursor-pointer shadow-xs"
                      >
                        + Fill Slot
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Event 4: 12:00 PM (Staff Lunch Break) */}
              {filteredEvents.some(e => e.id === 'evt-lunch') && (
                <div className="flex items-start gap-2.5 sm:gap-4 group">
                  <div className="w-16 sm:w-20 shrink-0 text-right pt-2.5 font-mono text-[12px] sm:text-[13px] font-bold text-[#777587]">
                    12:00 PM
                  </div>

                  <div className="flex flex-col items-center self-stretch shrink-0 relative w-4">
                    <div className="w-2 h-2 rounded-full mt-3.5 z-10 shrink-0 bg-[#c7c4d8]" />
                    <div className="w-[2px] bg-[#e1e5f2] flex-1 my-0.5" />
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div className="p-3 rounded-2xl bg-[#e9edff] text-[#464555] flex items-center justify-between gap-3 text-[12px] font-semibold border border-[#dce2f7]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-[#3525cd] shrink-0">restaurant</span>
                        <span className="truncate">Staff Lunch Rotation Buffer (45 mins) • Staggered Coverage</span>
                      </div>
                      <span className="text-[11px] text-[#3525cd] font-bold shrink-0">12:00 - 12:45 PM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Event 5: 01:15 PM (Camille David) */}
              {filteredEvents.some(e => e.id === 'evt-3') && (
                <div className="flex items-start gap-2.5 sm:gap-4 group">
                  <div className="w-16 sm:w-20 shrink-0 text-right pt-3 font-mono text-[12px] sm:text-[13px] font-bold text-[#464555]">
                    01:15 PM
                  </div>

                  <div className="flex flex-col items-center self-stretch shrink-0 relative w-4">
                    <div className="w-3 h-3 rounded-full mt-4 z-10 shrink-0 bg-[#4f46e5] ring-4 ring-[#4f46e5]/25" />
                    <div className="w-[2px] bg-[#e1e5f2] flex-1 my-0.5" />
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div
                      onClick={() => {
                        setInspectBooking(defaultEvents[4]);
                        onTriggerToast('Camille David: Balayage & Gloss (2 hours). Deposit ₱1,200 paid.', 'palette');
                      }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex items-center justify-between gap-3 hover:border-[#3525cd] hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img referrerPolicy="no-referrer" 
                          src={ASSETS.camilleAvatar}
                          alt="Camille David"
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#4f46e5]/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[14px] sm:text-[15px] font-bold text-[#141b2b] truncate">
                              Camille David
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-[#e2dfff] text-[#3323cc] text-[10px] sm:text-[11px] font-bold shrink-0">
                              Deposit Paid
                            </span>
                          </div>
                          <p className="text-[12px] text-[#141b2b] font-medium truncate">
                            Balayage &amp; Gloss Treatment (120m)
                          </p>
                          <p className="text-[11px] text-[#777587] truncate">
                            Specialist: Jamie Lim • Chair 2
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[15px] sm:text-[17px] font-bold text-[#141b2b] font-display">₱2,400</span>
                        <span className="block text-[10px] text-[#464555] font-semibold whitespace-nowrap">
                          ₱1,200 balance due
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event 6: 03:30 PM (Paolo Roxas) */}
              {filteredEvents.some(e => e.id === 'evt-4') && (
                <div className="flex items-start gap-2.5 sm:gap-4 group">
                  <div className="w-16 sm:w-20 shrink-0 text-right pt-3 font-mono text-[12px] sm:text-[13px] font-bold text-[#464555]">
                    03:30 PM
                  </div>

                  <div className="flex flex-col items-center self-stretch shrink-0 relative w-4">
                    <div className="w-3 h-3 rounded-full mt-4 z-10 shrink-0 bg-amber-500 ring-4 ring-amber-300/40" />
                    <div className="w-[2px] bg-[#e1e5f2] flex-1 my-0.5" />
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div
                      onClick={() => {
                        setInspectBooking(defaultEvents[5]);
                        onTriggerToast('Paolo Roxas: Classic Fade. Needs Action.', 'pending');
                      }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center justify-between gap-3 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img referrerPolicy="no-referrer" 
                          src={ASSETS.marcoAvatar}
                          alt="Paolo Roxas"
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-amber-300/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[14px] sm:text-[15px] font-bold text-[#141b2b] truncate">
                              Paolo Roxas
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] sm:text-[11px] font-bold shrink-0">
                              Needs Action
                            </span>
                          </div>
                          <p className="text-[12px] text-[#141b2b] font-medium truncate">
                            Classic Fade &amp; Beard Trim (45m)
                          </p>
                          <p className="text-[11px] text-[#777587] truncate">
                            Specialist: Julian Cruz • Chair 3
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[15px] sm:text-[17px] font-bold text-[#141b2b] font-display">₱450</span>
                        <span className="block text-[10px] text-amber-600 font-semibold whitespace-nowrap">
                          Pending approval
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic User-Added Bookings */}
              {extraBookings.map((b, idx) => (
                <div key={b.id || idx} className="flex items-start gap-2.5 sm:gap-4 group">
                  <div className="w-16 sm:w-20 shrink-0 text-right pt-3 font-mono text-[12px] sm:text-[13px] font-bold text-[#464555]">
                    {b.time}
                  </div>

                  <div className="flex flex-col items-center self-stretch shrink-0 relative w-4">
                    <div className="w-3 h-3 rounded-full mt-4 z-10 shrink-0 bg-[#3525cd] ring-4 ring-[#3525cd]/25" />
                    <div className="w-[2px] bg-[#e1e5f2] flex-1 my-0.5" />
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div
                      onClick={() => {
                        setInspectBooking(b);
                        onTriggerToast(`Viewing details for #${b.id}`, 'event');
                      }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex items-center justify-between gap-3 hover:border-[#3525cd] hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img referrerPolicy="no-referrer" 
                          src={b.avatar || ASSETS.alexAvatar}
                          alt={b.clientName}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#3525cd]/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[14px] sm:text-[15px] font-bold text-[#141b2b] truncate">{b.clientName}</h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold shrink-0 ${b.statusBg}`}>
                              {b.statusLabel}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#141b2b] font-medium truncate">
                            {b.serviceTitle} ({b.duration})
                          </p>
                          <p className="text-[11px] text-[#777587] truncate">
                            Specialist: {b.specialist} • {b.chair}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[15px] sm:text-[17px] font-bold text-[#141b2b] font-display">₱{b.fee}</span>
                        <span className="block text-[10px] text-[#777587] font-semibold whitespace-nowrap">
                          {b.paymentNote}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side: Command & Pacing Sidebar on Laptop/Desktop (lg:col-span-4 xl:col-span-3) */}
            <div className="hidden lg:flex lg:flex-col lg:col-span-4 xl:col-span-3 gap-5">
              {/* Card 1: Today's Financial & Chair Pacing */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-[#141b2b]">Today's Performance</h3>
                  <button
                    onClick={() => setIsBreakdownOpen(true)}
                    className="text-[11px] font-bold text-[#3525cd] hover:underline cursor-pointer"
                  >
                    View Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 rounded-xl bg-[#f9f9ff] border border-[#e9edff]">
                    <span className="text-[11px] text-[#777587] block font-medium">Daily GMV</span>
                    <span className="text-[18px] font-bold text-[#3525cd] font-display">₱14,850</span>
                    <span className="text-[9px] text-[#00702f] font-bold block mt-0.5">+18% vs avg</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f9f9ff] border border-[#e9edff]">
                    <span className="text-[11px] text-[#777587] block font-medium">Utilization</span>
                    <span className="text-[18px] font-bold text-[#141b2b] font-display">91.6%</span>
                    <span className="text-[9px] text-[#3525cd] font-bold block mt-0.5">11/12 Slots</span>
                  </div>
                </div>

                {/* Chair status indicators */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[#f1f3ff] text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#464555] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00702f]"></span>
                      Chair 1 (Maria)
                    </span>
                    <span className="font-bold text-[#141b2b]">In Service</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#464555] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3525cd]"></span>
                      Chair 2 (Jamie)
                    </span>
                    <span className="font-bold text-[#141b2b]">Booked 1:15 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#464555] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Chair 3 (Julian)
                    </span>
                    <span className="font-bold text-[#141b2b]">Booked 3:30 PM</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Active Specialists Schedule Quick Access */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3">
                <h3 className="text-[14px] font-bold text-[#141b2b]">Specialists on Duty</h3>
                <div className="flex flex-col gap-2.5">
                  {INITIAL_STYLISTS.map(st => (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStylist(st.id);
                        onTriggerToast(`Viewing only ${st.name}'s calendar`, 'person');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                        selectedStylist === st.id
                          ? 'border-[#3525cd] bg-[#f1f3ff]'
                          : 'border-[#e9edff] bg-white hover:border-[#3525cd]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img referrerPolicy="no-referrer"  src={st.avatar} alt={st.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-[12px] font-bold text-[#141b2b] truncate">{st.name}</h4>
                          <span className="text-[10px] text-[#777587] block truncate">{st.role || st.specialty}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#3525cd] shrink-0">
                        {st.id === 'st-1' ? '4 appts' : st.id === 'st-2' ? '3 appts' : '2 appts'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Quick Action Shortcuts */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-2.5">
                <h3 className="text-[14px] font-bold text-[#141b2b]">Quick Actions</h3>
                <button
                  onClick={onAddAppointment}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#3525cd] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#4f46e5] active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[17px]">add_circle</span>
                  <span>Add Walk-in Client</span>
                </button>
                <button
                  onClick={() => onTriggerToast('Blocked 30-min sanitizing window at 2:45 PM', 'lock_clock')}
                  className="w-full py-2 px-3 rounded-xl bg-[#f1f3ff] text-[#464555] text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#e9edff] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">timelapse</span>
                  <span>Block Buffer Time</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= VIEW 2: 3-DAY MULTI-COLUMN VIEW ================= */}
      {activeView === '3day' && (
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { day: 'Tuesday', date: 'Oct 20', isToday: true, count: '4 appointments', appts: [
                { time: '09:30 AM', name: 'Sarah Tan', svc: 'Blowout & Styling', fee: '₱380', status: 'Completed', specialist: 'Maria Santos', bg: 'bg-[#e9edff] text-[#00702f]' },
                { time: '10:45 AM', name: 'Alex Santos', svc: 'Haircut & Wash', fee: '₱450', status: 'Arriving', specialist: 'Maria Santos', bg: 'bg-[#7ffc97] text-[#002109]' },
                { time: '01:15 PM', name: 'Camille David', svc: 'Balayage Gloss', fee: '₱2,400', status: 'Deposit', specialist: 'Jamie Lim', bg: 'bg-[#e2dfff] text-[#3323cc]' },
                { time: '03:30 PM', name: 'Paolo Roxas', svc: 'Classic Fade', fee: '₱450', status: 'Pending', specialist: 'Julian Cruz', bg: 'bg-amber-100 text-amber-900' },
              ]},
              { day: 'Wednesday', date: 'Oct 21', isToday: false, count: '3 appointments', appts: [
                { time: '10:00 AM', name: 'Bianca Ramos', svc: 'Gloss Tone Refresh', fee: '₱1,200', status: 'Confirmed', specialist: 'Jamie Lim', bg: 'bg-[#e9edff] text-[#3525cd]' },
                { time: '02:00 PM', name: 'Enzo Cruz', svc: 'Beard Trim & Sculpt', fee: '₱350', status: 'Confirmed', specialist: 'Julian Cruz', bg: 'bg-[#e9edff] text-[#3525cd]' },
                { time: '04:30 PM', name: 'Lia Gomez', svc: 'Keratin Prep Infusion', fee: '₱1,800', status: 'Confirmed', specialist: 'Maria Santos', bg: 'bg-[#e9edff] text-[#3525cd]' },
              ]},
              { day: 'Thursday', date: 'Oct 22', isToday: false, count: '3 appointments', appts: [
                { time: '09:00 AM', name: 'Danica Dee', svc: 'Hydra Scalp Facial', fee: '₱850', status: 'Confirmed', specialist: 'Jamie Lim', bg: 'bg-[#e9edff] text-[#3525cd]' },
                { time: '11:15 AM', name: 'Mike Tan', svc: 'Executive Haircut', fee: '₱550', status: 'Confirmed', specialist: 'Maria Santos', bg: 'bg-[#e9edff] text-[#3525cd]' },
                { time: '01:45 PM', name: 'Carla Yap', svc: 'Balayage Ombre', fee: '₱2,800', status: 'Deposit', specialist: 'Jamie Lim', bg: 'bg-[#e2dfff] text-[#3323cc]' },
              ]}
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col gap-3 rounded-2xl bg-white p-4 border border-[#e9edff] shadow-xs">
                {/* Column Day Header */}
                <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[16px] font-bold text-[#141b2b] font-display">{col.day}</span>
                    <span className="text-[13px] text-[#777587] font-medium">{col.date}</span>
                  </div>
                  {col.isToday ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#7ffc97] text-[#002109] text-[10px] font-bold">
                      Today
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#777587] font-semibold">{col.count}</span>
                  )}
                </div>

                {/* Day Appointment cards */}
                <div className="flex flex-col gap-2.5 pt-1">
                  {col.appts.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => onTriggerToast(`${item.name} • ${item.svc} (${item.time})`, 'event')}
                      className="p-3 rounded-xl bg-[#f9f9ff] border border-[#e9edff] hover:border-[#3525cd] hover:shadow-xs transition-all cursor-pointer flex flex-col gap-1.5 text-[12px]"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#777587]">
                        <span className="font-bold">{item.time}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${item.bg}`}>{item.status}</span>
                      </div>
                      <span className="font-bold text-[#141b2b] text-[13px] truncate">{item.name}</span>
                      <div className="flex items-center justify-between text-[#464555]">
                        <span className="truncate">{item.svc}</span>
                        <span className="font-bold text-[#3525cd] shrink-0 font-display">{item.fee}</span>
                      </div>
                      <span className="text-[10px] text-[#777587]">Specialist: {item.specialist}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= VIEW 3: WEEK OVERVIEW GRID ================= */}
      {activeView === 'week' && (
        <section className="w-full">
          <div className="rounded-2xl bg-white border border-[#e9edff] p-4 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f3ff] pb-3">
              <div>
                <h3 className="text-[16px] sm:text-[18px] font-bold text-[#141b2b] font-display">Week 43: Oct 19 - Oct 25, 2026</h3>
                <p className="text-[12px] text-[#464555]">38 total appointments booked across all 3 specialist chairs • ₱42,300 GMV projected</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#e9edff] text-[#3525cd] text-[12px] font-bold self-start sm:self-auto">
                88% Fill Rate
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
              {datesList.map((d, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedDateIndex(i);
                    setActiveView('day');
                    onTriggerToast(`Viewing ${d.label} day timeline`, 'calendar_today');
                  }}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] ${
                    d.isToday
                      ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-md'
                      : 'bg-[#f9f9ff] text-[#141b2b] border-[#e9edff] hover:border-[#3525cd]'
                  }`}
                >
                  <span className={`text-[11px] font-bold uppercase ${d.isToday ? 'text-white/80' : 'text-[#777587]'}`}>
                    {d.short}
                  </span>
                  <span className="text-[20px] font-bold font-display">{d.day}</span>
                  <span className={`text-[11px] font-semibold ${d.isToday ? 'text-[#7ffc97]' : 'text-[#3525cd]'}`}>
                    {i === 1 ? '12 appts' : i === 0 ? '9 appts' : `${6 + i * 2} appts`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= MOBILE BOTTOM FLOATING ACTION ================= */}
      <div className="fixed bottom-[74px] sm:bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-8 z-40 flex items-center justify-between sm:justify-end gap-3 pointer-events-none lg:hidden">
        <button
          onClick={() => setIsBreakdownOpen(true)}
          className="bg-[#141b2b]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-xl text-[12px] font-semibold flex items-center gap-2 hover:bg-[#141b2b] active:scale-95 transition-all pointer-events-auto cursor-pointer border border-white/10"
        >
          <span className="w-2 h-2 rounded-full bg-[#7ffc97] animate-pulse shrink-0"></span>
          <span className="whitespace-nowrap">Today: ₱14,850 • 12 booked</span>
          <span className="material-symbols-outlined text-[16px] text-white/70">info</span>
        </button>

        <button
          onClick={onAddAppointment}
          className="w-12 h-12 rounded-full bg-[#3525cd] hover:bg-[#4f46e5] text-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform pointer-events-auto cursor-pointer ring-4 ring-white shrink-0"
          title="Add Walk-In / Block Slot"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
        </button>
      </div>

      {/* ================= MODAL: TODAY'S SCHEDULE BREAKDOWN ================= */}
      {isBreakdownOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div>
                <h3 className="text-[17px] font-bold text-[#141b2b]">Tuesday Oct 20 Breakdown</h3>
                <p className="text-[11px] text-[#464555]">Studio Bloom • Daily revenue &amp; chair pacing</p>
              </div>
              <button
                onClick={() => setIsBreakdownOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#464555] hover:text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#f1f3ff] border border-[#e9edff]">
                <span className="text-[11px] text-[#464555]">Gross Revenue</span>
                <p className="text-[20px] font-bold text-[#3525cd] font-display">₱14,850</p>
                <span className="text-[10px] text-[#00702f] font-semibold">+18% vs last Tuesday</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f1f3ff] border border-[#e9edff]">
                <span className="text-[11px] text-[#464555]">Chair Fill Rate</span>
                <p className="text-[20px] font-bold text-[#141b2b] font-display">91.6%</p>
                <span className="text-[10px] text-[#3525cd] font-semibold">11 of 12 slots filled</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1 text-[12px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f9f9ff]">
                <span className="text-[#464555]">Completed Appointments</span>
                <span className="font-bold text-[#00702f]">4 appointments (₱4,200)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f9f9ff]">
                <span className="text-[#464555]">Arriving / In Progress</span>
                <span className="font-bold text-[#3525cd]">6 appointments (₱8,650)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f9f9ff]">
                <span className="text-[#464555]">Pending Action</span>
                <span className="font-bold text-amber-700">2 bookings (₱2,000)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#e9edff]">
              <button
                onClick={() => {
                  setIsBreakdownOpen(false);
                  onAddAppointment();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#3525cd] text-white text-[13px] font-semibold hover:bg-[#4f46e5] cursor-pointer shadow-xs"
              >
                + Add Appointment
              </button>
              <button
                onClick={() => setIsBreakdownOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-[#f1f3ff] text-[#464555] text-[13px] font-semibold hover:bg-[#e9edff] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK APPOINTMENT INSPECTOR ================= */}
      {inspectBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2">
                <img referrerPolicy="no-referrer" 
                  src={inspectBooking.avatar || ASSETS.alexAvatar}
                  alt={inspectBooking.clientName || 'Client'}
                  className="w-10 h-10 rounded-full object-cover shadow-xs"
                />
                <div>
                  <h3 className="text-[15px] font-bold text-[#141b2b]">{inspectBooking.clientName}</h3>
                  <span className="text-[11px] text-[#464555]">{inspectBooking.clientPhone}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectBooking(null)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#464555] hover:text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="rounded-2xl bg-[#f1f3ff] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#464555]">Service</span>
                <span className="text-[13px] font-bold text-[#141b2b]">{inspectBooking.serviceTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#464555]">Time &amp; Chair</span>
                <span className="text-[12px] font-medium text-[#141b2b]">{inspectBooking.time} • {inspectBooking.chair || 'Chair 1'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#464555]">Specialist</span>
                <span className="text-[12px] font-medium text-[#3525cd]">{inspectBooking.specialist}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#dee2ef] pt-2">
                <span className="text-[12px] font-bold text-[#141b2b]">Total Fee</span>
                <span className="text-[16px] font-bold text-[#3525cd] font-display">₱{inspectBooking.fee}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  if (inspectBooking.clientPhone) {
                    navigator.clipboard?.writeText(inspectBooking.clientPhone);
                    onTriggerToast(`Copied phone: ${inspectBooking.clientPhone} 📞`, 'call');
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-[#e9edff] text-[#3525cd] text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#dce2f7] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>Call Client</span>
              </button>
              <button
                onClick={() => {
                  onTriggerToast(`Reminder dispatched to ${inspectBooking.clientName}! 💬`, 'send');
                  setInspectBooking(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-[#3525cd] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#4f46e5] cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">mark_chat_read</span>
                <span>Send SMS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
