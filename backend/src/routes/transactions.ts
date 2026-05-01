import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/api/transactions', async (request, reply) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, users(name), customers(name)')
      .eq('company_id', request.user.company_id)
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.post('/api/transactions', async (request, reply) => {
    const txn = request.body as any;
    txn.company_id = request.user.company_id;
    txn.cashier_id = request.user.id;

    // 1. Save Transaction
    const { data, error } = await supabase.from('transactions').insert(txn).select().single();
    if (error) return reply.status(500).send(error);

    // 2. Deduct Stock
    for (const item of txn.items) {
      const { data: p } = await supabase.from('products').select('stock').eq('id', item.id).single();
      if (p) {
        await supabase.from('products')
          .update({ stock: Math.max(0, p.stock - item.qty) })
          .eq('id', item.id);
      }
    }

    // 3. Update Customer Loyalty Points
    if (txn.customer_id) {
      const { data: c } = await supabase.from('customers').select('loyalty_points').eq('id', txn.customer_id).single();
      if (c) {
        const newBalance = c.loyalty_points - (txn.loyalty_redeemed || 0) + (txn.loyalty_earned || 0);
        await supabase.from('customers').update({ loyalty_points: newBalance }).eq('id', txn.customer_id);
      }
    }

    return data;
  });
}
