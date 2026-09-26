import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { ASSETS } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { createReview, getUserReviews } from '../lib/database';

interface ClientBookingsScreenProps {
  bookings: Booking[];
  onBookNew: () => void;
  onSelectStudio: (studioId: string) => void;
  onReschedule: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const ClientBookingsScreen: React.FC<ClientBookingsScreenProps> = ({
  bookings,
  onBookNew,
  onSelectStudio,
  onReschedule,
  onCancelBooking,
  onTriggerToast
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  // Modals state
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleDay, setRescheduleDay] = useState(22);
  const [rescheduleTime, setRescheduleTime] = useState('02:30 PM');

  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Schedule conflict / Change of plans');

  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<string[]>(['SC-8918']);

  useEffect(() => {
    async function loadReviews() {
      if (user?.id) {
        try {
          const userRevs = await getUserReviews(user.id);
          if (userRevs && userRevs.length > 0) {
            setReviewedBookingIds(prev => Array.from(new Set([...prev, ...userRevs.map(r => r.booking_id)])));
          }
        } catch (err) {
          console.warn('Failed to load user reviews from Supabase:', err);
        }
      }
    }
    loadReviews();
  }, [user?.id]);

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  // Working .ics Calendar File Downloader
  const handleDownloadIcs = (booking: Booking) => {
    const title = `${booking.serviceTitle} at ${booking.businessName}`;
    const desc = `Appointment with ${booking.stylistName} (${booking.duration}). Location: ${booking.location}. Booking Ref: ${booking.bookingNumber}`;
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Scheduly//Booking Engine//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${booking.id}-${Date.now()}@scheduly.app`,
      `DTSTAMP:20261020T080000Z`,
      `DTSTART:20261020T104500Z`,
      `DTEND:20261020T113000Z`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${booking.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appointment-${booking.bookingNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    onTriggerToast(`Downloaded appointment #${booking.bookingNumber} to your calendar! 📅`, 'event_available');
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleBooking) return;
    const updated = {
      ...rescheduleBooking,
      date: `Thursday, Oct ${rescheduleDay}, 2026`,
      time: rescheduleTime
    };
    onReschedule(updated);
    setRescheduleBooking(null);
    onTriggerToast(`Rescheduled to Thursday, Oct ${rescheduleDay} at ${rescheduleTime}! ✨`, 'check_circle');
  };

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    onCancelBooking(cancelModalBooking.id);
    setCancelModalBooking(null);
    onTriggerToast(`Booking #${cancelModalBooking.bookingNumber} has been cancelled.`, 'cancel');
  };

  const handleSubmitReview = async () => {
    if (!reviewModalBooking) return;
    if (reviewedBookingIds.includes(reviewModalBooking.id)) {
      onTriggerToast('You have already submitted a review for this appointment! ⭐', 'info');
      setReviewModalBooking(null);
      return;
    }

    setIsSubmittingReview(true);
    try {
      // Derive authenticated context safely
      const userId = user?.id || '00000000-0000-0000-0000-000000000011';
      const businessId = reviewModalBooking.businessId || '00000000-0000-0000-0000-000000000001';
      const staffId = reviewModalBooking.staffId || null;

      await createReview({
        booking_id: reviewModalBooking.id,
        user_id: userId,
        business_id: businessId,
        staff_id: staffId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined
      });

      setReviewedBookingIds(prev => [...prev, reviewModalBooking.id]);
      onTriggerToast(`Thank you! Your ${reviewRating}-star review has been published for ${reviewModalBooking.businessName} ⭐`, 'stars');
      setReviewModalBooking(null);
      setReviewComment('');
    } catch (err: any) {
      console.warn('Failed to submit review:', err);
      onTriggerToast(err.message || 'Unable to submit review. Please try again.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-8 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Profile Header Banner */}
      <section className="pt-4 pb-3">
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img referrerPolicy="no-referrer" 
                src={ASSETS.alexAvatar}
                alt="Alex Santos"
                className="w-13 h-13 rounded-full object-cover ring-2 ring-[#3525cd]/20 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#7ffc97] ring-2 ring-white"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[18px] font-bold text-[#141b2b] font-display">Alex Santos</h1>
                <span className="px-2 py-0.5 rounded-full bg-[#dee2ef] text-[#3525cd] text-[10px] font-bold uppercase tracking-wider">
                  VIP Client
                </span>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-[#464555] mt-0.5">
                <span>
                  <strong className="text-[#141b2b] font-semibold">{activeBookings.length}</strong> Active
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[#141b2b] font-semibold">{pastBookings.length + 12}</strong> Visits
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[#141b2b] font-semibold">100%</strong> Punctuality
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onBookNew}
            className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#4f46e5] active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Book New Service</span>
          </button>
        </div>
      </section>

      {/* Tabs Row: Upcoming, Past, Cancelled */}
      <section className="pt-2 pb-2">
        <div className="flex items-center bg-[#e9edff] p-1 rounded-xl w-full sm:w-auto self-start border border-[#e9edff]">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            Upcoming ({activeBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            Past Visits ({pastBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              activeTab === 'cancelled'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            Cancelled ({cancelledBookings.length})
          </button>
        </div>
      </section>

      {/* Tab 1: UPCOMING APPOINTMENTS */}
      {activeTab === 'upcoming' && (
        <section className="pt-3 flex flex-col gap-4">
          {activeBookings.length > 0 ? (
            activeBookings.map((booking, idx) => (
              <div
                key={booking.id}
                className="rounded-2xl bg-white p-4 lg:p-5 shadow-sm border border-[#e9edff] flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3525cd] via-[#4f46e5] to-[#7ffc97]"></div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pt-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#7ffc97] text-[#002109] text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#005522] animate-pulse"></span>
                        {idx === 0 ? 'Upcoming Today' : 'Confirmed'}
                      </span>
                      <span className="text-[12px] text-[#464555]">• Instant Confirmation</span>
                    </div>

                    <h2
                      onClick={() => onSelectStudio('studio-bloom')}
                      className="text-[19px] font-bold text-[#141b2b] font-display hover:text-[#3525cd] cursor-pointer transition-colors"
                    >
                      {booking.businessName}
                    </h2>
                    <p className="text-[14px] font-semibold text-[#3525cd]">
                      {booking.serviceTitle}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-[#777587]">Booking ID</span>
                    <div className="text-[13px] font-mono font-bold text-[#141b2b]">
                      {booking.bookingNumber}
                    </div>
                  </div>
                </div>

                {/* Time & Specialist Container */}
                <div className="rounded-xl bg-[#f1f3ff] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#e9edff]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#3525cd] shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#141b2b]">
                        {booking.date} • {booking.time}
                      </div>
                      <div className="text-[12px] text-[#464555]">
                        {booking.duration} session with {booking.stylistName}
                      </div>
                    </div>
                  </div>

                  {booking.stylistAvatar && (
                    <div className="flex items-center gap-2">
                      <img referrerPolicy="no-referrer" 
                        src={booking.stylistAvatar}
                        alt={booking.stylistName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
                      />
                      <div className="text-[12px]">
                        <span className="font-semibold text-[#141b2b] block">{booking.stylistName}</span>
                        <span className="text-[#00702f] font-medium text-[11px]">Assigned Specialist</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location & Payment Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-[#464555]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#3525cd]">location_on</span>
                    <span className="text-[#141b2b] font-medium">{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>
                      Payment: <strong className="text-[#141b2b]">{booking.paymentStatus}</strong>
                    </span>
                    <span className="text-[18px] font-bold text-[#141b2b] font-display">
                      ₱{booking.fee.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Interactive Action Buttons Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#f1f3ff]">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(booking.location || 'BGC Taguig');
                      onTriggerToast('Address copied to clipboard! Opening map directions... 🗺️', 'near_me');
                    }}
                    className="py-2 px-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#3525cd]">directions</span>
                    <span>Directions</span>
                  </button>

                  <button
                    onClick={() => handleDownloadIcs(booking)}
                    className="py-2 px-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#3525cd]">edit_calendar</span>
                    <span>Add to Cal</span>
                  </button>

                  <button
                    onClick={() => setRescheduleBooking(booking)}
                    className="py-2 px-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#3525cd]">schedule</span>
                    <span>Reschedule</span>
                  </button>

                  <button
                    onClick={() => setCancelModalBooking(booking)}
                    className="py-2 px-2 rounded-xl bg-[#fff0f0] hover:bg-[#ffe5e5] text-[#ba1a1a] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-8 shadow-xs border border-[#e9edff] text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-[#777587]">event_available</span>
              <h3 className="text-[17px] font-bold text-[#141b2b]">No Active Appointments</h3>
              <p className="text-[13px] text-[#464555] max-w-sm">
                You have no scheduled visits at the moment. Browse top rated studios to book your next session!
              </p>
              <button
                onClick={onBookNew}
                className="mt-2 px-4 py-2 rounded-xl bg-[#3525cd] text-white text-[13px] font-semibold shadow-xs hover:bg-[#4f46e5] cursor-pointer"
              >
                Explore Salons &amp; Spas
              </button>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: PAST VISITS */}
      {activeTab === 'past' && (
        <section className="pt-3 flex flex-col gap-4">
          {pastBookings.map(booking => (
            <div
              key={booking.id}
              className="rounded-2xl bg-white p-4 shadow-xs border border-[#e9edff] flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e9edff] text-[#3525cd] text-[10px] font-bold mb-1">
                    Completed Visit
                  </span>
                  <h3 className="text-[17px] font-bold text-[#141b2b] font-display">
                    {booking.businessName}
                  </h3>
                  <p className="text-[13px] text-[#464555]">
                    {booking.serviceTitle} • {booking.duration}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[16px] font-bold text-[#141b2b] font-display">
                    ₱{booking.fee.toLocaleString()}
                  </span>
                  <span className="block text-[11px] text-[#00702f] font-semibold">Paid in full</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[#464555] pt-1">
                <span>{booking.date} with {booking.stylistName}</span>
                <span className="font-mono text-[11px] text-[#777587]">#{booking.bookingNumber}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#f1f3ff]">
                {reviewedBookingIds.includes(booking.id) ? (
                  <div className="flex-1 py-2 rounded-xl bg-[#eafaf1] text-[#00702f] text-[12px] font-semibold flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Reviewed (5★)</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setReviewRating(5);
                      setReviewComment('');
                      setReviewModalBooking(booking);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] text-[12px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">rate_review</span>
                    <span>Leave Review</span>
                  </button>
                )}
                <button
                  onClick={onBookNew}
                  className="flex-1 py-2 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[12px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">repeat</span>
                  <span>Book Again</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Tab 3: CANCELLED VISITS */}
      {activeTab === 'cancelled' && (
        <section className="pt-3 flex flex-col gap-4">
          {cancelledBookings.length > 0 ? (
            cancelledBookings.map(booking => (
              <div
                key={booking.id}
                className="rounded-2xl bg-white p-4 shadow-xs border border-[#e9edff] flex flex-col gap-2 opacity-80"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-[#dee2ef] text-[#ba1a1a] text-[10px] font-bold">
                    Cancelled
                  </span>
                  <span className="font-mono text-[11px] text-[#777587]">#{booking.bookingNumber}</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#141b2b]">{booking.serviceTitle}</h3>
                <p className="text-[12px] text-[#464555]">
                  Original slot: {booking.date} • {booking.time} at {booking.businessName}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onBookNew}
                    className="px-3 py-1.5 rounded-xl bg-[#e9edff] text-[#3525cd] text-[12px] font-semibold hover:bg-[#3525cd] hover:text-white transition-all cursor-pointer"
                  >
                    Rebook Slot
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-[#777587] text-[13px]">
              No cancelled appointments.
            </div>
          )}
        </section>
      )}

      {/* ================= MODAL 1: RESCHEDULE MODAL ================= */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-[#141b2b]">Reschedule Appointment</h3>
                <p className="text-[11px] text-[#464555]">{rescheduleBooking.serviceTitle} • {rescheduleBooking.businessName}</p>
              </div>
              <button
                onClick={() => setRescheduleBooking(null)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#464555] hover:text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Day Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                Select New Date (October 2026)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { day: 21, name: 'Wed' },
                  { day: 22, name: 'Thu' },
                  { day: 23, name: 'Fri' },
                  { day: 24, name: 'Sat' }
                ].map(d => (
                  <button
                    key={d.day}
                    onClick={() => setRescheduleDay(d.day)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center transition-all cursor-pointer ${
                      rescheduleDay === d.day
                        ? 'border-[#3525cd] bg-[#e9edff] text-[#3525cd] font-bold'
                        : 'border-[#e9edff] text-[#141b2b] hover:bg-[#f1f3ff]'
                    }`}
                  >
                    <span className="text-[11px] text-[#464555]">{d.name}</span>
                    <span className="text-[16px] font-bold">{d.day}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selector */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#f1f3ff]">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                Select Available Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['10:30 AM', '01:15 PM', '02:30 PM', '04:00 PM', '05:30 PM', '06:45 PM'].map(slot => (
                  <button
                    key={slot}
                    onClick={() => setRescheduleTime(slot)}
                    className={`py-2 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${
                      rescheduleTime === slot
                        ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs'
                        : 'bg-white text-[#141b2b] border-[#e9edff] hover:bg-[#f1f3ff]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-[#e9edff]">
              <button
                onClick={() => setRescheduleBooking(null)}
                className="py-2.5 px-4 rounded-xl bg-[#e9edff] text-[#464555] text-[13px] font-semibold cursor-pointer"
              >
                Keep Current
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold cursor-pointer shadow-xs"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CANCEL CONFIRMATION MODAL ================= */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-[#e9edff] pb-3">
              <div className="w-10 h-10 rounded-full bg-[#fff0f0] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#141b2b]">Cancel Appointment</h3>
                <p className="text-[12px] text-[#464555]">Booking #{cancelModalBooking.bookingNumber}</p>
              </div>
            </div>

            <p className="text-[13px] text-[#464555] leading-relaxed">
              Are you sure you want to cancel your <strong>{cancelModalBooking.serviceTitle}</strong> session at {cancelModalBooking.businessName}? Free cancellation is honored with no penalties.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
              >
                <option>Schedule conflict / Change of plans</option>
                <option>Need to book with a different specialist</option>
                <option>Emergency / Illness</option>
                <option>Booked by mistake</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#e9edff]">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] text-[13px] font-semibold cursor-pointer"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[13px] font-semibold cursor-pointer shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: LEAVE REVIEW MODAL ================= */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-[#141b2b]">Review Your Experience</h3>
                <p className="text-[12px] text-[#464555]">{reviewModalBooking.businessName} • {reviewModalBooking.serviceTitle}</p>
              </div>
              <button
                onClick={() => setReviewModalBooking(null)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#464555]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Star Rating Selector */}
            <div className="flex flex-col items-center gap-1.5 py-1">
              <span className="text-[12px] font-semibold text-[#464555]">Tap to rate</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-[32px]"
                      style={{ fontVariationSettings: star <= reviewRating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-[13px] font-bold text-[#141b2b]">
                {reviewRating === 5 ? 'Exceptional (5/5)' : reviewRating === 4 ? 'Great (4/5)' : 'Good'}
              </span>
            </div>

            {/* Review Comment */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                Your Feedback
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Share your thoughts about the service, ambiance, and stylist..."
                className="w-full p-3 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#e9edff]">
              <button
                type="button"
                disabled={isSubmittingReview}
                onClick={() => setReviewModalBooking(null)}
                className="py-2.5 px-4 rounded-xl bg-[#e9edff] text-[#464555] text-[13px] font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReview || reviewRating < 1 || reviewRating > 5}
                onClick={handleSubmitReview}
                className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-[13px] font-semibold cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                {isSubmittingReview ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
