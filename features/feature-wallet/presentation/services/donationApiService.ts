import { DonationFormData } from '../schemas/donationSchema';
import { DonationResponse, DonationRequest } from '../../domain/types';

class DonationApiService {
  private baseUrl = '/api/donations';

  /**
   * Créer une nouvelle donation
   */
  async createDonation(announcementId: string, data: DonationFormData): Promise<DonationResponse> {
    try {
      const donationRequest: DonationRequest = {
        announcementId,
        amount: data.amount,
        isAnonymous: data.isAnonymous,
        paymentMethod: {
          id: data.paymentMethod,
          name: '', // Sera rempli côté serveur
          type: data.paymentMethod as 'mobile_money' | 'stripe' | 'paypal',
          icon: '',
          description: '',
          isAvailable: true
        },
        paymentDetails: {
          phoneNumber: data.phoneNumber,
          mobileProvider: data.mobileProvider,
          email: data.email
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationRequest),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la donation:', error);
      throw error;
    }
  }

  /**
   * Récupérer les donations d'une annonce
   */
  async getDonationsByAnnouncement(announcementId: string): Promise<DonationResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/announcement/${announcementId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des donations:', error);
      throw error;
    }
  }

  /**
   * Récupérer le statut d'une donation
   */
  async getDonationStatus(donationId: string): Promise<DonationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${donationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de la donation:', error);
      throw error;
    }
  }
}

export const donationApiService = new DonationApiService(); 