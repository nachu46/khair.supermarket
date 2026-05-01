-- Run this in your Supabase SQL Editor to add the company_settings table

CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE NOT NULL,
    shop_name TEXT DEFAULT 'My Supermarket',
    owner_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    whatsapp_number TEXT,
    country TEXT DEFAULT 'India',
    currency TEXT DEFAULT 'INR',
    currency_symbol TEXT DEFAULT '₹',
    tax_system TEXT DEFAULT 'GST',
    gstin TEXT,
    cgst_rate DECIMAL(5,2) DEFAULT 9,
    sgst_rate DECIMAL(5,2) DEFAULT 9,
    igst_rate DECIMAL(5,2) DEFAULT 18,
    vat_rate DECIMAL(5,2) DEFAULT 5,
    trn_number TEXT,
    sales_tax_rate DECIMAL(5,2) DEFAULT 0,
    invoice_prefix TEXT DEFAULT 'INV',
    invoice_footer TEXT DEFAULT 'Thank you for shopping with us!',
    print_format TEXT DEFAULT 'thermal',
    logo TEXT,
    upi_id TEXT,
    upi_name TEXT,
    enable_upi_qr BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allow service role to bypass RLS (backend uses service key)
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Company users can only see their own settings
CREATE POLICY "Company isolated settings" ON public.company_settings FOR ALL
USING (company_id = (auth.jwt()->>'company_id')::uuid);
