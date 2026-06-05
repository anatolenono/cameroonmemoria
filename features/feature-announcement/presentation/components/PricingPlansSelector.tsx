'use client';

import { AnnouncementPlan } from '@/features/feature-announcement/domain/types/announcement';
import { ANNOUNCEMENT_PLANS } from '@/features/feature-announcement/domain/types/pricing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingPlansSelectorProps {
  selectedPlan: AnnouncementPlan;
  onSelectPlan: (plan: AnnouncementPlan) => void;
  disabled?: boolean;
}

export function PricingPlansSelector({
  selectedPlan,
  onSelectPlan,
  disabled = false,
}: PricingPlansSelectorProps) {
  const plans = Object.values(ANNOUNCEMENT_PLANS);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                'p-4 cursor-pointer transition-all border-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary'
              )}
              onClick={() => !disabled && onSelectPlan(plan.id)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()} F CFA`}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>

                <p className="text-xs text-muted-foreground">{plan.description}</p>

                <div className="space-y-2">
                  <div className="text-xs font-medium">Inclus :</div>
                  <ul className="space-y-1 text-xs">
                    {plan.features.photoCount >= 1 && (
                      <li className="flex items-center gap-1">
                        <span className="text-primary">✓</span>
                        {plan.features.photoCount === 1
                          ? 'Photo unique'
                          : plan.features.photoCount === Infinity
                            ? 'Galerie illimitée'
                            : `Galerie (${plan.features.photoCount} photos)`}
                      </li>
                    )}
                    {plan.features.photoModifiable && (
                      <li className="flex items-center gap-1">
                        <span className="text-primary">✓</span>
                        Photo modifiable
                      </li>
                    )}
                    {plan.features.detailedCeremonySchedule && (
                      <li className="flex items-center gap-1">
                        <span className="text-primary">✓</span>
                        Déroulé obsèques détaillé
                      </li>
                    )}
                    {plan.features.videos && (
                      <li className="flex items-center gap-1">
                        <span className="text-primary">✓</span>
                        Vidéos
                      </li>
                    )}
                    {plan.features.biography && (
                      <li className="flex items-center gap-1">
                        <span className="text-primary">✓</span>
                        Biographie
                      </li>
                    )}
                    {plan.features.testimonies && (
                      <li className="flex items-center gap-1">
                        <span className="text-primary">✓</span>
                        Témoignages
                      </li>
                    )}
                    {plan.features.literaryAlbum && (
                      <li className="flex items-center gap-1">
                        <span className="text-primary">✓</span>
                        Livre d&apos;or
                      </li>
                    )}
                    {plan.features.fundraiser && (
                      <li className="flex items-center gap-1">
                        <span className="text-primary">✓</span>
                        Cagnotte
                      </li>
                    )}
                    {plan.features.livestream && (
                      <li className="flex items-center gap-1">
                        <span className="text-primary">✓</span>
                        Livestream
                      </li>
                    )}
                  </ul>
                </div>

                {plan.id === AnnouncementPlan.FREE && (
                  <Badge variant="outline" className="w-full justify-center">
                    Recommandé pour débuter
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Vous pouvez upgrader votre plan à tout moment après création de l'annonce.
      </p>
    </div>
  );
}
