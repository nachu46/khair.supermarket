import { FastifyRequest } from 'fastify';

export interface UserPayload {
  id: string;
  role: 'superadmin' | 'admin' | 'cashier';
  company_id: string | null;
  username: string;
  name: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: UserPayload;
  }
}
