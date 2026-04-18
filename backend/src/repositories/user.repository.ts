import { Role } from '@prisma/client';
import prisma from '../utils/prisma';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async create(data: { email: string; password: string; name: string; role: Role }) {
    return prisma.user.create({ data });
  }

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { fields: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const userRepository = new UserRepository();
