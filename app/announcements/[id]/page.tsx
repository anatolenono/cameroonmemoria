"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Share2,
  MessageCircle,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ImageIcon,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
  Flower2,
  Flame
} from "lucide-react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { announcementApiService, CreateAnnouncementResponse } from "@/features/feature-announcement";
import { condolenceApiService, CondolenceResponse } from "@/features/feature-condolence";
import { CreateCondolenceForm } from "@/features/feature-condolence/presentation/components/CreateCondolenceForm";
import { offeringApiService } from "@/features/feature-offering";
import { OfferingCounts } from "@/features/feature-offering/domain/types/offering";
import { useSession } from "@/lib/auth-client";

interface AnnouncementWithCondolences extends CreateAnnouncementResponse {
  views?: number;
  author?: string;
  authorContact?: {
    phone: string;
    email: string;
  };
  ceremonyAddress?: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AnnouncementDetailPage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [announcement, setAnnouncement] = useState<AnnouncementWithCondolences | null>(null);
  const [condolences, setCondolences] = useState<CondolenceResponse[]>([]);
  const [offeringCounts, setOfferingCounts] = useState<OfferingCounts>({ flowers: 0, candles: 0 });
  const [offeringSubmitting, setOfferingSubmitting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [condolencesLoading, setCondolencesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string>("");
  const [showCondolenceForm, setShowCondolenceForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [moderationLoading, setModerationLoading] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  // Detect payment success from query params
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      // Clean up the URL without reloading
      router.replace(`/announcements/${id}`, { scroll: false });
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => setShowPaymentSuccess(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, id, router]);

  // Handle share functionality
  const handleShare = async () => {
    if (!announcement) return;

    const shareData = {
      title: announcement.title,
      text: `Hommage à ${announcement.deceasedName}`,
      url: window.location.href,
    };

    try {
      // Try using native Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papiers !');
      }
    } catch (error) {
      // User canceled or error occurred
      console.log('Partage annulé ou erreur:', error);
    }
  };

  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/admin/stats');
          setIsAdmin(response.ok);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer l'annonce, les condoléances et les offrandes en parallèle
        const [announcementData, condolencesData, offeringCountsData] = await Promise.all([
          announcementApiService.getAnnouncementById(id),
          condolenceApiService.getCondolencesByAnnouncementId(id, {
            isApproved: true,
            limit: 6
          }).catch(error => {
            console.warn("Erreur lors de la récupération des condoléances:", error);
            return { condolences: [], total: 0, limit: 0, offset: 0 };
          }),
          offeringApiService.getCountsByAnnouncementId(id).catch(error => {
            console.warn("Erreur lors de la récupération des offrandes:", error);
            return { flowers: 0, candles: 0 };
          })
        ]);

        // Ajouter des données mockées pour les champs non disponibles dans l'API
        const enhancedData: AnnouncementWithCondolences = {
          ...announcementData,
          views: 45,
          author: announcementData.isAnonymous
            ? "Anonyme"
            : (announcementData.relationship || "Famille") + " " + announcementData.deceasedName.split(' ').pop(),
          authorContact: {
            phone: "+237 6XX XXX XXX",
            email: "contact@example.com"
          },
          ceremonyAddress: announcementData.ceremonyLocation ? `${announcementData.ceremonyLocation}, Cameroun` : undefined,
        };

        setAnnouncement(enhancedData);
        setCondolences(condolencesData.condolences);
        setOfferingCounts(offeringCountsData);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'annonce:", error);
        if (error instanceof Error && error.message === "Annonce non trouvée") {
          notFound();
        } else {
          setError(error instanceof Error ? error.message : "Une erreur est survenue");
        }
      } finally {
        setLoading(false);
        setCondolencesLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const refreshCondolences = async () => {
    if (!id) return;
    
    try {
      setCondolencesLoading(true);
      const condolencesData = await condolenceApiService.getCondolencesByAnnouncementId(id, { 
        isApproved: true,
        limit: 50 
      });
      setCondolences(condolencesData.condolences);
    } catch (error) {
      console.warn("Erreur lors de la récupération des condoléances:", error);
    } finally {
      setCondolencesLoading(false);
    }
  };

  const handleCondolenceSuccess = () => {
    setShowCondolenceForm(false);
    refreshCondolences();
  };

  const handleShowCondolenceForm = () => {
    setShowCondolenceForm(true);
  };

  const handleCancelCondolenceForm = () => {
    setShowCondolenceForm(false);
  };

  const handleOffering = async (type: 'FLOWER' | 'CANDLE') => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (offeringSubmitting) return;

    setOfferingSubmitting(type);
    // Optimistic update
    setOfferingCounts(prev => ({
      flowers: type === 'FLOWER' ? prev.flowers + 1 : prev.flowers,
      candles: type === 'CANDLE' ? prev.candles + 1 : prev.candles,
    }));

    try {
      await offeringApiService.createOffering(type, id);
    } catch (error) {
      console.error('Erreur lors du dépôt de l\'offrande:', error);
      // Revert optimistic update
      setOfferingCounts(prev => ({
        flowers: type === 'FLOWER' ? prev.flowers - 1 : prev.flowers,
        candles: type === 'CANDLE' ? prev.candles - 1 : prev.candles,
      }));
    } finally {
      setOfferingSubmitting(null);
    }
  };

  const handleOpenCarousel = (index: number) => {
    setCurrentImageIndex(index);
    setIsCarouselOpen(true);
  };

  const handleNextImage = () => {
    const mediaLength = announcement?.media?.length ?? 0;
    if (mediaLength > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % mediaLength);
    }
  };

  const handlePrevImage = () => {
    const mediaLength = announcement?.media?.length ?? 0;
    if (mediaLength > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + mediaLength) % mediaLength);
    }
  };

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!isCarouselOpen || !announcement?.media) return;

    const mediaLength = announcement.media.length;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % mediaLength);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + mediaLength) % mediaLength);
      }
      if (e.key === 'Escape') {
        setIsCarouselOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isCarouselOpen, announcement?.media]);

  const handleApprove = async () => {
    if (!announcement) return;
    
    try {
      setModerationLoading("approve");
      
      const response = await fetch(`/api/announcements/${announcement.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'approbation');
      }

      // Recharger les données depuis l'API
      const updatedData = await announcementApiService.getAnnouncementById(announcement.id);
      const enhancedData: AnnouncementWithCondolences = {
        ...updatedData,
        views: announcement.views,
        author: updatedData.isAnonymous
          ? "Anonyme"
          : (updatedData.relationship || "Famille") + " " + updatedData.deceasedName.split(' ').pop(),
        authorContact: announcement.authorContact,
        ceremonyAddress: announcement.ceremonyAddress,
      };
      setAnnouncement(enhancedData);
      alert("Annonce approuvée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      alert("Erreur lors de l'approbation de l'annonce");
    } finally {
      setModerationLoading(null);
    }
  };

  const handleReject = async () => {
    if (!announcement) return;
    
    const reason = prompt("Veuillez indiquer la raison du rejet :");
    if (!reason) return;
    
    try {
      setModerationLoading("reject");
      
      const response = await fetch(`/api/announcements/${announcement.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du rejet');
      }

      // Recharger les données depuis l'API
      const updatedData = await announcementApiService.getAnnouncementById(announcement.id);
      const enhancedData: AnnouncementWithCondolences = {
        ...updatedData,
        views: announcement.views,
        author: updatedData.isAnonymous
          ? "Anonyme"
          : (updatedData.relationship || "Famille") + " " + updatedData.deceasedName.split(' ').pop(),
        authorContact: announcement.authorContact,
        ceremonyAddress: announcement.ceremonyAddress,
      };
      setAnnouncement(enhancedData);
      alert("Annonce rejetée avec succès !");
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      alert("Erreur lors du rejet de l'annonce");
    } finally {
      setModerationLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Clock className="w-3 h-3 mr-1" />
            En attente de modération
          </Badge>
        );
      case "PUBLISHED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Publié
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement de l&apos;annonce...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" asChild>
          <Link href="/announcements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux annonces
          </Link>
        </Button>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!announcement) {
    notFound();
  }

  const ceremonyDate = announcement.ceremonyDate ? new Date(announcement.ceremonyDate) : null;
  const birthDate = announcement.deceasedBirthDate ? new Date(announcement.deceasedBirthDate) : null;
  const deathDate = new Date(announcement.deceasedDeathDate);
  
  const age = birthDate ? deathDate.getFullYear() - birthDate.getFullYear() : null;
  console.log("announcement", announcement);

  return (
    <div className="min-h-screen">
      {/* Payment success alert */}
      {showPaymentSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <Alert className="bg-green-50 border-green-200 text-green-800 shadow-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Donation effectuée avec succès !</AlertTitle>
            <AlertDescription>
              Merci pour votre générosité. Votre donation a bien été enregistrée.
            </AlertDescription>
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="absolute top-2 right-2 text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        </div>
      )}

      {/* Full-width Banner Hero */}
      {(announcement.bannerPreset?.imageUrl || announcement.bannerCustomUrl || (announcement.media && announcement.media.length > 0)) && (
        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] mb-12">
          <Image
            src={
              announcement.bannerPreset?.imageUrl ||
              announcement.bannerCustomUrl ||
              (announcement.media && announcement.media[0]?.url) ||
              ''
            }
            alt={`Bannière - ${announcement.title}`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Dark gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

          {/* Title and metadata overlay on banner */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 sm:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge
                  className={
                    announcement.type === 'FUNERAL'
                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-100'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                  }
                >
                  {announcement.type === 'FUNERAL' ? 'Funérailles' : 'Anniversaire'}
                </Badge>
                {getStatusBadge(announcement.status)}
              </div>
              <h1 className="font-deceased text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
                {announcement.title}
              </h1>
              <p className="text-white/90 text-lg drop-shadow">
                Publié par {announcement.author}
              </p>
            </div>
          </div>

          {/* Back button overlay (top-left) */}
          <div className="absolute top-6 left-6 sm:left-12 lg:left-20">
            <Button variant="secondary" asChild className="bg-white/90 hover:bg-white backdrop-blur-sm">
              <Link href="/announcements">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>

          {/* Action buttons overlay (top-right) */}
          <div className="absolute top-6 right-6 sm:right-12 lg:right-20 flex items-center gap-3">
            {/* Boutons de modération pour les administrateurs */}
            {isAdmin && announcement.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={moderationLoading !== null}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {moderationLoading === 'approve' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approuver
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={moderationLoading !== null}
                >
                  {moderationLoading === 'reject' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeter
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Share button */}
            <Button
              variant="secondary"
              size="sm"
              aria-label="Partager"
              className="bg-white/90 hover:bg-white backdrop-blur-sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pb-16">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
          {/* Description */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <Heart className="mr-2 h-6 w-6" />
                Hommage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="prose prose-base max-w-none leading-relaxed">
                {announcement.description ? (
                  announcement.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-6 last:mb-0 text-base leading-relaxed break-words overflow-wrap-anywhere">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground">Aucune description disponible.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar sections for mobile only (Donation, Person Info) */}
          <div className="space-y-8 block lg:hidden">
            {/* Donation Button */}
            <Card className="border-2 border-primary shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <Button
                  className="w-full h-16 text-lg font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                  asChild
                >
                  <Link href={`/donations/${id}`}>
                    <Heart className="h-6 w-6 fill-white" />
                    Faire un don
                  </Link>
                </Button>
              </CardContent>
            </Card>
            {/* Virtual Offerings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Flower2 className="mr-2 h-5 w-5" />
                  Offrandes virtuelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between h-12"
                  onClick={() => handleOffering('FLOWER')}
                  disabled={offeringSubmitting !== null}
                >
                  <span className="flex items-center gap-2">
                    <Flower2 className="h-5 w-5 text-pink-500" />
                    Déposer une fleur
                  </span>
                  <Badge variant="secondary">{offeringCounts.flowers}</Badge>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12"
                  onClick={() => handleOffering('CANDLE')}
                  disabled={offeringSubmitting !== null}
                >
                  <span className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-amber-500" />
                    Allumer une bougie
                  </span>
                  <Badge variant="secondary">{offeringCounts.candles}</Badge>
                </Button>
              </CardContent>
            </Card>
            {/* Person Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcement.deceasedPhotoUrl && (
                  <div className="mb-4">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border shadow-md">
                      <Image
                        src={announcement.deceasedPhotoUrl}
                        alt={announcement.deceasedName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg mb-2">{announcement.deceasedName}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {birthDate && (
                      <div>
                        <span className="font-medium">Né(e) le:</span>{' '}
                        {birthDate.toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Décédé(e) le:</span>{' '}
                      {deathDate.toLocaleDateString('fr-FR')}
                    </div>
                    {age && (
                      <div>
                        <span className="font-medium">Âge:</span> {age} ans
                      </div>
                    )}
                    {announcement.relationship && (isAdmin || announcement.userId === session?.user?.id) && (
                      <div>
                        <span className="font-medium">Lien avec le défunt :</span>{' '}
                        {announcement.relationship}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Timeline */}
          {announcement.events && announcement.events.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="mr-2 h-6 w-6" />
                  Programme des Cérémonies
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  {announcement.events.map((event, idx) => (
                    <div
                      key={idx}
                      className="relative flex gap-6 group"
                    >
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary shadow-sm group-hover:scale-110 transition-transform">
                          <div className="w-4 h-4 rounded-full bg-primary" />
                        </div>
                        {idx < (announcement.events?.length ?? 0) - 1 && (
                          <div className="w-0.5 h-full min-h-[40px] bg-gradient-to-b from-primary/50 to-primary/10 mt-2" />
                        )}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 pb-6">
                        <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors border border-border/50">
                          <h3 className="font-semibold text-lg text-foreground mb-3 leading-tight">
                            {event.name}
                          </h3>

                          <div className="space-y-2.5">
                            {/* Date */}
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground/90">
                                  {event.date.from && (
                                    <>
                                      {new Date(event.date.from).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                      })}
                                      {event.date.to && event.date.to !== event.date.from && (
                                        <>
                                          {' '}
                                          <span className="text-muted-foreground">au</span>{' '}
                                          {new Date(event.date.to).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                          })}
                                        </>
                                      )}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground/90 break-words">
                                  {event.location}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Galerie d'images - Modern Masonry Grid */}
          {announcement.media && announcement.media.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <ImageIcon className="mr-2 h-6 w-6" />
                  Galerie Photos ({announcement.media.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {/* Dynamic grid with varying sizes for visual interest */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {announcement.media.map((media, index) => {
                    // Create visual hierarchy: first image is larger, some are taller
                    const isFirst = index === 0;
                    const isTall = index % 5 === 2;
                    const isWide = index % 7 === 4 && (announcement.media?.length ?? 0) > 4;

                    return (
                      <div
                        key={media.id}
                        onClick={() => handleOpenCarousel(index)}
                        className={`
                          relative rounded-xl overflow-hidden border border-border/50
                          cursor-pointer group hover:border-primary transition-all duration-300
                          hover:shadow-xl hover:scale-[1.02]
                          ${isFirst ? 'md:col-span-2 md:row-span-2' : ''}
                          ${isTall && !isFirst ? 'row-span-2' : ''}
                          ${isWide && !isFirst ? 'col-span-2' : ''}
                          ${!isFirst && !isTall && !isWide ? 'aspect-square' : ''}
                          ${isFirst ? 'aspect-[4/3]' : ''}
                        `}
                      >
                        <Image
                          src={media.url}
                          alt={`Photo ${index + 1} - ${announcement.title}`}
                          className="object-cover transition-all duration-500 group-hover:scale-110"
                          fill
                          sizes={isFirst ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
                        />
                        {/* Hover overlay with zoom icon */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <ZoomIn className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        {/* Photo number badge */}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          {index + 1}/{announcement.media?.length ?? 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Immersive Carousel Modal */}
          {isCarouselOpen && announcement.media && announcement.media.length > 0 && (
            <div
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setIsCarouselOpen(false)}
            >
              {/* Close button */}
              <button
                onClick={() => setIsCarouselOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all"
                aria-label="Fermer"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Image counter */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
                {currentImageIndex + 1} / {announcement.media.length}
              </div>

              {/* Previous button */}
              {announcement.media.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-2 sm:left-4 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all hover:scale-110"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
              )}

              {/* Main image */}
              <div
                className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 md:p-12"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-full max-w-7xl max-h-full">
                  <Image
                    src={announcement.media[currentImageIndex].url}
                    alt={`Photo ${currentImageIndex + 1} - ${announcement.title}`}
                    className="object-contain"
                    fill
                    sizes="100vw"
                    priority
                  />
                </div>
              </div>

              {/* Next button */}
              {announcement.media.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-2 sm:right-4 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all hover:scale-110"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
              )}

              {/* Thumbnail strip at bottom (desktop only) */}
              {announcement.media.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 hidden md:flex gap-2 px-4 py-3 rounded-full bg-black/50 backdrop-blur-sm max-w-[90vw] overflow-x-auto">
                  {announcement.media.map((media, index) => (
                    <button
                      key={media.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-white scale-110'
                          : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={media.url}
                        alt={`Miniature ${index + 1}`}
                        className="object-cover"
                        fill
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Condolences */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between flex-wrap gap-2 text-xl">
                <div className="flex items-center">
                  <MessageCircle className="mr-2 h-6 w-6" />
                  Condoléances ({condolences.length})
                  {condolencesLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </div>
                {/* Only show the button if there is at least one condolence */}
                {!showCondolenceForm && condolences.length > 0 && (
                  <Button size="sm" onClick={handleShowCondolenceForm} className="w-full sm:w-auto">
                    Laisser un message
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {showCondolenceForm && (
                <div className="mb-6">
                  <CreateCondolenceForm
                    announcementId={id}
                    onSuccess={handleCondolenceSuccess}
                    onCancel={handleCancelCondolenceForm}
                  />
                </div>
              )}
              {condolencesLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Chargement des condoléances...</p>
                </div>
              ) : condolences.length > 0 ? (
                <>
                  {condolences.slice(0, 5).map((condolence) => (
                    <div key={condolence.id} className="border-l-4 border-primary/30 pl-6 py-4 bg-muted/30 rounded-r-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-base">
                          {condolence.isAnonymous
                            ? 'Anonyme'
                            : condolence.user?.name || 'Utilisateur'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(condolence.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-base text-foreground/80 leading-relaxed">{condolence.message}</p>
                    </div>
                  ))}
                  {condolences.length > 5 && (
                    <div className="text-center mt-6 pt-4 border-t">
                      <Link
                        href={`/announcements/${id}/condolences`}
                        className="text-primary hover:text-primary/80 underline text-base font-medium"
                      >
                        Voir toutes les condoléances ({condolences.length})
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p className="text-base mb-6">Aucun message de condoléances pour le moment.</p>
                  <Button className="mt-2 w-full sm:w-auto h-12 text-base font-semibold px-8" onClick={handleShowCondolenceForm}>
                    Laisser un message
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (desktop only) */}
        <div className="space-y-8 hidden lg:block lg:sticky lg:top-8">
          {/* Donation Section - always first in sidebar */}
          <Card className="border-2 border-primary shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <Button
                className="w-full h-16 text-lg font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                asChild
              >
                <Link href={`/donations/${id}`}>
                  <Heart className="h-6 w-6 fill-white" />
                  Faire un don
                </Link>
              </Button>
            </CardContent>
          </Card>
          {/* Virtual Offerings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Flower2 className="mr-2 h-5 w-5" />
                Offrandes virtuelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between h-12"
                onClick={() => handleOffering('FLOWER')}
                disabled={offeringSubmitting !== null}
              >
                <span className="flex items-center gap-2">
                  <Flower2 className="h-5 w-5 text-pink-500" />
                  Déposer une fleur
                </span>
                <Badge variant="secondary">{offeringCounts.flowers}</Badge>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between h-12"
                onClick={() => handleOffering('CANDLE')}
                disabled={offeringSubmitting !== null}
              >
                <span className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-500" />
                  Allumer une bougie
                </span>
                <Badge variant="secondary">{offeringCounts.candles}</Badge>
              </Button>
            </CardContent>
          </Card>
          {/* Person Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcement.deceasedPhotoUrl && (
                <div className="mb-4">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border shadow-md">
                    <Image
                      src={announcement.deceasedPhotoUrl}
                      alt={announcement.deceasedName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg mb-2">{announcement.deceasedName}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {birthDate && (
                    <div>
                      <span className="font-medium">Né(e) le:</span>{' '}
                      {birthDate.toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Décédé(e) le:</span>{' '}
                    {deathDate.toLocaleDateString('fr-FR')}
                  </div>
                  {age && (
                    <div>
                      <span className="font-medium">Âge:</span> {age} ans
                    </div>
                  )}
                  {announcement.relationship && (isAdmin || announcement.userId === session?.user?.id) && (
                    <div>
                      <span className="font-medium">Lien avec le défunt :</span>{' '}
                      {announcement.relationship}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ceremony Info and actions remain here for desktop */}
          {ceremonyDate && announcement.ceremonyLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Cérémonie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {ceremonyDate.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ceremonyDate.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{announcement.ceremonyLocation}</div>
                      {announcement.ceremonyAddress && (
                        <div className="text-sm text-muted-foreground">
                          {announcement.ceremonyAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
} 