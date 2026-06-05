'use client';

import { Calendar, MessageCircle, MapPin, Flower2, Flame } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AnnouncementCardProps {
  id: string;
  type: 'death_notice' | 'funeral' | 'anniversary' | 'thanks';
  name: string;
  pronoun?: string;
  dateOfBirth?: string;
  dateOfDeath: string;
  location?: string;
  funeralDate?: string;
  description: string;
  imageUrl?: string;
  condolenceCount?: number;
  donationAmount?: number;
  flowerCount?: number;
  candleCount?: number;
  timeAgo: string;
  isAnonymous?: boolean;
}

export function AnnouncementCard({
  id,
  type,
  name,
  pronoun,
  dateOfBirth,
  dateOfDeath,
  location,
  funeralDate,
  imageUrl,
  condolenceCount = 0,
  flowerCount = 0,
  candleCount = 0,
  isAnonymous = false,
}: AnnouncementCardProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'death_notice':
        return { label: 'Avis de décès', className: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'funeral':
        return { label: 'Funérailles', className: 'bg-gris-lavande/10 text-gris-lavande border-gris-lavande/20' };
      case 'anniversary':
        return { label: 'Anniversaire', className: 'bg-kaki-doux/20 text-gris-lavande border-kaki-doux/30' };
      case 'thanks':
        return { label: 'Remerciements', className: 'bg-peche-claire/30 text-gris-lavande border-peche-claire/40' };
      default:
        return { label: type, className: 'bg-sable-clair text-gris-lavande border-sable-clair' };
    }
  };

  const years = dateOfBirth
    ? `${new Date(dateOfBirth).getFullYear()} — ${new Date(dateOfDeath).getFullYear()}`
    : new Date(dateOfDeath).getFullYear().toString();

  const deathDateFormatted = new Date(dateOfDeath).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const badge = getTypeBadge(type);

  return (
    <Link href={`/announcements/${id}`} className="block group">
      <Card className="relative overflow-visible bg-white hover:shadow-xl transition-all duration-300 border-sable-clair/50">
        {/* Type Badge - top left, overlapping */}
        <div className="absolute -top-3 left-4 z-10">
          <Badge
            variant="outline"
            className={`font-body text-xs px-3 py-1 shadow-sm bg-white ${badge.className}`}
          >
            {badge.label}
          </Badge>
        </div>

        {/* Circular Profile Image */}
        <div className="relative -mt-14 mb-3 flex justify-center">
          <div className="relative h-28 w-28 rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-gradient-to-br from-sable-clair to-peche-claire group-hover:shadow-xl transition-shadow">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Flower2 className="h-12 w-12 text-terre-cuite/40" />
              </div>
            )}
          </div>
        </div>

        <CardContent className="pt-0 pb-5 px-5">
          {/* Name + years */}
          <div className="text-center mb-3">
            <h3 className="font-deceased text-xl font-bold text-gris-lavande leading-tight">
              {isAnonymous ? 'Annonce anonyme' : pronoun ? `${pronoun} ${name}` : name}
            </h3>
            <p className="font-body text-sm text-muted-foreground mt-1">{years}</p>
          </div>

          {/* Location + Death date - compact row */}
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground mb-4">
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-terre-cuite/70" />
                <span className="font-body truncate max-w-[200px]">{location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-terre-cuite/70" />
              <span className="font-body">{deathDateFormatted}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-sable-clair/60 mb-4" />

          {/* Stats row - offerings, condolences, ceremony */}
          <div className="flex items-center justify-center gap-5">
            {/* Flowers */}
            <div className="flex items-center gap-1.5" title="Fleurs déposées">
              <Flower2 className="h-4 w-4 text-pink-500/80" />
              <span className="font-body text-xs font-medium text-gris-lavande">{flowerCount}</span>
            </div>

            {/* Candles */}
            <div className="flex items-center gap-1.5" title="Bougies allumées">
              <Flame className="h-4 w-4 text-amber-500/80" />
              <span className="font-body text-xs font-medium text-gris-lavande">{candleCount}</span>
            </div>

            {/* Condolences */}
            <div className="flex items-center gap-1.5" title="Messages de condoléances">
              <MessageCircle className="h-4 w-4 text-terre-cuite/70" />
              <span className="font-body text-xs font-medium text-gris-lavande">{condolenceCount}</span>
            </div>

            {/* Funeral Date */}
            {funeralDate && (
              <div className="flex items-center gap-1.5" title="Date de cérémonie">
                <Calendar className="h-4 w-4 text-terre-cuite/70" />
                <span className="font-body text-xs font-medium text-gris-lavande">
                  {new Date(funeralDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
