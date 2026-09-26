import { Booking, Studio, SalonService, ClientProfile, Stylist } from '../types';

export const ASSETS = {
  logo: "/images/logo.png",
  schedulyLogo: "/images/scheduly_logo.jpg",
  studioLogo: "/images/studio_bloom_logo.jpg",
  userProfile: "/images/userProfile.jpg",
  ownerProfile: "/images/owner_profile.jpg",
  
  // Clients
  alexAvatar: "/images/alexAvatar.jpg",
  camilleAvatar: "/images/camilleAvatar.jpg",
  chloeAvatar: "/images/chloeAvatar.jpg",
  marcoAvatar: "/images/marcoAvatar.jpg",
  mayaAvatar: "/images/mayaAvatar.jpg",

  // Stylists
  mariaAvatar: "/images/mariaAvatar.jpg",
  jamieAvatar: "/images/jamieAvatar.jpg",
  julianAvatar: "/images/julianAvatar.jpg",

  // Studios & Venues
  studioBloomHero: "/images/studioBloomHero.jpg",
  studioBloomStorefront: "/images/studioBloomStorefront.jpg",
  studioBloomInside: "/images/studioBloomInside.jpg",
  northsideBarberHero: "/images/northsideBarberHero.jpg",
  northsideSquare: "/images/northsideSquare.jpg",
  glowNailHero: "/images/glowNailHero.jpg",
  glowSquare: "/images/glowSquare.jpg",
  mindfulSpaHero: "/images/mindfulSpaHero.jpg",
  auraSpaHero: "/images/auraSpaHero.jpg",
  glowNailQC: "/images/glowNailQC.jpg",

  // Services
  haircutService: "/images/haircutService.jpg",
  blowoutService: "/images/blowoutService.jpg",
  balayageService: "/images/balayageService.jpg",
  keratinService: "/images/keratinService.jpg",
  manicureService: "/images/manicureService.jpg"
};

export const INITIAL_STUDIOS: Studio[] = [
  {
    id: "studio-bloom",
    name: "Studio Bloom",
    category: "Hair Styling & Salon",
    rating: 4.9,
    reviewCount: 128,
    location: "Unit 302, High Street South, BGC, Taguig",
    area: "Bonifacio Global City",
    startingPrice: 450,
    image: ASSETS.studioBloomHero,
    verified: true,
    topRated: true,
    tags: ["Instant Confirm", "Sanitized"],
    openNow: true,
    closingTime: "8:00 PM",
    nextAvailable: "Today, 2:30 PM",
    ecoCertified: true
  },
  {
    id: "northside-barber",
    name: "Northside Barber Co.",
    category: "Barbershop & Grooming",
    rating: 4.8,
    reviewCount: 94,
    location: "Legazpi Village, Makati City",
    area: "Makati City",
    startingPrice: 350,
    image: ASSETS.northsideBarberHero,
    verified: true,
    tags: ["Master Stylists"],
    openNow: true,
    closingTime: "9:00 PM",
    nextAvailable: "Tomorrow, 11:00 AM"
  },
  {
    id: "glow-nail",
    name: "Glow Nail & Sanctuary",
    category: "Nails & Spa",
    rating: 4.95,
    reviewCount: 210,
    location: "Emerald Ave, Ortigas Center, Pasig",
    area: "Ortigas Center",
    startingPrice: 500,
    image: ASSETS.glowNailHero,
    verified: true,
    topRated: true,
    tags: ["Top Pick", "Japanese Polishes"],
    openNow: true,
    closingTime: "8:30 PM",
    nextAvailable: "Today, 4:00 PM"
  },
  {
    id: "mindful-spa",
    name: "Mindful Wellness Spa",
    category: "Wellness & Massage",
    rating: 4.7,
    reviewCount: 76,
    location: "Madrigal Business Park, Alabang, Muntinlupa",
    area: "Alabang, Muntinlupa",
    startingPrice: 850,
    image: ASSETS.mindfulSpaHero,
    verified: true,
    tags: ["Holistic Care", "Physical Therapists"],
    openNow: true,
    closingTime: "10:00 PM",
    nextAvailable: "Available This Week"
  }
];

export const INITIAL_SERVICES: SalonService[] = [
  {
    id: "srv-1",
    title: "Signature Haircut & Wash",
    category: "HAIRCUTS",
    description: "Consultation, precision cut, scalp massage and blowout.",
    duration: "45 mins",
    price: 450,
    isPopular: true,
    isActive: true,
    bookingsThisMonth: 142,
    grossRevenue: 63900,
    staffAssigned: "All Staff",
    image: ASSETS.haircutService
  },
  {
    id: "srv-2",
    title: "Balayage & Gloss Treatment",
    category: "COLOR",
    description: "Custom hand-painted highlights + deep moisture mask and toner.",
    duration: "120 mins",
    price: 2400,
    deposit: 500,
    isActive: true,
    bookingsThisMonth: 38,
    grossRevenue: 91200,
    staffAssigned: "Jamie Lim, Maria Santos",
    image: ASSETS.balayageService
  },
  {
    id: "srv-3",
    title: "Styling & Blowout",
    category: "HAIRCUTS",
    description: "Gentle wash and bouncy blowout styling with long-lasting hold serum.",
    duration: "35 mins",
    price: 380,
    isActive: true,
    bookingsThisMonth: 65,
    grossRevenue: 24700,
    staffAssigned: "Maria Santos",
    image: ASSETS.blowoutService
  },
  {
    id: "srv-4",
    title: "Keratin Smooth Therapy",
    category: "CHEMICAL",
    description: "Frizz reduction and nourishing shine treatment. Lasts up to 12 weeks.",
    duration: "90 mins",
    price: 1800,
    isActive: true,
    bookingsThisMonth: 22,
    grossRevenue: 39600,
    staffAssigned: "Jamie Lim",
    image: ASSETS.keratinService
  },
  {
    id: "srv-5",
    title: "Gel Polish Manicure",
    category: "NAILS",
    description: "Cuticle care + long-lasting UV gel with hand massage and organic oils.",
    duration: "50 mins",
    price: 550,
    isActive: true,
    bookingsThisMonth: 54,
    grossRevenue: 29700,
    staffAssigned: "Elena Cruz",
    image: ASSETS.manicureService
  },
  {
    id: "srv-6",
    title: "Express Beard Trim",
    category: "HAIRCUTS",
    description: "Hot towel finish, perimeter shape-up and conditioning beard oil.",
    duration: "20 mins",
    price: 250,
    isActive: false,
    bookingsThisMonth: 0,
    grossRevenue: 0,
    staffAssigned: "Julian Cruz",
    image: ASSETS.haircutService
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "SC-8921",
    bookingNumber: "SC-8921",
    clientName: "Alex Santos",
    clientPhone: "+63 917 555 0192",
    clientAvatar: ASSETS.alexAvatar,
    serviceTitle: "Signature Haircut & Wash",
    stylistName: "Maria Santos",
    stylistAvatar: ASSETS.mariaAvatar,
    date: "Tuesday, Oct 20, 2026",
    time: "10:45 AM",
    duration: "45 mins",
    fee: 450,
    status: "confirmed",
    paymentStatus: "Unpaid",
    paymentMethod: "Pay at Venue (Cash / GCash / Card)",
    location: "Unit 302, High Street South, BGC, Taguig",
    businessName: "Studio Bloom",
    clientNote: "Sensitive scalp, prefers sulfate-free shampoo."
  },
  {
    id: "SC-8920",
    bookingNumber: "SC-8920",
    clientName: "Camille David",
    clientPhone: "+63 928 444 8812",
    clientAvatar: ASSETS.camilleAvatar,
    serviceTitle: "Balayage & Gloss Treatment",
    stylistName: "Jamie Lim",
    stylistAvatar: ASSETS.jamieAvatar,
    date: "Tuesday, Oct 20, 2026",
    time: "01:15 PM",
    duration: "120 mins",
    fee: 2400,
    status: "confirmed",
    paymentStatus: "Deposit Paid",
    depositAmount: 1200,
    remainingBalance: 1200,
    paymentMethod: "GCash Online Deposit",
    location: "Unit 302, High Street South, BGC, Taguig",
    businessName: "Studio Bloom",
    clientNote: "Wella Koleston 7/1 (30g) + 8/38 (15g) @ 20vol on roots."
  },
  {
    id: "SC-8919",
    bookingNumber: "SC-8919",
    clientName: "Paolo Roxas",
    clientPhone: "+63 905 111 9283",
    clientInitials: "P",
    serviceTitle: "Classic Fade & Beard Trim",
    stylistName: "Julian Cruz",
    stylistAvatar: ASSETS.julianAvatar,
    date: "Tuesday, Oct 20, 2026",
    time: "03:30 PM",
    duration: "45 mins",
    fee: 450,
    status: "pending",
    paymentStatus: "Unpaid",
    paymentMethod: "Pay at Venue",
    location: "Unit 302, High Street South, BGC, Taguig",
    businessName: "Studio Bloom",
    clientNote: "Requested quiet session if possible. First time visiting."
  },
  {
    id: "SC-8918",
    bookingNumber: "SC-8918",
    clientName: "Sarah Tan",
    clientPhone: "+63 919 333 1122",
    clientInitials: "S",
    serviceTitle: "Styling & Blowout",
    stylistName: "Maria Santos",
    stylistAvatar: ASSETS.mariaAvatar,
    date: "Tuesday, Oct 20, 2026",
    time: "09:30 AM",
    duration: "35 mins",
    fee: 380,
    status: "completed",
    paymentStatus: "Paid",
    paymentMethod: "Paid via GCash (₱380)",
    location: "Unit 302, High Street South, BGC, Taguig",
    businessName: "Studio Bloom"
  }
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: "cl-1",
    name: "Alex Santos",
    phone: "+63 917 555 0192",
    email: "alex.santos@gmail.com",
    avatar: ASSETS.alexAvatar,
    initials: "AS",
    tier: "VIP",
    visits: 14,
    totalSpent: 7850,
    lastVisit: "16d ago",
    frequencyDays: 18,
    nextAppointment: "Today, 10:45 AM",
    preferredStylist: "Maria Santos",
    clientNotes: "Prefers non-scented shampoo, sensitive scalp. Likes crisp side part with matte pomade finish.",
    tags: ["VIP", "Frequent", "High LTV"]
  },
  {
    id: "cl-2",
    name: "Camille David",
    phone: "+63 928 444 8812",
    email: "camille.d@gmail.com",
    avatar: ASSETS.camilleAvatar,
    initials: "CD",
    tier: "VIP",
    visits: 8,
    totalSpent: 18400,
    lastVisit: "3 wks ago",
    formulaNote: "Wella Koleston 7/1 (30g) + 8/38 (15g) @ 20vol on roots.",
    clientNotes: "Always prefers afternoon sessions (after 2:00 PM). Due for gloss treatment soon.",
    preferredStylist: "Jamie Lim",
    tags: ["VIP", "Top Spender"]
  },
  {
    id: "cl-3",
    name: "Sarah Tan",
    phone: "+63 919 333 1122",
    initials: "ST",
    tier: "Regular",
    visits: 4,
    totalSpent: 1920,
    lastVisit: "Today (9:15 AM)",
    clientNotes: "Express Blowout regular before meetings.",
    preferredStylist: "Maria Santos",
    tags: ["Regular", "Frequent"]
  },
  {
    id: "cl-4",
    name: "Marco Valdez",
    phone: "+63 905 888 2211",
    initials: "MV",
    avatar: ASSETS.marcoAvatar,
    tier: "New Client",
    visits: 1,
    totalSpent: 650,
    lastVisit: "First Visit Today",
    nextAppointment: "Today, 02:00 PM",
    clientNotes: "First visit from Instagram recommendation.",
    tags: ["New"]
  }
];

export const INITIAL_STYLISTS: Stylist[] = [
  {
    id: "st-1",
    name: "Maria Santos",
    role: "Senior Stylist Specialist",
    avatar: ASSETS.mariaAvatar,
    rating: 4.95,
    apptsCount: 112,
    earnings: 54200,
    goalPercentage: "36.5% of goal"
  },
  {
    id: "st-2",
    name: "Jamie Lim",
    role: "Master Colorist & Founder",
    avatar: ASSETS.jamieAvatar,
    rating: 4.98,
    apptsCount: 98,
    earnings: 82400,
    goalPercentage: "Top Earner",
    isTopEarner: true
  },
  {
    id: "st-3",
    name: "Julian Cruz",
    role: "Barber Artist & Stylist",
    avatar: ASSETS.julianAvatar,
    rating: 4.88,
    apptsCount: 74,
    earnings: 33600,
    goalPercentage: "22.6% of goal"
  }
];

export const ADMIN_KYC_REQUESTS = [
  {
    id: "kyc-1",
    name: "Aura Aesthetics & Spa",
    location: "Makati City, Metro Manila",
    appliedTime: "Applied 4h ago",
    tin: "402-981-114",
    dtiVerified: true,
    mayorsPermit: true,
    status: "Pending Verification",
    image: ASSETS.auraSpaHero
  },
  {
    id: "kyc-2",
    name: "Studio Bloom",
    location: "BGC Flagship • Jamie Lim",
    category: "Hair & Beauty",
    monthlyGMV: "₱148,200",
    rating: 4.9,
    reviews: 184,
    tier: "PRO",
    status: "Active",
    image: ASSETS.studioBloomStorefront
  },
  {
    id: "kyc-3",
    name: "Northside Barber Co.",
    location: "Quezon City • Julian Cruz",
    category: "Barbershop",
    monthlyGMV: "₱96,400",
    status: "Active",
    tier: "BASIC",
    image: ASSETS.northsideSquare
  },
  {
    id: "kyc-4",
    name: "Glow Nail Bar QC",
    location: "Tomas Morato, QC • Mara Santos",
    issue: "2025 Mayor's Permit Re-uploaded",
    issueDetail: "Prior record flagged expired on Feb 1. Partner uploaded certified municipal renewal certificate.",
    status: "Re-Submitted",
    image: ASSETS.glowNailQC
  }
];
