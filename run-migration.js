const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rscgmitogypqtjxoscsz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY2dtaXRvZ3lwcXRqeG9zY3N6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYwMjAwMywiZXhwIjoyMDkzMTc4MDAzfQ.FsRluryu9pJeWKaR4Lx-KxPsSoBfEf7N9yZaHDdZr5Y',
  { auth: { persistSession: false } }
);

// The Supabase service key can execute raw SQL via the /pg REST endpoint
async function runSQL(sql) {
  const res = await fetch(
    'https://rscgmitogypqtjxoscsz.supabase.co/rest/v1/rpc/exec_sql',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY2dtaXRvZ3lwcXRqeG9zY3N6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYwMjAwMywiZXhwIjoyMDkzMTc4MDAzfQ.FsRluryu9pJeWKaR4Lx-KxPsSoBfEf7N9yZaHDdZr5Y',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY2dtaXRvZ3lwcXRqeG9zY3N6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYwMjAwMywiZXhwIjoyMDkzMTc4MDAzfQ.FsRluryu9pJeWKaR4Lx-KxPsSoBfEf7N9yZaHDdZr5Y',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql })
    }
  );
  return { ok: res.ok, status: res.status, body: await res.text() };
}

const CREATE_SQL = `
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
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
`;

async function run() {
  console.log('Attempting migration via exec_sql RPC...');
  const result = await runSQL(CREATE_SQL);
  
  if (result.ok) {
    console.log('✅ Migration complete! Table created.');
    return;
  }

  console.log(`RPC failed (${result.status}): ${result.body}`);

  // Final fallback: try using the pg endpoint
  console.log('\nTrying pg endpoint...');
  const pgRes = await fetch(
    'https://rscgmitogypqtjxoscsz.supabase.co/pg',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY2dtaXRvZ3lwcXRqeG9zY3N6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYwMjAwMywiZXhwIjoyMDkzMTc4MDAzfQ.FsRluryu9pJeWKaR4Lx-KxPsSoBfEf7N9yZaHDdZr5Y',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY2dtaXRvZ3lwcXRqeG9zY3N6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYwMjAwMywiZXhwIjoyMDkzMTc4MDAzfQ.FsRluryu9pJeWKaR4Lx-KxPsSoBfEf7N9yZaHDdZr5Y',
      },
      body: JSON.stringify({ query: CREATE_SQL })
    }
  );
  
  const pgText = await pgRes.text();
  if (pgRes.ok) {
    console.log('✅ Migration complete via pg endpoint!');
  } else {
    console.log(`pg endpoint failed (${pgRes.status}): ${pgText}`);
    console.log('\n⚠️  MANUAL ACTION NEEDED:');
    console.log('1. Go to: https://supabase.com/dashboard/project/rscgmitogypqtjxoscsz/sql/new');
    console.log('2. Paste the SQL from: add_settings_table.sql');
    console.log('3. Click Run');
  }
}

run().catch(console.error);
