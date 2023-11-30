// import { Request } from 'express';
import { User } from '../../user/entities/user.entity';
import { FastifyRequest } from 'fastify';

export interface AuthRequest extends FastifyRequest {
  user: User;
}
