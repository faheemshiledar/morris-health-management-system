# 🏥 Morris Health Management System

A modern, AI-powered clinic management platform built with **Next.js**, **Supabase**, and **Groq AI**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![Groq](https://img.shields.io/badge/Groq-llama3--70b-orange)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## ✨ Features

| Module | What it does |
|--------|-------------|
| 📊 **Dashboard** | Live stats — patients, doctors, today's appointments, lab tests |
| 🧑‍⚕️ **Patients** | Register & manage patients with full medical history |
| 👨‍⚕️ **Doctors** | Add doctors with specializations & schedules |
| 📅 **Appointments** | Schedule, track & filter appointments by status |
| 🔬 **Lab Tests** | Manage test results with built-in AI explanation |
| 💳 **Billing** | Track invoices, payments & overdue amounts |
| 🤖 **AI Assistant** | Chat with Groq AI for health insights & lab explanations |

---

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/morris-health.git
cd morris-health
npm install
cp .env.local.example .env.local
# Fill in your keys in .env.local
npm run dev
```

See **DEPLOYMENT.md** for full deployment instructions.

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GROQ_API_KEY=gsk_...
```

---

## 📦 Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API (llama3-70b-8192)
- **Deployment**: Vercel

---

## 📄 License

MIT — built by Morris Health Team.
