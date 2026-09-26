import React, { useState, useEffect } from 'react';
import { Studio } from '../types';
import { INITIAL_STUDIOS } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { getBusinesses, getFavorites, toggleFavorite } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';

interface FavoritesScreenProps {
  onSelectStudio: (studioId: string) => void;
  onExploreMore: () => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onSelectStudio,
  onExploreMore,
  onTriggerToast
}) => {
  const { user } = useAuth();
  const [studios, setStudios] = useState<Studio[]>(INITIAL_STUDIOS);
  // Initial default saved studios for Alex Santos
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    'studio-bloom',
    'northside-barber',
    'glow-nail'
  ]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'price'>('recent');

  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        try {
          const loadedStudios = await getBusinesses();
          if (loadedStudios && loadedStudios.length > 0) {
            setStudios(loadedStudios);
          }
          if (user) {
            const favs = await getFavorites(user.id);
            if (favs && favs.length > 0) {
              setFavoriteIds(favs);
            }
          }
        } catch (err) {
          console.warn('Failed to load favorites data from Supabase:', err);
        }
      }
    }
    loadData();
  }, [user]);

  const handleToggleFavorite = async (studio: Studio, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyFav = favoriteIds.includes(studio.id);

    if (isCurrentlyFav) {
      setFavoriteIds(prev => prev.filter(id => id !== studio.id));
      onTriggerToast(`Removed ${studio.name} from saved favorites`, 'bookmark_remove');
    } else {
      setFavoriteIds(prev => [...prev, studio.id]);
      onTriggerToast(`Saved ${studio.name} to favorites! ⭐`, 'bookmark_added');
    }

    if (isSupabaseConfigured && user) {
      try {
        await toggleFavorite(user.id, studio.id);
      } catch (err) {
        console.warn('Failed to persist favorite toggle in Supabase:', err);
      }
    }
  };

  const handleRestoreDefault = () => {
    setFavoriteIds(['studio-bloom', 'northside-barber', 'glow-nail', 'mindful-spa']);
    onTriggerToast('Restored sample saved favorites list! ✨', 'refresh');
  };

  // Filter bookmarked studios
  const savedStudios = studios.filter(studio => favoriteIds.includes(studio.id));

  const filteredStudios = savedStudios.filter(studio => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'hair') return studio.category.toLowerCase().includes('hair');
    if (categoryFilter === 'barber') return studio.category.toLowerCase().includes('barber');
    if (categoryFilter === 'nails-spa') return studio.category.toLowerCase().includes('nail') || studio.category.toLowerCase().includes('spa') || studio.category.toLowerCase().includes('wellness');
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price') return a.startingPrice - b.startingPrice;
    return 0; // recent
  });

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-8 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Top Header Section - Compact on Laptop (1280x720 / 1366x768 friendly) */}
      <section className="pt-3 lg:pt-5 pb-3 border-b border-[#e9edff] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] lg:text-[24px] font-bold text-[#141b2b] font-display tracking-tight">
              Saved &amp; Bookmarked Studios
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#dee2ef] text-[#3525cd] text-[11px] font-bold">
              {savedStudios.length} {savedStudios.length === 1 ? 'place' : 'places'}
            </span>
          </div>
          <p className="text-[13px] text-[#464555] mt-0.5">
            Your personal shortlist of verified salons, barbershops, and spas ready for instant booking.
          </p>
        </div>

        {/* Filter Pills & Actions Bar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Category segmented filter */}
          <div className="flex items-center bg-[#f1f3ff] p-0.5 rounded-xl border border-[#e9edff]">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'text-[#464555] hover:text-[#141b2b]'
              }`}
            >
              All ({savedStudios.length})
            </button>
            <button
              onClick={() => setCategoryFilter('hair')}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                categoryFilter === 'hair'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'text-[#464555] hover:text-[#141b2b]'
              }`}
            >
              Hair
            </button>
            <button
              onClick={() => setCategoryFilter('barber')}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                categoryFilter === 'barber'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'text-[#464555] hover:text-[#141b2b]'
              }`}
            >
              Barber
            </button>
            <button
              onClick={() => setCategoryFilter('nails-spa')}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                categoryFilter === 'nails-spa'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'text-[#464555] hover:text-[#141b2b]'
              }`}
            >
              Nails &amp; Spa
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2.5 pr-7 rounded-xl bg-white border border-[#e9edff] text-[12px] font-semibold text-[#464555] hover:text-[#141b2b] focus:outline-none focus:border-[#3525cd] cursor-pointer appearance-none shadow-xs"
            >
              <option value="recent">Sort: Recently Added</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="price">Sort: Lowest Price</option>
            </select>
            <span className="material-symbols-outlined text-[16px] text-[#777587] absolute right-2 pointer-events-none">
              expand_more
            </span>
          </div>

          <button
            onClick={onExploreMore}
            className="h-8 px-3 rounded-xl bg-[#e9edff] hover:bg-[#3525cd] hover:text-white text-[#3525cd] text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Discover More</span>
          </button>
        </div>
      </section>

      {/* Grid of Saved Favorite Studios */}
      {filteredStudios.length > 0 ? (
        <section className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {filteredStudios.map(studio => {
              const isSaved = favoriteIds.includes(studio.id);

              return (
                <article
                  key={studio.id}
                  onClick={() => onSelectStudio(studio.id)}
                  className="group rounded-2xl bg-white border border-[#e9edff] shadow-xs hover:shadow-md hover:border-[#c7c4d8] transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-36 lg:h-38 w-full overflow-hidden bg-[#e9edff]">
                    <img referrerPolicy="no-referrer" 
                      src={studio.image}
                      alt={studio.name}
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

                      {/* Bookmark Toggle Button (interactive) */}
                      <button
                        onClick={(e) => handleToggleFavorite(studio, e)}
                        title="Remove from favorites"
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

                    {/* Bottom overlay info: Next Available Slot */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7ffc97] animate-pulse"></span>
                        {studio.nextAvailable || 'Book Next'}
                      </span>
                      <span className="text-white/90 font-medium truncate max-w-[120px]">
                        {studio.area}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex flex-col gap-2 flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h2 className="text-[15px] font-bold text-[#141b2b] group-hover:text-[#3525cd] transition-colors truncate">
                          {studio.name}
                        </h2>
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

                    {/* Price and CTA row */}
                    <div className="pt-2 border-t border-[#f1f3ff] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#777587] block uppercase font-semibold leading-none">Starting</span>
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
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        /* Empty State */
        <section className="py-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#e9edff] flex items-center justify-center text-[#3525cd]">
            <span className="material-symbols-outlined text-[28px]">bookmark_border</span>
          </div>
          <div className="max-w-sm">
            <h3 className="text-[17px] font-bold text-[#141b2b]">No saved studios in this filter</h3>
            <p className="text-[13px] text-[#464555] mt-1">
              {savedStudios.length === 0
                ? "You haven't added any favorite salons yet. Browse popular spots and tap the bookmark icon to save them."
                : 'Try switching to another category tab to view your saved places.'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onExploreMore}
              className="px-4 py-2 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Explore Top Studios
            </button>
            {savedStudios.length === 0 && (
              <button
                onClick={handleRestoreDefault}
                className="px-4 py-2 rounded-xl bg-[#e9edff] text-[#3525cd] hover:bg-[#dce2f7] text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Load Sample Favorites
              </button>
            )}
          </div>
        </section>
      )}

      {/* Suggested For You Bar (if user has favorites, show 1-click add recommendation) */}
      <section className="mt-6 p-4 rounded-2xl bg-[#f1f3ff] border border-[#e9edff] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#3525cd] shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#141b2b]">Discover studios near your appointments</h4>
            <p className="text-[12px] text-[#464555]">Find top-rated barbers, nail bars, and spas near BGC High Street.</p>
          </div>
        </div>
        <button
          onClick={onExploreMore}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-[#e9edff] text-[#3525cd] hover:bg-[#3525cd] hover:text-white text-[12px] font-semibold transition-all shrink-0 cursor-pointer self-start sm:self-auto"
        >
          Explore All Venues
        </button>
      </section>
    </div>
  );
};
