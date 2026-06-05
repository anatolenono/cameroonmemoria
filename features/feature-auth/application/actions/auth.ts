'use server';

import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { AuthResult } from '../../domain/types/auth';
import { prisma } from '@/lib/prisma';

function isEmail(value: string): boolean {
  return value.includes('@');
}

function phoneToPlaceholderEmail(phone: string): string {
  const sanitized = phone.replace(/[^0-9+]/g, '');
  return `phone_${sanitized}@phone.cameroonmemoria.local`;
}

/**
 * Inscription d'un utilisateur.
 * Accepte email OU phoneNumber (au moins un requis), plus password et name.
 */
export async function registerUser(
  password: string,
  name: string,
  email?: string,
  phoneNumber?: string
): Promise<AuthResult> {
  if (!email && !phoneNumber) {
    return { error: 'Email ou numéro de téléphone requis' };
  }
  if (!password) {
    return { error: 'Mot de passe requis' };
  }

  const effectiveEmail = email || phoneToPlaceholderEmail(phoneNumber!);

  try {
    const headersList = await headers();
    await auth.api.signUpEmail({
      body: { email: effectiveEmail, password, name },
      headers: headersList,
    });

    if (phoneNumber) {
      await prisma.user.update({
        where: { email: effectiveEmail },
        data: { phoneNumber },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription",
    };
  }
}

/**
 * Connexion d'un utilisateur par email ou numéro de téléphone + mot de passe.
 */
export async function loginUser(identifier: string, password: string): Promise<AuthResult> {
  if (!identifier || !password) {
    return { error: 'Identifiant et mot de passe requis' };
  }

  try {
    let email: string;

    if (isEmail(identifier)) {
      email = identifier;
    } else {
      // Lookup user by phone number to get their email
      const user = await prisma.user.findUnique({
        where: { phoneNumber: identifier },
        select: { email: true },
      });

      if (!user) {
        return { error: 'Numéro de téléphone ou mot de passe incorrect' };
      }

      email = user.email;
    }

    const headersList = await headers();
    await auth.api.signInEmail({
      body: { email, password },
      headers: headersList,
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return {
      error: error instanceof Error ? error.message : 'Identifiant ou mot de passe incorrect',
    };
  }
}

/**
 * Déconnexion d'un utilisateur.
 */
export async function logoutUser(): Promise<AuthResult> {
  try {
    const headersList = await headers();
    await auth.api.signOut({ headers: headersList });
    return { success: true };
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    return {
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la déconnexion',
    };
  }
}
