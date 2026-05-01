import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/api/products', async (request, reply) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, suppliers(name)')
      .eq('company_id', request.user.company_id)
      .order('name');
      
    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.get('/api/products/alerts', async (request, reply) => {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    const { data: lowStock } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('company_id', request.user.company_id)
      .lt('stock', 10);

    const { data: expiring } = await supabase
      .from('products')
      .select('id, name, expiry_date')
      .eq('company_id', request.user.company_id)
      .not('expiry_date', 'is', null)
      .lt('expiry_date', nextMonthStr);

    return { 
      lowStock: lowStock || [], 
      expiring: expiring || [] 
    };
  });

  fastify.post('/api/products', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });
    
    const product = request.body as any;
    product.company_id = request.user.company_id;
    // Sanitize UUID fields: empty string → null
    if (!product.supplier_id) product.supplier_id = null;
    if (!product.expiry_date) product.expiry_date = null;
    if (!product.barcode) product.barcode = null;

    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) return reply.status(500).send(error);

    await supabase.from('audit_logs').insert({
      company_id: request.user.company_id,
      user_id: request.user.id,
      action: 'CREATED_PRODUCT',
      details: `Added product: ${product.name}`
    });

    return data;
  });

  fastify.put('/api/products/:id', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });

    const { id } = request.params as any;
    const updates = request.body as any;
    // Sanitize UUID fields: empty string → null
    if (!updates.supplier_id) updates.supplier_id = null;
    if (!updates.expiry_date) updates.expiry_date = null;
    if (!updates.barcode) updates.barcode = null;
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('company_id', request.user.company_id)
      .select()
      .single();

    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.delete('/api/products/:id', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });

    const { id } = request.params as any;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('company_id', request.user.company_id);

    if (error) return reply.status(500).send(error);
    return { success: true };
  });
}
