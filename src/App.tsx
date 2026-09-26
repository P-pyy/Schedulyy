import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppMode, ClientTab, BusinessTab, AdminTab, Booking, SalonService, ToastMessage } from './types';
import { INITIAL_BOOKINGS, INITIAL_SERVICES, ASSETS } from './data/mockData';
import { useAuth } from './hooks/useAuth';
import { getBookings, updateBookingStatus, setBookingCheckIn } from './lib/database';
import { isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './views/HomeScreen';
import { ExploreScreen } from './views/ExploreScreen';
import { ServiceDetailsScreen } from './views/ServiceDetailsScreen';
import { BookingSlotScreen } from './views/BookingSlotScreen';
import { ClientBookingsScreen } from './views/ClientBookingsScreen';
import { BusinessOverviewScreen } from './views/BusinessOverviewScreen';
import { BusinessCalendarScreen } from './views/BusinessCalendarScreen';
import { BusinessBookingsScreen } from './views/BusinessBookingsScreen';
import { BusinessClientsScreen } from './views/BusinessClientsScreen';
import { ServicesManagementScreen } from './views/ServicesManagementScreen';
import { BusinessAnalyticsScreen } from './views/BusinessAnalyticsScreen';
import { AdminConsoleScreen } from './views/AdminConsoleScreen';
import { FavoritesScreen } from './views/FavoritesScreen';
import { AuthModal } from './views/AuthModal';

export function App() {
  const { user, profile, role, appMode: authAppMode, signOut } = useAuth();

  const [appMode, setAppMode] = useState<AppMode>('client');
  const [clientTab, setClientTab] = useState<ClientTab>('home');
  const [businessTab, setBusinessTab] = useState<BusinessTab>('overview');
  const [adminTab, setAdminTab] = useState<AdminTab>('settings');

  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [selectedService, setSelectedService] = useState<SalonService>(INITIAL_SERVICES[0]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load real bookings from Supabase
  useEffect(() => {
    async function loadBookings() {
      if (isSupabaseConfigured) {
        try {
          const loaded = await getBookings({
            clientUserId: appMode === 'client' && user ? user.id : undefined
          });
          if (loaded && loaded.length > 0) {
            setBookings(loaded);
          }
        } catch (err) {
          console.warn('Failed to load bookings from Supabase:', err);
        }
      }
    }
    loadBookings();
  }, [user, appMode]);

  // Sync mode with real profile role when authenticating
  useEffect(() => {
    if (user && profile?.role) {
      if (profile.role === 'admin') {
        setAppMode('admin');
      } else if (profile.role === 'business_owner' || profile.role === 'staff') {
        setAppMode('business');
      } else {
        setAppMode('client');
      }
    }
  }, [user, profile]);

  // Trigger tactile floating toast notifications
  const triggerToast = (message: string, icon = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, icon, type: 'info' }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Client actions
  const handleSelectStudio = (_studioId: string) => {
    setClientTab('service-detail');
    triggerToast('Viewing Studio Bloom verified salon details 🌿', 'storefront');
  };

  const handleContinueToSlots = (service: SalonService) => {
    setSelectedService(service);
    setClientTab('booking-flow');
  };

  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    setClientTab('bookings');
  };

  const handleReschedule = (booking: Booking) => {
    setBookings(prev => prev.map(b => (b.id === booking.id ? booking : b)));
  };

  const handleAddCustomBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleCancelBooking = async (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    );
    if (isSupabaseConfigured) {
      try {
        await updateBookingStatus(bookingId, 'cancelled');
      } catch (err) {
        console.warn('Failed to cancel booking in Supabase:', err);
      }
    }
    triggerToast('Appointment cancelled. Fee refunded to original payment.', 'cancel');
  };

  // Business actions
  const handleAcceptBooking = async (id: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'confirmed' as const } : b))
    );
    if (isSupabaseConfigured) {
      try {
        await updateBookingStatus(id, 'confirmed');
      } catch (err) {
        console.warn('Failed to confirm booking in Supabase:', err);
      }
    }
  };

  const handleDeclineBooking = async (id: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    );
    if (isSupabaseConfigured) {
      try {
        await updateBookingStatus(id, 'cancelled');
      } catch (err) {
        console.warn('Failed to decline booking in Supabase:', err);
      }
    }
  };

  const handleCheckInToggle = async (id: string) => {
    const target = bookings.find(b => b.id === id);
    if (!target) return;
    const newState = !target.isCheckedIn;
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, isCheckedIn: newState } : b))
    );
    if (isSupabaseConfigured) {
      try {
        await setBookingCheckIn(id, newState);
      } catch (err) {
        console.warn('Failed to set check in status in Supabase:', err);
      }
    }
    triggerToast(
      newState ? `${target.clientName} marked as checked in! 🚪` : `Check-in reverted for ${target.clientName}`,
      'check_circle'
    );
  };

  const handleAddBookingWalkIn = () => {
    const generatedId = `SC-${Math.floor(2000 + Math.random() * 8000)}`;
    const newWalkIn: Booking = {
      id: generatedId,
      bookingNumber: generatedId,
      clientName: 'Walk-in Guest',
      clientPhone: '+63 900 000 0000',
      clientInitials: 'W',
      serviceTitle: 'Signature Haircut & Wash',
      stylistName: 'Julian Cruz',
      stylistAvatar: ASSETS.julianAvatar,
      date: 'Tuesday, Oct 20, 2026',
      time: '11:30 AM',
      duration: '30 mins',
      fee: 450,
      status: 'confirmed',
      paymentStatus: 'Unpaid',
      paymentMethod: 'Pay at Venue',
      location: 'Unit 302, High Street South, BGC, Taguig',
      businessName: 'Studio Bloom'
    };
    setBookings([newWalkIn, ...bookings]);
    triggerToast('Walk-in booking added at 11:30 AM slot! ✂️', 'add_circle');
  };

  // Back button handling in client nested views
  const canGoBack = appMode === 'client' && (clientTab === 'service-detail' || clientTab === 'booking-flow');
  const handleGoBack = () => {
    if (clientTab === 'booking-flow') {
      setClientTab('service-detail');
    } else if (clientTab === 'service-detail') {
      setClientTab('explore');
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col font-sans selection:bg-[#3525cd]/15">
      {/* Dynamic Header with Multi-Perspective Switcher */}
      <Header
        appMode={appMode}
        setAppMode={setAppMode}
        clientTab={clientTab}
        setClientTab={setClientTab}
        businessTab={businessTab}
        setBusinessTab={setBusinessTab}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSearch={() => {
          if (appMode === 'client') {
            setClientTab('explore');
          } else {
            triggerToast('Search ready across all appointment records 🔍', 'search');
          }
        }}
        onTriggerToast={triggerToast}
        canGoBack={canGoBack}
        onGoBack={handleGoBack}
      />

      {/* Main Screen Views Routing */}
      <main className="flex-1 w-full pt-16 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${appMode}-${appMode === 'client' ? clientTab : appMode === 'business' ? businessTab : adminTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="w-full flex-1"
          >
            {/* ==================== CLIENT VIEWS ==================== */}
        {appMode === 'client' && (
          <>
            {clientTab === 'home' && (
              <HomeScreen
                onStartFree={() => setClientTab('explore')}
                onExplore={() => setClientTab('explore')}
                onSelectStudio={handleSelectStudio}
                onTriggerToast={triggerToast}
              />
            )}

            {clientTab === 'explore' && (
              <ExploreScreen
                onSelectStudio={handleSelectStudio}
                onTriggerToast={triggerToast}
              />
            )}

            {clientTab === 'service-detail' && (
              <ServiceDetailsScreen
                onContinueToSlots={handleContinueToSlots}
                onTriggerToast={triggerToast}
              />
            )}

            {clientTab === 'booking-flow' && (
              <BookingSlotScreen
                service={selectedService}
                onBookingConfirmed={handleBookingConfirmed}
                onBack={handleGoBack}
                onTriggerToast={triggerToast}
              />
            )}

            {clientTab === 'bookings' && (
              <ClientBookingsScreen
                bookings={bookings}
                onBookNew={() => setClientTab('explore')}
                onSelectStudio={handleSelectStudio}
                onReschedule={handleReschedule}
                onCancelBooking={handleCancelBooking}
                onTriggerToast={triggerToast}
              />
            )}

            {clientTab === 'favorites' && (
              <FavoritesScreen
                onSelectStudio={handleSelectStudio}
                onExploreMore={() => setClientTab('explore')}
                onTriggerToast={triggerToast}
              />
            )}

            {clientTab === 'profile' && (
              <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-4 pb-28 lg:pb-8">
                <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex items-center gap-4">
                  <img
                    src={profile?.avatar_url || ASSETS.alexAvatar}
                    alt={profile?.full_name || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-[#3525cd]/15"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-bold text-[#141b2b]">
                        {profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Alex Santos')}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-[#dee2ef] text-[#3525cd] text-[10px] font-bold uppercase">
                        {profile?.role || (user ? 'Customer' : 'VIP')}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#464555]">
                      {profile?.phone || '+63 917 555 0192'} • {user?.email || 'BGC, Taguig'}
                    </p>
                    <p className="text-[12px] text-[#00702f] font-semibold mt-1">
                      {user ? 'Authenticated Supabase User' : '14 visits completed with 5-star punctuality'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setAppMode('business');
                      triggerToast('Switched to Business Portal view', 'storefront');
                    }}
                    className="w-full p-4 rounded-xl bg-[#e9edff] text-[#3525cd] font-bold text-[14px] flex items-center justify-between hover:bg-[#dce2f7] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">storefront</span>
                      <span>Switch to Business Portal (Studio Bloom)</span>
                    </span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>

                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="w-full p-4 rounded-xl bg-white border border-[#e9edff] text-[#141b2b] font-semibold text-[14px] flex items-center justify-between hover:bg-[#f1f3ff] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">account_circle</span>
                      <span>Account Credentials &amp; Passwords</span>
                    </span>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>

                  {user && (
                    <button
                      onClick={async () => {
                        await signOut();
                        triggerToast('Signed out of Supabase session', 'logout');
                      }}
                      className="w-full p-4 rounded-xl bg-[#fee2e2] text-[#991b1b] font-semibold text-[14px] flex items-center justify-between hover:bg-[#fecaca] cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined">logout</span>
                        <span>Sign Out ({user.email})</span>
                      </span>
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== BUSINESS VIEWS ==================== */}
        {appMode === 'business' && (
          <>
            {businessTab === 'overview' && (
              <BusinessOverviewScreen
                bookings={bookings}
                onNavigateTab={(tab) => setBusinessTab(tab)}
                onCheckInToggle={handleCheckInToggle}
                onAddBooking={handleAddCustomBooking}
                onTriggerToast={triggerToast}
              />
            )}

            {businessTab === 'calendar' && (
              <BusinessCalendarScreen
                bookings={bookings}
                onSelectBooking={(b) => triggerToast(`Viewing booking #${b.bookingNumber}`, 'event')}
                onAddAppointment={handleAddBookingWalkIn}
                onTriggerToast={triggerToast}
              />
            )}

            {businessTab === 'bookings' && (
              <BusinessBookingsScreen
                bookings={bookings}
                onAcceptBooking={handleAcceptBooking}
                onDeclineBooking={handleDeclineBooking}
                onCheckInToggle={handleCheckInToggle}
                onAddBooking={handleAddBookingWalkIn}
                onTriggerToast={triggerToast}
              />
            )}

            {businessTab === 'clients' && (
              <BusinessClientsScreen onTriggerToast={triggerToast} />
            )}

            {businessTab === 'services' && (
              <ServicesManagementScreen
                onPreviewPublicStore={() => {
                  setAppMode('client');
                  setClientTab('service-detail');
                  triggerToast('Showing public storefront view for Studio Bloom 🛍️', 'visibility');
                }}
                onTriggerToast={triggerToast}
              />
            )}

            {businessTab === 'analytics' && (
              <BusinessAnalyticsScreen onTriggerToast={triggerToast} />
            )}
          </>
        )}

        {/* ==================== ADMIN VIEWS ==================== */}
        {appMode === 'admin' && (
          <AdminConsoleScreen
            adminTab={adminTab}
            onNavigateTab={setAdminTab}
            onTriggerToast={triggerToast}
          />
        )}
      </motion.div>
    </AnimatePresence>
      </main>

      {/* Floating Tactical Toast Banner Stack */}
      <div className="fixed top-20 left-4 right-4 z-50 flex flex-col items-center pointer-events-none gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto max-w-sm w-full bg-[#141b2b] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-[#7ffc97] text-[20px] shrink-0">
                {toast.icon || 'check_circle'}
              </span>
              <span className="text-[13px] font-medium flex-1">{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-white/60 hover:text-white p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Business "More" Drawer Menu */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-0">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-bottom duration-200 pb-10">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-2">
              <span className="text-[14px] font-bold text-[#141b2b]">Studio Bloom Menu</span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <button
              onClick={() => {
                setBusinessTab('services');
                setIsMoreMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] flex items-center gap-3 text-left transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-[#3525cd] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </span>
              <div>
                <div className="font-bold text-[14px] text-[#141b2b]">Services &amp; Pricing</div>
                <div className="text-[11px] text-[#464555]">Configure durations, active menus &amp; public link</div>
              </div>
            </button>

            <button
              onClick={() => {
                setBusinessTab('analytics');
                setIsMoreMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] flex items-center gap-3 text-left transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-[#00702f] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">insights</span>
              </span>
              <div>
                <div className="font-bold text-[14px] text-[#141b2b]">Revenue &amp; Analytics</div>
                <div className="text-[11px] text-[#464555]">Velocity charts, occupancy rate &amp; staff earnings</div>
              </div>
            </button>

            <button
              onClick={() => {
                setAppMode('client');
                setClientTab('service-detail');
                setIsMoreMenuOpen(false);
                triggerToast('Switched to customer storefront preview! 🛍️', 'storefront');
              }}
              className="p-3 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] flex items-center gap-3 text-left transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
              </span>
              <div>
                <div className="font-bold text-[14px] text-[#141b2b]">Preview Client Storefront</div>
                <div className="text-[11px] text-[#464555]">See how clients view and book your salon</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav
        appMode={appMode}
        clientTab={clientTab}
        setClientTab={setClientTab}
        businessTab={businessTab}
        setBusinessTab={setBusinessTab}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(role) => {
          setAppMode(role);
          if (role === 'business') {
            setBusinessTab('overview');
          } else {
            setClientTab('bookings');
          }
        }}
        onTriggerToast={triggerToast}
      />
    </div>
  );
}

export default App;
