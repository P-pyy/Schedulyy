export type UserRole = 'customer' | 'business_owner' | 'staff' | 'admin';
export type BusinessTier = 'BASIC' | 'PRO' | 'ENTERPRISE';
export type ServiceCategory = 'HAIRCUTS' | 'COLOR' | 'CHEMICAL' | 'NAILS' | 'WELLNESS';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'deposit_paid';
export type CrmTier = 'VIP' | 'Regular' | 'New';
export type KycStatus = 'pending' | 'verified' | 'rejected' | 'resubmitted';
export type ModerationPriority = 'high' | 'medium' | 'low';
export type ModerationStatus = 'open' | 'in_review' | 'resolved' | 'archived';
export type ModerationTargetType = 'business' | 'booking' | 'user';

export interface DbProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_banned: boolean;
  ban_reason: string | null;
  banned_at: string | null;
  banned_by: string | null;
  is_verified: boolean;
  fraud_flag: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBusiness {
  id: string;
  owner_id: string;
  name: string;
  category: string | null;
  description: string | null;
  location: string | null;
  area: string | null;
  image_url: string | null;
  logo_url: string | null;
  is_verified: boolean;
  is_top_rated: boolean;
  eco_certified: boolean;
  tags: string[];
  tier: BusinessTier;
  public_slug: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbService {
  id: string;
  business_id: string;
  title: string;
  category: ServiceCategory | null;
  description: string | null;
  duration_minutes: number;
  price: number;
  deposit: number | null;
  is_popular: boolean;
  is_active: boolean;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbStaff {
  id: string;
  business_id: string;
  user_id: string | null;
  name: string;
  role: string | null;
  specialty: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbServiceStaff {
  service_id: string;
  staff_id: string;
}

export interface DbBooking {
  id: string;
  booking_number: string;
  business_id: string;
  service_id: string;
  staff_id: string | null;
  client_user_id: string | null;
  client_crm_id: string | null;
  client_name: string;
  client_phone: string;
  start_at: string;
  end_at: string;
  fee: number;
  status: BookingStatus;
  is_checked_in: boolean;
  checked_in_at: string | null;
  payment_status: PaymentStatus;
  payment_method: string | null;
  deposit_amount: number;
  client_note: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbClientCrm {
  id: string;
  business_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  tier: CrmTier;
  preferred_staff_id: string | null;
  formula_note: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DbClientNote {
  id: string;
  client_crm_id: string;
  business_id: string;
  author_id: string | null;
  note_text: string;
  created_at: string;
}

export interface DbFavorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
}

export interface DbReview {
  id: string;
  booking_id: string;
  user_id: string;
  business_id: string;
  staff_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface DbKycRequest {
  id: string;
  business_id: string;
  tin: string | null;
  dti_verified: boolean;
  mayors_permit: boolean;
  status: KycStatus;
  issue_note: string | null;
  issue_detail: string | null;
  document_url: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbModerationTicket {
  id: string;
  priority: ModerationPriority;
  status: ModerationStatus;
  title: string;
  target_type: ModerationTargetType | null;
  target_id: string | null;
  target_label: string | null;
  subtitle: string | null;
  reporter_id: string | null;
  reporter_label: string | null;
  quote: string | null;
  disputed_amount: number | null;
  resolution_text: string | null;
  action_message: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAuditLog {
  id: string;
  action: string;
  author_id: string | null;
  author_name: string | null;
  author_role: string | null;
  details: string | null;
  created_at: string;
}

export interface DbPlatformSettings {
  id: number;
  platform_fee_percent: number;
  platform_fee_fixed: number;
  auto_cancel_timeout_minutes: number;
  sms_balance: number;
  toggle_gcash: boolean;
  toggle_vip: boolean;
  toggle_commission: boolean;
  toggle_maintenance: boolean;
  updated_at: string;
}

export interface DbBusinessHours {
  id: string;
  business_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export interface DbStaffHours {
  id: string;
  staff_id: string;
  business_id: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_off: boolean;
}

export interface DbBlockedSlot {
  id: string;
  business_id: string;
  staff_id: string | null;
  start_at: string;
  end_at: string;
  reason: string;
  created_by: string | null;
  created_at: string;
}
