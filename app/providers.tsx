'use client';

import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Composant Provider pour l'application
 * Wrap l'application avec les fournisseurs nécessaires
 */
export function Providers({ children }: ProvidersProps) {
  // betterAuth ne fournit pas directement un SessionProvider
  // Nous retournons donc simplement les enfants
  return <>{children}</>;
}
