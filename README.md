# Supermarket Pro (Multi-Tenant SaaS Platform)

Supermarket Pro is a complete, production-ready, cloud-native Point of Sale and Store Management system built with Next.js 14, Fastify (Node.js), and Supabase PostgreSQL.

## 🌟 Key Features
- **Multi-Tenant Architecture**: Manage multiple companies, each with isolated data and staff.
- **Role-Based Access Control**: Strict permissions for Super Admins, Store Admins, and Cashiers.
- **Robust POS**: Real-time cart calculation, loyalty points redemption, and stock deduction.
- **GST Billing**: Support for thermal (80mm) and A4 letterhead invoice printing.
- **Subscriptions**: Tiered billing plans controlling user limits and features.
- **Security**: Supabase Row Level Security (RLS) combined with JWT backend enforcement.

---

## 🚀 Setup Instructions

### 1. Database (Supabase)
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy the entire contents of `schema.sql` located in the root of this repository.
4. Run the script. This will create all tables, apply RLS policies, and insert the default Superadmin credentials.

### 2. Environment Variables
You need to configure both the backend and frontend.

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` folder:
```env
PORT=4001
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=any_strong_random_string
```

#### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend/` folder:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4001
```

### 3. Running the Application

You will need to run both servers simultaneously.

**Terminal 1 (Backend API):**
```bash
cd backend
npm install
npx tsx src/index.ts
```
*(The backend runs on `http://localhost:4001`)*

**Terminal 2 (Frontend UI):**
```bash
cd frontend
npm install
npm run dev -- -p 4000
```
*(The frontend runs on `http://localhost:4000`)*

---

## 🔑 Default Login
Once both servers are running, open `http://localhost:4000` in your browser.

- **Username**: `superadmin`
- **Password**: `super123`

1. Log in as Super Admin.
2. Go to "Companies" and create your first shop.
3. The system will auto-generate Store Admin credentials for you to test the POS and management dashboards.
