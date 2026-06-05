import { createAuthClient } from 'better-auth/react';

/**
 * Client d'authentification pour betterAuth
 * Fournit des hooks et des méthodes pour interagir avec les fonctionnalités d'authentification
 */
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});

// Exporter les hooks d'authentification
export const { signIn, signUp, signOut, useSession } = authClient;
