export interface Condolence {
  id: string;
  message: string;
  isAnonymous: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  announcementId: string;
  // Relations optionnelles
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  announcement?: {
    id: string;
    title: string;
  };
}

export interface CreateCondolenceDto {
  message: string;
  announcementId: string;
}

export interface UpdateCondolenceDto {
  message?: string;
  isApproved?: boolean;
}

export interface CondolenceQuery {
  announcementId?: string;
  userId?: string;
  isApproved?: boolean;
  limit?: number;
  offset?: number;
} 