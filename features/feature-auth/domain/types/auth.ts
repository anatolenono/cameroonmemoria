/**
 * Types pour l'authentification
 */

export interface AuthError {
  error: string;
}

export interface AuthSuccess {
  success: boolean;
}

export type AuthResult = AuthError | AuthSuccess;

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Session {
  user: User;
}
