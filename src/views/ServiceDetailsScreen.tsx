import React, { useState } from 'react';
import { SalonService } from '../types';
import { ASSETS, INITIAL_SERVICES } from '../data/mockData';

interface ServiceDetailsScreenProps {
  onContinueToSlots: (selectedService: SalonService) => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const ServiceDetailsScreen: React.FC<ServiceDetailsScreenProps> = ({
  onContinueToSlots,
  onTriggerToast
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('srv-1');
  const [activeTab, setActiveTab] = useState<'services' | 'about' | 'reviews' | 'portfolio'>('services');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const selectedService = INITIAL_SERVICES.find(s => s.id === selectedServiceId) || INITIAL_SERVICES[0];

  const popularHaircuts = INITIAL_SERVICES.filter(s => s.id === 'srv-1' || s.id === 'srv-3');
  const colorTreatments = INITIAL_SERVICES.filter(s => s.id === 'srv-2' || s.id === 'srv-4');
  const nailTreatments = INITIAL_SERVICES.filter(s => s.id === 'srv-5');

  const handleToggleSelect = (service: SalonService) => {
    setSelectedServiceId(service.id);
    onTriggerToast(`Selected ${service.title} (₱${service.price.toLocaleString()})`, 'check_circle');
  };

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-16 max-w-6xl mx-auto lg:px-6">
      {/* Interactive Top Action Row */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e1e8fd] text-[#141b2b] text-[12px] font-semibold">
          <span className="material-symbols-outlined text-[16px] text-[#00702f]" style={{ fontVariationSettings: "'FILL' 1" }}>
            eco
          </span>
          Eco-certified Salon
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerToast('Share link copied to clipboard! 🔗', 'ios_share')}
            aria-label="Share studio"
            className="w-10 h-10 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b] hover:bg-[#dce2f7] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
          <button
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              onTriggerToast(isBookmarked ? 'Removed from favorites' : 'Added to favorites ⭐', 'bookmark');
            }}
            aria-label="Bookmark studio"
            className="w-10 h-10 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b] hover:bg-[#dce2f7] transition-colors"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${isBookmarked ? 'text-[#3525cd]' : ''}`}
              style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
          </button>
        </div>
      </div>

      {/* Studio Hero Profile Card */}
      <section className="px-4 pt-1">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-[#e9edff]">
          <div className="relative h-48 w-full overflow-hidden bg-[#e9edff]">
            <img
              src={ASSETS.studioBloomInside}
              alt="Studio Bloom Interior"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = ASSETS.studioBloomHero; }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141b2b]/85 via-[#141b2b]/25 to-transparent"></div>

            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-semibold text-[#141b2b] shadow-xs">
                <span className="material-symbols-outlined text-[#3525cd] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                Verified Partner
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#dce2f7]">
                  Hair &amp; Beauty Sanctuary
                </span>
                <h2 className="text-[26px] font-bold text-white drop-shadow-xs font-display leading-tight">
                  Studio Bloom
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white text-[#3525cd] text-[12px] font-bold shadow-xs">
                Top Rated
              </span>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[13px] text-[#464555]">
              <span className="inline-flex items-center font-bold text-[#141b2b]">
                <span className="material-symbols-outlined text-[16px] text-amber-500 mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                4.9
              </span>
              <span>(128 verified reviews)</span>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5 text-[#141b2b]">
                <span className="material-symbols-outlined text-[15px] text-[#3525cd]">location_on</span>
                High Street, BGC, Taguig
              </span>
            </div>

            <div className="flex items-center gap-2 text-[12px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7ffc97] text-[#002109] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#005522]"></span>
                Open now
              </span>
              <span className="text-[#464555] font-medium">Closes 8:00 PM • Valet parking available</span>
            </div>

            {/* Action Pills Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => onTriggerToast('Opening navigation route to BGC High Street South...', 'navigation')}
                className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors text-[#141b2b]"
              >
                <div className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-[18px]">turn_right</span>
                </div>
                <span className="text-[11px] font-medium">Directions</span>
              </button>

              <button
                onClick={() => onTriggerToast('Live chat connected with Studio Bloom receptionist', 'chat')}
                className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors text-[#141b2b]"
              >
                <div className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                </div>
                <span className="text-[11px] font-medium">Message</span>
              </button>

              <button
                onClick={() => onTriggerToast('Calling Studio Bloom direct front desk: +63 2 8888 1234', 'call')}
                className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors text-[#141b2b]"
              >
                <div className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </div>
                <span className="text-[11px] font-medium">Call</span>
              </button>

              <button
                onClick={() => onTriggerToast('Studio profile link ready to share!', 'ios_share')}
                className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors text-[#141b2b]"
              >
                <div className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-[18px]">ios_share</span>
                </div>
                <span className="text-[11px] font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Segmented Navigation Tabs */}
      <div className="sticky top-16 z-30 px-4 pt-4 pb-2 bg-[#f9f9ff]/95 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('services')}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#e9edff] text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            <span>Services</span>
            <span className="w-5 h-5 rounded-full bg-white/25 text-white text-[11px] flex items-center justify-center">
              5
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('about');
              onTriggerToast('Viewing Studio Bloom operating hours & amenities', 'info');
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#e9edff] text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            About &amp; Hours
          </button>

          <button
            onClick={() => {
              setActiveTab('reviews');
              onTriggerToast('Viewing 128 verified customer reviews ⭐', 'star');
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#e9edff] text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            <span>Reviews</span>
            <span className="text-[11px] opacity-80">128</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('portfolio');
              onTriggerToast('Viewing client transformations & salon gallery 📷', 'photo_library');
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#e9edff] text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            Portfolio
          </button>
        </div>
      </div>

      {/* TAB 1: SERVICES LIST */}
      {activeTab === 'services' && (
        <div className="px-4 flex flex-col gap-5 pt-2">
          {/* Category 1: Popular Haircuts */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3525cd]"></span>
                <h3 className="text-[18px] font-bold text-[#141b2b] font-display">Popular Haircuts</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#464555]">2 services</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {popularHaircuts.map(srv => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <article
                    key={srv.id}
                    onClick={() => handleToggleSelect(srv)}
                    className={`p-4 rounded-2xl bg-white shadow-xs border transition-all duration-150 flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected ? 'border-2 border-[#3525cd] ring-4 ring-[#3525cd]/10' : 'border-[#e9edff] hover:border-[#c7c4d8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[16px] font-bold text-[#141b2b]">{srv.title}</h4>
                          {srv.isPopular && (
                            <span className="px-2 py-0.5 rounded-full bg-[#e2dfff] text-[#3323cc] text-[11px] font-semibold">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#464555] mt-1 line-clamp-2">{srv.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[#464555] text-[12px]">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[15px] text-[#5a5e69]">schedule</span>
                            {srv.duration}
                          </span>
                          <span>•</span>
                          <span>Includes aromatic rinse</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#e9edff]">
                        <img
                          src={srv.image}
                          alt={srv.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.src = ASSETS.haircutService; }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#f1f3ff]">
                      <span className="text-[20px] font-bold text-[#141b2b] font-display">
                        ₱{srv.price.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(srv);
                        }}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#3525cd] text-white shadow-xs'
                            : 'bg-[#e9edff] text-[#3525cd] hover:bg-[#3525cd] hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {isSelected ? 'check' : 'add'}
                        </span>
                        <span>{isSelected ? 'Selected' : 'Book'}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Category 2: Color & Treatments */}
          <section className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4f46e5]"></span>
                <h3 className="text-[18px] font-bold text-[#141b2b] font-display">Color &amp; Treatments</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#464555]">2 services</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {colorTreatments.map(srv => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <article
                    key={srv.id}
                    onClick={() => handleToggleSelect(srv)}
                    className={`p-4 rounded-2xl bg-white shadow-xs border transition-all duration-150 flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected ? 'border-2 border-[#3525cd] ring-4 ring-[#3525cd]/10' : 'border-[#e9edff] hover:border-[#c7c4d8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[16px] font-bold text-[#141b2b]">{srv.title}</h4>
                        <p className="text-[12px] text-[#464555] mt-1 line-clamp-2">{srv.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[#464555] text-[12px]">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[15px] text-[#5a5e69]">schedule</span>
                            {srv.duration}
                          </span>
                          <span>•</span>
                          <span className="text-[#00702f] font-semibold">Includes toner</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#e9edff]">
                        <img
                          src={srv.image}
                          alt={srv.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.src = ASSETS.balayageService; }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#f1f3ff]">
                      <span className="text-[20px] font-bold text-[#141b2b] font-display">
                        ₱{srv.price.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(srv);
                        }}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#3525cd] text-white shadow-xs'
                            : 'bg-[#e9edff] text-[#3525cd] hover:bg-[#3525cd] hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {isSelected ? 'check' : 'add'}
                        </span>
                        <span>{isSelected ? 'Selected' : 'Book'}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Category 3: Nail & Grooming */}
          <section className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5a5e69]"></span>
                <h3 className="text-[18px] font-bold text-[#141b2b] font-display">Nail &amp; Grooming</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#464555]">1 service</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nailTreatments.map(srv => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <article
                    key={srv.id}
                    onClick={() => handleToggleSelect(srv)}
                    className={`p-4 rounded-2xl bg-white shadow-xs border transition-all duration-150 flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected ? 'border-2 border-[#3525cd] ring-4 ring-[#3525cd]/10' : 'border-[#e9edff] hover:border-[#c7c4d8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[16px] font-bold text-[#141b2b]">{srv.title}</h4>
                        <p className="text-[12px] text-[#464555] mt-1 line-clamp-2">{srv.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[#464555] text-[12px]">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[15px] text-[#5a5e69]">schedule</span>
                            {srv.duration}
                          </span>
                          <span>•</span>
                          <span>Organic oils</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#e9edff]">
                        <img
                          src={srv.image}
                          alt={srv.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.src = ASSETS.manicureService; }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#f1f3ff]">
                      <span className="text-[20px] font-bold text-[#141b2b] font-display">
                        ₱{srv.price.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(srv);
                        }}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#3525cd] text-white shadow-xs'
                            : 'bg-[#e9edff] text-[#3525cd] hover:bg-[#3525cd] hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {isSelected ? 'check' : 'add'}
                        </span>
                        <span>{isSelected ? 'Selected' : 'Book'}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Quality Guarantee Box */}
          <div className="p-4 rounded-2xl bg-[#f1f3ff] flex items-center gap-3 text-[#464555] border border-[#e9edff]">
            <div className="w-10 h-10 rounded-full bg-[#7ffc97] flex items-center justify-center text-[#002109] shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#141b2b]">Scheduly Guarantee</h4>
              <p className="text-[12px] text-[#464555]">
                Instant booking confirmation, fee-free rescheduling up to 4 hours before.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ABOUT & HOURS */}
      {activeTab === 'about' && (
        <div className="px-4 flex flex-col gap-5 pt-2">
          {/* About Bio Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3">
            <h3 className="text-[18px] font-bold text-[#141b2b] font-display">About Studio Bloom</h3>
            <p className="text-[13px] text-[#464555] leading-relaxed">
              Founded in 2021 by Master Colorist Jamie Lim, Studio Bloom is Bonifacio Global City's sanctuary for sustainable, modern haircare. We combine cruelty-free formulas, precision European styling techniques, and bespoke color chemistry to nurture your hair's natural vitality.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#f1f3ff]">
              <div className="p-3 rounded-xl bg-[#f1f3ff] text-center">
                <span className="text-[18px] font-bold text-[#3525cd] block font-display">2021</span>
                <span className="text-[11px] text-[#464555]">Established</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f1f3ff] text-center">
                <span className="text-[18px] font-bold text-[#3525cd] block font-display">3,400+</span>
                <span className="text-[11px] text-[#464555]">Happy Clients</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f1f3ff] text-center">
                <span className="text-[18px] font-bold text-[#3525cd] block font-display">4.9★</span>
                <span className="text-[11px] text-[#464555]">Satisfaction</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f1f3ff] text-center">
                <span className="text-[18px] font-bold text-[#00702f] block font-display">100%</span>
                <span className="text-[11px] text-[#464555]">Eco-Certified</span>
              </div>
            </div>
          </div>

          {/* Operating Hours Table */}
          <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#141b2b] font-display">Opening Hours</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7ffc97] text-[#002109] text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005522] animate-pulse"></span>
                Open Today
              </span>
            </div>

            <div className="flex flex-col divide-y divide-[#f1f3ff] text-[13px]">
              {[
                { day: 'Monday', hours: '9:00 AM – 8:00 PM', isToday: false },
                { day: 'Tuesday', hours: '9:00 AM – 8:00 PM', isToday: true },
                { day: 'Wednesday', hours: '9:00 AM – 8:00 PM', isToday: false },
                { day: 'Thursday', hours: '9:00 AM – 8:00 PM', isToday: false },
                { day: 'Friday', hours: '9:00 AM – 9:00 PM', isToday: false },
                { day: 'Saturday', hours: '9:00 AM – 9:00 PM', isToday: false },
                { day: 'Sunday', hours: '10:00 AM – 7:00 PM', isToday: false }
              ].map(schedule => (
                <div
                  key={schedule.day}
                  className={`py-2.5 flex items-center justify-between px-2 rounded-lg transition-colors ${
                    schedule.isToday ? 'bg-[#e9edff] font-bold text-[#3525cd]' : 'text-[#464555]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {schedule.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>
                    )}
                    <span>{schedule.day}</span>
                    {schedule.isToday && (
                      <span className="text-[10px] uppercase font-bold text-[#3525cd] bg-white px-1.5 py-0.2 rounded">
                        Today
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums font-medium">{schedule.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities & Payment Options */}
          <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3">
            <h3 className="text-[17px] font-bold text-[#141b2b] font-display">Amenities &amp; Policies</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { icon: 'local_parking', title: 'Valet Parking', desc: 'Complimentary for guests' },
                { icon: 'wifi', title: 'High-Speed WiFi', desc: '500 Mbps guest network' },
                { icon: 'coffee', title: 'Artisan Barista', desc: 'Specialty coffee & teas' },
                { icon: 'eco', title: 'Eco-Certified', desc: 'Sulfate-free vegan products' },
                { icon: 'payments', title: 'Cashless Accepted', desc: 'GCash, Maya, Cards' },
                { icon: 'accessible', title: 'Accessible', desc: 'Elevators & wide ramps' }
              ].map((amenity, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#f1f3ff] border border-[#e9edff] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#3525cd] text-[20px] shrink-0 mt-0.5">
                    {amenity.icon}
                  </span>
                  <div>
                    <span className="text-[12px] font-bold text-[#141b2b] block">{amenity.title}</span>
                    <span className="text-[11px] text-[#464555]">{amenity.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Contact Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3">
            <h3 className="text-[17px] font-bold text-[#141b2b] font-display">Location &amp; Contact</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#f1f3ff]">
              <div>
                <span className="text-[13px] font-bold text-[#141b2b] block">Studio Bloom Flagship</span>
                <span className="text-[12px] text-[#464555]">Unit 302, High Street South, Bonifacio Global City, Taguig, 1634 Metro Manila</span>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#3525cd]">
                  <span>+63 2 8888 1234</span>
                  <span>•</span>
                  <span>hello@studiobloom.ph</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('Unit 302, High Street South, BGC, Taguig');
                    onTriggerToast('Address copied to clipboard! 📋', 'content_copy');
                  }}
                  className="px-3 py-2 rounded-xl bg-white border border-[#e9edff] hover:bg-[#e9edff] text-[12px] font-semibold text-[#141b2b] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => onTriggerToast('Opening Google Maps navigation route...', 'navigation')}
                  className="px-3.5 py-2 rounded-xl bg-[#3525cd] text-white hover:bg-[#4f46e5] text-[12px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">directions</span>
                  <span>Navigate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEWS & TESTIMONIALS */}
      {activeTab === 'reviews' && (
        <div className="px-4 flex flex-col gap-5 pt-2">
          {/* Reviews Scorecard Summary */}
          <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#f1f3ff] min-w-[100px]">
                <span className="text-[34px] font-extrabold text-[#141b2b] font-display leading-none">4.9</span>
                <div className="flex items-center text-amber-500 mt-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-[#464555] font-semibold mt-1">128 reviews</span>
              </div>

              <div className="flex-1 flex flex-col gap-1.5 min-w-[180px]">
                {[
                  { star: '5★', pct: 92 },
                  { star: '4★', pct: 6 },
                  { star: '3★', pct: 2 },
                  { star: '2★', pct: 0 },
                  { star: '1★', pct: 0 }
                ].map(r => (
                  <div key={r.star} className="flex items-center gap-2 text-[11px]">
                    <span className="w-5 text-[#464555] font-medium">{r.star}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                      <div style={{ width: `${r.pct}%` }} className="h-full bg-amber-400 rounded-full"></div>
                    </div>
                    <span className="w-7 text-right text-[#777587] font-semibold tabular-nums">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#eafaf1] border border-[#d5f5e3] flex flex-col gap-1 sm:max-w-xs">
              <span className="text-[12px] font-bold text-[#00702f] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Verified Guest Feedback
              </span>
              <p className="text-[11px] text-[#464555] leading-relaxed">
                Only clients with completed appointments can leave verified ratings. All feedback is authenticated.
              </p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="flex flex-col gap-3">
            {[
              {
                id: 'rev-1',
                client: 'Alex Santos',
                avatar: ASSETS.alexAvatar,
                rating: 5,
                service: 'Signature Haircut & Wash',
                stylist: 'Maria Santos',
                date: '2 days ago',
                comment: 'Maria is extraordinarily meticulous with texture and shape. The scalp massage with botanical peppermint oils was deeply relaxing. Will never go anywhere else in BGC!'
              },
              {
                id: 'rev-2',
                client: 'Camille David',
                avatar: ASSETS.camilleAvatar,
                rating: 5,
                service: 'Balayage & Gloss Treatment',
                stylist: 'Jamie Lim',
                date: '1 week ago',
                comment: 'Jamie is true hair royalty! My balayage blend is completely seamless with no brassiness. The shine from the gloss treatment has lasted over two weeks already.'
              },
              {
                id: 'rev-3',
                client: 'Sarah Tan',
                avatar: ASSETS.mayaAvatar,
                rating: 5,
                service: 'Styling & Blowout',
                stylist: 'Maria Santos',
                date: '2 weeks ago',
                comment: 'Booked a blowout before an executive presentation. Hair held volume through 8 hours of meetings and humidity. Front desk was punctual and courteous.'
              },
              {
                id: 'rev-4',
                client: 'Marco Valdez',
                avatar: ASSETS.marcoAvatar,
                rating: 4,
                service: 'Signature Haircut & Wash',
                stylist: 'Julian Cruz',
                date: '3 weeks ago',
                comment: 'Great cut and very clean aesthetic salon. Julian gave solid advice on styling products for humidity resistance. Highly recommended!'
              }
            ].map(rev => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.avatar}
                      alt={rev.client}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = ASSETS.alexAvatar; }}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-[#e9edff]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-[#141b2b]">{rev.client}</span>
                        <span className="material-symbols-outlined text-[14px] text-[#00702f]" title="Verified Booking">
                          verified
                        </span>
                      </div>
                      <span className="text-[11px] text-[#777587]">{rev.service} • with {rev.stylist}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-[#777587] mt-0.5">{rev.date}</span>
                  </div>
                </div>

                <p className="text-[12px] text-[#464555] leading-relaxed mt-1">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PORTFOLIO SHOWCASE */}
      {activeTab === 'portfolio' && (
        <div className="px-4 flex flex-col gap-5 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[18px] font-bold text-[#141b2b] font-display">Client Transformations</h3>
              <p className="text-[12px] text-[#464555]">Real styling results from our Studio Bloom specialists</p>
            </div>
            <span className="text-[12px] font-semibold text-[#3525cd]">7 showcases</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { img: ASSETS.balayageService, title: 'Sun-Kissed Balayage', stylist: 'Jamie Lim', tag: 'Color' },
              { img: ASSETS.haircutService, title: 'Precision Bob Cut', stylist: 'Maria Santos', tag: 'Cut' },
              { img: ASSETS.keratinService, title: 'Keratin Gloss Shine', stylist: 'Jamie Lim', tag: 'Treatment' },
              { img: ASSETS.blowoutService, title: 'Voluminous Blowout', stylist: 'Maria Santos', tag: 'Styling' },
              { img: ASSETS.manicureService, title: 'Gel Floral Manicure', stylist: 'Elena Cruz', tag: 'Nails' },
              { img: ASSETS.studioBloomInside, title: 'Styling Lounge', stylist: 'BGC Flagship', tag: 'Interior' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden bg-[#e9edff] aspect-square shadow-xs border border-[#e9edff] cursor-pointer"
                onClick={() => onTriggerToast(`Viewing ${item.title} by ${item.stylist}`, 'image')}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = ASSETS.haircutService; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-85 group-hover:opacity-95 transition-opacity"></div>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#141b2b] shadow-xs">
                    {item.tag}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <span className="text-[12px] font-bold block truncate drop-shadow-xs">{item.title}</span>
                  <span className="text-[10px] text-white/80 block truncate">by {item.stylist}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Summary Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl shadow-[0_-8px_24px_rgba(20,27,43,0.08)] px-4 py-2.5 pb-[env(safe-area-inset-bottom,10px)] border-t border-[#e9edff]">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          {/* Quick Detail Summary */}
          <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-pulse shrink-0"></span>
              <p className="text-[13px] text-[#141b2b] truncate">
                Selected:{' '}
                <span className="font-semibold text-[#3525cd]">
                  {selectedService.title}
                </span>
              </p>
            </div>
            <span className="text-[18px] font-bold text-[#141b2b] font-display shrink-0">
              ₱{selectedService.price.toLocaleString()}
            </span>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => onContinueToSlots(selectedService)}
            className="w-full sm:w-auto px-6 h-10 sm:h-11 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[14px] font-semibold shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shrink-0"
          >
            <span>Continue to Date &amp; Time</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
