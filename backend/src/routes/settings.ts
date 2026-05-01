import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';

// Default settings shape
const DEFAULT_SETTINGS = {
  shop_name: 'My Supermarket',
  owner_name: '',
  phone: '',
  email: '',
  address: '',
  whatsapp_number: '',
  country: 'India',
  currency: 'INR',
  currency_symbol: '₹',
  tax_system: 'GST',
  gstin: '',
  cgst_rate: 9,
  sgst_rate: 9,
  igst_rate: 18,
  vat_rate: 5,
  trn_number: '',
  sales_tax_rate: 0,
  invoice_prefix: 'INV',
  invoice_footer: 'Thank you for shopping with us!',
  print_format: 'thermal',
  logo: null,
  upi_id: '',
  upi_name: '',
  enable_upi_qr: false,
};

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /api/settings - Fetch or create default settings for this company
  fastify.get('/api/settings', async (request, reply) => {
    const cid = request.user.company_id;
    if (!cid) return reply.status(403).send({ error: 'No company associated' });

    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('company_id', cid)
      .single();

    if (error && error.code === 'PGRST116') {
      // No row found – create defaults
      const { data: created, error: createError } = await supabase
        .from('company_settings')
        .insert({ company_id: cid, ...DEFAULT_SETTINGS })
        .select()
        .single();
      if (createError) return reply.status(500).send(createError);
      return created;
    }

    if (error) return reply.status(500).send(error);
    return data;
  });

  // PUT /api/settings - Save settings for this company
  fastify.put('/api/settings', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });

    const cid = request.user.company_id;
    const updates = request.body as any;
    delete updates.company_id; // prevent overriding

    const { data, error } = await supabase
      .from('company_settings')
      .upsert({ company_id: cid, ...updates }, { onConflict: 'company_id' })
      .select()
      .single();

    if (error) return reply.status(500).send(error);

    await supabase.from('audit_logs').insert({
      company_id: cid,
      user_id: request.user.id,
      action: 'UPDATED_SETTINGS',
      details: 'Shop settings were updated',
    });

    return data;
  });
}
