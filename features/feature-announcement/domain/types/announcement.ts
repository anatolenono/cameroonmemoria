import { Media } from "./media";

export enum AnnouncementType {
  DEATH_NOTICE = "DEATH_NOTICE",
  FUNERAL = "FUNERAL",
  ANNIVERSARY = "ANNIVERSARY",
  THANKS = "THANKS",
  OTHER = "OTHER"
}

export enum AnnouncementStatus {
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED"
}

export enum AnnouncementPlan {
  FREE = "FREE",
  ESSENTIAL = "ESSENTIAL",
  COMPLETE = "COMPLETE",
  PREMIUM = "PREMIUM"
}

export interface EventItem {
  date: { from: string; to?: string };
  name: string;
  location: string;
}

export interface Announcement {
  id: string;
  title: string;
  description?: string | null;
  type: AnnouncementType;
  status: AnnouncementStatus;
  isAnonymous: boolean;
  deceasedName: string;
  deceasedPronoun?: string | null;
  deceasedBirthDate?: Date | null;
  deceasedBirthPlace?: string | null;
  deceasedDeathDate: Date;
  deceasedPhotoUrl?: string | null;
  ceremonyDate?: Date | null;
  ceremonyLocation?: string | null;
  /** List of events (array of objects with date, name, location) */
  events?: EventItem[];
  relationship?: string;
  bannerPresetId?: string | null;
  bannerPreset?: { id: string; name: string; imageUrl: string } | null;
  bannerCustomUrl?: string | null;
  plan: AnnouncementPlan;
  planPaidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
  media?: Media[];
  condolenceCount?: number;
  flowerCount?: number;
  candleCount?: number;
}

export interface CreateAnnouncementDto {
  title: string;
  description?: string;
  type: AnnouncementType;
  deceasedName: string;
  deceasedPronoun?: string;
  deceasedBirthDate?: Date | string;
  deceasedBirthPlace?: string;
  deceasedDeathDate: Date | string;
  deceasedPhotoUrl?: string;
  ceremonyDate?: Date | string;
  ceremonyLocation?: string;
  /** List of events (array of objects with date, name, location) */
  events?: EventItem[];
  relationship?: string;
  bannerPresetId?: string;
  bannerCustomUrl?: string;
  mediaIds?: string[];
  registerName?: string;
  registerEmail?: string;
  registerPassword?: string;
  registerConfirmPassword?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  description?: string;
  type?: AnnouncementType;
  status?: AnnouncementStatus;
  isAnonymous?: boolean;
  deceasedName?: string;
  deceasedPronoun?: string;
  deceasedBirthDate?: Date | string;
  deceasedBirthPlace?: string;
  deceasedDeathDate?: Date | string;
  deceasedPhotoUrl?: string;
  ceremonyDate?: Date | string;
  ceremonyLocation?: string;
  /** List of events (array of objects with date, name, location) */
  events?: EventItem[];
  relationship?: string;
  mediaIds?: string[];
  bannerPresetId?: string;
  bannerCustomUrl?: string;
}

export interface AnnouncementQuery {
  type?: AnnouncementType | AnnouncementType[];
  status?: AnnouncementStatus;
  limit?: number;
  offset?: number;
  userId?: string;
  q?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  withDonations?: boolean;
  recentOnly?: boolean;
} 