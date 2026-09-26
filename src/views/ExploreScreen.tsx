import React, { useState, useEffect } from 'react';
import { Studio } from '../types';
import { INITIAL_STUDIOS, ASSETS } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { getBusinesses, getFavorites, toggleFavorite } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';

interface ExploreScreenProps {
  onSelectStudio: (studioId: string) => void;
  onTriggerToast: (msg: string, icon?: string) => void;
  initialCategory?: string;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onSelectStudio,
  onTriggerToast,
  initialCategory = 'all'
}) => {
  const { user } = useAuth();
  const [studios, setStudios] = useState<Studio[]>(INITIAL_STUDIOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({
    'studio-bloom': true,
    'northside-barber': true
  });

  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        try {
          const loaded = await getBusinesses();
          if (loaded && loaded.length > 0) {
            setStudios(loaded);
          }
          if (user) {
            const favs = await getFavorites(user.id);
            if (favs && favs.length > 0) {
              const map: Record<string, boolean> = {};
              favs.forEach(id => { map[id] = true; });
              setBookmarkedIds(map);
            }
          }
        } catch (err) {
          console.warn('Failed to load businesses from Supabase:', err);
        }
      }
    }
    loadData();
  }, [user]);

  // Working filter state
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterMinRating, setFilterMinRating] = useState<boolean>(false);
  const [filterAvailableToday, setFilterAvailableToday] = useState<boolean>(false);
  const [filterBudget, setFilterBudget] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price-asc' | 'reviews'>('recommended');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'hair', label: 'Hair & Styling' },
    { id: 'barber', label: 'Barber' },
    { id: 'nails', label: 'Nails & Spa' },
    { id: 'wellness', label: 'Wellness' },
    { id: 'tutors', label: 'Tutors' },
  ];

  const toggleBookmark = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const willBeSaved = !bookmarkedIds[id];
    setBookmarkedIds(prev => ({ ...prev, [id]: willBeSaved }));
    if (willBeSaved) {
      onTriggerToast(`Saved ${name} to your favorites shortlist! ⭐`, 'bookmark');
    } else {
      onTriggerToast(`Removed ${name} from saved favorites`, 'bookmark_border');
    }

    if (isSupabaseConfigured && user) {
      try {
        await toggleFavorite(user.id, id);
      } catch (err) {
        console.warn('Failed to toggle favorite in Supabase:', err);
      }
    }
  };

  const filteredStudios = studios.filter(studio => {
    // Search matching
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matches =
        studio.name.toLowerCase().includes(query) ||
        studio.category.toLowerCase().includes(query) ||
        studio.area.toLowerCase().includes(query) ||
        studio.location.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Category matching
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'hair' && !(studio.category.toLowerCase().includes('hair') || studio.id === 'studio-bloom')) return false;
      if (selectedCategory === 'barber' && !studio.category.toLowerCase().includes('barber')) return false;
      if (selectedCategory === 'nails' && !studio.category.toLowerCase().includes('nail')) return false;
      if (selectedCategory === 'wellness' && !(studio.category.toLowerCase().includes('wellness') || studio.category.toLowerCase().includes('spa'))) return false;
      if (selectedCategory === 'tutors' && !studio.category.toLowerCase().includes('tutor')) return false;
    }

    // Active Area Filter
    if (filterArea !== 'all' && !studio.area.toLowerCase().includes(filterArea.toLowerCase())) {
      return false;
    }

    // Rating Filter (4.8+)
    if (filterMinRating && studio.rating < 4.8) {
      return false;
    }

    // Available Today
    if (filterAvailableToday && (!studio.nextAvailable || !studio.nextAvailable.toLowerCase().includes('today'))) {
      return false;
    }

    // Budget Filter (<= 500 or maxPrice)
    if (filterBudget && studio.startingPrice > 500) {
      return false;
    }

    if (studio.startingPrice > maxPriceFilter) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-asc') return a.startingPrice - b.startingPrice;
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
    return 0; // recommended
  });

  const activeFiltersCount = (filterArea !== 'all' ? 1 : 0) +
    (filterMinRating ? 1 : 0) +
    (filterAvailableToday ? 1 : 0) +
    (filterBudget ? 1 : 0) +
    (maxPriceFilter < 1000 ? 1 : 0);

  const handleResetFilters = () => {
    setFilterArea('all');
    setFilterMinRating(false);
    setFilterAvailableToday(false);
    setFilterBudget(false);
    setMaxPriceFilter(1000);
    setSortBy('recommended');
    onTriggerToast('All filters cleared', 'refresh');
  };

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-8 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Search & Filter Header */}
      <section className="sticky top-16 z-30 py-2.5 bg-[#f9f9ff]/95 backdrop-blur-md">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 flex items-center gap-2 px-3.5 h-11 rounded-xl bg-white shadow-xs border border-[#e9edff] focus-within:border-[#3525cd] transition-colors">
            <span className="material-symbols-outlined text-[#777587] text-[20px] shrink-0">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search salon, barber, nail spa, or neighborhood..."
              className="w-full bg-transparent text-[13px] text-[#141b2b] placeholder:text-[#777587] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#777587] hover:text-[#141b2b] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFilterModalOpen(true)}
            aria-label="Open Filters"
            className={`h-11 px-3.5 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 shadow-xs cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-[#3525cd] text-white border-[#3525cd]'
                : 'bg-white text-[#3525cd] border-[#e9edff] hover:bg-[#e9edff]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span className="text-[12px] font-semibold hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#3525cd] text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Filter Horizontal Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all active:scale-95 shadow-xs cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'bg-white text-[#141b2b] hover:bg-[#e9edff] border border-[#e9edff]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Working Quick Sub-filter Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 pb-0.5">
          <button
            onClick={() => {
              const next = filterArea === 'bonifacio' ? 'all' : 'bonifacio';
              setFilterArea(next);
              onTriggerToast(next !== 'all' ? 'Filtering for BGC, Taguig 📍' : 'Area filter cleared', 'near_me');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-all cursor-pointer ${
              filterArea === 'bonifacio'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#141b2b] border border-[#e9edff] hover:bg-[#f1f3ff]'
            }`}
          >
            <span className={`material-symbols-outlined text-[14px] ${filterArea === 'bonifacio' ? 'text-white' : 'text-[#3525cd]'}`}>
              near_me
            </span>
            <span>BGC, Taguig</span>
          </button>

          <button
            onClick={() => {
              const next = !filterMinRating;
              setFilterMinRating(next);
              onTriggerToast(next ? 'Showing top-rated venues (4.8+ stars) ⭐' : 'Rating filter cleared', 'star');
            }}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-all cursor-pointer ${
              filterMinRating
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#141b2b] border border-[#e9edff] hover:bg-[#f1f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[13px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span>4.8+</span>
          </button>

          <button
            onClick={() => {
              const next = !filterAvailableToday;
              setFilterAvailableToday(next);
              onTriggerToast(next ? 'Showing studios with open slots today ⚡' : 'Availability filter cleared', 'bolt');
            }}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-all cursor-pointer ${
              filterAvailableToday
                ? 'bg-[#00702f] text-white shadow-xs'
                : 'bg-white text-[#141b2b] border border-[#e9edff] hover:bg-[#f1f3ff]'
            }`}
          >
            <span className={`material-symbols-outlined text-[14px] ${filterAvailableToday ? 'text-white' : 'text-[#00702f]'}`}>
              bolt
            </span>
            <span>Available Today</span>
          </button>

          <button
            onClick={() => {
              const next = !filterBudget;
              setFilterBudget(next);
              onTriggerToast(next ? 'Budget filter active: Under ₱500 🏷️' : 'Budget filter cleared', 'payments');
            }}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-all cursor-pointer ${
              filterBudget
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#141b2b] border border-[#e9edff] hover:bg-[#f1f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">payments</span>
            <span>Under ₱500</span>
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#dee2ef] text-[#424751] hover:text-[#ba1a1a] text-[11px] font-semibold shrink-0 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">close</span>
              <span>Reset</span>
            </button>
          )}
        </div>
      </section>

      {/* Main Results Grid */}
      <section className="pt-3">
        <div className="flex items-center justify-between pb-3">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#3525cd]">
              Curated Discovery
            </span>
            <h2 className="text-[17px] font-bold text-[#141b2b] font-display">
              {searchQuery ? `Results for "${searchQuery}"` : 'Recommended for You'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#464555]">
              {filteredStudios.length} {filteredStudios.length === 1 ? 'place' : 'places'} found
            </span>
            <div className="hidden sm:block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-7 px-2 rounded-lg bg-white border border-[#e9edff] text-[11px] font-semibold text-[#464555] cursor-pointer"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="rating">Sort: Highest Rating</option>
                <option value="price-asc">Sort: Lowest Starting Price</option>
                <option value="reviews">Sort: Most Reviews</option>
              </select>
            </div>
          </div>
        </div>

        {filteredStudios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {filteredStudios.map(studio => {
              const isSaved = !!bookmarkedIds[studio.id];

              return (
                <div
                  key={studio.id}
                  onClick={() => onSelectStudio(studio.id)}
                  className="group rounded-2xl bg-white border border-[#e9edff] shadow-xs hover:shadow-md hover:border-[#c7c4d8] transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  {/* Image banner with badges */}
                  <div className="relative h-38 lg:h-40 w-full overflow-hidden bg-[#e9edff]">
                    <img
                      src={studio.image}
                      alt={studio.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = ASSETS.studioBloomHero; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1">
                        {studio.topRated ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#3525cd] shadow-xs">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              hotel_class
                            </span>
                            Top Pick
                          </span>
                        ) : studio.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#141b2b] shadow-xs">
                            <span className="material-symbols-outlined text-[12px] text-[#00702f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              verified
                            </span>
                            Verified
                          </span>
                        ) : null}
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(studio.id, studio.name, e)}
                        title={isSaved ? 'Remove favorite' : 'Save to favorites'}
                        className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs hover:bg-white text-[#3525cd] flex items-center justify-center shadow-xs transition-transform active:scale-90 pointer-events-auto cursor-pointer"
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          bookmark
                        </span>
                      </button>
                    </div>

                    {/* Next Available Overlay */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7ffc97] animate-pulse"></span>
                        {studio.nextAvailable || 'Instant Booking'}
                      </span>
                      <span className="text-white/90 font-medium truncate max-w-[120px]">
                        {studio.area}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-3.5 flex flex-col gap-2 flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-[15px] font-bold text-[#141b2b] group-hover:text-[#3525cd] transition-colors truncate">
                          {studio.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-[12px] font-bold text-[#141b2b] shrink-0">
                          <span className="material-symbols-outlined text-[15px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span>{studio.rating}</span>
                          <span className="text-[11px] font-normal text-[#777587]">({studio.reviewCount})</span>
                        </div>
                      </div>

                      <p className="text-[12px] text-[#464555] truncate mt-0.5">
                        {studio.category}
                      </p>
                      <p className="text-[11px] text-[#777587] truncate">
                        {studio.location}
                      </p>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-2 border-t border-[#f1f3ff] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#777587] block uppercase font-semibold leading-none">Starting from</span>
                        <span className="text-[15px] font-bold text-[#141b2b] font-display">
                          ₱{studio.startingPrice.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudio(studio.id);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[12px] font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Book</span>
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#e9edff] flex items-center justify-center text-[#3525cd]">
              <span className="material-symbols-outlined text-[28px]">travel_explore</span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#141b2b]">No studios match these filters</h3>
              <p className="text-[13px] text-[#464555] mt-1">
                Try widening your price range or clearing the active filters.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-[13px] font-semibold shadow-xs hover:bg-[#4f46e5] cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Advanced Filter Drawer / Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[20px]">tune</span>
                <h3 className="text-[16px] font-bold text-[#141b2b]">Search &amp; Studio Filters</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#464555] hover:text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Neighborhood / Area */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#141b2b] uppercase tracking-wider">
                Neighborhood / City
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Metro Manila' },
                  { id: 'bonifacio', label: 'BGC, Taguig' },
                  { id: 'makati', label: 'Makati City' },
                  { id: 'ortigas', label: 'Ortigas / Pasig' },
                  { id: 'alabang', label: 'Alabang / Muntinlupa' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFilterArea(item.id)}
                    className={`p-2.5 rounded-xl border text-left text-[12px] font-semibold transition-all cursor-pointer ${
                      filterArea === item.id
                        ? 'border-[#3525cd] bg-[#e9edff] text-[#3525cd]'
                        : 'border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Starting Price Slider */}
            <div className="flex flex-col gap-2 pt-1 border-t border-[#f1f3ff]">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-[#141b2b] uppercase tracking-wider">
                  Max Starting Price
                </label>
                <span className="text-[14px] font-bold text-[#3525cd]">
                  ₱{maxPriceFilter.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={1500}
                step={50}
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="w-full accent-[#3525cd] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#777587]">
                <span>₱300 (Budget)</span>
                <span>₱1,500+ (Luxury)</span>
              </div>
            </div>

            {/* Amenity / Safety Features */}
            <div className="flex flex-col gap-2 pt-1 border-t border-[#f1f3ff]">
              <label className="text-[12px] font-bold text-[#141b2b] uppercase tracking-wider">
                Preferences &amp; Amenities
              </label>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-[#e9edff] text-[13px] cursor-pointer hover:bg-[#f1f3ff]">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#00702f]">bolt</span>
                    <span>Same-day available appointments</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={filterAvailableToday}
                    onChange={(e) => setFilterAvailableToday(e.target.checked)}
                    className="w-4 h-4 accent-[#3525cd] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-[#e9edff] text-[13px] cursor-pointer hover:bg-[#f1f3ff]">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-500">star</span>
                    <span>Top Rated (4.8+ Stars only)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={filterMinRating}
                    onChange={(e) => setFilterMinRating(e.target.checked)}
                    className="w-4 h-4 accent-[#3525cd] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-[#e9edff]">
              <button
                onClick={handleResetFilters}
                className="py-2.5 px-4 rounded-xl bg-[#e9edff] text-[#464555] hover:bg-[#dce2f7] text-[13px] font-semibold cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setIsFilterModalOpen(false);
                  onTriggerToast(`Applied ${activeFiltersCount} filters! Found ${filteredStudios.length} studios. ✨`, 'check_circle');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold cursor-pointer shadow-xs"
              >
                Show {filteredStudios.length} Studios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
