import { auth } from '@/core/infrastructure/auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';

/**
 * Handler API pour les requêtes d'authentification
 * Cette route gère toutes les requêtes d'authentification de betterAuth
 */
export const { GET, POST } = toNextJsHandler(auth.handler);
