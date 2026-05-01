-- Phase 1: Database Schema & RLS
-- Run this entire script in your Supabase SQL Editor

-- 1. Create Core Tables

CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_monthly DECIMAL(10, 2) NOT NULL,
    max_users INTEGER NOT NULL,
    max_products INTEGER NOT NULL,
    features JSONB
);

CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    gst_number TEXT,
    logo_url TEXT,
    subscription_plan UUID REFERENCES public.subscription_plans(id),
    subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'expired')),
    subscription_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('superadmin', 'admin', 'cashier')) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    barcode TEXT,
    category TEXT,
    price_mrp DECIMAL(10, 2) NOT NULL,
    price_cost DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    expiry_date DATE,
    hsn_code TEXT,
    tax_rate DECIMAL(5, 2) DEFAULT 0 CHECK (tax_rate IN (0, 5, 12, 18, 28)),
    emoji TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    cashier_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    bill_number TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    loyalty_redeemed INTEGER DEFAULT 0,
    loyalty_earned INTEGER DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 2. Seed Initial Data
INSERT INTO public.subscription_plans (name, price_monthly, max_users, max_products, features) VALUES
('Basic', 999.00, 3, 100, '{"pos": true, "inventory": true, "gst_invoice": false}'),
('Standard', 1999.00, 10, 500, '{"pos": true, "inventory": true, "gst_invoice": true, "reports": true}'),
('Pro', 3999.00, 9999, 999999, '{"pos": true, "inventory": true, "gst_invoice": true, "reports": true, "priority_support": true}');

-- Seed Superadmin (Password: 'super123' bcrypt hashed cost 10)
INSERT INTO public.users (company_id, name, username, password_hash, role, is_active) 
VALUES (NULL, 'System Admin', 'superadmin', '$2b$10$m27KqE6MIDcaYlYOkdflLei13PHVGzBbjgp/6heAvYeTDkYzYPOum', 'superadmin', true);


-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- 4. RLS Policies
-- Note: Super Admin bypasses these automatically when using the Supabase Service Role Key on the backend.
-- The frontend will use the Anon Key and send the JWT which contains the 'company_id'.

-- Companies (Users can view their own company)
CREATE POLICY "Users can view own company" ON public.companies FOR SELECT
USING (id = (auth.jwt()->>'company_id')::uuid);

-- Users (Users can view staff in their own company)
CREATE POLICY "Users can view own company staff" ON public.users FOR SELECT
USING (company_id = (auth.jwt()->>'company_id')::uuid);

-- Suppliers
CREATE POLICY "Company isolated suppliers" ON public.suppliers FOR ALL
USING (company_id = (auth.jwt()->>'company_id')::uuid);

-- Products
CREATE POLICY "Company isolated products" ON public.products FOR ALL
USING (company_id = (auth.jwt()->>'company_id')::uuid);

-- Customers
CREATE POLICY "Company isolated customers" ON public.customers FOR ALL
USING (company_id = (auth.jwt()->>'company_id')::uuid);

-- Transactions
CREATE POLICY "Company isolated transactions" ON public.transactions FOR ALL
USING (company_id = (auth.jwt()->>'company_id')::uuid);

-- Audit Logs
CREATE POLICY "Company isolated audit logs" ON public.audit_logs FOR ALL
USING (company_id = (auth.jwt()->>'company_id')::uuid);
