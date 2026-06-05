import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { auth } from '@/core/infrastructure/auth/auth';
import { prisma } from '@/lib/prisma';

const scrypt = promisify(_scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return salt + ':' + derivedKey.toString('hex');
}

export async function createAccountCredentials({ email, password, name }: { email: string, password: string, name?: string }) {
  // Create headers for better-auth API context
  const mockHeaders = new Headers({
    'content-type': 'application/json',
  });

  try {
    // Use better-auth's signUpEmail which properly hashes passwords
    await auth.api.signUpEmail({
      body: { email, password, name: name || '' },
      headers: mockHeaders,
    });

    // Set emailVerified to true for test accounts
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      });
    }
  } catch (error) {
    console.error(`Error creating account for ${email}:`, error);
    throw error;
  }
} 
