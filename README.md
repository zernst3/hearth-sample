> **This is a sample codebase for a Camerata inspection.** It was written to test
> Camerata, the code inspection engine by Cantus Works, and it contains problems
> placed on purpose: security gaps, data handling mistakes and code quality issues.
> Do not deploy it or copy code from it.
>
> Every key, token and password in this repository is fake test data, including the
> ones in `.env.production` that look live. None of them works anywhere.

# Hearth

Hearth is a local services marketplace. Sellers publish services with bookable
time slots, buyers pick a slot and pay through Stripe Checkout, and the two
sides talk in a per-booking chat. Sellers can attach photos to listings, buyers
can attach documents to bookings, and an admin console handles refunds and user
management. Booking confirmation emails go out from a Supabase Edge Function.

## Stack

- Next.js 15 (App Router) with React 19 and TypeScript
- Supabase: Postgres, Auth, Storage, Realtime, Edge Functions
- Stripe Checkout for payments
- Vitest for tests

## Running locally

1. Install dependencies: `npm install`
2. Start the local Supabase stack: `supabase start`
3. Apply migrations and seed data: `supabase db reset`
4. Copy `.env.example` to `.env.local` and fill in the values printed by
   `supabase start` plus your Stripe test key.
5. Start the app: `npm run dev` and open http://localhost:3000

## Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm test` runs the unit and integration tests
- `npm run lint` runs ESLint

The integration tests need the local Supabase stack running and
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` set.

## Layout

- `app/` routes, pages, route handlers and server actions
- `components/` UI components
- `hooks/` client data hooks
- `lib/` and `utils/` shared server and formatting code
- `supabase/` migrations, seed data and Edge Functions
- `tests/` Vitest suites
