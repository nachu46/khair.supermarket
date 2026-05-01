import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const server = fastify({ logger: true });

// Setup Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// CORS
await server.register(cors, {
  origin: true
});

// --- AUTH ROUTES ---
server.post('/api/auth/login', async (request, reply) => {
  const { username, password } = request.body as any;

  const { data: user, error } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !user) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  return user;
});

// --- COMPANY MANAGEMENT (Super Admin Only) ---
server.get('/api/companies', async (request, reply) => {
  const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
  if (error) return reply.status(500).send(error);
  return data;
});

server.post('/api/companies', async (request, reply) => {
  const company = request.body as any;
  const { data, error } = await supabase.from('companies').insert(company).select().single();
  if (error) return reply.status(500).send(error);
  return data;
});

// --- USER MANAGEMENT ---
server.get('/api/users', async (request, reply) => {
  const { company_id } = request.query as any;
  let query = supabase.from('users').select('*');
  if (company_id) query = query.eq('company_id', company_id);

  const { data, error } = await query;
  if (error) return reply.status(500).send(error);
  return data;
});

server.post('/api/users', async (request, reply) => {
  const newUser = request.body as any;
  const { data, error } = await supabase.from('users').insert(newUser).select().single();
  if (error) return reply.status(500).send(error);
  return data;
});

// --- PRODUCTS ---
server.get('/api/products', async (request, reply) => {
  const { company_id } = request.query as any;
  const { data, error } = await supabase.from('products').select('*').eq('company_id', company_id).order('name');
  if (error) return reply.status(500).send(error);
  return data;
});

// --- TRANSACTIONS ---
server.post('/api/transactions', async (request, reply) => {
  const txn = request.body as any;
  const { data, error } = await supabase.from('transactions').insert(txn).select().single();
  if (error) return reply.status(500).send(error);

  // Stock update
  for (const item of txn.items) {
    const { data: p } = await supabase.from('products').select('stock').eq('id', item.id).single();
    if (p) {
      await supabase.from('products').update({ stock: p.stock - item.qty }).eq('id', item.id);
    }
  }
  return data;
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
