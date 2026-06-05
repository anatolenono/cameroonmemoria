export enum MediaType {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER"
}

export interface Media {
  id: string;
  url: string;
  type: MediaType;
  createdAt: Date;
  announcementId: string;
}

export interface CreateMediaDto {
  url: string;
  type: MediaType;
  announcementId?: string;
} 