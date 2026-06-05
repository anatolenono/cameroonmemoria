import { AnnouncementPlan } from '../../domain/types/announcement';
import {
  ANNOUNCEMENT_PLANS,
  getPlanDetails,
  canAddPhotos,
  canModifyPhoto,
  canAddVideos,
  canAddBiography,
  canAddTestimonies,
  canSeeLiteraryAlbum,
  canHaveFundraiser,
} from '../../domain/types/pricing';

export interface PricingCheckResult {
  allowed: boolean;
  reason?: string;
}

export class PricingService {
  /**
   * Check if a feature is allowed for a given plan
   */
  canAddPhotos(plan: AnnouncementPlan): boolean {
    return canAddPhotos(plan);
  }

  canModifyPhoto(plan: AnnouncementPlan): boolean {
    return canModifyPhoto(plan);
  }

  canAddVideos(plan: AnnouncementPlan): boolean {
    return canAddVideos(plan);
  }

  canAddBiography(plan: AnnouncementPlan): boolean {
    return canAddBiography(plan);
  }

  canAddTestimonies(plan: AnnouncementPlan): boolean {
    return canAddTestimonies(plan);
  }

  canSeeLiteraryAlbum(plan: AnnouncementPlan): boolean {
    return canSeeLiteraryAlbum(plan);
  }

  canHaveFundraiser(plan: AnnouncementPlan): boolean {
    return canHaveFundraiser(plan);
  }

  /**
   * Get all available plans
   */
  getAllPlans() {
    return Object.values(ANNOUNCEMENT_PLANS);
  }

  /**
   * Get plan details by ID
   */
  getPlanDetails(plan: AnnouncementPlan) {
    return getPlanDetails(plan);
  }

  /**
   * Check if user can add a specific number of photos
   */
  checkPhotoLimit(plan: AnnouncementPlan, currentPhotoCount: number): PricingCheckResult {
    const details = getPlanDetails(plan);

    if (plan === AnnouncementPlan.FREE && currentPhotoCount >= 1) {
      return {
        allowed: false,
        reason: 'Le plan gratuit ne permet qu\'une seule photo. Veuillez passer à un plan supérieur pour en ajouter d\'autres.',
      };
    }

    if (currentPhotoCount >= details.features.photoCount) {
      return {
        allowed: false,
        reason: `Limite de photos atteinte pour votre plan (${details.features.photoCount} maximum).`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if photo can be modified/replaced
   */
  checkPhotoModification(plan: AnnouncementPlan): PricingCheckResult {
    if (!this.canModifyPhoto(plan)) {
      return {
        allowed: false,
        reason: 'Seul le plan Essentiel ou supérieur permet de modifier la photo. Passez à un plan supérieur.',
      };
    }
    return { allowed: true };
  }

  /**
   * Check if video can be added
   */
  checkVideoAddition(plan: AnnouncementPlan): PricingCheckResult {
    if (!this.canAddVideos(plan)) {
      return {
        allowed: false,
        reason: 'Seul le plan Complet ou supérieur permet d\'ajouter des vidéos.',
      };
    }
    return { allowed: true };
  }

  /**
   * Check if biography section is allowed
   */
  checkBiography(plan: AnnouncementPlan): PricingCheckResult {
    if (!this.canAddBiography(plan)) {
      return {
        allowed: false,
        reason: 'Seul le plan Complet ou supérieur permet d\'ajouter une biographie.',
      };
    }
    return { allowed: true };
  }

  /**
   * Check if testimonies are allowed
   */
  checkTestimonies(plan: AnnouncementPlan): PricingCheckResult {
    if (!this.canAddTestimonies(plan)) {
      return {
        allowed: false,
        reason: 'Seul le plan Complet ou supérieur permet d\'ajouter des témoignages.',
      };
    }
    return { allowed: true };
  }

  /**
   * Check if literary album is allowed
   */
  checkLiteraryAlbum(plan: AnnouncementPlan): PricingCheckResult {
    if (!this.canSeeLiteraryAlbum(plan)) {
      return {
        allowed: false,
        reason: 'Seul le plan Complet ou supérieur permet d\'activer le livre d\'or.',
      };
    }
    return { allowed: true };
  }

  /**
   * Check if fundraiser is allowed
   */
  checkFundraiser(plan: AnnouncementPlan): PricingCheckResult {
    if (!this.canHaveFundraiser(plan)) {
      return {
        allowed: false,
        reason: 'Seul le plan Premium permet d\'activer une cagnotte.',
      };
    }
    return { allowed: true };
  }
}
