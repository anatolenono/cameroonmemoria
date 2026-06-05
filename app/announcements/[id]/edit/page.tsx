"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, ShieldX } from "lucide-react";
import { CreateAnnouncementForm, CreateAnnouncementFormData, announcementApiService } from "@/features/feature-announcement";
import type { EditContext } from "@/features/feature-announcement/presentation/components/CreateAnnouncementForm";
import { AnnouncementAdminsManager } from "@/features/feature-announcement/presentation/components/AnnouncementAdminsManager";
import { useSession } from "@/lib/auth-client";

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const id = String((params as Record<string, string>).id);
  const { data: session, isPending: sessionLoading } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<CreateAnnouncementFormData | null>(null);
  const [editContext, setEditContext] = useState<EditContext | undefined>(undefined);
  const [unauthorized, setUnauthorized] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (sessionLoading || !session) return;
    let active = true;
    const load = async () => {
      try {
        const a = await announcementApiService.getAnnouncementById(id);
        if (!active) return;

        // Check ownership: only the author or an admin can edit
        const userRole = (session.user as Record<string, unknown>).role as string | undefined;
        if (a.userId !== session.user.id && userRole !== "ADMIN") {
          setUnauthorized(true);
          return;
        }

        // Map API response to form data
        const mapped: CreateAnnouncementFormData = {
          type: (a.type || "FUNERAL").toLowerCase() as "death_notice" | "funeral" | "anniversary" | "thanks",
          title: a.title || "",
          description: a.description || "",
          deceasedName: a.deceasedName || "",
          deceasedPronoun: (a.deceasedPronoun as "M." | "Mme" | "Mlle") || "M.",
          birthDate: a.deceasedBirthDate || undefined,
          birthPlace: a.deceasedBirthPlace || "",
          deathDate: a.deceasedDeathDate,
          relationship: a.relationship || "",
          relationshipOther: "",
          bannerPresetId: a.bannerPresetId || undefined,
          bannerCustomUrl: a.bannerCustomUrl || undefined,
          events: Array.isArray(a.events) && a.events.length > 0
            ? a.events.map((event: { date: { from?: string; to?: string }; name: string; location: string }) => ({
                date: {
                  from: event.date?.from || "",
                  to: event.date?.to || "",
                },
                name: event.name || "",
                location: event.location || "",
              }))
            : [{
                date: { from: a.ceremonyDate || "", to: "" },
                name: "",
                location: a.ceremonyLocation || "",
              }],
        };

        // Build edit context for banner and media
        const context: EditContext = {
          bannerPresetId: a.bannerPresetId || undefined,
          bannerCustomUrl: a.bannerCustomUrl || undefined,
          bannerPresetImageUrl: a.bannerPreset?.imageUrl || undefined,
          deceasedPhotoUrl: a.deceasedPhotoUrl || undefined,
          existingMedia: Array.isArray(a.media)
            ? a.media.map((m: { id: string; url: string; type: string }) => ({
                id: m.id,
                url: m.url,
                type: m.type,
              }))
            : undefined,
        };

        setEditContext(context);
        setInitialData(mapped);
      } catch {
        setError("Impossible de charger l'annonce");
      }
    };
    if (id) load();
    return () => { active = false; };
  }, [id, session, sessionLoading]);

  const handleSubmit = async (data: CreateAnnouncementFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await announcementApiService.updateAnnouncement(id, data);
      setSuccess("Annonce mise à jour avec succès");
      // After a short delay, go back to detail or my list
      setTimeout(() => {
        router.push(`/announcements/${id}`);
        router.refresh();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // For edit, skip draft saving
  };

  if (sessionLoading || !session) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center space-y-4">
            <ShieldX className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous n&apos;êtes pas autorisé à modifier cette annonce.
            </p>
            <Button asChild variant="outline">
              <Link href="/announcements/my">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à mes annonces
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href="/announcements/my">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à mes annonces
          </Link>
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="py-3 text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </CardContent>
        </Card>
      )}

      {success && (
        <Card>
          <CardContent className="py-3 text-green-600 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> {success}
          </CardContent>
        </Card>
      )}

      {initialData && (
        <>
          <CreateAnnouncementForm
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            isLoading={isLoading}
            initialValues={initialData}
            mode="edit"
            editContext={editContext}
          />

          <AnnouncementAdminsManager
            announcementId={id}
            isCreator={true}
          />
        </>
      )}
    </div>
  );
}
