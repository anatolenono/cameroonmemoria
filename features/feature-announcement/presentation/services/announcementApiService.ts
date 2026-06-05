import { CreateAnnouncementFormData } from "../schemas";
import { AnnouncementType, Announcement } from "../../domain/types/announcement";

export interface CreateAnnouncementResponse extends Omit<Announcement, 'deceasedBirthDate' | 'deceasedDeathDate' | 'ceremonyDate' | 'createdAt' | 'updatedAt'> {
  deceasedBirthDate?: string | null;
  deceasedDeathDate: string;
  ceremonyDate?: string | null;
  createdAt: string;
  updatedAt: string;
  uploadStats?: {
    successCount: number;
    failedCount: number;
    failedUploads?: { originalname: string; error: string }[];
  };
}

export interface ApiAnnouncementResponse {
  id: string;
  title: string;
  description?: string;
  type: string;
  status?: string;
  isAnonymous: boolean;
  deceasedName: string;
  deceasedPronoun?: string;
  deceasedBirthDate?: string;
  deceasedBirthPlace?: string;
  deceasedDeathDate: string;
  deceasedPhotoUrl?: string;
  ceremonyDate?: string;
  ceremonyLocation?: string;
  createdAt: string;
  media?: Array<{ url: string }>;
  condolenceCount?: number;
  flowerCount?: number;
  candleCount?: number;
}

export interface TransformedAnnouncement {
  id: string;
  type: 'death_notice' | 'funeral' | 'anniversary' | 'thanks';
  status?: 'PUBLISHED' | 'PENDING' | 'REJECTED' | string;
  name: string;
  pronoun?: string;
  dateOfBirth?: string;
  dateOfDeath: string;
  location?: string;
  funeralDate?: string;
  description: string;
  imageUrl?: string;
  condolenceCount: number;
  donationAmount: number;
  flowerCount: number;
  candleCount: number;
  timeAgo: string;
  isAnonymous: boolean;
}

export interface GetAnnouncementsResponse {
  announcements: ApiAnnouncementResponse[];
  total: number;
}

// === ADMIN INTERFACES ===

export interface AdminStats {
  pendingAnnouncements: number;
  totalAnnouncements: number;
  publishedAnnouncements: number;
  rejectedAnnouncements: number;
  pendingCondolences: number;
  totalCondolences: number;
  totalUsers: number;
  todaySubmissions: number;
  weeklyGrowth: number;
}

export interface AnnouncementWithModerationInfo extends CreateAnnouncementResponse {
  submittedAt: string;
  submitterName?: string;
  submitterEmail?: string;
  moderationNotes?: string;
}

export interface AdminAnnouncementsResponse {
  announcements: AnnouncementWithModerationInfo[];
  total: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  announcementsCount: number;
  avatar?: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
}

export interface ApiError {
  error: string;
}

export interface AnnouncementFilters {
  q?: string;
  type?: string; // comma separated or single type
  location?: string;
  dateFrom?: string; // yyyy-MM-dd
  dateTo?: string;   // yyyy-MM-dd
  withDonations?: string; // 'true' | undefined
  recentOnly?: string;    // 'true' | undefined
  limit?: number;
  offset?: number;
  status?: string;
  userId?: string;
}

class AnnouncementApiService {
  private baseUrl = '/api/announcements';
  private adminBaseUrl = '/api/admin';

  /**
   * Convertit le type du formulaire vers le type de domaine
   */
  private mapFormTypeToApiType(formType: "death_notice" | "funeral" | "anniversary" | "thanks"): AnnouncementType {
    const typeMapping = {
      "death_notice": AnnouncementType.DEATH_NOTICE,
      "funeral": AnnouncementType.FUNERAL,
      "anniversary": AnnouncementType.ANNIVERSARY,
      "thanks": AnnouncementType.THANKS,
    };
    return typeMapping[formType];
  }

  /**
   * Mapper le type API vers le type attendu par le composant
   */
  private mapApiTypeToComponentType(apiType: string): 'death_notice' | 'funeral' | 'anniversary' | 'thanks' {
    switch (apiType.toUpperCase()) {
      case 'DEATH_NOTICE':
        return 'death_notice';
      case 'FUNERAL':
        return 'funeral';
      case 'ANNIVERSARY':
        return 'anniversary';
      case 'THANKS':
        return 'thanks';
      default:
        return 'funeral';
    }
  }

  /**
   * Fonction pour calculer le temps écoulé
   */
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Aujourd'hui";
    } else if (diffInDays === 1) {
      return "Il y a 1 jour";
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? "Il y a 1 semaine" : `Il y a ${weeks} semaines`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? "Il y a 1 mois" : `Il y a ${months} mois`;
    }
  }

  /**
   * Transforme les données API vers le format attendu par les composants
   */
  private transformAnnouncement(announcement: ApiAnnouncementResponse): TransformedAnnouncement {
    return {
      id: announcement.id,
      type: this.mapApiTypeToComponentType(announcement.type),
      status: (announcement.status || '').toUpperCase() as TransformedAnnouncement['status'],
      name: announcement.isAnonymous ? "Anonyme" : announcement.deceasedName,
      pronoun: announcement.deceasedPronoun,
      dateOfBirth: announcement.deceasedBirthDate,
      dateOfDeath: announcement.deceasedDeathDate,
      location: announcement.ceremonyLocation,
      funeralDate: announcement.ceremonyDate,
      description: announcement.description || announcement.title,
      imageUrl: announcement.deceasedPhotoUrl, // Use deceased photo instead of first gallery image
      condolenceCount: announcement.condolenceCount ?? 0,
      donationAmount: 0,
      flowerCount: announcement.flowerCount ?? 0,
      candleCount: announcement.candleCount ?? 0,
      timeAgo: this.formatTimeAgo(new Date(announcement.createdAt)),
      isAnonymous: announcement.isAnonymous,
    };
  }

  // === PUBLIC METHODS ===

  /**
   * Récupère les annonces récentes
   */
  async getRecentAnnouncements(limit: number = 3): Promise<TransformedAnnouncement[]> {
    try {
      const params = new URLSearchParams();
      params.append('status', 'PUBLISHED');
      params.append('limit', limit.toString());
      params.append('offset', '0');

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: GetAnnouncementsResponse = await response.json();
      
      return data.announcements.map(announcement => this.transformAnnouncement(announcement));
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces récentes:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la récupération des annonces');
    }
  }

  /**
   * Récupère les annonces avec filtres
   */
  async getAnnouncements(params: AnnouncementFilters = {}): Promise<TransformedAnnouncement[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.q) searchParams.append('q', params.q);
      if (params.type && params.type !== 'ALL') searchParams.append('type', params.type.toUpperCase());
      if (params.location) searchParams.append('location', params.location);
      if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) searchParams.append('dateTo', params.dateTo);
      if (params.withDonations) searchParams.append('withDonations', params.withDonations);
      if (params.recentOnly) searchParams.append('recentOnly', params.recentOnly);
      if (params.status) searchParams.append('status', params.status);
      if (params.userId) searchParams.append('userId', params.userId);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: GetAnnouncementsResponse = await response.json();
      
      return data.announcements.map(announcement => this.transformAnnouncement(announcement));
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la récupération des annonces');
    }
  }

  /**
   * Crée une nouvelle annonce
   */
  async createAnnouncement(data: CreateAnnouncementFormData, files?: File[]): Promise<CreateAnnouncementResponse> {
    try {
      // Si des fichiers sont présents, utiliser FormData (multipart/form-data)
      if (files && files.length > 0) {
        const formData = new FormData();
        
        // Ajouter les données de l'annonce
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('type', this.mapFormTypeToApiType(data.type));
        formData.append('deceasedName', data.deceasedName);
        if (data.deceasedPronoun) {
          formData.append('deceasedPronoun', data.deceasedPronoun);
        }
        if (data.birthDate) {
          formData.append('deceasedBirthDate', data.birthDate);
        }
        if (data.birthPlace) {
          formData.append('birthPlace', data.birthPlace);
        }
        formData.append('deceasedDeathDate', data.deathDate);
        // Ajouter les événements sous forme de JSON string
        formData.append('events', JSON.stringify(data.events));
        formData.append('relationship', data.relationship);

        // Ajouter les champs de bannière
        if (data.bannerPresetId) {
          formData.append('bannerPresetId', data.bannerPresetId);
          console.log('Adding bannerPresetId to FormData:', data.bannerPresetId);
        }
        if (data.bannerCustomUrl) {
          formData.append('bannerCustomUrl', data.bannerCustomUrl);
          console.log('Adding bannerCustomUrl to FormData:', data.bannerCustomUrl);
        }

        // Champs d'inscription si présents
        if (data.registerName) formData.append('registerName', data.registerName);
        if (data.registerEmail) formData.append('registerEmail', data.registerEmail);
        if (data.registerPassword) formData.append('registerPassword', data.registerPassword);
        if (data.registerConfirmPassword) formData.append('registerConfirmPassword', data.registerConfirmPassword);

        // Ajouter les fichiers
        files.forEach((file, index) => {
          // Check if this is the deceased photo file
          if (file.name === 'deceasedPhoto') {
            formData.append('deceasedPhoto', file);
          } else {
            formData.append(`media${index}`, file);
          }
        });

        console.log("Envoi avec FormData, nombre de fichiers:", files.length);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          body: formData, // Pas de Content-Type header, le navigateur le définit automatiquement pour multipart
        });

        console.log("Statut de la réponse:", response.status);

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Données de réponse brutes:", responseData);

        // Vérifier que l'ID est présent
        if (!responseData.id) {
          console.error("ID manquant dans la réponse API:", responseData);
          throw new Error("L'API n'a pas retourné d'ID pour l'annonce créée");
        }

        return responseData;
      } else {
        // Pas de fichiers, utiliser JSON comme avant
        const requestBody = {
          title: data.title,
          description: data.description,
          type: this.mapFormTypeToApiType(data.type),
          deceasedName: data.deceasedName,
          deceasedPronoun: data.deceasedPronoun || undefined,
          deceasedBirthDate: data.birthDate || undefined,
          deceasedBirthPlace: data.birthPlace || undefined,
          deceasedDeathDate: data.deathDate,
          events: JSON.stringify(data.events),
          relationship: data.relationship,
          // Champs de bannière
          ...(data.bannerPresetId && { bannerPresetId: data.bannerPresetId }),
          ...(data.bannerCustomUrl && { bannerCustomUrl: data.bannerCustomUrl }),
          // Champs d'inscription si présents
          ...(data.registerName && { registerName: data.registerName }),
          ...(data.registerEmail && { registerEmail: data.registerEmail }),
          ...(data.registerPassword && { registerPassword: data.registerPassword }),
          ...(data.registerConfirmPassword && { registerConfirmPassword: data.registerConfirmPassword }),
        };

        console.log("Corps de la requête API (JSON):", requestBody);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log("Statut de la réponse:", response.status);

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Données de réponse brutes:", responseData);

        // Vérifier que l'ID est présent
        if (!responseData.id) {
          console.error("ID manquant dans la réponse API:", responseData);
          throw new Error("L'API n'a pas retourné d'ID pour l'annonce créée");
        }

        return responseData;
      }
    } catch (error) {
      console.error("Erreur dans createAnnouncement:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la création de l\'annonce');
    }
  }

  /**
   * Sauvegarde un brouillon d'annonce (pour l'instant, on utilise localStorage)
   */
  saveDraft(data: CreateAnnouncementFormData): void {
    try {
      const draftKey = 'announcement_draft';
      const draftData = {
        ...data,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    } catch (error) {
      console.warn('Impossible de sauvegarder le brouillon:', error);
    }
  }

  /**
   * Récupère un brouillon sauvegardé
   */
  getDraft(): (CreateAnnouncementFormData & { savedAt: string }) | null {
    try {
      const draftKey = 'announcement_draft';
      const draftData = localStorage.getItem(draftKey);
      if (draftData) {
        return JSON.parse(draftData);
      }
    } catch (error) {
      console.warn('Impossible de récupérer le brouillon:', error);
    }
    return null;
  }

  /**
   * Supprime le brouillon sauvegardé
   */
  clearDraft(): void {
    try {
      const draftKey = 'announcement_draft';
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.warn('Impossible de supprimer le brouillon:', error);
    }
  }

  /**
   * Récupère une annonce par son ID
   */
  async getAnnouncementById(id: string): Promise<CreateAnnouncementResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Annonce non trouvée');
        }
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la récupération de l\'annonce');
    }
  }

  /**
   * Met à jour une annonce existante
   */
  async updateAnnouncement(id: string, data: CreateAnnouncementFormData): Promise<void> {
    try {
      const requestBody = {
        title: data.title,
        description: data.description,
        type: this.mapFormTypeToApiType(data.type),
        deceasedName: data.deceasedName,
        deceasedPronoun: data.deceasedPronoun || undefined,
        deceasedBirthDate: data.birthDate || undefined,
        deceasedBirthPlace: data.birthPlace || undefined,
        deceasedDeathDate: data.deathDate,
        ceremonyDate: data.events?.[0]?.date?.from || undefined,
        ceremonyLocation: data.events?.[0]?.location || undefined,
        relationship: data.relationship || undefined,
        // mediaIds and banner fields can be added when edit UI supports them
      };

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue est survenue lors de la mise à jour de l'annonce");
    }
  }

  // === ADMIN METHODS ===

  /**
   * Récupère les statistiques pour le tableau de bord admin
   */
  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        pendingAnnouncements: data.pendingAnnouncements || 0,
        totalAnnouncements: data.totalAnnouncements || 0,
        publishedAnnouncements: data.publishedAnnouncements || 0,
        rejectedAnnouncements: data.rejectedAnnouncements || 0,
        pendingCondolences: data.pendingCondolences || 0,
        totalCondolences: data.totalCondolences || 0,
        totalUsers: data.totalUsers || 0,
        todaySubmissions: data.todaySubmissions || 0,
        weeklyGrowth: data.weeklyGrowth || 0
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques admin:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la récupération des statistiques');
    }
  }

  /**
   * Récupère les annonces pour l'administration
   */
  async getAdminAnnouncements(params: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AnnouncementWithModerationInfo[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
      if (params.search) searchParams.append('search', params.search);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const response = await fetch(`${this.adminBaseUrl}/announcements?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: AdminAnnouncementsResponse = await response.json();
      
      return data.announcements;
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces admin:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la récupération des annonces');
    }
  }

  /**
   * Approuve une annonce
   */
  async approveAnnouncement(announcementId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${announcementId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de l\'approbation');
    }
  }

  /**
   * Rejette une annonce
   */
  async rejectAnnouncement(announcementId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${announcementId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors du rejet');
    }
  }

  /**
   * Récupère les utilisateurs pour l'administration
   */
  async getAdminUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AdminUser[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.search) searchParams.append('search', params.search);
      if (params.role && params.role !== 'ALL') searchParams.append('role', params.role);
      if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const response = await fetch(`${this.adminBaseUrl}/users?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: AdminUsersResponse = await response.json();
      
      return data.users;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs admin:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la récupération des utilisateurs');
    }
  }

  /**
   * Effectue une action sur un utilisateur (suspend, ban, etc.)
   */
  async performUserAction(userId: string, action: string): Promise<void> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/users/${userId}/action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'action utilisateur:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de l\'action utilisateur');
    }
  }
}

export const announcementApiService = new AnnouncementApiService(); 