import { z } from "zod";

const eventDateSchema = z.object({
  from: z.string().min(1, "La date de début est requise"),
  to: z.string().optional(),
});

const eventSchema = z.object({
  date: eventDateSchema,
  name: z.string().min(1, "Le nom de l'événement est requis"),
  location: z.string().min(3, "Le lieu doit contenir au moins 3 caractères").max(200, "Le lieu ne peut pas dépasser 200 caractères"),
});

export const createAnnouncementSchema = z.object({
  type: z.enum(["death_notice", "funeral", "anniversary", "thanks"], {
    required_error: "Veuillez sélectionner un type d'annonce",
    invalid_type_error: "Type d'annonce invalide",
  }),
  title: z
    .string()
    .min(1, "Le titre est requis")
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z
    .string()
    .min(1, "La description est requise")
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(1000, "La description ne peut pas dépasser 1000 caractères"),
  deceasedName: z
    .string()
    .min(1, "Le nom de la personne est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets"),
  deceasedPronoun: z.enum(["M.", "Mme", "Mlle"], {
    required_error: "Veuillez sélectionner la civilité du défunt",
    invalid_type_error: "Civilité invalide",
  }),
  relationship: z.string().min(1, "Le lien avec le défunt est requis"),
  relationshipOther: z.string().optional(),
  birthDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true; // Optionnel
      const birthYear = new Date(date).getFullYear();
      const currentYear = new Date().getFullYear();
      return birthYear >= 1900 && birthYear <= currentYear;
    }, "Date de naissance invalide"),
  birthPlace: z
    .string()
    .optional()
    .refine((place) => {
      if (!place || place.trim().length === 0) return true; // Optionnel
      return place.trim().length >= 2 && place.trim().length <= 100;
    }, "Le lieu de naissance doit contenir entre 2 et 100 caractères"),
  deathDate: z
    .string()
    .min(1, "La date de décès est requise")
    .refine((date) => {
      const deathDate = new Date(date);
      const currentDate = new Date();
      return deathDate <= currentDate;
    }, "La date de décès ne peut pas être dans le futur"),
  events: z.array(eventSchema).min(1, "Au moins un événement est requis"),
  bannerPresetId: z.string().optional(),
  bannerCustomUrl: z.string().optional(),
  bannerCustomColor: z.string().optional(),
  registerName: z.string().optional(),
  registerEmail: z.string().optional(),
  registerPhoneNumber: z.string().optional(),
  registerPassword: z.string().optional(),
  registerConfirmPassword: z.string().optional(),
}).refine((data) => {
  // Validation croisée : si une date de naissance est fournie, elle doit être antérieure à la date de décès
  if (data.birthDate && data.deathDate) {
    return new Date(data.birthDate) < new Date(data.deathDate);
  }
  return true;
}, {
  message: "La date de naissance doit être antérieure à la date de décès",
  path: ["birthDate"],
})
.refine((data) => {
  // Si relationship est 'Autre', relationshipOther doit être précisé
  if (data.relationship === 'Autre') {
    return data.relationshipOther && data.relationshipOther.trim().length >= 2;
  }
  return true;
}, {
  message: "Veuillez préciser le lien avec le défunt.",
  path: ["relationshipOther"],
});

export type CreateAnnouncementFormData = z.infer<typeof createAnnouncementSchema>; 