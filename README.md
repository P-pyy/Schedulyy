# Scheduly

Scheduly is a responsive appointment-booking and business-management prototype for salons, barbershops, spas, and other service providers. A single-page React application contains client, business, and platform-admin experiences.

## Experiences

- **Client:** Search and filter service businesses, view service menus and studio profiles, choose a date, time, and specialist, manage bookings, save favorites, export appointments to a calendar file, and submit reviews.
- **Business:** View an operations overview and calendar, manage bookings and check-ins, export booking records, maintain client notes, manage services and staff schedules, and submit business verification details.
- **Platform admin:** Review the platform dashboard, business KYC submissions, sample user records, moderation tickets, platform settings, and audit history.

The interface is a prototype rather than a complete production booking service. Several dashboards, analytics, user lists, moderation examples, payment/SMS controls, and calendar schedules use seeded or static demo data. The UI does not itself provide payment processing, outbound reminders, social sign-in, or live platform telemetry.

## Technology

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- Supabase JavaScript client for optional authentication and persistence
- Motion for React animations
- Material Symbols for interface icons

## Requirements

- Node.js supported by Vite 8 (Node.js 20.19+ or 22.12+)
- npm

## Run locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Vite serves the app at [http://localhost:3000](http://localhost:3000).

Available scripts:

```bash
npm run dev      # Start the Vite development server on port 3000
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build
npm run lint     # Run TypeScript checking (tsc --noEmit)
```

## Supabase setup

Supabase is optional for the local demo. Without valid Supabase settings, the app uses bundled sample data and simulated authentication. Data held only in the browser or module state is not a durable database and is reset when the app reloads.

To connect a Supabase project:

1. Create a `.env` file in the project root with the project URL and public anon key:

	```dotenv
	VITE_SUPABASE_URL=https://<project-ref>.supabase.co
	VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
	```

2. In the Supabase SQL Editor, run [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql) against a fresh project. The migration creates the application schema, row-level security policies, and database functions. It does not create Auth users or sample business records.
3. Create users through Supabase Auth. A database trigger creates each user's profile. To grant the first administrator role, update that profile in the SQL Editor, for example:

	```sql
	update public.profiles
	set role = 'admin'
	where email = 'admin@example.com';
	```

4. Restart the Vite server after changing environment variables.

Use only the public anon key in this browser app. Never put a Supabase service-role key in `.env` variables prefixed with `VITE_` or in client-side code.

Email/password authentication and selected business, booking, staff, CRM, favorite, review, and KYC operations use Supabase when it is configured. Booking creation and privileged admin actions use database RPCs. Some screens still display sample content or use local state, so connecting Supabase does not turn every dashboard metric or interaction into live data.

## Project layout

```text
.
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── images/
├── src/
│   ├── main.tsx                 # React entry point and providers
│   ├── index.css                # Tailwind import and global styles
│   ├── app/App.tsx              # Main app state and screen routing
│   ├── components/              # Header, navigation, and error boundary
│   ├── contexts/AuthContext.tsx # Authentication and profile state
│   ├── data/mockData.ts         # Seed data and bundled image assets
│   ├── hooks/useAuth.ts         # Auth context hook export
│   ├── lib/                     # Supabase auth, database access, and DB types
│   ├── shared/types.ts          # Shared UI/domain types
│   └── views/                   # Client, business, admin, and auth screens
└── supabase/migrations/         # Database schema, policies, and RPCs
```

## Limitations

- Local demo changes are generally kept in React or module state and do not persist across reloads.
- Supabase-backed features require the migration, valid environment variables, appropriate Auth users/roles, and matching records in the database.
- Some app screens intentionally use fixed sample records and metrics; they should not be treated as operational reporting.
- No license file is currently included.
