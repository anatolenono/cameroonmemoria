"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { 
  CreateAnnouncementForm, 
  CreateAnnouncementFormData,
  announcementApiService 
} from "@/features/feature-announcement";

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (data: CreateAnnouncementFormData, files?: File[]) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Données envoyées:", data);
      console.log("Fichiers envoyés:", files?.length || 0);
      const result = await announcementApiService.createAnnouncement(data, files);
      console.log("Réponse de l'API:", result);
      console.log("ID de l'annonce:", result.id);
      
      // Afficher les statistiques d'upload si présentes
      if (result.uploadStats) {
        console.log("Stats d'upload:", result.uploadStats);
        if (result.uploadStats.failedCount > 0) {
          setError(`Annonce créée avec succès, mais ${result.uploadStats.failedCount} image(s) n'ont pas pu être téléversées.`);
        }
      }
      
      // Supprimer le brouillon après succès
      announcementApiService.clearDraft();
      
      // Afficher un message de succès
      if (!result.uploadStats || result.uploadStats.failedCount === 0) {
        setSuccess("Votre annonce a été créée avec succès ! Elle sera publiée après modération par notre équipe.");
      } else {
        setSuccess("Votre annonce a été créée et sera publiée après modération, mais certaines images n'ont pas pu être téléversées.");
      }
      
      // Vérifier que l'ID existe avant la redirection
      if (result.id) {
        // Rediriger vers la page de l'annonce après un délai
        setTimeout(() => {
          router.push(`/announcements/${result.id}`);
          location.reload();
        }, 2000);
      } else {
        console.error("ID manquant dans la réponse:", result);
        setError("L'annonce a été créée mais l'ID est manquant. Veuillez vérifier vos annonces.");
      }
      
    } catch (error) {
      console.error("Erreur lors de la création de l'annonce:", error);
      setError(error instanceof Error ? error.message : "Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = (data: CreateAnnouncementFormData, files?: File[]) => {
    try {
      announcementApiService.saveDraft(data);
      if (files && files.length > 0) {
        setSuccess(`Brouillon sauvegardé avec succès ! (${files.length} image(s) sélectionnée(s) - elles seront envoyées lors de la publication)`);
      } else {
        setSuccess("Brouillon sauvegardé avec succès !");
      }
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du brouillon:", error);
      setError("Impossible de sauvegarder le brouillon");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/announcements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux annonces
          </Link>
        </Button>
        
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">Créer une annonce</h1>
          <p className="font-body text-muted-foreground">
            Partagez un hommage ou une commémoration avec votre communauté
          </p>
        </div>
      </div>

      {/* Messages d'état */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Succès</span>
            </div>
            <p className="mt-2 text-sm text-green-700">{success}</p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <CreateAnnouncementForm
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isLoading={isLoading}
      />

      {/* Info - All announcements require moderation */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Note :</strong> Toutes les annonces seront examinées par notre équipe avant publication pour garantir la qualité et le respect de notre communauté.
            </p>
            <p>
              Vous recevrez une notification une fois votre annonce approuvée et publiée.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 