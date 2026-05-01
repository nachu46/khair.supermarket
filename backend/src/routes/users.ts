import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';
import bcrypt from 'bcrypt';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/api/users', async (request, reply) => {
    let query = supabase.from('users').select('id, name, username, role, is_active, company_id, created_at');
    
    if (request.user.role !== 'superadmin') {
      query = query.eq('company_id', request.user.company_id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.post('/api/users', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });

    const newUser = request.body as any;
    
    // Admins can only create users for their own company
    if (request.user.role === 'admin') {
      newUser.company_id = request.user.company_id;
      if (newUser.role === 'superadmin') {
        return reply.status(403).send({ error: 'Cannot create superadmin' });
      }
    }

    if (newUser.password) {
      newUser.password_hash = await bcrypt.hash(newUser.password, 10);
      delete newUser.password;
    }

    const { data, error } = await supabase.from('users').insert(newUser).select('id, name, username, role, is_active').single();
    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.put('/api/users/:id', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });

    const { id } = request.params as any;
    const updates = request.body as any;
    
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    let query = supabase.from('users').update(updates).eq('id', id);
    
    // Admins can only update users in their own company
    if (request.user.role === 'admin') {
      query = query.eq('company_id', request.user.company_id);
    }

    const { data, error } = await query.select('id, name, username, role, is_active').single();
    if (error) return reply.status(500).send(error);
    return data;
  });

  fastify.delete('/api/users/:id', async (request, reply) => {
    if (request.user.role === 'cashier') return reply.status(403).send({ error: 'Unauthorized' });

    const { id } = request.params as any;
    
    let query = supabase.from('users').delete().eq('id', id);
    if (request.user.role === 'admin') {
      query = query.eq('company_id', request.user.company_id);
    }

    const { error } = await query;
    if (error) return reply.status(500).send(error);
    return { success: true };
  });
}
