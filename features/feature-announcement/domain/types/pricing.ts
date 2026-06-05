import { AnnouncementPlan } from "./announcement";

export interface AnnouncementPlanDetails {
  id: AnnouncementPlan;
  name: string;
  price: number; // F CFA
  currency: string;
  description: string;
  features: {
    photoCount: number; // 1 for FREE (immutable), unlimited for PREMIUM
    photoModifiable: boolean;
    gallery: boolean;
    videos: boolean;
    biography: boolean;
    testimonies: boolean;
    detailedCeremonySchedule: boolean;
    virtualOfferings: boolean;
    literaryAlbum: boolean; // Livre d'or
    fundraiser: boolean; // Cagnotte
    livestream: boolean;
  };
}

export const ANNOUNCEMENT_PLANS: Record<AnnouncementPlan, AnnouncementPlanDetails> = {
  [AnnouncementPlan.FREE]: {
    id: AnnouncementPlan.FREE,
    name: "Gratuit",
    price: 0,
    currency: "F CFA",
    description: "Annonce de base avec une photo",
    features: {
      photoCount: 1,
      photoModifiable: false,
      gallery: false,
      videos: false,
      biography: false,
      testimonies: false,
      detailedCeremonySchedule: false,
      virtualOfferings: true,
      literaryAlbum: false,
      fundraiser: false,
      livestream: false,
    },
  },
  [AnnouncementPlan.ESSENTIAL]: {
    id: AnnouncementPlan.ESSENTIAL,
    name: "Essentiel",
    price: 5000,
    currency: "F CFA",
    description: "Photo modifiable et déroulé détaillé des obsèques",
    features: {
      photoCount: 1,
      photoModifiable: true,
      gallery: false,
      videos: false,
      biography: false,
      testimonies: false,
      detailedCeremonySchedule: true,
      virtualOfferings: true,
      literaryAlbum: false,
      fundraiser: false,
      livestream: false,
    },
  },
  [AnnouncementPlan.COMPLETE]: {
    id: AnnouncementPlan.COMPLETE,
    name: "Complet",
    price: 10000,
    currency: "F CFA",
    description: "Galerie, vidéos, biographie et témoignages",
    features: {
      photoCount: 10,
      photoModifiable: true,
      gallery: true,
      videos: true,
      biography: true,
      testimonies: true,
      detailedCeremonySchedule: true,
      virtualOfferings: true,
      literaryAlbum: true,
      fundraiser: false,
      livestream: false,
    },
  },
  [AnnouncementPlan.PREMIUM]: {
    id: AnnouncementPlan.PREMIUM,
    name: "Premium",
    price: 15000,
    currency: "F CFA",
    description: "Galerie illimitée, cagnotte et livestream",
    features: {
      photoCount: Infinity,
      photoModifiable: true,
      gallery: true,
      videos: true,
      biography: true,
      testimonies: true,
      detailedCeremonySchedule: true,
      virtualOfferings: true,
      literaryAlbum: true,
      fundraiser: true,
      livestream: true,
    },
  },
};

export function getPlanDetails(plan: AnnouncementPlan): AnnouncementPlanDetails {
  return ANNOUNCEMENT_PLANS[plan];
}

export function canAddPhotos(plan: AnnouncementPlan): boolean {
  return getPlanDetails(plan).features.gallery || plan !== AnnouncementPlan.FREE;
}

export function canModifyPhoto(plan: AnnouncementPlan): boolean {
  return getPlanDetails(plan).features.photoModifiable;
}

export function canAddVideos(plan: AnnouncementPlan): boolean {
  return getPlanDetails(plan).features.videos;
}

export function canAddBiography(plan: AnnouncementPlan): boolean {
  return getPlanDetails(plan).features.biography;
}

export function canAddTestimonies(plan: AnnouncementPlan): boolean {
  return getPlanDetails(plan).features.testimonies;
}

export function canSeeLiteraryAlbum(plan: AnnouncementPlan): boolean {
  return getPlanDetails(plan).features.literaryAlbum;
}

export function canHaveFundraiser(plan: AnnouncementPlan): boolean {
  return getPlanDetails(plan).features.fundraiser;
}
