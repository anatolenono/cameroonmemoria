import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';

/**
 * Password reset request endpoint using better-auth
 * This endpoint triggers the sendResetPassword callback configured in auth.ts
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email est requis' },
        { status: 400 }
      );
    }

    // Use better-auth's built-in password reset functionality
    // This will generate a token, store it in verification table, and trigger sendResetPassword callback
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
      },
    });

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);

    // Don't reveal if email exists or not for security
    return NextResponse.json(
      {
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
      },
      { status: 200 }
    );
  }
}
