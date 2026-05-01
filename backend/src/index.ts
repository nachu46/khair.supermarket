import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import authPlugin from './plugins/auth';

import authRoutes from './routes/auth';
import companiesRoutes from './routes/companies';
import productsRoutes from './routes/products';
import transactionsRoutes from './routes/transactions';
import customersRoutes from './routes/customers';
import suppliersRoutes from './routes/suppliers';
import usersRoutes from './routes/users';
import reportsRoutes from './routes/reports';
import auditRoutes from './routes/audit';
import subscriptionsRoutes from './routes/subscriptions';
import settingsRoutes from './routes/settings';

dotenv.config();

const server = fastify({ logger: true });

async function build() {
  await server.register(cors, { 
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
  await server.register(authPlugin);

  // Health check
  server.get('/api/health', async () => ({ status: 'ok' }));

  // Register Routes
  await server.register(authRoutes);
  await server.register(companiesRoutes);
  await server.register(productsRoutes);
  await server.register(transactionsRoutes);
  await server.register(customersRoutes);
  await server.register(suppliersRoutes);
  await server.register(usersRoutes);
  await server.register(reportsRoutes);
  await server.register(auditRoutes);
  await server.register(subscriptionsRoutes);
  await server.register(settingsRoutes);

  return server;
}

const start = async () => {
  try {
    const app = await build();
    const port = parseInt(process.env.PORT || '4001');
    await app.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
