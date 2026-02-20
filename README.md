# TaskMaster 🚀

A full-featured task management application built with **React + Vite + Supabase**.

---

## ✨ Features

- **Authentication** — Email/password sign-up & login, Google OAuth, forgot password
- **Task Management** — Create, edit, delete tasks with priorities, statuses, deadlines, subtasks
- **Projects** — Organize tasks into color-coded projects with progress tracking
- **Kanban Board** — Drag-and-drop tasks across status columns
- **Calendar View** — Month/week/day views with task dots and detail panel
- **Dashboard** — KPI cards, weekly productivity charts, upcoming & overdue tasks
- **Settings** — Profile, notifications, appearance, integrations, billing preferences
- **Pricing Page** — Three-tier subscription model (Free, Premium, Enterprise)
- **Help Center** — FAQ, support ticket form, system status monitor
- **Dark Mode UI** — Fully styled dark theme throughout

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Charts | Recharts |
| Icons | Lucide React + Material Symbols |
| Notifications | react-hot-toast |
| Dates | date-fns |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) account

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd taskmaster
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your **Project URL** and **anon public key**
3. Go to **SQL Editor** and run the entire contents of `supabase_schema.sql`
4. (Optional) Go to **Authentication → Providers** and enable **Google OAuth**

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
taskmaster/
├── public/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── AppLayout.jsx      # Main app shell with sidebar
│   ├── contexts/
│   │   ├── AuthContext.jsx        # Authentication state
│   │   └── TaskContext.jsx        # Tasks, projects, categories state
│   ├── lib/
│   │   └── supabase.js            # Supabase client + auth helpers
│   ├── pages/
│   │   ├── AuthPage.jsx           # Login/Signup
│   │   ├── DashboardPage.jsx      # Overview & analytics
│   │   ├── TasksPage.jsx          # Task list & management
│   │   ├── ProjectsPage.jsx       # Projects overview
│   │   ├── ProjectDetailPage.jsx  # Individual project view
│   │   ├── KanbanPage.jsx         # Drag-and-drop kanban board
│   │   ├── CalendarPage.jsx       # Calendar views
│   │   ├── SettingsPage.jsx       # User settings
│   │   ├── PricingPage.jsx        # Subscription plans
│   │   └── HelpPage.jsx           # Help center & support
│   ├── styles/
│   │   └── index.css              # Global styles + Tailwind
│   ├── App.jsx                    # Routes & providers
│   └── main.jsx                   # Entry point
├── supabase_schema.sql            # Full database schema
├── tailwind.config.js
├── vite.config.js
└── .env.example
```

---

## 🗄 Database Schema

The `supabase_schema.sql` file sets up:

- **profiles** — Extended user profiles
- **categories** — Task categories (with default seeding)
- **projects** — Project management with color, dates, team flag
- **user_projects** — Team project memberships
- **tasks** — Full task model with subtasks, recurrence, scheduling
- **task_comments** — Comments on tasks
- **attachments** — File attachments
- **reminders** — Custom task reminders
- **payments** — Payment/subscription records
- **activity_logs** — Audit trail

All tables have Row Level Security (RLS) enabled.

---

## 🔒 Row Level Security

All data is protected by RLS policies ensuring users can only access their own data. Policies are automatically applied when users are authenticated through Supabase Auth.

---

## 🏗 Build for Production

```bash
npm run build
npm run preview
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Run `npm run build`
2. Drag `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)
3. Add environment variables in site settings

---

## 📋 Task Validation Rules

| Field | Rule |
|-------|------|
| Task Name | 1–50 characters |
| Deadline | Must be a future date |
| Password | 8–16 chars, must include uppercase, lowercase, digit, special char |
| Phone | Must include country code |
| Project Dates | End date must be ≥ start date |

---

## 💡 Tips

- Enable **Google OAuth** in Supabase for one-click login
- Default categories (Personal, Work, Family, Projects) are auto-created for each new user via database trigger
- The Kanban board updates task status directly in Supabase in real-time
- All forms include client-side validation matching the database constraints

---

## 📄 License

MIT License — free to use, modify, and distribute.
