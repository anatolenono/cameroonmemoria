/**
 * Type pour la réponse de l'API d'upload
 */
export interface UploadResponse {
  success: boolean;
  message: string;
  files: {
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
  }[];
  error?: string;
}

/**
 * Options pour l'upload de fichiers
 */
export interface UploadOptions {
  /** Nom du champ de formulaire (défaut: "file") */
  fieldName?: string;
  /** URL de l'API d'upload (défaut: "/api/upload") */
  endpoint?: string;
  /** Données additionnelles à envoyer avec le fichier */
  additionalData?: Record<string, string>;
  /** Callback pour suivre la progression de l'upload (0-100) */
  onProgress?: (progress: number) => void;
}

/**
 * Client pour l'upload de fichiers vers Minio via l'API
 */
export class FileUploadClient {
  /**
   * Upload un fichier vers Minio
   * @param file Fichier à uploader
   * @param options Options d'upload
   * @returns Promesse avec la réponse de l'API
   */
  static async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    const {
      fieldName = 'file',
      endpoint = '/api/upload',
      additionalData = {},
      onProgress
    } = options;

    // Créer un FormData
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Ajouter les données additionnelles
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      // Utiliser XHR si le callback de progression est fourni
      if (onProgress && typeof XMLHttpRequest !== 'undefined') {
        return await this.uploadWithProgress(formData, endpoint, onProgress);
      }
      
      // Sinon utiliser fetch standard
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json() as UploadResponse;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      return {
        success: false,
        message: 'Échec de l\'upload',
        files: [],
        error: (error as Error).message
      };
    }
  }
  
  /**
   * Upload multiple files vers Minio
   * @param files Liste des fichiers à uploader
   * @param options Options d'upload
   * @returns Promesse avec les réponses de l'API
   */
  static async uploadMultipleFiles(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }
  
  /**
   * Upload un fichier avec suivi de progression via XHR
   * @param formData Données du formulaire
   * @param endpoint URL de l'API
   * @param onProgress Callback de progression
   * @returns Promesse avec la réponse de l'API
   */
  private static uploadWithProgress(
    formData: FormData,
    endpoint: string,
    onProgress: (progress: number) => void
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Gérer les événements de progression
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });
      
      // Gérer la fin de l'upload
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as UploadResponse;
            resolve(response);
          } catch (error: unknown) {
            console.error('Erreur de parsing:', error);
            reject(new Error('Erreur lors du parsing de la réponse'));
          }
        } else {
          reject(new Error(`Erreur HTTP: ${xhr.status}`));
        }
      });
      
      // Gérer les erreurs
      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau lors de l\'upload'));
      });
      
      // Gérer l'abandon
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload annulé'));
      });
      
      // Ouvrir et envoyer la requête
      xhr.open('POST', endpoint, true);
      xhr.send(formData);
    });
  }
} 