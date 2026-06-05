import { NextRequest, NextResponse } from 'next/server';
import { fileUploadService } from '@/lib/services/fileUploadService';

export interface UploadResponse {
  success: boolean;
  message: string;
  files: {
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    url?: string;
  }[];
  failedFiles?: {
    fieldname: string;
    originalname: string;
    error: string;
  }[];
  error?: string;
}

/**
 * Gestionnaire POST pour l'upload de fichiers
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Vérifier si la requête contient des fichiers
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Format invalide',
          files: [],
          error: 'Les données doivent être envoyées en multipart/form-data'
        },
        { status: 400 }
      );
    }

    // Récupérer les données du formulaire
    const formData = await req.formData();
    const uploadedFiles = [];
    const failedFiles = [];

    // Traiter chaque fichier
    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        // Utiliser le service pour traiter le blob avec retry
        const uploadResult = await fileUploadService.processBlob(value, 3, 2000);
        
        if (uploadResult.success && uploadResult.url) {
          // Ajouter l'URL à la liste des fichiers uploadés avec succès
          uploadedFiles.push({
            fieldname: key,
            originalname: uploadResult.originalname,
            mimetype: uploadResult.mimetype,
            size: uploadResult.size,
            url: uploadResult.url
          });
        } else {
          // Ajouter aux fichiers en échec
          failedFiles.push({
            fieldname: key,
            originalname: uploadResult.originalname,
            error: uploadResult.error || 'Une erreur inconnue est survenue lors de l\'upload'
          });
        }
      }
    }

    // Définir le statut de succès global
    const overallSuccess = uploadedFiles.length > 0 || failedFiles.length === 0;
    
    // Déterminer le message approprié
    let message = '';
    if (uploadedFiles.length > 0 && failedFiles.length === 0) {
      message = 'Tous les fichiers ont été uploadés avec succès';
    } else if (uploadedFiles.length > 0 && failedFiles.length > 0) {
      message = `${uploadedFiles.length} fichier(s) uploadé(s) avec succès, ${failedFiles.length} fichier(s) en échec`;
    } else if (uploadedFiles.length === 0 && failedFiles.length > 0) {
      message = 'Tous les uploads ont échoué';
    } else {
      message = 'Aucun fichier n\'a été fourni';
    }

    // Retourner la réponse
    const response: UploadResponse = {
      success: overallSuccess,
      message,
      files: uploadedFiles,
      ...(failedFiles.length > 0 ? { failedFiles } : {})
    };

    return NextResponse.json(response, { 
      status: overallSuccess || uploadedFiles.length > 0 ? 200 : 500 
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de fichier:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Échec de l\'upload',
        files: [],
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 