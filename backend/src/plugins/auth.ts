import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { UserPayload } from '../types';

const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super_secret_dev_key_change_me_in_prod'
  });

  fastify.decorate('authenticate', async (request: any, reply: any) => {
    if (request.method === 'OPTIONS') return;
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
    }
  });
};

export default fp(authPlugin);
