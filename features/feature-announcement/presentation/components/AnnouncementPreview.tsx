"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Heart, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CreateAnnouncementFormData } from "../schemas";
import Image from "next/image";

interface AnnouncementPreviewProps {
  open: boolean;
  onClose: () => void;
  data: CreateAnnouncementFormData;
  onConfirm: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  bannerPreviewUrl?: string | null;
  deceasedPhotoPreview?: string | null;
  galleryPreviews?: string[];
}

export function AnnouncementPreview({
  open,
  onClose,
  data,
  onConfirm,
  isLoading = false,
  mode = 'create',
  bannerPreviewUrl,
  deceasedPhotoPreview,
  galleryPreviews = [],
}: AnnouncementPreviewProps) {
  // Map type to French label
  const typeLabels: Record<string, string> = {
    funeral: "Funérailles",
    anniversary: "Anniversaire",
    thanks: "Remerciements",
  };

  // Map type to color
  const typeColors: Record<string, string> = {
    funeral: "bg-gray-800 text-white",
    anniversary: "bg-blue-600 text-white",
    thanks: "bg-green-600 text-white",
  };

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifiée";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Get relationship display
  const getRelationshipDisplay = () => {
    if (data.relationship === 'Autre' && data.relationshipOther) {
      return data.relationshipOther;
    }
    return data.relationship;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-display">
                Prévisualisation de l&apos;annonce
              </DialogTitle>
              <DialogDescription className="mt-2">
                Vérifiez les informations avant de publier
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Banner Image or Color */}
          {bannerPreviewUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              {bannerPreviewUrl.startsWith('#') ? (
                // Solid color banner
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: bannerPreviewUrl }}
                />
              ) : (
                // Image banner
                <Image
                  src={bannerPreviewUrl}
                  alt="Bannière"
                  fill
                  className="object-cover"
                />
              )}
            </div>
          )}

          {/* Type Badge */}
          <div className="flex items-center gap-2">
            <Badge className={typeColors[data.type]}>
              {typeLabels[data.type]}
            </Badge>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-display font-bold text-gris-lavande">
              {data.title}
            </h1>
          </div>

          {/* Deceased Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                En mémoire de
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Deceased Photo */}
              {deceasedPhotoPreview && (
                <div className="flex justify-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={deceasedPhotoPreview}
                      alt={data.deceasedName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Deceased Name */}
              <div className="text-center">
                <p className="text-2xl font-display font-bold">
                  {data.deceasedPronoun} {data.deceasedName}
                </p>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {data.birthDate ? formatDate(data.birthDate) : "?"} - {formatDate(data.deathDate)}
                  </span>
                </div>
              </div>

              {/* Birth Place */}
              {data.birthPlace && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{data.birthPlace}</span>
                </div>
              )}

              {/* Relationship */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Annoncé par : {getRelationshipDisplay()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {data.description}
              </p>
            </CardContent>
          </Card>

          {/* Events/Ceremonies */}
          {data.events && data.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Programme des cérémonies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.events.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-lg">{event.name}</h4>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {event.date.from && formatDate(event.date.from)}
                            {event.date.to && ` - ${formatDate(event.date.to)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gallery */}
          {galleryPreviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Galerie de photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryPreviews.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={url}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Modifier
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <span className="mr-2">⏳</span>
                  {mode === 'edit' ? 'Mise à jour...' : 'Publication...'}
                </>
              ) : (
                mode === 'edit' ? "Mettre à jour l'annonce" : "Publier l'annonce"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
