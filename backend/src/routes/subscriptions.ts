import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // Super Admin Only middleware
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.user.role !== 'superadmin') {
      return reply.status(403).send({ error: 'Super Admin access required' });
    }
  });

  fastify.post('/api/subscriptions/update', async (request, reply) => {
    const { company_id, plan_id, status, expiry_date } = request.body as any;

    const { data, error } = await supabase
      .from('companies')
      .update({
        subscription_plan: plan_id,
        subscription_status: status,
        subscription_expiry: expiry_date
      })
      .eq('id', company_id)
      .select()
      .single();

    if (error) return reply.status(500).send(error);

    await supabase.from('audit_logs').insert({
      user_id: request.user.id,
      company_id,
      action: 'UPDATED_SUBSCRIPTION',
      details: `Updated plan to ${plan_id}, status to ${status}, expiry to ${expiry_date}`
    });

    return data;
  });

  fastify.get('/api/subscriptions/plans', async (request, reply) => {
    const { data, error } = await supabase.from('subscription_plans').select('*').order('price_monthly');
    if (error) return reply.status(500).send(error);
    return data;
  });
}
