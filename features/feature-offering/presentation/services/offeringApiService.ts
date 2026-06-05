import { OfferingCounts } from '../../domain/types/offering';

class OfferingApiService {
  private baseUrl = '/api/offerings';

  async getCountsByAnnouncementId(announcementId: string): Promise<OfferingCounts> {
    const response = await fetch(`${this.baseUrl}?announcementId=${announcementId}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
  }

  async createOffering(type: 'FLOWER' | 'CANDLE', announcementId: string): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, announcementId }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Erreur HTTP: ${response.status}`);
    }
  }
}

export const offeringApiService = new OfferingApiService();
