import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
  async updatePhoneNumber(userId: string, phoneNumber: string): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { phoneNumber } });
  }
}

export const userRepository = new UserRepository(); 