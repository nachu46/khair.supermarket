const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Subscription Plans
  const { error: planError } = await supabase.from('subscription_plans').upsert([
    { name: 'Basic', price_monthly: 999.00, max_users: 3, max_products: 100, features: { pos: true, inventory: true, gst_invoice: false } },
    { name: 'Standard', price_monthly: 1999.00, max_users: 10, max_products: 500, features: { pos: true, inventory: true, gst_invoice: true, reports: true } },
    { name: 'Pro', price_monthly: 3999.00, max_users: 9999, max_products: 999999, features: { pos: true, inventory: true, gst_invoice: true, reports: true, priority_support: true } }
  ]);

  if (planError) {
    console.error('❌ Error seeding plans:', planError.message);
  } else {
    console.log('✅ Subscription plans seeded.');
  }

  // 2. Seed Superadmin
  // Note: Password is 'super123'
  const { error: userError } = await supabase.from('users').upsert([
    { 
      username: 'superadmin', 
      name: 'System Admin', 
      password_hash: '$2b$10$m27KqE6MIDcaYlYOkdflLei13PHVGzBbjgp/6heAvYeTDkYzYPOum', // super123
      role: 'superadmin', 
      is_active: true 
    },
    { 
      username: 'admin', 
      name: 'Admin User', 
      password_hash: '$2b$10$uLRFIcPkp3tLoB9uRXtVqeX1Ww9JGgHwH4HOkegJACBfZE/FXV3j6', // admin123
      role: 'superadmin', 
      is_active: true 
    }
  ], { onConflict: 'username' });

  if (userError) {
    console.error('❌ Error seeding superadmin:', userError.message);
  } else {
    console.log('✅ Superadmin account seeded (Username: superadmin, Password: super123).');
  }

  console.log('🚀 Seeding complete! You can now log in.');
}

seed();
