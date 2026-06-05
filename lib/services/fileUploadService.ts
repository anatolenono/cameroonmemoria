import { mkdir, writeFile } from 'fs/promises';
import fs from 'fs';
import { join } from 'path';
import { fileUploader } from '@/lib/services/fileUploader';
import { retryAsync } from 'ts-retry';

interface TempFileInfo {
  filepath: string;
  mimetype: string;
  originalname: string;
  size: number;
}

interface UploadedFileInfo {
  success: boolean;
  url?: string;
  mimetype: string;
  originalname: string;
  size: number;
  error?: string;
}

/**
 * Service pour gérer l'upload de fichiers avec gestion des erreurs et retry
 */
export class FileUploadService {
  private readonly tempDir: string;
  
  constructor() {
    this.tempDir = join('/tmp', 'cameroonmemoria-uploads');
  }
  
  /**
   * Sauvegarde un blob dans un fichier temporaire
   */
  public async saveBlobToTempFile(blob: Blob): Promise<TempFileInfo> {
    // Créer un dossier temporaire si nécessaire
    await mkdir(this.tempDir, { recursive: true });

    // Générer un nom de fichier unique
    const randomId = Math.random().toString(36).substring(2, 15);
    const originalname = `file-${randomId}`;
    const filepath = join(this.tempDir, `${Date.now()}-${randomId}`);
    
    // Convertir le blob en arrayBuffer puis en Buffer
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Écrire le fichier
    await writeFile(filepath, buffer);
    
    return {
      filepath,
      mimetype: blob.type,
      originalname,
      size: buffer.length
    };
  }
  
  /**
   * Supprime un fichier temporaire
   */
  public deleteTempFile(filepath: string): void {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier temporaire ${filepath}:`, error);
    }
  }
  
  /**
   * Upload un fichier vers MinIO avec retry en cas d'échec
   */
  public async uploadFileWithRetry(
    tempFile: TempFileInfo,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<UploadedFileInfo> {
    try {
      // Lire le fichier
      const fileBuffer = fs.readFileSync(tempFile.filepath);
      
      // Uploader vers MinIO avec retries
      const fileUrl = await retryAsync(
        async () => {
          return await fileUploader.upload(
            fileBuffer,
            tempFile.originalname,
            tempFile.mimetype
          );
        },
        {
          maxTry: maxRetries,
          delay: delayMs,
          onError: (error, currentTry) => {
            console.warn(`Tentative ${currentTry}/${maxRetries} d'upload échouée: ${error.message}`);
            // La fonction onError doit retourner undefined pour continuer les retries
            return undefined;
          },
          onMaxRetryFunc: (error) => {
            console.error(`L'upload a échoué après ${maxRetries} tentatives: ${error.message}`);
            
            // On pourrait enregistrer les erreurs dans un fichier de log ou une base de données ici
            const errorDetails = {
              originalname: tempFile.originalname,
              mimetype: tempFile.mimetype,
              size: tempFile.size,
              error: error.message,
              timestamp: new Date().toISOString()
            };
            
            console.error('Détails de l\'erreur:', JSON.stringify(errorDetails));
          }
        }
      );
      
      // L'upload a réussi, retourner les informations avec success=true
      return {
        success: true,
        url: fileUrl,
        mimetype: tempFile.mimetype,
        originalname: tempFile.originalname,
        size: tempFile.size
      };
    } catch (error) {
      // L'upload a échoué après tous les retries, retourner les informations avec success=false
      return {
        success: false,
        mimetype: tempFile.mimetype,
        originalname: tempFile.originalname,
        size: tempFile.size,
        error: `Échec de l'upload du fichier après ${maxRetries} tentatives: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * Traite un blob complet - sauvegarde temporaire, upload et nettoyage
   * Retourne toujours un résultat, même en cas d'échec, avec un indicateur de succès
   */
  public async processBlob(
    blob: Blob,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<UploadedFileInfo> {
    // Sauvegarder dans un fichier temporaire
    let tempFile: TempFileInfo | null = null;
    
    try {
      tempFile = await this.saveBlobToTempFile(blob);
      
      // Uploader vers MinIO avec retry
      const result = await this.uploadFileWithRetry(tempFile, maxRetries, delayMs);
      
      return result;
    } catch (error) {
      // Cas d'erreur inattendue (par exemple lors de la création du fichier temporaire)
      return {
        success: false,
        mimetype: blob.type,
        originalname: tempFile?.originalname || `file-error-${Date.now()}`,
        size: tempFile?.size || 0,
        error: `Erreur lors du traitement du fichier: ${(error as Error).message}`
      };
    } finally {
      // Toujours supprimer le fichier temporaire, même en cas d'erreur
      if (tempFile) {
        this.deleteTempFile(tempFile.filepath);
      }
    }
  }
}

// Exporter une instance singleton pour une utilisation facile
export const fileUploadService = new FileUploadService(); 