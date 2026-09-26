# Scheduly

Scheduly is a modern appointment-booking and service business management prototype built for salons, studios, spas, barbershops, and similar service-driven businesses. It presents a client booking experience, a business operations dashboard, and an admin oversight view in a single React + TypeScript app.

## Overview

The app is designed to simulate a marketplace for discovering businesses, browsing services, selecting time slots, and managing bookings. It is structured around three primary experiences:

- Client mode for browsing studios and booking appointments
- Business mode for managing calendar, bookings, services, clients, and analytics
- Admin mode for reviewing onboarding, verification, and operational workflows

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion / Motion
- Google GenAI package
- Lucide React icons

## Project structure

```text
Scheduly/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   ├── data/
│   │   └── mockData.ts
│   ├── components/
│   │   ├── Header.tsx
│   │   └── BottomNav.tsx
│   └── views/
│       ├── HomeScreen.tsx
│       ├── ExploreScreen.tsx
│       ├── ServiceDetailsScreen.tsx
│       ├── BookingSlotScreen.tsx
│       ├── ClientBookingsScreen.tsx
│       ├── BusinessOverviewScreen.tsx
│       ├── BusinessCalendarScreen.tsx
│       ├── BusinessBookingsScreen.tsx
│       ├── BusinessClientsScreen.tsx
│       ├── ServicesManagementScreen.tsx
│       ├── BusinessAnalyticsScreen.tsx
│       ├── AdminConsoleScreen.tsx
│       ├── FavoritesScreen.tsx
│       └── AuthModal.tsx
├── README.md
└── public/
```

## Features

- Studio discovery and service browsing
- Service detail pages with pricing and availability
- Appointment booking flow with date and time selection
- Client bookings, favorites, and profile management
- Business dashboard for operations and analytics
- Client CRM with booking history and customer information
- Admin console for onboarding and compliance review
- Responsive layout for mobile-first booking experiences

## Getting started

### Prerequisites

- Node.js 18 or later
- npm

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

This starts the Vite app on port 3000.

### Build for production

```bash
npm run build
```

### Type check

```bash
npm run lint
```

## App behavior

The app uses a single-page React interface to switch between client, business, and admin views. Booking data, studio listings, services, and UI state are driven primarily from local mock data and component state rather than a backend API.

## Notes

This repository is a polished front-end prototype rather than a full production-ready booking platform. It is best suited for UI exploration, product demos, and design validation for a service-booking workflow.

## License

This project does not currently include a license file. If you plan to distribute or deploy it publicly, add an appropriate license before release.
