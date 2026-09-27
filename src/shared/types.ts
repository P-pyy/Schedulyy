export type AppMode = 'client' | 'business' | 'admin';

export type ClientTab = 'home' | 'explore' | 'bookings' | 'favorites' | 'profile' | 'service-detail' | 'booking-flow';
export type BusinessTab = 'overview' | 'calendar' | 'bookings' | 'clients' | 'services' | 'analytics';
export type AdminTab = 'overview' | 'businesses' | 'users' | 'reports' | 'settings';

export interface Booking {
  id: string;
  bookingNumber: string;
  clientName: string;
  clientPhone: string;
  clientAvatar?: string;
  clientInitials?: string;
  serviceTitle: string;
  stylistName: string;
  stylistAvatar?: string;
  date: string;
  time: string;
  duration: string;
  fee: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  isCheckedIn?: boolean;
  paymentStatus: 'Unpaid' | 'Paid' | 'Deposit Paid';
  paymentMethod?: string;
  depositAmount?: number;
  remainingBalance?: number;
  clientNote?: string;
  location?: string;
  businessName: string;
  businessId?: string;
  staffId?: string | null;
  clientUserId?: string | null;
  serviceId?: string;
}

export interface Studio {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  area: string;
  startingPrice: number;
  image: string;
  verified: boolean;
  topRated?: boolean;
  tags: string[];
  openNow?: boolean;
  closingTime?: string;
  nextAvailable?: string;
  ecoCertified?: boolean;
}

export interface SalonService {
  id: string;
  businessId?: string;
  title: string;
  category: 'HAIRCUTS' | 'COLOR' | 'CHEMICAL' | 'NAILS' | 'WELLNESS';
  description: string;
  duration: string;
  price: number;
  deposit?: number;
  isPopular?: boolean;
  isActive: boolean;
  bookingsThisMonth: number;
  grossRevenue: number;
  staffAssigned: string;
  image: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  initials?: string;
  tier: 'VIP' | 'Regular' | 'New Client';
  visits: number;
  totalSpent: number;
  lastVisit: string;
  frequencyDays?: number;
  nextAppointment?: string;
  formulaNote?: string;
  clientNotes: string;
  preferredStylist?: string;
  punctualityRate?: string;
  tags?: string[];
}

export interface Stylist {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  avatar: string;
  rating: number;
  apptsCount: number;
  earnings: number;
  goalPercentage: string;
  isTopEarner?: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  icon?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface ModerationTicket {
  id: string;
  category: 'high' | 'review' | 'resolved';
  priorityLabel: string;
  priorityIcon: string;
  statusBadge: string;
  title: string;
  titleIcon: string;
  target: string;
  subtitleExtra?: string;
  bookingRef?: boolean;
  reporter?: string;
  reporterIcon?: string;
  timeAgo?: string;
  quote?: string;
  disputedPenalty?: string;
  actionResolution?: string;
  actionMessage?: string;
  isResolved: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'owner' | 'admin' | 'flagged';
  roleBadge: string;
  subBadge?: string;
  avatarUrl?: string;
  initials?: string;
  avatarBadgeIcon?: string;
  avatarBadgeBg?: string;
  verified: boolean;
  joinedDate: string;
  searchTerms: string;
  metric1Label?: string;
  metric1Value?: string;
  metric1Icon?: string;
  metric2Label?: string;
  metric2Value?: string;
  metric2Icon?: string;
  businessName?: string;
  businessIcon?: string;
  businessMeta?: string;
  businessPipeline?: string;
  fraudWarning?: string;
  fraudWarningIcon?: string;
  fraudTag?: string;
  fraudSubtext?: string;
  isBanned?: boolean;
}

