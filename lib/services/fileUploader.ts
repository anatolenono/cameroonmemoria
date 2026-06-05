import * as Minio from 'minio';
import { Readable } from 'stream';

/**
 * Classe FileUploader pour simplifier l'upload de fichiers vers Minio
 */
export class FileUploader {
  private client: Minio.Client | null = null;
  private bucketName: string;
  private endpoint: string;
  private port?: number;
  private useSSL: boolean;
  private publicUrl: string;

  /**
   * Constructeur - configure les paramètres mais n'initialise pas encore la connexion
   */
  constructor() {
    // Stocker les paramètres sans initialiser le client
    this.endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    if (process.env.MINIO_PORT){
      this.port = parseInt(process.env.MINIO_PORT);
    }
    this.useSSL = process.env.MINIO_USE_SSL === 'true';
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'cameroonmemoria-media';

    this.publicUrl = (process.env.MINIO_PUBLIC_URL || 'http://localhost:9000').replace(/\/$/, '');
  }

  /**
   * Initialise le client Minio de manière paresseuse (lazy initialization)
   */
  private getClient(): Minio.Client {
    if (!this.client) {
      // Valider que les variables d'environnement sont présentes
      const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
      const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';

      if (!accessKey || !secretKey) {
        throw new Error(
          "Les variables d'environnement MINIO_ACCESS_KEY et MINIO_SECRET_KEY doivent être définies"
        );
      }

      // Initialiser le client seulement quand c'est nécessaire
      this.client = new Minio.Client({
        endPoint: this.endpoint,
        port: this.port,
        useSSL: this.useSSL,
        accessKey,
        secretKey,
      });
    }
    return this.client;
  }

  /**
   * Vérifie si le bucket existe et le crée si nécessaire
   */
  private async ensureBucketExists(): Promise<void> {
    const client = this.getClient();
    const bucketExists = await client.bucketExists(this.bucketName);

    if (!bucketExists) {
      // Créer le bucket s'il n'existe pas
      await client.makeBucket(this.bucketName, 'us-east-1');

      // Définir une politique d'accès public pour le bucket
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
    }
  }

  /**
   * Upload un fichier vers Minio
   * @param file - Buffer ou ReadableStream du fichier
   * @param fileName - Nom du fichier
   * @param contentType - Type MIME du fichier
   * @returns L'URL publique du fichier uploadé
   */
  async upload(file: Buffer | Readable, fileName: string, contentType: string): Promise<string> {
    try {
      const client = this.getClient();

      // S'assurer que le bucket existe
      await this.ensureBucketExists();

      // Générer un nom de fichier unique
      const uniqueFileName = `${Date.now()}_${fileName}`;

      // Uploader le fichier
      await client.putObject(
        this.bucketName,
        uniqueFileName,
        file,
        file instanceof Buffer ? file.length : undefined,
        { 'Content-Type': contentType }
      );

      return `${this.publicUrl}/${this.bucketName}/${uniqueFileName}`;
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier:", error);
      throw new Error(`Échec de l'upload: ${(error as Error).message}`);
    }
  }

  /**
   * Supprime un fichier du bucket Minio
   * @param fileName - Nom du fichier à supprimer
   */
  async delete(fileName: string): Promise<void> {
    try {
      const client = this.getClient();
      await client.removeObject(this.bucketName, fileName);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw new Error(`Échec de la suppression: ${(error as Error).message}`);
    }
  }

  /**
   * Extrait le nom du fichier à partir d'une URL Minio
   * @param url - L'URL complète du fichier
   * @returns Le nom du fichier dans le bucket
   */
  extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Le dernier élément du chemin est le nom du fichier
      return pathParts[pathParts.length - 1];
    } catch (error) {
      console.error("Erreur lors de l'extraction du nom de fichier:", error);
      throw new Error(`URL invalide: ${(error as Error).message}`);
    }
  }

  /**
   * Génère une URL présignée pour un accès temporaire au fichier
   * @param fileName - Nom du fichier
   * @param expirySeconds - Durée de validité en secondes (défaut: 24h)
   * @returns URL présignée
   */
  async getPresignedUrl(fileName: string, expirySeconds: number = 86400): Promise<string> {
    try {
      const client = this.getClient();
      return await client.presignedGetObject(this.bucketName, fileName, expirySeconds);
    } catch (error) {
      console.error("Erreur lors de la génération de l'URL présignée:", error);
      throw new Error(`Échec de la génération de l'URL: ${(error as Error).message}`);
    }
  }
}

// Exporter une instance singleton pour une utilisation facile
export const fileUploader = new FileUploader();
