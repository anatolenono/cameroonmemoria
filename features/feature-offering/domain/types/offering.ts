export interface Offering {
  id: string;
  type: 'FLOWER' | 'CANDLE';
  createdAt: Date;
  userId: string;
  announcementId: string;
  user?: {
    id: string;
    name?: string;
  };
}

export interface CreateOfferingDto {
  type: 'FLOWER' | 'CANDLE';
  announcementId: string;
}

export interface OfferingCounts {
  flowers: number;
  candles: number;
}
