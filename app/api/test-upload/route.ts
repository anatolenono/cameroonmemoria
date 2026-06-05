import { NextRequest, NextResponse } from 'next/server';
import { fileUploader } from '@/lib/services/fileUploader';

/**
 * Endpoint de test pour l'upload de fichiers
 * 
 * Ce endpoint utilise directement fileUploader pour tester
 * l'upload de fichiers vers Minio sans traiter un vrai formulaire.
 * Il génère un fichier texte simple à partir du texte fourni.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer le texte à partir de la query string (ou utiliser un texte par défaut)
    const searchParams = req.nextUrl.searchParams;
    const text = searchParams.get('text') || 'Fichier de test pour Cameroon Memoria';
    
    // Créer un buffer à partir du texte
    const fileBuffer = Buffer.from(text);
    
    // Upload le buffer comme un fichier texte
    const fileUrl = await fileUploader.upload(
      fileBuffer,
      'test.txt',
      'text/plain'
    );
    
    // Retourner la réponse
    return NextResponse.json({
      success: true,
      message: 'Fichier test uploadé avec succès',
      fileUrl
    });
  } catch (error) {
    console.error('Erreur lors du test d\'upload:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Échec de l\'upload de test',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
} 