/**
 * Utilitaire centralisé pour les libellés des types d'annonces
 *
 * Ce fichier maintient la correspondance entre les valeurs de base de données
 * (FUNERAL, ANNIVERSARY, THANKS, OTHER) et leurs libellés d'affichage en français.
 *
 * Conformément aux retours utilisateurs (TODO-019, TODO-032):
 * - "FUNERAL" → "Avis de Décès" (au lieu de "Funérailles")
 * - Tous les types sont au pluriel pour la navigation
 */

import { AnnouncementType } from '@/features/feature-announcement/domain/types/announcement';

/**
 * Libellés singuliers des types d'annonces
 * Utilisés dans les formulaires et contextes où on parle d'une annonce spécifique
 */
export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType | string, string> = {
  FUNERAL: "Avis de Décès",
  ANNIVERSARY: "Anniversaire de Décès",
  THANKS: "Remerciements",
  OTHER: "Autre",
  // Support des valeurs en minuscules (parfois utilisées dans l'API)
  funeral: "Avis de Décès",
  anniversary: "Anniversaire de Décès",
  thanks: "Remerciements",
  other: "Autre",
};

/**
 * Libellés pluriels des types d'annonces
 * Utilisés dans la navigation et les en-têtes de sections
 */
export const ANNOUNCEMENT_TYPE_LABELS_PLURAL: Record<AnnouncementType | string, string> = {
  FUNERAL: "Avis de Décès",
  ANNIVERSARY: "Anniversaires de Décès",
  THANKS: "Remerciements",
  OTHER: "Autres",
  // Support des valeurs en minuscules
  funeral: "Avis de Décès",
  anniversary: "Anniversaires de Décès",
  thanks: "Remerciements",
  other: "Autres",
};

/**
 * Obtient le libellé d'affichage pour un type d'annonce
 *
 * @param type - Le type d'annonce (FUNERAL, ANNIVERSARY, THANKS, OTHER ou leurs variantes minuscules)
 * @param plural - Si true, retourne la forme plurielle (pour la navigation)
 * @returns Le libellé français correspondant
 *
 * @example
 * ```ts
 * getAnnouncementTypeLabel('FUNERAL') // "Avis de Décès"
 * getAnnouncementTypeLabel('funeral', true) // "Avis de Décès"
 * getAnnouncementTypeLabel('ANNIVERSARY', true) // "Anniversaires de Décès"
 * ```
 */
export function getAnnouncementTypeLabel(
  type: AnnouncementType | string | undefined | null,
  plural: boolean = false
): string {
  if (!type) return "Type inconnu";

  const normalizedType = type.toUpperCase();
  const labels = plural ? ANNOUNCEMENT_TYPE_LABELS_PLURAL : ANNOUNCEMENT_TYPE_LABELS;

  return labels[normalizedType] || labels[type] || "Type inconnu";
}

/**
 * Obtient tous les types d'annonces avec leurs libellés
 * Utile pour générer des menus ou des filtres
 *
 * @param plural - Si true, retourne les formes plurielles
 * @returns Un tableau d'objets {value, label}
 *
 * @example
 * ```ts
 * getAllAnnouncementTypes() // [{value: 'FUNERAL', label: 'Avis de Décès'}, ...]
 * getAllAnnouncementTypes(true) // [{value: 'FUNERAL', label: 'Avis de Décès'}, ...]
 * ```
 */
export function getAllAnnouncementTypes(plural: boolean = false) {
  const types: AnnouncementType[] = [
    AnnouncementType.FUNERAL,
    AnnouncementType.ANNIVERSARY,
    AnnouncementType.THANKS,
  ];

  return types.map(type => ({
    value: type,
    label: getAnnouncementTypeLabel(type, plural),
  }));
}
