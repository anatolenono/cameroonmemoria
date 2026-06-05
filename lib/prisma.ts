import { PrismaClient } from '@prisma/client';

// Déclaration pour éviter de multiples instances en développement
declare global {
  var prisma: PrismaClient | undefined;
}

// Création d'une instance unique de PrismaClient
export const prisma = global.prisma || new PrismaClient();

// En développement, on assigne l'instance au global pour éviter les multiples instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
