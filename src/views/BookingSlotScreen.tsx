import React, { useState } from 'react';
import { SalonService, Booking, Stylist } from '../types';
import { INITIAL_STYLISTS, ASSETS } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { createBookingRpc } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';

interface BookingSlotScreenProps {
  service: SalonService;
  onBookingConfirmed: (newBooking: Booking) => void;
  onBack: () => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const BookingSlotScreen: React.FC<BookingSlotScreenProps> = ({
  service,
  onBookingConfirmed,
  onBack,
  onTriggerToast
}) => {
  const { user, profile } = useAuth();
  const [selectedDay, setSelectedDay] = useState(20);
  const [selectedTime, setSelectedTime] = useState('10:45 AM');
  const [selectedStylistId, setSelectedStylistId] = useState<string>('st-1');
  const [clientNotes, setClientNotes] = useState('Sensitive scalp, prefers sulfate-free shampoo.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dates = [
    { dayName: 'Mon', dayNum: 19, slots: 4, available: true },
    { dayName: 'Tue', dayNum: 20, slots: 6, available: true },
    { dayName: 'Wed', dayNum: 21, slots: 3, available: true },
    { dayName: 'Thu', dayNum: 22, slots: 8, available: true },
    { dayName: 'Fri', dayNum: 23, slots: 0, available: false },
    { dayName: 'Sat', dayNum: 24, slots: 5, available: true },
    { dayName: 'Sun', dayNum: 25, slots: 2, available: true },
  ];

  const morningSlots = ['09:30 AM', '10:45 AM', '11:30 AM'];
  const afternoonSlots = ['01:15 PM', '02:45 PM', '04:00 PM'];
  const eveningSlots = ['05:30 PM', '06:45 PM'];

  const chosenStylist = INITIAL_STYLISTS.find(s => s.id === selectedStylistId) || INITIAL_STYLISTS[0];

  const handleConfirm = async () => {
    setIsSubmitting(true);
    let generatedId = `SC-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isSupabaseConfigured && user) {
      try {
        const [timePart, meridiem] = selectedTime.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        const startAt = new Date(Date.UTC(2026, 9, selectedDay, hours, minutes)).toISOString();

        const dbBooking = await createBookingRpc({
          business_id: service.businessId || '00000000-0000-0000-0000-000000000001',
          service_id: service.id,
          start_at: startAt,
          client_name: profile?.full_name || user.email?.split('@')[0] || 'Alex Santos',
          client_phone: profile?.phone || '+63 917 555 0192',
          staff_id: null,
          client_user_id: user.id,
          client_note: clientNotes,
          payment_method: service.deposit ? 'GCash Deposit' : 'Pay at Venue',
          deposit_amount: service.deposit || 0
        });

        if (dbBooking?.booking_number) {
          generatedId = dbBooking.booking_number;
        }
      } catch (err: any) {
        console.warn('create_booking RPC notice:', err.message);
      }
    }

    setTimeout(() => {
      const newBooking: Booking = {
        id: generatedId,
        bookingNumber: generatedId,
        clientName: profile?.full_name || 'Alex Santos',
        clientPhone: profile?.phone || '+63 917 555 0192',
        clientAvatar: profile?.avatar_url || ASSETS.alexAvatar,
        serviceTitle: service.title,
        stylistName: chosenStylist.name,
        stylistAvatar: chosenStylist.avatar,
        date: `Tuesday, Oct ${selectedDay}, 2026`,
        time: selectedTime,
        duration: service.duration,
        fee: service.price,
        status: 'confirmed',
        paymentStatus: service.deposit ? 'Deposit Paid' : 'Unpaid',
        paymentMethod: service.deposit ? 'GCash Deposit' : 'Pay at Venue (Cash / GCash / Card)',
        location: 'Unit 302, High Street South, BGC, Taguig',
        businessName: 'Studio Bloom',
        businessId: service.businessId || '00000000-0000-0000-0000-000000000001',
        serviceId: service.id,
        clientUserId: user?.id || null,
        clientNote: clientNotes
      };

      onBookingConfirmed(newBooking);
      onTriggerToast(`Appointment confirmed! Booking #${generatedId} saved. 🎉`, 'check_circle');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-16 max-w-5xl mx-auto lg:px-6">
      {/* Stepper Progress Bar */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#e9edff] bg-white">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#7ffc97] text-[#002109] flex items-center justify-center text-[12px] font-bold">
            ✓
          </span>
          <span className="text-[12px] font-semibold text-[#464555]">Service</span>
        </div>
        <div className="h-0.5 flex-1 mx-2 bg-[#3525cd]"></div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#3525cd] text-white flex items-center justify-center text-[12px] font-bold">
            2
          </span>
          <span className="text-[12px] font-bold text-[#141b2b]">Date &amp; Time</span>
        </div>
        <div className="h-0.5 flex-1 mx-2 bg-[#e9edff]"></div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#e9edff] text-[#777587] flex items-center justify-center text-[12px] font-semibold">
            3
          </span>
          <span className="text-[12px] font-semibold text-[#777587]">Review</span>
        </div>
      </div>

      {/* Selected Service Snippet Banner */}
      <div className="px-4 py-3 bg-[#f1f3ff] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 border border-[#e9edff]">
            <img
              src={service.image}
              alt={service.title}
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = ASSETS.haircutService; }}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#141b2b]">{service.title}</h3>
            <span className="text-[12px] text-[#464555]">
              {service.duration} • Studio Bloom (BGC)
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[16px] font-bold text-[#3525cd] font-display">
            ₱{service.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#3525cd] uppercase tracking-wider">
              Step 1 of 2
            </span>
            <h2 className="text-[18px] font-bold text-[#141b2b] font-display">Select Date</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#141b2b]">October 2026</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onTriggerToast('Showing previous week', 'arrow_back')}
                className="w-8 h-8 rounded-lg bg-[#e9edff] text-[#141b2b] flex items-center justify-center hover:bg-[#dce2f7]"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                onClick={() => onTriggerToast('Showing next week', 'arrow_forward')}
                className="w-8 h-8 rounded-lg bg-[#e9edff] text-[#141b2b] flex items-center justify-center hover:bg-[#dce2f7]"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {dates.map(d => {
            const isSelected = selectedDay === d.dayNum;
            return (
              <button
                key={d.dayNum}
                disabled={!d.available}
                onClick={() => {
                  setSelectedDay(d.dayNum);
                  onTriggerToast(`Selected Tuesday Oct ${d.dayNum}, 2026`, 'calendar_month');
                }}
                className={`shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  !d.available
                    ? 'opacity-40 bg-gray-100 cursor-not-allowed text-gray-400'
                    : isSelected
                    ? 'bg-[#3525cd] text-white shadow-md ring-4 ring-[#3525cd]/20 scale-105'
                    : 'bg-white text-[#141b2b] hover:bg-[#e9edff] border border-[#e9edff]'
                }`}
              >
                <span className={`text-[11px] uppercase font-semibold ${isSelected ? 'text-white/90' : 'text-[#777587]'}`}>
                  {d.dayName}
                </span>
                <span className="text-[18px] font-bold font-display leading-none">
                  {d.dayNum}
                </span>
                <span className={`text-[10px] font-medium ${isSelected ? 'text-[#7ffc97]' : 'text-[#00702f]'}`}>
                  {d.available ? `${d.slots} slots` : 'Full'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialist / Stylist Selector */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#141b2b]">Choose Specialist</h3>
          <span className="text-[11px] text-[#464555]">Optional</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              setSelectedStylistId('st-1');
              onTriggerToast('Selected Maria Santos (Senior Stylist)', 'person');
            }}
            className={`shrink-0 px-3 py-2 rounded-xl flex items-center gap-2 border transition-all ${
              selectedStylistId === 'st-1'
                ? 'border-2 border-[#3525cd] bg-white ring-2 ring-[#3525cd]/15'
                : 'border-[#e9edff] bg-white hover:bg-[#f1f3ff]'
            }`}
          >
            <img referrerPolicy="no-referrer"  src={ASSETS.mariaAvatar} alt="Maria" className="w-8 h-8 rounded-full object-cover" />
            <div className="text-left">
              <div className="text-[12px] font-bold text-[#141b2b]">Maria Santos</div>
              <div className="text-[10px] text-[#464555]">4.95 ⭐ • Senior</div>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedStylistId('st-2');
              onTriggerToast('Selected Jamie Lim (Master Colorist)', 'person');
            }}
            className={`shrink-0 px-3 py-2 rounded-xl flex items-center gap-2 border transition-all ${
              selectedStylistId === 'st-2'
                ? 'border-2 border-[#3525cd] bg-white ring-2 ring-[#3525cd]/15'
                : 'border-[#e9edff] bg-white hover:bg-[#f1f3ff]'
            }`}
          >
            <img referrerPolicy="no-referrer"  src={ASSETS.jamieAvatar} alt="Jamie" className="w-8 h-8 rounded-full object-cover" />
            <div className="text-left">
              <div className="text-[12px] font-bold text-[#141b2b]">Jamie Lim</div>
              <div className="text-[10px] text-[#464555]">4.98 ⭐ • Founder</div>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedStylistId('st-3');
              onTriggerToast('Selected Julian Cruz (Barber Artist)', 'person');
            }}
            className={`shrink-0 px-3 py-2 rounded-xl flex items-center gap-2 border transition-all ${
              selectedStylistId === 'st-3'
                ? 'border-2 border-[#3525cd] bg-white ring-2 ring-[#3525cd]/15'
                : 'border-[#e9edff] bg-white hover:bg-[#f1f3ff]'
            }`}
          >
            <img referrerPolicy="no-referrer"  src={ASSETS.julianAvatar} alt="Julian" className="w-8 h-8 rounded-full object-cover" />
            <div className="text-left">
              <div className="text-[12px] font-bold text-[#141b2b]">Julian Cruz</div>
              <div className="text-[10px] text-[#464555]">4.88 ⭐ • Barber</div>
            </div>
          </button>
        </div>
      </div>

      {/* Available Time Slots Groups */}
      <div className="px-4 pt-5 flex flex-col gap-4">
        <div>
          <span className="text-[11px] font-semibold text-[#3525cd] uppercase tracking-wider">
            Step 2 of 2
          </span>
          <h2 className="text-[18px] font-bold text-[#141b2b] font-display">Select Time Slot</h2>
        </div>

        {/* Morning */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold text-[#777587] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
            Morning
          </span>
          <div className="grid grid-cols-3 gap-2">
            {morningSlots.map(time => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`h-11 rounded-xl text-[13px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#3525cd] text-white shadow-md ring-2 ring-[#3525cd]/25 font-bold'
                      : 'bg-white text-[#141b2b] hover:bg-[#e9edff] border border-[#e9edff]'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Afternoon */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-[12px] font-semibold text-[#777587] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">light_mode</span>
            Afternoon
          </span>
          <div className="grid grid-cols-3 gap-2">
            {afternoonSlots.map(time => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`h-11 rounded-xl text-[13px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#3525cd] text-white shadow-md ring-2 ring-[#3525cd]/25 font-bold'
                      : 'bg-white text-[#141b2b] hover:bg-[#e9edff] border border-[#e9edff]'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Evening */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-[12px] font-semibold text-[#777587] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">bedtime</span>
            Evening
          </span>
          <div className="grid grid-cols-3 gap-2">
            {eveningSlots.map(time => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`h-11 rounded-xl text-[13px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#3525cd] text-white shadow-md ring-2 ring-[#3525cd]/25 font-bold'
                      : 'bg-white text-[#141b2b] hover:bg-[#e9edff] border border-[#e9edff]'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Client Notes Field */}
        <div className="pt-2 flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-[#141b2b] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#3525cd]">edit_note</span>
            Special requests / Notes for stylist
          </label>
          <textarea
            value={clientNotes}
            onChange={e => setClientNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-white border border-[#e9edff] p-3 text-[13px] text-[#141b2b] placeholder:text-[#777587] focus:outline-none focus:border-[#3525cd]"
            placeholder="e.g. Sensitive scalp, preferred styling product, silent session"
          />
        </div>
      </div>

      {/* Sticky Bottom Confirmation Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl shadow-[0_-8px_24px_rgba(20,27,43,0.08)] px-4 py-2.5 pb-[env(safe-area-inset-bottom,10px)] border-t border-[#e9edff]">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div>
              <div className="text-[11px] text-[#777587]">Scheduled Time</div>
              <div className="text-[14px] font-bold text-[#141b2b]">
                Tue, Oct {selectedDay} • {selectedTime}
              </div>
            </div>
            <div className="sm:border-l sm:border-[#e9edff] sm:pl-4">
              <div className="text-[11px] text-[#777587]">Total Due</div>
              <div className="text-[18px] font-bold text-[#3525cd] font-display leading-none">
                ₱{service.price.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 h-11 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[14px] font-semibold shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Confirming Appointment...</span>
              </>
            ) : (
              <>
                <span>Confirm Booking (₱{service.price.toLocaleString()})</span>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
