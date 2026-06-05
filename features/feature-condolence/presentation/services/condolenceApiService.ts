import { Condolence, CreateCondolenceDto, UpdateCondolenceDto } from "../../domain/types/condolence";

export interface CondolenceResponse extends Omit<Condolence, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface CondolencesListResponse {
  condolences: CondolenceResponse[];
  total: number;
  limit: number;
  offset: number;
}

// === ADMIN INTERFACES ===

// Interface pour les données brutes de l'API
export interface RawApiCondolenceResponse {
  id: string;
  message: string;
  isAnonymous: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  announcementId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  announcement: {
    id: string;
    title: string;
  };
  moderationNotes?: string;
}

// Interface pour l'interface utilisateur (transformée)
export interface AdminCondolenceResponse {
  id: string;
  content: string;
  author: string;
  authorEmail?: string;
  announcementTitle: string;
  status: string;
  createdAt: string;
  moderationNotes?: string;
}

export interface AdminCondolencesResponse {
  condolences: AdminCondolenceResponse[];
  total: number;
}

export interface ApiError {
  error: string;
}

class CondolenceApiService {
  private baseUrl = '/api/condolences';
  private adminBaseUrl = '/api/admin';

  /**
   * Transforme les données API brutes vers le format d'interface utilisateur
   */
  private transformApiCondolence(rawCondolence: RawApiCondolenceResponse): AdminCondolenceResponse {
    // Mapper isApproved vers un statut textuel
    let status = 'PENDING';
    if (rawCondolence.isApproved === true) {
      status = 'APPROVED';
    } else if (rawCondolence.isApproved === false && rawCondolence.moderationNotes) {
      status = 'REJECTED';
    }

    return {
      id: rawCondolence.id,
      content: rawCondolence.message,
      author: rawCondolence.isAnonymous ? "Anonyme" : rawCondolence.user.name,
      authorEmail: rawCondolence.isAnonymous ? undefined : rawCondolence.user.email,
      announcementTitle: rawCondolence.announcement.title,
      status: status,
      createdAt: rawCondolence.createdAt,
      moderationNotes: rawCondolence.moderationNotes,
    };
  }

  /**
   * Récupère les condoléances pour une annonce spécifique
   */
  async getCondolencesByAnnouncementId(
    announcementId: string, 
    options: {
      limit?: number;
      offset?: number;
      isApproved?: boolean;
    } = {}
  ): Promise<CondolencesListResponse> {
    try {
      const searchParams = new URLSearchParams({
        announcementId,
        ...Object.fromEntries(
          Object.entries(options).map(([key, value]) => [key, String(value)])
        )
      });

      const response = await fetch(`${this.baseUrl}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la récupération des condoléances');
    }
  }

  /**
   * Crée une nouvelle condoléance
   */
  async createCondolence(data: CreateCondolenceDto): Promise<CondolenceResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la création de la condoléance');
    }
  }

  /**
   * Met à jour une condoléance
   */
  async updateCondolence(id: string, data: UpdateCondolenceDto): Promise<CondolenceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la mise à jour de la condoléance');
    }
  }

  /**
   * Supprime une condoléance
   */
  async deleteCondolence(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la suppression de la condoléance');
    }
  }

  /**
   * Récupère une condoléance par ID
   */
  async getCondolenceById(id: string): Promise<CondolenceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la récupération de la condoléance');
    }
  }

  // === ADMIN METHODS ===

  /**
   * Récupère les condoléances pour l'administration
   */
  async getAdminCondolences(params: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AdminCondolenceResponse[]> {
    try {
      const searchParams = new URLSearchParams();
      
      // Pour l'API des condoléances, on ne filtre pas par statut au niveau API
      // car on transforme isApproved en statut côté client
      if (params.search) searchParams.append('search', params.search);
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

      const data = await response.json();
      
      // L'API retourne { condolences: [...], total, limit, offset }
      // Transformer les données et appliquer le filtre de statut côté client
      const transformedCondolences = data.condolences.map((rawCondolence: RawApiCondolenceResponse) => 
        this.transformApiCondolence(rawCondolence)
      );

      // Filtrer par statut après transformation si nécessaire
      if (params.status && params.status !== 'ALL') {
        return transformedCondolences.filter((condolence: AdminCondolenceResponse) => 
          condolence.status === params.status
        );
      }

      return transformedCondolences;
    } catch (error) {
      console.error("Erreur lors de la récupération des condoléances admin:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la récupération des condoléances');
    }
  }

  /**
   * Approuve une condoléance
   */
  async approveCondolence(condolenceId: string): Promise<void> {
    try {
      const updateData: UpdateCondolenceDto = {
        isApproved: true
      };

      const response = await fetch(`${this.baseUrl}/${condolenceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation de la condoléance:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de l\'approbation de la condoléance');
    }
  }

  /**
   * Rejette une condoléance
   */
  async rejectCondolence(condolenceId: string): Promise<void> {
    try {
      const updateData: UpdateCondolenceDto = {
        isApproved: false
      };

      const response = await fetch(`${this.baseUrl}/${condolenceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors du rejet de la condoléance:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors du rejet de la condoléance');
    }
  }
}

export const condolenceApiService = new CondolenceApiService(); 