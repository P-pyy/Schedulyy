# Scheduly
[](https://github.com/P-pyy/scheduly#scheduly)
Scheduly is a modern, responsive appointment-booking and business-management platform for salons, barbershops, spas, and other service providers. It brings together client discovery, business operations, and administrative oversight in a single React application with optional Supabase-powered persistence and authentication.

## Features
[](https://github.com/P-pyy/scheduly#features)

- Client-facing service discovery with searchable business listings, filters, and detailed studio profiles
- Smart appointment booking flow for selecting date, time, specialist, and service details
- Booking management for viewing, canceling, and rescheduling appointments
- Favorites and saved preferences for studios and services
- Business dashboard for overview analytics, appointment controls, and client management
- Business calendar and booking operations with status updates and check-in controls
- Services and pricing management for service offerings and operational configuration
- Admin console for platform management, moderation, business reviews, and user oversight
- Optional Supabase-powered auth, database syncing, and persisted booking records

## Stack
[](https://github.com/P-pyy/scheduly#stack)

- Node.js
- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Motion for React
- Supabase for authentication and optional database persistence
- Express for optional backend/server-side support
- Lucide React for UI icons

## Project structure
[](https://github.com/P-pyy/scheduly#project-structure)

```text
scheduly/
├── index.html                  HTML entry point
├── package.json                Dependencies and scripts
├── vite.config.ts             Vite configuration
├── tsconfig.json              TypeScript configuration
├── public/                    Static assets and bundled media
│   └── images/                Image files used throughout the UI
├── src/
│   ├── app/
│   │   └── App.tsx            Main application shell and mode switching
│   ├── components/            Reusable UI components
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── ErrorBoundary.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx    Authentication and profile state
│   ├── data/
│   │   └── mockData.ts        Demo data and bundled assets
│   ├── hooks/
│   │   └── useAuth.ts         Auth hook wrapper
│   ├── lib/
│   │   ├── auth.ts            Authentication helpers
│   │   ├── database.ts        Supabase data access layer
│   │   ├── database.types.ts  Generated DB types
│   │   └── supabase.ts        Supabase client setup
│   ├── shared/
│   │   └── types.ts           Shared application types
│   ├── views/                 Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ExploreScreen.tsx
│   │   ├── ServiceDetailsScreen.tsx
│   │   ├── BookingSlotScreen.tsx
│   │   ├── ClientBookingsScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── BusinessOverviewScreen.tsx
│   │   ├── BusinessCalendarScreen.tsx
│   │   ├── BusinessBookingsScreen.tsx
│   │   ├── BusinessClientsScreen.tsx
│   │   ├── ServicesManagementScreen.tsx
│   │   ├── BusinessAnalyticsScreen.tsx
│   │   ├── AdminConsoleScreen.tsx
│   │   └── AuthModal.tsx
│   ├── index.css             Global styles and Tailwind entry
│   ├── main.tsx              React entry point
│   └──
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
├── README.md
├── package-lock.json
├── .gitignore
└── .env.example (if present)
```

## How it works
[](https://github.com/P-pyy/scheduly#how-it-works)
`src/main.tsx` boots the app and initializes the React providers, while `src/app/App.tsx` manages the three primary user experiences: client, business, and admin. The header and state logic route the UI between those modes and sync the active role when Supabase-authenticated user data is available.

The project supports a demo mode that uses bundled sample data in `src/data/mockData.ts` when Supabase is not configured. If a valid Supabase environment is present, the app loads and updates booking data through `src/lib/database.ts` and keeps the UI aligned with the authenticated user profile.

## Requirements
[](https://github.com/P-pyy/scheduly#requirements)

- Node.js 20.19+ or 22.12+
- npm
- Optional: a Supabase project for authentication and persistence

## Installation
[](https://github.com/P-pyy/scheduly#installation)

```bash
git clone https://github.com/P-pyy/scheduly.git
cd scheduly
npm install
```

Create a `.env` file in the project root if you want to enable Supabase-backed features:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Do not commit `.env` and keep the public anon key only in client-side environment variables.

## Running the application
[](https://github.com/P-pyy/scheduly#running-the-application)

```bash
npm run dev
```

Then open:

- Client app: `http://localhost:3000/`
- Business/admin modes are switched inside the app UI

Additional scripts:

```bash
npm run build
npm run preview
npm run lint
npm run clean
```

## Supabase data used by the application
[](https://github.com/P-pyy/scheduly#supabase-data-used-by-the-application)

The app can integrate with Supabase for:

- authentication
- user profiles and role-based mode switching
- booking records and booking status updates
- client check-in states
- optional real persistence for business and admin flows

The database schema is defined under `supabase/migrations/0001_initial_schema.sql` and should be applied to a Supabase project before enabling full data-backed features.

## Available command
[](https://github.com/P-pyy/scheduly#available-command)

```bash
npm run dev
```

This starts the Vite development server with hot reloading.

## Security notes
[](https://github.com/P-pyy/scheduly#security-notes)

- Keep `.env` out of version control.
- Use only the public Supabase anon key in client-side environment variables.
- Do not expose Supabase service-role credentials in the browser.
- Review Supabase Row Level Security policies before deploying the app to production.
- Treat the demo mode as a prototype; it is not a production-grade booking or payment system.
