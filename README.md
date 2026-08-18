# NISC Election Portal 2026–27

Official election portal for the **North India Student Cell (NISC)** at KLH University, Hyderabad.

Built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## Features

- 🗳️ **Secure Voting** — Roll number authentication for 70 NISC members
- 👤 **Candidate Manifestos** — Full manifesto pages for all 3 candidates
- 🔒 **Revote Prevention** — Members can only vote once
- 🎨 **NISC Branding** — Warm peach/orange theme with premium typography

## Getting Started

```bash
# Install dependencies
npm install

# Create .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── page.tsx              # Homepage
├── voter/page.tsx        # Voter login & voting flow
├── candidates/page.tsx   # All candidates
├── candidates/[slug]/    # Individual manifesto
├── results/page.tsx      # Election results
├── admin/page.tsx        # Admin login
└── admin/dashboard/      # Admin dashboard

components/election/      # Reusable election components
data/                     # Candidate & voter data
lib/                      # Auth, election logic, Supabase client
types/                    # TypeScript interfaces
```

## Admin Access

Navigate to `/admin` and enter the admin passcode.

## Tech Stack

- **Framework**: Next.js 14.2.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Fonts**: Outfit (headings) + Inter (body)
