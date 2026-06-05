"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
  Eye,
  Mail
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { announcementApiService } from "@/features/feature-announcement";

interface AnnouncementDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  isAnonymous: boolean;
  deceasedName: string;
  deceasedBirthDate: string | null;
  deceasedDeathDate: string;
  ceremonyDate: string | null;
  ceremonyLocation: string | null;
  createdAt: string;
  updatedAt: string;
  submitterName?: string;
  submitterEmail?: string;
  userId?: string | null;
}

export default function AdminAnnouncementDetailPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const announcementId = params.id as string;

  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [moderationNotes, setModerationNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAnnouncementDetail = useCallback(async () => {
    try {
      setLoading(true);
      
      // Utiliser l'API existante pour récupérer les détails
      const response = await announcementApiService.getAnnouncementById(announcementId);
      
      if (response) {
        setAnnouncement({
          id: response.id,
          title: response.title,
          description: response.description || null,
          type: response.type,
          status: response.status,
          isAnonymous: response.isAnonymous,
          deceasedName: response.deceasedName,
          deceasedBirthDate: response.deceasedBirthDate || null,
          deceasedDeathDate: response.deceasedDeathDate,
          ceremonyDate: response.ceremonyDate || null,
          ceremonyLocation: response.ceremonyLocation || null,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
          submitterName: response.isAnonymous ? "Anonyme" : "Utilisateur",
          submitterEmail: response.isAnonymous ? undefined : "email@example.com"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'annonce:", error);
    } finally {
      setLoading(false);
    }
  }, [announcementId]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      fetchAnnouncementDetail();
    }
  }, [session, isPending, router, fetchAnnouncementDetail]);

  const handleApprove = async () => {
    try {
      setActionLoading("approve");
      
      const response = await fetch(`/api/announcements/${announcementId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moderationNotes: moderationNotes || undefined
        })
      });

      if (response.ok) {
        setAnnouncement(prev => prev ? { ...prev, status: "PUBLISHED" } : null);
        alert("Annonce approuvée avec succès !");
      } else {
        throw new Error("Erreur lors de l'approbation");
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      alert("Erreur lors de l'approbation de l'annonce");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!moderationNotes.trim()) {
      alert("Veuillez fournir une raison pour le rejet");
      return;
    }

    try {
      setActionLoading("reject");
      
      const response = await fetch(`/api/announcements/${announcementId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: moderationNotes
        })
      });

      if (response.ok) {
        setAnnouncement(prev => prev ? { ...prev, status: "REJECTED" } : null);
        alert("Annonce rejetée avec succès !");
      } else {
        throw new Error("Erreur lors du rejet");
      }
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      alert("Erreur lors du rejet de l'annonce");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case "PUBLISHED":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Publié</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "FUNERAL":
        return "Funérailles";
      case "ANNIVERSARY":
        return "Anniversaire";
      case "MEMORIAL":
        return "Mémorial";
      default:
        return type;
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Annonce non trouvée</h3>
              <p className="text-gray-600 mb-4">L&apos;annonce demandée n&apos;existe pas ou a été supprimée.</p>
              <Link href="/admin/announcements">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la liste
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin/announcements">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Détail de l&apos;annonce</h1>
              <p className="text-gray-600">Modération et gestion</p>
            </div>
          </div>
          {getStatusBadge(announcement.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de l'annonce */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{announcement.title}</span>
                  <Badge variant="secondary">{getTypeLabel(announcement.type)}</Badge>
                </CardTitle>
                <CardDescription>
                  Soumise le {new Date(announcement.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcement.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{announcement.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Défunt(e)
                    </h4>
                    <p className="text-gray-700">{announcement.deceasedName}</p>
                    {announcement.deceasedBirthDate && (
                      <p className="text-sm text-gray-500">
                        Né(e) le {new Date(announcement.deceasedBirthDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Décédé(e) le {new Date(announcement.deceasedDeathDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {announcement.ceremonyDate && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Cérémonie
                      </h4>
                      <p className="text-gray-700">
                        {new Date(announcement.ceremonyDate).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {announcement.ceremonyLocation && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {announcement.ceremonyLocation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions de modération */}
          <div className="space-y-6">
            {/* Informations du soumissionnaire */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Soumissionnaire</CardTitle>
              </CardHeader>
              <CardContent>
                {announcement.isAnonymous ? (
                  <div className="text-center py-4">
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Soumission anonyme</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{announcement.submitterName}</span>
                    </div>
                    {announcement.submitterEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{announcement.submitterEmail}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions de modération */}
            {announcement.status === "PENDING" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions de modération</CardTitle>
                  <CardDescription>
                    Approuver ou rejeter cette annonce
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="moderationNotes">Notes de modération</Label>
                    <Input
                      id="moderationNotes"
                      placeholder="Ajoutez des notes ou commentaires..."
                      value={moderationNotes}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModerationNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={handleApprove}
                      disabled={actionLoading !== null}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === "approve" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approuver
                    </Button>

                    <Button
                      onClick={handleReject}
                      disabled={actionLoading !== null}
                      variant="destructive"
                    >
                      {actionLoading === "reject" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Rejeter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aperçu public */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aperçu public</CardTitle>
                <CardDescription>
                  Voir comment cette annonce apparaîtra aux utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/announcements/${announcement.id}`} target="_blank">
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir l&apos;aperçu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 