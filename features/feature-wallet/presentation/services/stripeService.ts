interface CreateCheckoutSessionData {
  amount: number;
  announcementId: string;
  deceasedName: string;
  isAnonymous: boolean;
}

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface StripeErrorResponse {
  error: string;
}

export class StripeService {
  /**
   * Créer une session de checkout Stripe
   */
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<CreateCheckoutSessionResponse> {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount, // XAF is a zero-decimal currency, no conversion needed
          announcementId: data.announcementId,
          deceasedName: data.deceasedName,
          isAnonymous: data.isAnonymous,
        }),
      });

      if (!response.ok) {
        const errorData: StripeErrorResponse = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
      }

      const result: CreateCheckoutSessionResponse = await response.json();
      
      if (!result.url) {
        throw new Error('URL de redirection manquante');
      }

      return result;
    } catch (error) {
      console.error('Erreur StripeService.createCheckoutSession:', error);
      throw error instanceof Error ? error : new Error('Erreur inconnue lors de la création de la session Stripe');
    }
  }

  /**
   * Rediriger vers Stripe Checkout
   */
  redirectToCheckout(url: string): void {
    window.location.href = url;
  }

  /**
   * Vérifier si l'environnement Stripe est configuré
   */
  isConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      typeof window !== 'undefined'
    );
  }

  /**
   * Obtenir la clé publique Stripe
   */
  getPublishableKey(): string | undefined {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  }

  /**
   * Formater un montant en FCFA pour l'affichage
   */
  formatAmount(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }

  /**
   * Valider les données de session de checkout
   */
  private validateCheckoutData(data: CreateCheckoutSessionData): void {
    if (!data.amount || data.amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0');
    }

    if (!data.announcementId) {
      throw new Error('ID de l\'annonce requis');
    }

    if (!data.deceasedName) {
      throw new Error('Nom du défunt requis');
    }

    if (typeof data.isAnonymous !== 'boolean') {
      throw new Error('Le type de donation (anonyme/public) doit être spécifié');
    }

    // Vérifier les limites de montant (500 FCFA min, 1,000,000 FCFA max)
    if (data.amount < 500) {
      throw new Error('Le montant minimum est de 500 FCFA');
    }

    if (data.amount > 1000000) {
      throw new Error('Le montant maximum est de 1,000,000 FCFA');
    }
  }

  /**
   * Créer une session de checkout avec validation
   */
  async createValidatedCheckoutSession(data: CreateCheckoutSessionData): Promise<CreateCheckoutSessionResponse> {
    // Valider les données avant de créer la session
    this.validateCheckoutData(data);
    
    // Créer la session
    return this.createCheckoutSession(data);
  }
}

// Créer et exporter une instance du service
export const stripeService = new StripeService();

// Exporter aussi le type pour les tests et l'injection de dépendance
export type { CreateCheckoutSessionData, CreateCheckoutSessionResponse };

export default stripeService; 