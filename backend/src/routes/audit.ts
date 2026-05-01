import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/api/audit-logs', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });

    let query = supabase
      .from('audit_logs')
      .select('*, users(name, username), companies(name)')
      .order('created_at', { ascending: false })
      .limit(200);

    // Admins only see their own company logs
    if (request.user.role !== 'superadmin') {
      query = query.eq('company_id', request.user.company_id);
    }

    const { data, error } = await query;
    if (error) return reply.status(500).send(error);
    return data;
  });
}
