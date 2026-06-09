import type { Request, Response } from 'express';
import prisma from '../repositories/db.js';

export function getUsers(request: Request, response: Response) {
  const users = prisma.user.findMany();

  response.send(users);
}

export function getUserById(request: Request, response: Response) {
  response.send([]);
}

export function createUser(request: Request, response: Response) {
  console.log(request.body);

  response.send([]);
}
