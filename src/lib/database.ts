import { supabase, isSupabaseConfigured } from './supabase';
import {
  DbBusiness,
  DbService,
  DbStaff,
  DbBooking,
  DbClientCrm,
  DbClientNote,
  DbFavorite,
  DbReview,
  DbKycRequest,
  DbModerationTicket,
  DbAuditLog,
  DbPlatformSettings,
  DbBusinessHours,
  DbStaffHours,
  DbBlockedSlot,
  BookingStatus,
  KycStatus,
  ModerationStatus,
  CrmTier,
  ServiceCategory
} from './database.types';
import { Booking, Studio, SalonService, ClientProfile, Stylist } from '../types';
import {
  INITIAL_STUDIOS,
  INITIAL_SERVICES,
  INITIAL_STYLISTS,
  INITIAL_BOOKINGS,
  INITIAL_CLIENTS,
  ASSETS
} from '../data/mockData';

// -------------------------------------------------------------
// BUSINESSES / STUDIOS
// -------------------------------------------------------------
export async function getBusinesses(): Promise<Studio[]> {
  if (!isSupabaseConfigured) return INITIAL_STUDIOS;

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .order('is_top_rated', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_STUDIOS;
    }

    return data.map((b: DbBusiness): Studio => ({
      id: b.id,
      name: b.name,
      category: b.category || 'Hair & Wellness',
      rating: 4.9,
      reviewCount: 120,
      location: b.location || 'BGC, Taguig',
      area: b.area || 'Bonifacio Global City',
      startingPrice: 450,
      image: b.image_url || ASSETS.studioBloomHero,
      verified: b.is_verified,
      topRated: b.is_top_rated,
      tags: b.tags?.length ? b.tags : ['Verified Salon'],
      openNow: true,
      closingTime: '8:00 PM',
      nextAvailable: 'Today, 2:30 PM',
      ecoCertified: b.eco_certified
    }));
  } catch (err) {
    console.warn('Failed to load businesses from Supabase:', err);
    return INITIAL_STUDIOS;
  }
}

export async function getBusinessByOwnerId(ownerId: string): Promise<DbBusiness | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();
    if (error || !data) return null;
    return data as DbBusiness;
  } catch (err) {
    console.warn('Failed to load business by owner:', err);
    return null;
  }
}

// -------------------------------------------------------------
// SERVICES
// -------------------------------------------------------------
export async function getServices(businessId?: string): Promise<SalonService[]> {
  if (!isSupabaseConfigured) return INITIAL_SERVICES;

  try {
    let query = supabase.from('services').select('*').order('sort_order', { ascending: true });
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return INITIAL_SERVICES;
    }

    return data.map((s: DbService): SalonService => ({
      id: s.id,
      businessId: s.business_id,
      title: s.title,
      category: (s.category || 'HAIRCUTS') as any,
      description: s.description || '',
      duration: `${s.duration_minutes} mins`,
      price: Number(s.price),
      deposit: s.deposit ? Number(s.deposit) : undefined,
      isPopular: s.is_popular,
      isActive: s.is_active,
      bookingsThisMonth: 18,
      grossRevenue: Number(s.price) * 18,
      staffAssigned: 'All Staff',
      image: s.image_url || ASSETS.haircutService
    }));
  } catch (err) {
    console.warn('Failed to load services from Supabase:', err);
    return INITIAL_SERVICES;
  }
}

export async function createService(service: {
  business_id: string;
  title: string;
  category?: ServiceCategory;
  description?: string;
  duration_minutes: number;
  price: number;
  deposit?: number;
  image_url?: string;
}): Promise<DbService | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as DbService;
}

export async function updateService(id: string, updates: Partial<DbService>): Promise<DbService | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as DbService;
}

export async function deleteService(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
  return true;
}

// -------------------------------------------------------------
// STAFF
// -------------------------------------------------------------
let localStaff: DbStaff[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    business_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    name: 'Maria Santos',
    role: 'Senior Stylist Specialist',
    specialty: 'Balayage & Precision Cuts',
    avatar_url: ASSETS.mariaAvatar,
    is_active: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    business_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    name: 'Jamie Lim',
    role: 'Master Colorist & Founder',
    specialty: 'Custom Color, Gloss & Chemical Treatments',
    avatar_url: ASSETS.jamieAvatar,
    is_active: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    business_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    name: 'Julian Cruz',
    role: 'Barber Artist & Stylist',
    specialty: 'Fades, Beard Trims & Men Styling',
    avatar_url: ASSETS.julianAvatar,
    is_active: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z'
  }
];

let localServiceStaff: { service_id: string; staff_id: string }[] = [
  { service_id: 'srv-1', staff_id: '00000000-0000-0000-0000-000000000101' },
  { service_id: 'srv-1', staff_id: '00000000-0000-0000-0000-000000000102' },
  { service_id: 'srv-1', staff_id: '00000000-0000-0000-0000-000000000103' },
  { service_id: 'srv-2', staff_id: '00000000-0000-0000-0000-000000000101' },
  { service_id: 'srv-2', staff_id: '00000000-0000-0000-0000-000000000102' },
  { service_id: 'srv-3', staff_id: '00000000-0000-0000-0000-000000000101' },
  { service_id: 'srv-4', staff_id: '00000000-0000-0000-0000-000000000102' },
  { service_id: 'srv-6', staff_id: '00000000-0000-0000-0000-000000000103' }
];

let localStaffHours: DbStaffHours[] = [
  ...['00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000103'].flatMap(staffId => [
    { id: `sh-${staffId}-0`, staff_id: staffId, business_id: '00000000-0000-0000-0000-000000000001', day_of_week: 0, start_time: null, end_time: null, is_off: true },
    { id: `sh-${staffId}-1`, staff_id: staffId, business_id: '00000000-0000-0000-0000-000000000001', day_of_week: 1, start_time: '09:00', end_time: '19:00', is_off: false },
    { id: `sh-${staffId}-2`, staff_id: staffId, business_id: '00000000-0000-0000-0000-000000000001', day_of_week: 2, start_time: '09:00', end_time: '19:00', is_off: false },
    { id: `sh-${staffId}-3`, staff_id: staffId, business_id: '00000000-0000-0000-0000-000000000001', day_of_week: 3, start_time: '09:00', end_time: '19:00', is_off: false },
    { id: `sh-${staffId}-4`, staff_id: staffId, business_id: '00000000-0000-0000-0000-000000000001', day_of_week: 4, start_time: '09:00', end_time: '19:00', is_off: false },
    { id: `sh-${staffId}-5`, staff_id: staffId, business_id: '00000000-0000-0000-0000-000000000001', day_of_week: 5, start_time: '09:00', end_time: '20:00', is_off: false },
    { id: `sh-${staffId}-6`, staff_id: staffId, business_id: '00000000-0000-0000-0000-000000000001', day_of_week: 6, start_time: '09:00', end_time: '20:00', is_off: false }
  ])
];

export async function getStaff(businessId?: string): Promise<Stylist[]> {
  if (!isSupabaseConfigured) return INITIAL_STYLISTS;

  try {
    let query = supabase.from('staff').select('*').eq('is_active', true);
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return INITIAL_STYLISTS;
    }

    return data.map((s: DbStaff): Stylist => ({
      id: s.id,
      name: s.name,
      role: s.role || 'Senior Stylist',
      specialty: s.specialty || 'Styling & Cuts',
      avatar: s.avatar_url || ASSETS.jamieAvatar,
      rating: 4.9,
      apptsCount: 42,
      earnings: 28400,
      goalPercentage: '92%',
      isTopEarner: true
    }));
  } catch (err) {
    console.warn('Failed to load staff from Supabase:', err);
    return INITIAL_STYLISTS;
  }
}

export async function getFullStaff(businessId?: string): Promise<DbStaff[]> {
  if (!isSupabaseConfigured) {
    if (businessId) return localStaff.filter(s => s.business_id === businessId);
    return localStaff;
  }
  try {
    let query = supabase.from('staff').select('*').order('created_at', { ascending: true });
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Failed to query staff from Supabase:', error);
      return localStaff;
    }
    // Return real database records if query succeeded
    return (data || []) as DbStaff[];
  } catch (err) {
    console.warn('Failed to load full staff:', err);
    return localStaff;
  }
}

export async function createStaff(staff: {
  business_id: string;
  name: string;
  role?: string;
  specialty?: string;
  avatar_url?: string;
  is_active?: boolean;
}): Promise<DbStaff> {
  if (!isSupabaseConfigured) {
    const newStaff: DbStaff = {
      id: `st-${Date.now()}`,
      business_id: staff.business_id,
      user_id: null,
      name: staff.name,
      role: staff.role || 'Senior Stylist',
      specialty: staff.specialty || 'All Salon Services',
      avatar_url: staff.avatar_url || ASSETS.julianAvatar,
      is_active: staff.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStaff.push(newStaff);
    return newStaff;
  }

  const { data, error } = await supabase
    .from('staff')
    .insert([{
      business_id: staff.business_id,
      name: staff.name,
      role: staff.role || null,
      specialty: staff.specialty || null,
      avatar_url: staff.avatar_url || null,
      is_active: staff.is_active ?? true
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as DbStaff;
}

export async function updateStaff(id: string, updates: Partial<DbStaff>): Promise<DbStaff> {
  if (!isSupabaseConfigured) {
    localStaff = localStaff.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s);
    const found = localStaff.find(s => s.id === id);
    if (!found) throw new Error('Staff not found');
    return found;
  }

  const { data, error } = await supabase
    .from('staff')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as DbStaff;
}

export async function toggleStaffActive(id: string, isActive: boolean): Promise<DbStaff> {
  return updateStaff(id, { is_active: isActive });
}

export async function getStaffServices(staffId: string): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return localServiceStaff.filter(ss => ss.staff_id === staffId).map(ss => ss.service_id);
  }
  try {
    const { data, error } = await supabase
      .from('service_staff')
      .select('service_id')
      .eq('staff_id', staffId);
    if (error || !data) return [];
    return data.map((d: { service_id: string }) => d.service_id);
  } catch (err) {
    console.warn('Failed to get staff services:', err);
    return [];
  }
}

export async function setStaffServices(staffId: string, serviceIds: string[]): Promise<void> {
  if (!isSupabaseConfigured) {
    localServiceStaff = localServiceStaff.filter(ss => ss.staff_id !== staffId);
    serviceIds.forEach(srvId => {
      localServiceStaff.push({ service_id: srvId, staff_id: staffId });
    });
    return;
  }

  // Delete current assignments for staff
  const { error: delError } = await supabase
    .from('service_staff')
    .delete()
    .eq('staff_id', staffId);

  if (delError) {
    throw new Error(delError.message);
  }

  if (serviceIds.length > 0) {
    const records = serviceIds.map(service_id => ({ service_id, staff_id: staffId }));
    const { error: insertError } = await supabase
      .from('service_staff')
      .insert(records);
    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}

export async function getStaffHours(staffId: string): Promise<DbStaffHours[]> {
  if (!isSupabaseConfigured) {
    return localStaffHours.filter(sh => sh.staff_id === staffId).sort((a, b) => a.day_of_week - b.day_of_week);
  }
  try {
    const { data, error } = await supabase
      .from('staff_hours')
      .select('*')
      .eq('staff_id', staffId)
      .order('day_of_week', { ascending: true });
    if (error || !data || data.length === 0) return [];
    return data as DbStaffHours[];
  } catch (err) {
    console.warn('Failed to get staff hours:', err);
    return [];
  }
}

export async function updateStaffHours(
  staffId: string,
  businessId: string,
  hours: { day_of_week: number; start_time: string | null; end_time: string | null; is_off: boolean }[]
): Promise<void> {
  if (!isSupabaseConfigured) {
    localStaffHours = localStaffHours.filter(sh => sh.staff_id !== staffId);
    hours.forEach(h => {
      localStaffHours.push({
        id: `sh-${staffId}-${h.day_of_week}`,
        staff_id: staffId,
        business_id: businessId,
        day_of_week: h.day_of_week,
        start_time: h.start_time,
        end_time: h.end_time,
        is_off: h.is_off
      });
    });
    return;
  }

  await supabase.from('staff_hours').delete().eq('staff_id', staffId);

  const records = hours.map(h => ({
    staff_id: staffId,
    business_id: businessId,
    day_of_week: h.day_of_week,
    start_time: h.start_time,
    end_time: h.end_time,
    is_off: h.is_off
  }));

  const { error } = await supabase.from('staff_hours').insert(records);
  if (error) {
    throw new Error(error.message);
  }
}

// -------------------------------------------------------------
// BOOKINGS
// -------------------------------------------------------------
export async function getBookings(filter?: {
  businessId?: string;
  clientUserId?: string;
}): Promise<Booking[]> {
  if (!isSupabaseConfigured) return INITIAL_BOOKINGS;

  try {
    let query = supabase
      .from('bookings')
      .select('*, services(title, duration_minutes), staff(name, avatar_url), businesses(name, location)')
      .order('start_at', { ascending: false });

    if (filter?.businessId) {
      query = query.eq('business_id', filter.businessId);
    }
    if (filter?.clientUserId) {
      query = query.eq('client_user_id', filter.clientUserId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return INITIAL_BOOKINGS;
    }

    return data.map((b: any): Booking => {
      const startDate = new Date(b.start_at);
      const dateStr = startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const timeStr = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      return {
        id: b.id,
        bookingNumber: b.booking_number,
        clientName: b.client_name,
        clientPhone: b.client_phone,
        clientAvatar: ASSETS.alexAvatar,
        clientInitials: b.client_name ? b.client_name.charAt(0).toUpperCase() : 'C',
        serviceTitle: b.services?.title || 'Salon Service',
        stylistName: b.staff?.name || 'Assigned Stylist',
        stylistAvatar: b.staff?.avatar_url || ASSETS.jamieAvatar,
        date: dateStr,
        time: timeStr,
        duration: b.services?.duration_minutes ? `${b.services.duration_minutes} mins` : '45 mins',
        fee: Number(b.fee),
        status: b.status,
        isCheckedIn: b.is_checked_in,
        paymentStatus: b.payment_status === 'deposit_paid' ? 'Deposit Paid' : b.payment_status === 'paid' ? 'Paid' : 'Unpaid',
        paymentMethod: b.payment_method || 'Pay at Venue',
        depositAmount: b.deposit_amount ? Number(b.deposit_amount) : 0,
        clientNote: b.client_note || undefined,
        location: b.businesses?.location || 'Unit 302, High Street South, BGC, Taguig',
        businessName: b.businesses?.name || 'Studio Bloom',
        businessId: b.business_id,
        staffId: b.staff_id,
        clientUserId: b.client_user_id,
        serviceId: b.service_id
      };
    });
  } catch (err) {
    console.warn('Failed to load bookings from Supabase:', err);
    return INITIAL_BOOKINGS;
  }
}

/**
 * Creates booking using the existing secure database function create_booking.
 */
export async function createBookingRpc(params: {
  business_id: string;
  service_id: string;
  start_at: string;
  client_name: string;
  client_phone: string;
  staff_id?: string | null;
  client_user_id?: string | null;
  client_crm_id?: string | null;
  client_note?: string | null;
  payment_method?: string | null;
  deposit_amount?: number;
}): Promise<DbBooking> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet');
  }

  const { data, error } = await supabase.rpc('create_booking', {
    p_business_id: params.business_id,
    p_service_id: params.service_id,
    p_start_at: params.start_at,
    p_client_name: params.client_name,
    p_client_phone: params.client_phone,
    p_staff_id: params.staff_id || null,
    p_client_user_id: params.client_user_id || null,
    p_client_crm_id: params.client_crm_id || null,
    p_client_note: params.client_note || null,
    p_payment_method: params.payment_method || null,
    p_deposit_amount: params.deposit_amount || 0
  });

  if (error) {
    throw new Error(error.message);
  }
  return data as DbBooking;
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<DbBooking | null> {
  if (!isSupabaseConfigured) return null;

  const updates: any = { status };
  if (status === 'cancelled') {
    updates.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as DbBooking;
}

export async function setBookingCheckIn(
  bookingId: string,
  isCheckedIn: boolean
): Promise<DbBooking | null> {
  if (!isSupabaseConfigured) return null;

  // Respect Postgres constraint:
  // check ((is_checked_in = false and checked_in_at is null) or (is_checked_in = true and checked_in_at is not null))
  const { data, error } = await supabase
    .from('bookings')
    .update({
      is_checked_in: isCheckedIn,
      checked_in_at: isCheckedIn ? new Date().toISOString() : null
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as DbBooking;
}

// -------------------------------------------------------------
// CLIENT CRM & NOTES
// -------------------------------------------------------------
export async function getClientCrm(businessId?: string): Promise<ClientProfile[]> {
  if (!isSupabaseConfigured) return INITIAL_CLIENTS;

  try {
    let query = supabase.from('client_crm').select('*, client_notes(*)').order('created_at', { ascending: false });
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return INITIAL_CLIENTS;
    }

    return data.map((c: any): ClientProfile => {
      const notesList = (c.client_notes || []).map((n: DbClientNote) => `• ${n.note_text}`).join('\n');
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || undefined,
        avatar: c.avatar_url || undefined,
        initials: c.name ? c.name.charAt(0).toUpperCase() : 'C',
        tier: c.tier === 'VIP' ? 'VIP' : c.tier === 'Regular' ? 'Regular' : 'New Client',
        visits: 4,
        totalSpent: 3800,
        lastVisit: 'Recent',
        formulaNote: c.formula_note || undefined,
        clientNotes: notesList || '• Client record created.',
        preferredStylist: 'Jamie Lim',
        punctualityRate: '100%',
        tags: c.tags || []
      };
    });
  } catch (err) {
    console.warn('Failed to load CRM clients from Supabase:', err);
    return INITIAL_CLIENTS;
  }
}

export async function createClientCrm(client: {
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  tier?: CrmTier;
  formula_note?: string;
  tags?: string[];
}): Promise<DbClientCrm | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('client_crm')
    .insert([client])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as DbClientCrm;
}

export async function addClientNote(
  clientCrmId: string,
  businessId: string,
  noteText: string,
  authorId?: string
): Promise<DbClientNote | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('client_notes')
    .insert([{
      client_crm_id: clientCrmId,
      business_id: businessId,
      author_id: authorId || null,
      note_text: noteText
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as DbClientNote;
}

// -------------------------------------------------------------
// FAVORITES
// -------------------------------------------------------------
export async function getFavorites(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return ['studio-bloom'];
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('business_id')
      .eq('user_id', userId);

    if (error || !data) return ['studio-bloom'];
    return data.map((f: { business_id: string }) => f.business_id);
  } catch (err) {
    console.warn('Failed to get favorites:', err);
    return ['studio-bloom'];
  }
}

export async function toggleFavorite(userId: string, businessId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('business_id', businessId)
      .maybeSingle();

    if (data) {
      await supabase.from('favorites').delete().eq('id', data.id);
      return false; // Removed
    } else {
      await supabase.from('favorites').insert([{ user_id: userId, business_id: businessId }]);
      return true; // Added
    }
  } catch (err) {
    console.warn('Failed to toggle favorite:', err);
    return false;
  }
}

// -------------------------------------------------------------
// REVIEWS
// -------------------------------------------------------------
let localReviews: DbReview[] = [
  {
    id: 'rev-1',
    booking_id: 'SC-8918',
    user_id: '00000000-0000-0000-0000-000000000011',
    business_id: '00000000-0000-0000-0000-000000000001',
    staff_id: '00000000-0000-0000-0000-000000000101',
    rating: 5,
    comment: 'Wonderful styling and blowout! Maria was attentive, gentle with my sensitive scalp, and the style lasted through all my meetings.',
    created_at: '2026-10-18T10:00:00Z'
  }
];

export async function createReview(review: {
  booking_id: string;
  user_id: string;
  business_id: string;
  staff_id?: string | null;
  rating: number;
  comment?: string;
}): Promise<DbReview> {
  if (review.rating < 1 || review.rating > 5) {
    throw new Error('Rating must be between 1 and 5 stars.');
  }

  // Check for duplicate review
  const existing = await getBookingReview(review.booking_id);
  if (existing) {
    throw new Error('A review has already been submitted for this appointment.');
  }

  if (!isSupabaseConfigured) {
    const newRev: DbReview = {
      id: `rev-${Date.now()}`,
      booking_id: review.booking_id,
      user_id: review.user_id,
      business_id: review.business_id,
      staff_id: review.staff_id || null,
      rating: review.rating,
      comment: review.comment?.trim() || null,
      created_at: new Date().toISOString()
    };
    localReviews.push(newRev);
    return newRev;
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      booking_id: review.booking_id,
      user_id: review.user_id,
      business_id: review.business_id,
      staff_id: review.staff_id || null,
      rating: review.rating,
      comment: review.comment?.trim() || null
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as DbReview;
}

export async function getBookingReview(bookingId: string): Promise<DbReview | null> {
  if (!isSupabaseConfigured) {
    return localReviews.find(r => r.booking_id === bookingId) || null;
  }
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error || !data) return null;
    return data as DbReview;
  } catch {
    return null;
  }
}

export async function getUserReviews(userId: string): Promise<DbReview[]> {
  if (!isSupabaseConfigured) {
    return localReviews.filter(r => r.user_id === userId);
  }
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId);
    if (error || !data) return [];
    return data as DbReview[];
  } catch {
    return [];
  }
}

export async function getReviews(businessId?: string): Promise<DbReview[]> {
  if (!isSupabaseConfigured) {
    if (businessId) return localReviews.filter(r => r.business_id === businessId);
    return localReviews;
  }
  try {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (businessId) query = query.eq('business_id', businessId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data as DbReview[];
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// MERCHANT KYC SUBMISSION & STATUS
// -------------------------------------------------------------
let localMerchantKyc: DbKycRequest = {
  id: 'kyc-2',
  business_id: '00000000-0000-0000-0000-000000000001',
  tin: '284-918-331-000',
  dti_verified: true,
  mayors_permit: true,
  status: 'verified',
  issue_note: null,
  issue_detail: null,
  document_url: 'https://scheduly.ph/docs/kyc/studio-bloom-mayors-permit-2026.pdf',
  reviewed_by: null,
  reviewed_at: '2026-09-10T14:20:00Z',
  created_at: '2026-09-01T08:00:00Z',
  updated_at: '2026-09-10T14:20:00Z'
};

export async function getMerchantKyc(businessId: string): Promise<DbKycRequest | null> {
  if (!isSupabaseConfigured) {
    return localMerchantKyc.business_id === businessId ? localMerchantKyc : null;
  }
  try {
    const { data, error } = await supabase
      .from('kyc_requests')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as DbKycRequest;
  } catch (err) {
    console.warn('Failed to load merchant KYC:', err);
    return null;
  }
}

export async function submitMerchantKyc(params: {
  business_id: string;
  tin: string;
  dti_verified: boolean;
  mayors_permit: boolean;
  document_url?: string;
}): Promise<DbKycRequest> {
  if (!params.business_id) {
    throw new Error('Business ID is required for KYC submission');
  }

  if (!isSupabaseConfigured) {
    if (localMerchantKyc.business_id === params.business_id && localMerchantKyc.status === 'verified') {
      throw new Error('Business is already KYC verified. Compliance changes require platform review.');
    }
    localMerchantKyc = {
      ...localMerchantKyc,
      business_id: params.business_id,
      tin: params.tin,
      dti_verified: params.dti_verified,
      mayors_permit: params.mayors_permit,
      document_url: params.document_url || localMerchantKyc.document_url,
      status: 'pending',
      issue_note: null,
      issue_detail: null,
      updated_at: new Date().toISOString()
    };
    return localMerchantKyc;
  }

  // Validate authenticated user owns this business (or is admin)
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) {
    const { data: biz } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .eq('id', params.business_id)
      .maybeSingle();

    if (biz && biz.owner_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: You can only submit KYC verification for your own business.');
      }
    }
  }

  // Check if existing record exists for this business
  const { data: existing } = await supabase
    .from('kyc_requests')
    .select('*')
    .eq('business_id', params.business_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    if (existing.status === 'verified') {
      throw new Error('Business is already KYC verified. Compliance changes require platform review.');
    }

    // Try updating existing request (status always set to 'pending' per requirement 6)
    const { data: updateData, error: updateError } = await supabase
      .from('kyc_requests')
      .update({
        tin: params.tin,
        dti_verified: params.dti_verified,
        mayors_permit: params.mayors_permit,
        document_url: params.document_url || null,
        status: 'pending',
        issue_note: null,
        issue_detail: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .maybeSingle();

    if (!updateError && updateData) {
      return updateData as DbKycRequest;
    }

    // If existing request was rejected and direct update was restricted by RLS,
    // insert a new pending request (permitted for business owner by kyc_insert policy)
    if (existing.status === 'rejected') {
      const { data: insertData, error: insertError } = await supabase
        .from('kyc_requests')
        .insert([{
          business_id: params.business_id,
          tin: params.tin,
          dti_verified: params.dti_verified,
          mayors_permit: params.mayors_permit,
          document_url: params.document_url || null,
          status: 'pending'
        }])
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      return insertData as DbKycRequest;
    }

    // If existing request was already pending, avoid creating duplicate pending requests
    if (existing.status === 'pending') {
      if (updateError) {
        console.warn('KYC update notice:', updateError.message);
      }
      return existing as DbKycRequest;
    }

    if (updateError) throw new Error(updateError.message);
    return existing as DbKycRequest;
  } else {
    // New KYC request insertion
    const { data, error } = await supabase
      .from('kyc_requests')
      .insert([{
        business_id: params.business_id,
        tin: params.tin,
        dti_verified: params.dti_verified,
        mayors_permit: params.mayors_permit,
        document_url: params.document_url || null,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as DbKycRequest;
  }
}

// -------------------------------------------------------------
// ADMIN SECURE RPC OPERATIONS
// -------------------------------------------------------------
export async function approveKycRpc(
  kycId: string,
  status: KycStatus,
  issueNote?: string,
  issueDetail?: string
): Promise<DbKycRequest> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }
  const { data, error } = await supabase.rpc('approve_kyc', {
    p_kyc_id: kycId,
    p_status: status,
    p_issue_note: issueNote || null,
    p_issue_detail: issueDetail || null
  });

  if (error) {
    throw new Error(error.message);
  }
  return data as DbKycRequest;
}

export async function resolveModerationTicketRpc(
  ticketId: string,
  status: ModerationStatus,
  resolutionText?: string,
  actionMessage?: string
): Promise<DbModerationTicket> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }
  const { data, error } = await supabase.rpc('resolve_moderation_ticket', {
    p_ticket_id: ticketId,
    p_status: status,
    p_resolution_text: resolutionText || null,
    p_action_message: actionMessage || null
  });

  if (error) {
    throw new Error(error.message);
  }
  return data as DbModerationTicket;
}

export async function banUserRpc(userId: string, reason: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }
  const { error } = await supabase.rpc('ban_user', {
    p_user_id: userId,
    p_reason: reason
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePlatformSettingsRpc(settings: {
  platform_fee_percent?: number;
  platform_fee_fixed?: number;
  auto_cancel_timeout_minutes?: number;
  sms_balance?: number;
  toggle_gcash?: boolean;
  toggle_vip?: boolean;
  toggle_commission?: boolean;
  toggle_maintenance?: boolean;
}): Promise<DbPlatformSettings> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }
  const { data, error } = await supabase.rpc('update_platform_settings', {
    p_platform_fee_percent: settings.platform_fee_percent,
    p_platform_fee_fixed: settings.platform_fee_fixed,
    p_auto_cancel_timeout_minutes: settings.auto_cancel_timeout_minutes,
    p_sms_balance: settings.sms_balance,
    p_toggle_gcash: settings.toggle_gcash,
    p_toggle_vip: settings.toggle_vip,
    p_toggle_commission: settings.toggle_commission,
    p_toggle_maintenance: settings.toggle_maintenance
  });

  if (error) {
    throw new Error(error.message);
  }
  return data as DbPlatformSettings;
}

export async function getPlatformSettings(): Promise<DbPlatformSettings | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) return null;
  return data as DbPlatformSettings;
}

export async function getAuditLogs(): Promise<DbAuditLog[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return data as DbAuditLog[];
}

export async function getBusinessHours(businessId: string): Promise<DbBusinessHours[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('business_id', businessId)
    .order('day_of_week', { ascending: true });

  if (error) return [];
  return data as DbBusinessHours[];
}
