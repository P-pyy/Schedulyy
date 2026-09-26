import React, { useState } from 'react';
import { Booking } from '../types';

interface BusinessBookingsScreenProps {
  bookings: Booking[];
  onSelectBooking?: (booking: Booking) => void;
  onAddBooking: () => void;
  onCheckInToggle: (id: string) => void;
  onAcceptBooking: (id: string) => void;
  onDeclineBooking: (id: string) => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const BusinessBookingsScreen: React.FC<BusinessBookingsScreenProps> = ({
  bookings,
  onSelectBooking,
  onAddBooking,
  onCheckInToggle,
  onAcceptBooking,
  onDeclineBooking,
  onTriggerToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all');

  const filtered = bookings.filter(b => {
    const matchesSearch =
      b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.clientPhone && b.clientPhone.includes(searchQuery));

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  const handleExportCSV = () => {
    const headers = ['Booking Number', 'Client Name', 'Phone', 'Service', 'Stylist', 'Date', 'Time', 'Duration', 'Fee', 'Status', 'Payment'];
    const rows = bookings.map(b => [
      b.bookingNumber,
      `"${b.clientName}"`,
      `"${b.clientPhone}"`,
      `"${b.serviceTitle}"`,
      `"${b.stylistName}"`,
      `"${b.date}"`,
      `"${b.time}"`,
      `"${b.duration}"`,
      b.fee,
      b.status,
      `"${b.paymentStatus}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `studio-bloom-bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onTriggerToast('Exported booking records to CSV file! 📊', 'download');
  };

  const totalFee = bookings.reduce((sum, b) => sum + (b.fee || 0), 0);
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-12 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Search, Filter & Action Control Card (Clean Top Card, Never Overlaps or Crops Content) */}
      <section className="pt-4 pb-2">
        <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex flex-col gap-4">
          {/* Top Row: Search Input & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input Box */}
            <div className="flex-1 flex items-center gap-2.5 px-3.5 h-11 rounded-xl bg-[#f9f9ff] border border-[#e9edff] focus-within:border-[#3525cd] focus-within:bg-white transition-all shadow-xs">
              <span className="material-symbols-outlined text-[#777587] text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by client name, phone, service, or #SC..."
                className="w-full bg-transparent text-[13px] text-[#141b2b] placeholder:text-[#777587] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[#777587] hover:text-[#141b2b] hover:bg-[#e9edff] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Actions: Add Booking & Export CSV */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              <button
                onClick={onAddBooking}
                className="h-11 px-4 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white flex items-center gap-2 text-[12px] font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                title="Add New Appointment"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Booking</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="h-11 px-3.5 rounded-xl bg-white border border-[#e9edff] flex items-center gap-1.5 text-[12px] font-semibold text-[#464555] hover:text-[#3525cd] hover:border-[#3525cd] shadow-xs cursor-pointer transition-colors"
                title="Export Bookings to CSV"
              >
                <span className="material-symbols-outlined text-[19px]">download</span>
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Status Filter Tabs & Summary Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f1f3ff]">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e9edff]'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'confirmed'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e9edff]'
                }`}
              >
                Confirmed ({confirmedCount})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e9edff]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'completed'
                    ? 'bg-[#00702f] text-white shadow-xs'
                    : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e9edff]'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="hidden md:flex items-center gap-2 text-[12px] text-[#777587]">
              <span>Filtered: <strong className="text-[#141b2b]">{filtered.length}</strong></span>
              <span>•</span>
              <span>Total Value: <strong className="text-[#3525cd] font-display">₱{totalFee.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Bookings Card Grid (Fully Visible, Never Cropped or Hidden) */}
      <section className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(b => (
          <div
            key={b.id}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs hover:border-[#3525cd] hover:shadow-md transition-all flex flex-col gap-3.5"
          >
            {/* Header: Client Avatar, Name, Status Badge, Booking # & Fee */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {b.clientAvatar ? (
                  <img referrerPolicy="no-referrer" 
                    src={b.clientAvatar}
                    alt={b.clientName}
                    className="w-11 h-11 rounded-full object-cover shadow-xs shrink-0 ring-2 ring-[#e9edff]"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#e9edff] text-[#3525cd] flex items-center justify-center font-bold text-[14px] shrink-0">
                    {b.clientInitials || b.clientName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[15px] font-bold text-[#141b2b] truncate">{b.clientName}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                        b.status === 'confirmed'
                          ? 'bg-[#7ffc97] text-[#002109]'
                          : b.status === 'pending'
                          ? 'bg-[#ffe8b3] text-[#78350f]'
                          : 'bg-[#e9edff] text-[#00702f]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#777587] font-medium">{b.clientPhone}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono font-semibold text-[#777587] block">#{b.bookingNumber}</span>
                <div className="text-[17px] font-bold text-[#141b2b] font-display">
                  ₱{b.fee.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Service & Time Info Container */}
            <div className="p-3 rounded-xl bg-[#f1f3ff] flex items-center justify-between gap-3 text-[12px]">
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[#141b2b] truncate">{b.serviceTitle}</span>
                <span className="text-[#464555] text-[11px] truncate">
                  {b.date} • {b.time} ({b.duration})
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-semibold text-[#3525cd] block">{b.stylistName}</span>
                <span className="text-[11px] text-[#777587]">{b.paymentStatus}</span>
              </div>
            </div>

            {/* Client Note (if present) */}
            {b.clientNote && (
              <div className="text-[12px] text-[#464555] bg-[#fff8e6] p-2.5 rounded-xl border border-[#ffe8b3]/70 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">
                  description
                </span>
                <span className="leading-snug">{b.clientNote}</span>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-2 border-t border-[#f1f3ff] gap-2">
              {b.status === 'pending' ? (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      onAcceptBooking(b.id);
                      onTriggerToast(`Accepted booking #${b.bookingNumber} for ${b.clientName}! ✅`, 'check_circle');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[17px]">check</span>
                    <span>Accept Booking</span>
                  </button>
                  <button
                    onClick={() => {
                      onDeclineBooking(b.id);
                      onTriggerToast(`Declined booking #${b.bookingNumber}`, 'cancel');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#f1f3ff] text-[#ba1a1a] text-[13px] font-semibold hover:bg-[#ffe5e5] cursor-pointer transition-colors"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full gap-2">
                  <button
                    onClick={() => {
                      onCheckInToggle(b.id);
                      onTriggerToast(
                        b.isCheckedIn
                          ? `Undid check-in for ${b.clientName}`
                          : `${b.clientName} checked in at Studio Bloom! 🎉`,
                        'how_to_reg'
                      );
                    }}
                    className={`px-3.5 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      b.isCheckedIn
                        ? 'bg-[#7ffc97] text-[#002109]'
                        : 'bg-[#e9edff] text-[#3525cd] hover:bg-[#dce2f7]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {b.isCheckedIn ? 'done_all' : 'how_to_reg'}
                    </span>
                    <span>{b.isCheckedIn ? 'Checked In' : 'Check In Client'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTriggerToast(`Sent appointment reminder SMS to ${b.clientName}! 📲`, 'send')}
                      className="p-2 rounded-xl bg-[#f1f3ff] text-[#464555] hover:text-[#3525cd] hover:bg-[#e9edff] transition-colors cursor-pointer"
                      title="Send SMS / WhatsApp Reminder"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </button>
                    <button
                      onClick={() => onTriggerToast(`Downloaded receipt for #${b.bookingNumber}`, 'receipt')}
                      className="p-2 rounded-xl bg-[#f1f3ff] text-[#464555] hover:text-[#3525cd] hover:bg-[#e9edff] transition-colors cursor-pointer"
                      title="Print / View Receipt"
                    >
                      <span className="material-symbols-outlined text-[18px]">receipt</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-10 text-center bg-white rounded-2xl border border-[#e9edff] shadow-xs flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#777587]">
              <span className="material-symbols-outlined text-[24px]">search_off</span>
            </div>
            <h4 className="text-[15px] font-bold text-[#141b2b]">No bookings match your filter</h4>
            <p className="text-[12px] text-[#777587]">Try adjusting your search query or switching status filters.</p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#3525cd] text-white text-[12px] font-bold hover:bg-[#4f46e5] transition-all cursor-pointer shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
