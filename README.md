# Scheduly

A modern, responsive appointment-booking and business-management platform for salons, barbershops, spas, and other service providers. Built as a single-page React application, Scheduly provides seamless experiences for clients discovering services, businesses managing operations, and administrators overseeing the platform.

## Features

### Client Experience
- **Service Discovery:** Search and filter businesses by location, category, and ratings
- **Studio Browsing:** View detailed service menus, stylist profiles, and pricing
- **Smart Booking:** Select date, time, specialist, and complete checkout flow
- **Booking Management:** View, reschedule, and cancel appointments
- **Favorites:** Save preferred studios and services for quick access
- **Export:** Download appointment confirmations and calendar exports

### Business Dashboard
- **Operations Overview:** Real-time view of today's bookings and key metrics
- **Calendar Management:** Visual appointment scheduling with drag-and-drop support
- **Booking Controls:** Accept, decline, or mark clients as checked in
- **Client CRM:** Maintain client profiles with notes, visit history, and preferences
- **Services & Pricing:** Configure service offerings, durations, and pricing tiers
- **Analytics:** Track revenue, occupancy rates, and staff performance

### Admin Console
- **Platform Dashboard:** Monitor system health and key metrics
- **Business KYC:** Review and approve business verification submissions
- **Moderation:** Handle disputes, reviews, and platform violations
- **User Management:** Manage roles, permissions, and platform access
- **Audit Trail:** Track platform activity and administrative actions

## Tech Stack

- **React 19** – Modern UI framework with TypeScript support
- **TypeScript** – Static type checking for safer code
- **Vite 8** – Lightning-fast development server and build tool
- **Tailwind CSS 4** – Utility-first CSS framework
- **Motion for React** – Smooth animations and transitions
- **Supabase** – Optional authentication and PostgreSQL persistence
- **Lucide React** – Icon library for the UI
- **Express** – Optional backend for server-side needs

## Project Structure

```
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
│
├── public/                       # Static assets
│   └── images/                   # Image assets
│
├── src/
│   ├── main.tsx                 # React entry point with providers
│   ├── index.css                # Tailwind imports and global styles
│   │
│   ├── app/
│   │   └── App.tsx              # Main app component with routing logic
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Header.tsx           # Top navigation with mode switcher
│   │   ├── BottomNav.tsx        # Mobile bottom navigation
│   │   └── ErrorBoundary.tsx    # Error fallback boundary
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication and user profile state
│   │
│   ├── hooks/
│   │   └── useAuth.ts           # Auth context consumer hook
│   │
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client initialization
│   │   ├── auth.ts              # Authentication functions
│   │   ├── database.ts          # Database queries and mutations
│   │   └── database.types.ts    # Generated Supabase types
│   │
│   ├── data/
│   │   └── mockData.ts          # Sample data and bundled image assets
│   │
│   ├── shared/
│   │   └── types.ts             # Shared domain and UI type definitions
│   │
│   └── views/                   # Screen components
│       ├── HomeScreen.tsx           # Client landing page
│       ├── ExploreScreen.tsx        # Business discovery and search
│       ├── ServiceDetailsScreen.tsx # Studio and service details
│       ├── BookingSlotScreen.tsx    # Booking flow and checkout
│       ├── ClientBookingsScreen.tsx # Client's appointment list
│       ├── FavoritesScreen.tsx      # Saved studios and services
│       │
│       ├── BusinessOverviewScreen.tsx  # Business dashboard overview
│       ├── BusinessCalendarScreen.tsx  # Visual appointment calendar
│       ├── BusinessBookingsScreen.tsx  # Manage bookings (accept/decline)
│       ├── BusinessClientsScreen.tsx   # Client CRM and history
│       ├── ServicesManagementScreen.tsx# Service and pricing config
│       ├── BusinessAnalyticsScreen.tsx # Revenue and performance metrics
│       │
│       ├── AdminConsoleScreen.tsx   # Admin dashboard and controls
│       └── AuthModal.tsx            # Authentication UI (login/signup)
│
└── supabase/
    └── migrations/
        └── 0001_initial_schema.sql  # Database schema, policies, and triggers
```

## How It Works

**Runtime Flow:** The app initializes with React providers (AuthProvider, ErrorBoundary) in `main.tsx`. The `App` component manages three distinct application modes: **client** (service discovery and booking), **business** (appointment and CRM management), and **admin** (platform oversight). Mode selection is either manual via the header switcher or automatic based on the authenticated user's role.

**Authentication:** If Supabase is configured, users can sign in via email/password through the `AuthModal`. The `AuthContext` manages user state, fetches profile data, and syncs the app mode to the user's role. Without Supabase, the app runs in demo mode using bundled sample data and simulated authentication.

**State Management:** Booking state and UI navigation live in React component state within `App.tsx`. For Supabase-backed features, mutations are sent to the database via `lib/database.ts` functions (e.g., `updateBookingStatus`, `setBookingCheckIn`). Non-Supabase changes persist only in memory during the session.

**Styling:** All UI is styled with Tailwind CSS (v4) using a custom color palette. Animations are powered by Motion for React for smooth transitions between screens and toast notifications.

## Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm

### Local Development

1. **Clone and install:**
   ```bash
   git clone https://github.com/P-pyy/scheduly.git
   cd scheduly
   npm install
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```
   The app runs at `http://localhost:3000`

3. **Available npm scripts:**
   ```bash
   npm run dev       # Start dev server with hot reload
   npm run build     # Create production build in dist/
   npm run preview   # Preview production build locally
   npm run lint      # Run TypeScript type checking
   npm run clean     # Remove build artifacts
   ```

### Supabase Setup (Optional)

To enable persistent bookings, authentication, and CRM features:

1. **Create a `.env` file** in the project root:
   ```env
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

2. **Initialize the database:**
   - Open Supabase SQL Editor
   - Copy and run the entire `supabase/migrations/0001_initial_schema.sql` file
   - This creates tables, row-level security policies, and database triggers

3. **Create users:**
   - Use Supabase Auth to create email/password users
   - To make the first user an admin, run in SQL Editor:
     ```sql
     UPDATE public.profiles
     SET role = 'admin'
     WHERE email = 'admin@example.com';
     ```

4. **Restart the dev server** after updating `.env`

**Note:** Only use the public anon key in `.env` (prefixed with `VITE_`). Never expose the service-role key in client code.

## Key Behaviors

- **Demo Mode:** Without Supabase, all data comes from `mockData.ts`. Session changes don't persist across page reloads.
- **Supabase Mode:** Real auth, CRM, and booking management. Bookings sync with the database in real time.
- **Mode Switching:** Click the mode selector in the header to switch between Client, Business, and Admin views for testing.
- **Role-Based Access:** Admin and business roles are enforced by Supabase row-level security policies.
- **Sample Data:** The app includes seeded business, service, and booking records for immediate hands-on exploration.

## Limitations

- Local demo changes are lost on page reload (not persisted to storage)
- Some admin screens use fixed sample records and should not be treated as operational reporting
- Booking creation and certain admin actions default to demo mode if Supabase is not configured
- No license file is currently included
- The interface is a prototype and not production-ready for payment processing or SMS integrations

## Contributing

Contributions are welcome. Please open an issue or pull request for bugs, features, or documentation improvements.

## Support

For questions or issues:
1. Check the Supabase setup instructions if authentication or persistence isn't working
2. Verify your environment variables are correctly set
3. Review the console logs for error details
4. Ensure your Supabase project has the migration schema applied

## License

See LICENSE file for details.
