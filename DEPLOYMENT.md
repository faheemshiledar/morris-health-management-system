# 🚀 Morris HMS — Deployment Guide
**Deploy in under 10 minutes**

---

## ✅ Prerequisites
- GitHub account
- Vercel account (free) → https://vercel.com
- Supabase account (free) → https://supabase.com
- Groq account (free) → https://console.groq.com

---

## STEP 1 — Set Up Supabase (3 min)

1. Go to https://app.supabase.com → **New Project**
2. Name it `morris-health`, choose a region close to you, set a DB password
3. Wait ~2 minutes for project to spin up
4. Go to **SQL Editor** → **New Query**
5. Paste the entire contents of `supabase-schema.sql` and click **Run**
6. Go to **Project Settings → API**
7. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## STEP 2 — Get Your Groq API Key (1 min)

1. Go to https://console.groq.com → **API Keys** → **Create API Key**
2. Copy the key → `GROQ_API_KEY`

---

## STEP 3 — Push to GitHub (2 min)

```bash
# In the morris-health folder:
git init
git add .
git commit -m "Initial commit — Morris HMS"

# Create a new repo on GitHub (github.com/new), then:
git remote add origin https://github.com/YOUR_USERNAME/morris-health.git
git branch -M main
git push -u origin main
```

---

## STEP 4 — Deploy on Vercel (3 min)

1. Go to https://vercel.com/new
2. Click **Import Git Repository** → select `morris-health`
3. Click **Environment Variables** and add these three:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `GROQ_API_KEY` | `gsk_...` |

4. Click **Deploy** → Wait ~2 minutes
5. 🎉 Your app is live at `https://morris-health-xxx.vercel.app`

---

## STEP 5 — Local Development (Optional)

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/morris-health.git
cd morris-health

# Install dependencies
npm install

# Create env file
cp .env.local.example .env.local
# → Edit .env.local and fill in your credentials

# Run dev server
npm run dev
# → Open http://localhost:3000
```

---

## 📁 Project Structure

```
morris-health/
├── app/
│   ├── layout.js                  ← Root layout (sidebar)
│   ├── page.js                    ← Dashboard
│   ├── patients/page.js           ← Patient management
│   ├── doctors/page.js            ← Doctor management
│   ├── appointments/page.js       ← Appointment scheduling
│   ├── labs/page.js               ← Lab test management
│   ├── billing/page.js            ← Billing & payments
│   ├── ai-assistant/page.js       ← Groq AI chat
│   └── api/
│       ├── dashboard/route.js     ← Dashboard stats API
│       ├── patients/route.js      ← Patients CRUD API
│       ├── doctors/route.js       ← Doctors CRUD API
│       ├── appointments/route.js  ← Appointments CRUD API
│       ├── labs/route.js          ← Lab tests CRUD API
│       ├── billing/route.js       ← Billing CRUD API
│       └── ai/route.js            ← Groq AI API
├── components/
│   ├── Sidebar.js                 ← Navigation sidebar
│   ├── StatCard.js                ← Dashboard stat cards
│   ├── Modal.js                   ← Reusable modal
│   └── PageHeader.js              ← Page title header
├── lib/
│   ├── supabase.js                ← Supabase client
│   └── groq.js                   ← Groq AI helper
├── supabase-schema.sql            ← Run this in Supabase SQL Editor
├── .env.local.example             ← Copy → .env.local
└── package.json
```

---

## 🔒 Security Notes for Production

- In Supabase → **Authentication → Row Level Security**, tighten RLS policies to require auth
- Add Next.js middleware for basic route protection if needed
- Never expose `GROQ_API_KEY` on the client side — it's server-only ✅ (already done)

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing Supabase env vars` | Check `.env.local` has all 3 variables |
| Tables not found | Re-run `supabase-schema.sql` in SQL Editor |
| AI returns error | Verify `GROQ_API_KEY` is valid and not expired |
| Build fails on Vercel | Check Vercel → Deployments → logs for specific error |
| Data not saving | Check Supabase → Table Editor to confirm tables exist |
