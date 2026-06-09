import { betterAuth } from 'better-auth';
import { prisma } from '@/lib/prisma';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { emailService } from '@/lib/services/emailService';

/**
 * Initialisation de betterAuth avec notre adaptateur Prisma
 * Cette instance sera utilisée côté serveur
 */
export const auth = betterAuth({
  // Configuration de la base de données avec l'adaptateur Prisma
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // Type de base de données utilisé
  }),

  // Configuration des cookies et de la session
  secret: process.env.AUTH_SECRET || 'votre-clé-secrète-temporaire-de-développement',
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Expose custom user fields in session
  user: {
    additionalFields: {
      role: {
        type: 'string',
      },
    },
  },

  // Configuration des stratégies d'authentification
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    // Configuration for password reset
    sendResetPassword: async ({ user, url, token }) => {
      // Send password reset email using our email service
      // Note: We use void to prevent timing attacks as recommended by better-auth
      void emailService.sendPasswordResetEmail(user.email, token);
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour in seconds
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been successfully reset.`);
    },
  },

  // Ajout du plugin nextCookies pour les actions serveur
  plugins: [nextCookies()],
});
