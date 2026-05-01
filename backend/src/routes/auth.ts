import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase';
import bcrypt from 'bcrypt';

export default async function (fastify: FastifyInstance) {
  fastify.post('/api/auth/login', async (request, reply) => {
    const { username, password } = request.body as any;

    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, role, company_id, name, is_active')
      .eq('username', username)
      .single();

    if (error || !user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return reply.status(403).send({ error: 'Account is deactivated' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      company_id: user.company_id,
      name: user.name
    };

    const token = fastify.jwt.sign(payload, { expiresIn: '8h' });

    return reply.send({ token, user: payload });
  });
}
