import React, { useState } from 'react';
import { AppMode, ClientTab, BusinessTab, AdminTab } from '../types';
import { ASSETS } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  clientTab: ClientTab;
  setClientTab: (tab: ClientTab) => void;
  businessTab: BusinessTab;
  setBusinessTab: (tab: BusinessTab) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
  onTriggerToast: (msg: string, icon?: string) => void;
  title?: string;
  subtitle?: string;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  setAppMode,
  clientTab,
  setClientTab,
  businessTab,
  setBusinessTab,
  adminTab,
  setAdminTab,
  onOpenAuth,
  onOpenSearch,
  onTriggerToast,
  title,
  subtitle,
  canGoBack,
  onGoBack
}) => {
  const { user, profile } = useAuth();
  const [showPortalSelector, setShowPortalSelector] = useState(false);

  // Compute title & subtitle if not explicitly passed
  let displayTitle = title;
  let displaySubtitle = subtitle;

  if (!displayTitle) {
    if (appMode === 'client') {
      displayTitle = 'Scheduly';
      if (clientTab === 'home') displaySubtitle = 'Home';
      else if (clientTab === 'explore') displaySubtitle = 'Explore';
      else if (clientTab === 'bookings') displaySubtitle = 'Bookings';
      else if (clientTab === 'favorites') displaySubtitle = 'Favorites';
      else if (clientTab === 'profile') displaySubtitle = 'Profile';
      else if (clientTab === 'service-detail') displayTitle = 'Service Details';
      else if (clientTab === 'booking-flow') displayTitle = 'Select Time Slot';
    } else if (appMode === 'business') {
      displayTitle = 'Studio Bloom';
      displaySubtitle = 'Business Portal';
    } else if (appMode === 'admin') {
      displayTitle = 'Scheduly';
      displaySubtitle = 'Admin Console';
    }
  }

  const handlePortalSwitch = (mode: AppMode) => {
    setAppMode(mode);
    setShowPortalSelector(false);
    if (mode === 'client') {
      setClientTab('home');
      onTriggerToast('Switched to Client Consumer View 🛍️', 'person');
    } else if (mode === 'business') {
      setBusinessTab('overview');
      onTriggerToast('Switched to Studio Bloom Business Portal 💼', 'storefront');
    } else if (mode === 'admin') {
      setAdminTab('overview');
      onTriggerToast('Switched to Super Admin Console 🛡️', 'admin_panel_settings');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f9f9ff]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-[env(safe-area-inset-top,0px)]">
      <div className="h-16 px-4 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-2 w-full">
        {/* Left: Back button OR Logo & Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {canGoBack && onGoBack ? (
            <button
              onClick={onGoBack}
              aria-label="Go back"
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-[#141b2b] hover:bg-[#e9edff] transition-colors shrink-0 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          ) : null}

          {/* Scheduly Logo Icon & Portal Trigger */}
          <button
            onClick={() => setShowPortalSelector(!showPortalSelector)}
            className="flex items-center gap-2 min-w-0 group text-left cursor-pointer"
            title="Switch portal view"
          >
            <div className="w-8 h-8 rounded-xl bg-[#e9edff] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform overflow-hidden ring-1 ring-[#e9edff]">
              <img
                src={appMode === 'business' ? ASSETS.studioLogo : ASSETS.logo}
                alt="Logo"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = ASSETS.logo; }}
                className="w-full h-full object-cover"
              />
            </div>
            {appMode === 'admin' ? (
              <div className="flex items-center gap-1">
                <span className="bg-[#3525cd]/10 text-[#3525cd] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                  Admin Console
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#777587] group-hover:text-[#3525cd] transition-transform duration-200">
                  {showPortalSelector ? 'expand_less' : 'arrow_drop_down'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[15px] text-[#141b2b] truncate group-hover:text-[#3525cd] transition-colors leading-tight">
                    {displayTitle}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#777587] group-hover:text-[#3525cd] transition-transform duration-200">
                    {showPortalSelector ? 'expand_less' : 'arrow_drop_down'}
                  </span>
                </div>
                {displaySubtitle && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#464555] truncate leading-none">
                    {displaySubtitle}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>

        {/* Center Desktop Navigation Tabs (visible on >= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1 mx-2">
          {appMode === 'client' && (
            <>
              <button
                onClick={() => setClientTab('home')}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  clientTab === 'home'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setClientTab('explore')}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  clientTab === 'explore'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Explore
              </button>
              <button
                onClick={() => setClientTab('bookings')}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                  clientTab === 'bookings'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                <span>Bookings</span>
                <span className={`w-1.5 h-1.5 rounded-full ${clientTab === 'bookings' ? 'bg-white' : 'bg-[#3525cd]'}`}></span>
              </button>
              <button
                onClick={() => setClientTab('favorites')}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  clientTab === 'favorites'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Favorites
              </button>
            </>
          )}

          {appMode === 'business' && (
            <>
              <button
                onClick={() => setBusinessTab('overview')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  businessTab === 'overview'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setBusinessTab('calendar')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  businessTab === 'calendar'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setBusinessTab('bookings')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  businessTab === 'bookings'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setBusinessTab('clients')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  businessTab === 'clients'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Clients
              </button>
              <button
                onClick={() => setBusinessTab('services')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  businessTab === 'services'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setBusinessTab('analytics')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  businessTab === 'analytics'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Analytics
              </button>
            </>
          )}

          {appMode === 'admin' && (
            <>
              <button
                onClick={() => setAdminTab('overview')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  adminTab === 'overview'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Pulse
              </button>
              <button
                onClick={() => setAdminTab('businesses')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  adminTab === 'businesses'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                KYC
              </button>
              <button
                onClick={() => setAdminTab('users')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  adminTab === 'users'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setAdminTab('reports')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  adminTab === 'reports'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Moderation
              </button>
              <button
                onClick={() => setAdminTab('settings')}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  adminTab === 'settings'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff]'
                }`}
              >
                Settings
              </button>
            </>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Role Switcher Pill */}
          <div className="hidden sm:flex items-center bg-[#e9edff] p-0.5 rounded-full mr-1">
            <button
              onClick={() => handlePortalSwitch('client')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                appMode === 'client' ? 'bg-[#ffffff] text-[#3525cd] shadow-xs' : 'text-[#464555] hover:text-[#141b2b]'
              }`}
            >
              Client
            </button>
            <button
              onClick={() => handlePortalSwitch('business')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                appMode === 'business' ? 'bg-[#ffffff] text-[#3525cd] shadow-xs' : 'text-[#464555] hover:text-[#141b2b]'
              }`}
            >
              Business
            </button>
            <button
              onClick={() => handlePortalSwitch('admin')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                appMode === 'admin' ? 'bg-[#ffffff] text-[#3525cd] shadow-xs' : 'text-[#464555] hover:text-[#141b2b]'
              }`}
            >
              Admin
            </button>
          </div>

          {appMode !== 'admin' && (
            <button
              onClick={onOpenSearch}
              aria-label="Search services"
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#464555] hover:text-[#141b2b] hover:bg-[#e9edff] transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
          )}

          <button
            onClick={() => onTriggerToast(appMode === 'admin' ? '6 business verification applications in queue' : 'All appointments are up to date! 🔔', 'notifications')}
            aria-label="Notifications"
            className="relative w-11 h-11 flex items-center justify-center text-[#464555] hover:text-[#141b2b] rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ring-2 ring-[#f9f9ff] ${appMode === 'admin' ? 'bg-[#ba1a1a]' : 'bg-[#3525cd]'}`}></span>
          </button>

          <button
            onClick={onOpenAuth}
            aria-label="User profile & auth"
            className="w-11 h-11 flex items-center justify-center group cursor-pointer"
            title="Sign In / Switch Accounts"
          >
            <img
              src={profile?.avatar_url || (appMode === 'client' ? ASSETS.userProfile : ASSETS.ownerProfile)}
              alt="Profile"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = ASSETS.userProfile; }}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#c7c4d8]/30 shadow-xs group-hover:ring-2 group-hover:ring-[#3525cd] transition-all"
            />
          </button>
        </div>
      </div>

      {/* Dropdown Menu for Quick View Switching */}
      {showPortalSelector && (
        <div className="absolute top-16 left-4 right-4 max-w-sm mx-auto bg-[#ffffff] rounded-2xl shadow-xl border border-[#e9edff] p-3 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
          <div className="px-2 py-1 text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
            Switch Perspective
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <button
              onClick={() => handlePortalSwitch('client')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                appMode === 'client' ? 'bg-[#e9edff] text-[#3525cd]' : 'hover:bg-[#f1f3ff] text-[#141b2b]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#e2dfff] text-[#3525cd] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </span>
                <div>
                  <div className="font-semibold text-[13px]">Consumer Client View</div>
                  <div className="text-[11px] text-[#464555]">Browse studios, book slots, my visits</div>
                </div>
              </div>
              {appMode === 'client' && (
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">check</span>
              )}
            </button>

            <button
              onClick={() => handlePortalSwitch('business')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                appMode === 'business' ? 'bg-[#e9edff] text-[#3525cd]' : 'hover:bg-[#f1f3ff] text-[#141b2b]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#e2dfff] text-[#3525cd] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                </span>
                <div>
                  <div className="font-semibold text-[13px]">Studio Bloom Business Portal</div>
                  <div className="text-[11px] text-[#464555]">Dashboard, calendar grid, CRM, services</div>
                </div>
              </div>
              {appMode === 'business' && (
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">check</span>
              )}
            </button>

            <button
              onClick={() => handlePortalSwitch('admin')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                appMode === 'admin' ? 'bg-[#e9edff] text-[#3525cd]' : 'hover:bg-[#f1f3ff] text-[#141b2b]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#dee2ef] text-[#5a5e69] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">gshield</span>
                </span>
                <div>
                  <div className="font-semibold text-[13px]">Super Admin Console</div>
                  <div className="text-[11px] text-[#464555]">KYC verification, business directory</div>
                </div>
              </div>
              {appMode === 'admin' && (
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">check</span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
