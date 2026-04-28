# innocentdev — Portfolio + Supabase

Fresh Next.js 14 portfolio with Supabase backend and admin panel.

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + RLS)
- **Vercel** (deployment)

## Quick Start

### 1. Clone & install
```bash
git clone https://github.com/INNOCENT-010/innocentdev.git
cd innocentdev
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → your project
2. Open **SQL Editor**
3. Paste and run the entire contents of `supabase-schema.sql`
4. This creates all tables, RLS policies, and seeds your initial data

### 3. Environment variables
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=choose_a_password
```

Get these from: Supabase Dashboard → Settings → API

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, featured projects, CTA |
| `/about` | Bio, skills with bars, experience, links |
| `/portfolio` | All projects with filter tabs |
| `/admin` | Dashboard with counts |
| `/admin/projects` | Add / edit / delete projects |
| `/admin/skills` | Manage tech stack |
| `/admin/experience` | Work history |
| `/admin/messages` | Contact form inbox |

## Admin Panel
Go to `/admin` — no login UI is built (you're the only user). 
For basic protection, add a Vercel password protection or use middleware.

Optional: add middleware for admin protection in `src/middleware.ts`:
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const auth = request.headers.get('authorization')
    const pass = process.env.ADMIN_PASSWORD
    if (!auth || auth !== `Bearer ${pass}`) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Bearer' },
      })
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
```

## Deploy to Vercel
```bash
# Push to GitHub first, then:
vercel --prod
```
Add your env vars in Vercel dashboard → Settings → Environment Variables.

## Database Tables

| Table | Purpose |
|-------|---------|
| `profile` | Single row — your bio, links, availability |
| `projects` | Portfolio projects with tech stack |
| `skills` | Tech stack by category with proficiency |
| `experience` | Work history |
| `contact_messages` | Form submissions (future contact form) |
