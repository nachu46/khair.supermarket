import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/api/reports', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });

    const { from, to } = request.query as any;
    
    let query = supabase
      .from('transactions')
      .select('*, items')
      .eq('company_id', request.user.company_id);
      
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data: transactions, error } = await query;
    if (error) return reply.status(500).send(error);

    // Aggregate stats
    const stats = {
      revenue: 0,
      bills: transactions?.length || 0,
      itemsSold: 0,
      profit: 0, // Requires cost tracking, simplified for now
      avgBill: 0,
      topProducts: {} as any
    };

    transactions?.forEach(txn => {
      stats.revenue += Number(txn.total);
      
      const items = typeof txn.items === 'string' ? JSON.parse(txn.items) : txn.items;
      items.forEach((item: any) => {
        stats.itemsSold += item.qty;
        
        if (!stats.topProducts[item.id]) {
          stats.topProducts[item.id] = { name: item.name, qty: 0, revenue: 0 };
        }
        stats.topProducts[item.id].qty += item.qty;
        stats.topProducts[item.id].revenue += (item.price * item.qty);
      });
    });

    if (stats.bills > 0) {
      stats.avgBill = stats.revenue / stats.bills;
    }

    // Convert topProducts object to sorted array
    stats.topProducts = Object.values(stats.topProducts).sort((a: any, b: any) => b.qty - a.qty).slice(0, 10);

    return stats;
  });
}
