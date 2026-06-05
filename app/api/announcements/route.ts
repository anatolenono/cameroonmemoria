import { NextRequest, NextResponse } from 'next/server';
import { announcementService } from '@/features/feature-announcement/application/services/announcementService';
import { mediaService } from '@/features/feature-announcement/application/services/mediaService';
import { 
  CreateAnnouncementDto, 
  AnnouncementType,
  AnnouncementStatus,
  EventItem
} from '@/features/feature-announcement/domain/types/announcement';
import { CreateMediaDto } from '@/features/feature-announcement/domain/types/media';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { fileUploadService } from '@/lib/services/fileUploadService';

// GET /api/announcements
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    // Filtres existants
    const typeParams = searchParams.get('type')?.split(',') ?? [];
    const type = typeParams.length > 0 ? typeParams : undefined;
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const userId = searchParams.get('userId') || undefined;
    
    // Nouveaux filtres du frontend
    const q = searchParams.get('q') || undefined;
    const location = searchParams.get('location') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const withDonations = searchParams.get('withDonations') === 'true';
    const recentOnly = searchParams.get('recentOnly') === 'true';

    const result = await announcementService.getAllAnnouncements({
      type: type as AnnouncementType[] | undefined,
      status: status as AnnouncementStatus | undefined,
      limit,
      offset,
      userId,
      q,
      location,
      dateFrom,
      dateTo,
      withDonations,
      recentOnly
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des annonces';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/announcements
export async function POST(req: NextRequest) {
  try {
    // Récupérer la session utilisateur (optionnel maintenant)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // L'utilisateur peut être authentifié ou non
    let userId = session?.user?.id || undefined;
    let formData: FormData | undefined = undefined;
    let body: unknown = undefined;
    let registrationFields: {
      registerName?: string;
      registerEmail?: string;
      registerPassword?: string;
      registerConfirmPassword?: string;
      registerPhoneNumber?: string;
    } = {};

    // Déterminer le type de contenu de la requête
    const contentType = req.headers.get('content-type') || '';

    // Traitement différent selon le type de contenu
    let announcementData: CreateAnnouncementDto;
    const uploadedMedias: CreateMediaDto[] = [];
    const failedUploads: { originalname: string, error: string }[] = [];

    if (contentType.includes('multipart/form-data')) {
      // Cas d'un formulaire multipart avec des fichiers
      formData = await req.formData();
      // Extraire les données de l'annonce
      announcementData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        type: formData.get('type') as AnnouncementType,
        deceasedName: formData.get('deceasedName') as string,
        deceasedPronoun: formData.get('deceasedPronoun') as string || undefined,
        deceasedBirthDate: formData.get('deceasedBirthDate') as string || undefined,
        deceasedBirthPlace: formData.get('birthPlace') as string || undefined,
        deceasedDeathDate: formData.get('deceasedDeathDate') as string,
        // events is stored as a JSON string in the form data
        events: (() => {
          const val = formData.get('events');
          if (typeof val === 'string') {
            try { return JSON.parse(val) as EventItem[]; } catch { return undefined; }
          }
          return undefined;
        })(),
        relationship: formData.get('relationship') as string | undefined,
        bannerPresetId: (formData.get('bannerPresetId') as string)?.trim() || undefined,
        bannerCustomUrl: (formData.get('bannerCustomUrl') as string)?.trim() || undefined,
      };

      console.log('Banner data from form:', {
        bannerPresetId: announcementData.bannerPresetId,
        bannerCustomUrl: announcementData.bannerCustomUrl
      });
      // Champs d'inscription
      registrationFields = {
        registerName: formData.get('registerName') as string | undefined,
        registerEmail: formData.get('registerEmail') as string | undefined,
        registerPassword: formData.get('registerPassword') as string | undefined,
        registerConfirmPassword: formData.get('registerConfirmPassword') as string | undefined,
        registerPhoneNumber: formData.get('registerPhoneNumber') as string | undefined,
      };
      // Traiter les fichiers
      for (const [key, value] of formData.entries()) {
        if (value instanceof Blob) {
          // Utiliser le service pour traiter le blob avec retry
          const uploadResult = await fileUploadService.processBlob(value, 3, 2000);
          if (uploadResult.success && uploadResult.url) {
            // Handle deceased photo
            if (key === 'deceasedPhoto') {
              console.log('Using file as deceased photo');
              announcementData.deceasedPhotoUrl = uploadResult.url;
            }
            // Handle gallery media
            else if (key.startsWith('media')) {
              console.log('Adding file to gallery');
              uploadedMedias.push({
                url: uploadResult.url,
                type: mediaService.determineMediaType(uploadResult.mimetype)
              });
            }
          } else {
            failedUploads.push({
              originalname: uploadResult.originalname,
              error: uploadResult.error || 'Une erreur inconnue est survenue lors de l\'upload'
            });
            console.error(`Échec de l'upload pour ${key}:`, uploadResult.error);
          }
        }
      }
    } else {
      // Cas d'une requête JSON standard
      body = await req.json();
      const b = body as Record<string, unknown>;
      announcementData = {
        title: b.title as string,
        description: b.description as string | undefined,
        type: b.type as AnnouncementType,
        deceasedName: b.deceasedName as string,
        deceasedBirthDate: b.deceasedBirthDate as string | undefined,
        deceasedDeathDate: b.deceasedDeathDate as string,
        deceasedPhotoUrl: b.deceasedPhotoUrl as string | undefined,
        // events is sent as a JSON string or array
        events: (() => {
          const val = b.events;
          if (typeof val === 'string') {
            try { return JSON.parse(val); } catch { return undefined; }
          }
          if (Array.isArray(val)) return val;
          return undefined;
        })(),
        mediaIds: b.mediaIds as string[] | undefined,
        relationship: b.relationship as string | undefined,
        bannerPresetId: b.bannerPresetId as string | undefined,
        bannerCustomUrl: b.bannerCustomUrl as string | undefined,
      };
      registrationFields = {
        registerName: b.registerName as string | undefined,
        registerEmail: b.registerEmail as string | undefined,
        registerPassword: b.registerPassword as string | undefined,
        registerConfirmPassword: b.registerConfirmPassword as string | undefined,
        registerPhoneNumber: b.registerPhoneNumber as string | undefined,
      };
    }

    // --- LOGIQUE INSCRIPTION SI NON CONNECTÉ ---
    if (!userId) {
      const regName = registrationFields.registerName;
      const regEmail = registrationFields.registerEmail;
      const regPassword = registrationFields.registerPassword;
      const regConfirmPassword = registrationFields.registerConfirmPassword;
      const regPhoneNumber = registrationFields.registerPhoneNumber;
      if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
        return NextResponse.json({ error: "Informations d'inscription manquantes." }, { status: 401 });
      }
      if (regPassword !== regConfirmPassword) {
        return NextResponse.json({ error: "Les mots de passe ne correspondent pas." }, { status: 401 });
      }
      try {
        await auth.api.signUpEmail({
          body: {
            email: regEmail,
            password: regPassword,
            name: regName,
          },
        });
        await auth.api.signInEmail({
          body: {
            email: regEmail,
            password: regPassword,
          },
        });
        const { userRepository } = await import('@/features/feature-auth/infrastructure/userRepository');
        const user = await userRepository.findByEmail(regEmail);
        if (!user?.id) {
          return NextResponse.json({ error: "Impossible de récupérer l'utilisateur après inscription." }, { status: 401 });
        }
        // Mettre à jour le numéro de téléphone si fourni
        if (regPhoneNumber) {
          await userRepository.updatePhoneNumber(user.id, regPhoneNumber);
        }
        userId = user.id;
      } catch {
        return NextResponse.json({ error: "Erreur lors de l'inscription automatique." }, { status: 401 });
      }
    }
    // --- FIN LOGIQUE INSCRIPTION ---

    const announcement = await announcementService.createAnnouncementWithMedia(
      announcementData, 
      uploadedMedias, 
      userId
    );

    // Ajouter les informations sur les uploads échoués à la réponse
    const response = {
      ...announcement,
      uploadStats: {
        successCount: uploadedMedias.length,
        failedCount: failedUploads.length,
        failedUploads: failedUploads.length > 0 ? failedUploads : undefined
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de l\'annonce';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 