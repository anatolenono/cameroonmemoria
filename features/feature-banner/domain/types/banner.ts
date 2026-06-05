export enum BannerType {
  COLOR = 'COLOR',
  GRADIENT = 'GRADIENT',
  PHOTO = 'PHOTO',
}

export interface BannerPreset {
  id: string;
  name: string;
  type: BannerType;
  imageUrl: string;
  thumbnailUrl: string | null;
  category: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBannerPresetDto {
  name: string;
  type: BannerType;
  imageUrl: string;
  thumbnailUrl?: string;
  category?: string;
  displayOrder?: number;
}

export interface UpdateBannerPresetDto {
  name?: string;
  type?: BannerType;
  imageUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface BannerSelection {
  presetId?: string;
  customUrl?: string;
}
