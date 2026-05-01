import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';
import bcrypt from 'bcrypt';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // Super Admin Only middleware
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.user.role !== 'superadmin') {
      return reply.status(403).send({ error: 'Super Admin access required' });
    }
  });

  fastify.get('/api/companies', async (request, reply) => {
    const { data, error } = await supabase.from('companies').select('*, subscription_plans(name, features)').order('created_at', { ascending: false });
    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.post('/api/companies', async (request, reply) => {
    const { name, address, phone, gst_number, subscription_plan, admin_username, admin_password } = request.body as any;
    
    // 1. Create Company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({ name, address, phone, gst_number, subscription_plan, subscription_status: 'trial' })
      .select()
      .single();

    if (companyError) return reply.status(500).send(companyError);

    // 2. Setup Admin user (Manual or Auto-generated)
    const username = admin_username || `admin_${company.id.substring(0,6)}`;
    const plainPassword = admin_password || Math.random().toString(36).slice(-8);
    const password_hash = await bcrypt.hash(plainPassword, 10);

    const { error: userError } = await supabase
      .from('users')
      .insert({
        company_id: company.id,
        name: 'Shop Admin',
        username,
        password_hash,
        role: 'admin'
      });

    if (userError) return reply.status(500).send(userError);

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: request.user.id,
      action: 'CREATED_COMPANY',
      details: `Created company ${name} and admin user ${username}`
    });

    return { company, admin_credentials: { username, password: plainPassword } };
  });

  fastify.put('/api/companies/:id', async (request, reply) => {
    const { id } = request.params as any;
    const updates = request.body as any;
    
    const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select().single();
    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.delete('/api/companies/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) return reply.status(500).send(error);
    return { success: true };
  });
}
