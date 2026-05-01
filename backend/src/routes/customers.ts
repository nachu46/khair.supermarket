import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/api/customers', async (request, reply) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', request.user.company_id)
      .order('name');
      
    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.post('/api/customers', async (request, reply) => {
    const customer = request.body as any;
    customer.company_id = request.user.company_id;

    const { data, error } = await supabase.from('customers').insert(customer).select().single();
    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.put('/api/customers/:id', async (request, reply) => {
    const { id } = request.params as any;
    const updates = request.body as any;
    
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .eq('company_id', request.user.company_id)
      .select()
      .single();

    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.delete('/api/customers/:id', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });

    const { id } = request.params as any;
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('company_id', request.user.company_id);

    if (error) return reply.status(500).send(error);
    return { success: true };
  });
}
