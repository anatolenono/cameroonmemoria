/**
 * Email Service for sending emails
 * Supports console logging (development) and SMTP (production)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private provider: string;

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'console';
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<void> {
    if (this.provider === 'console') {
      // Development: Log to console
      console.log('\n========== EMAIL (DEVELOPMENT) ==========');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('---');
      console.log(options.text || 'No text version provided');
      console.log('=========================================\n');
      return;
    }

    // TODO: Implement SMTP or other email providers
    // For now, fallback to console logging with a warning
    console.warn('Email provider not configured. Logging email to console:');
    console.log('\n========== EMAIL ==========');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text);
    console.log('===========================\n');
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe sur Cameroon Memoria.</p>
              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <center>
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </center>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
              <p><strong>Ce lien expirera dans 1 heure.</strong></p>
              <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
              <p>Cordialement,<br>L'équipe Cameroon Memoria</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Cameroon Memoria. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Réinitialisation de mot de passe

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe sur Cameroon Memoria.

Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
${resetUrl}

Ce lien expirera dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.

Cordialement,
L'équipe Cameroon Memoria
    `.trim();

    await this.send({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Cameroon Memoria',
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
