import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Composant pour le header de page
export function PageHeaderSkeleton({ showBackButton = false }: { showBackButton?: boolean }) {
  return (
    <div className="space-y-3">
      {showBackButton && <Skeleton className="h-9 w-48" />}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    </div>
  );
}

// Composant pour les cartes de statistiques
export function StatsCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Composant pour les filtres et recherche
export function FiltersSkeleton({ hasMultipleFilters = true }: { hasMultipleFilters?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          {hasMultipleFilters ? (
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <Skeleton className="h-10 w-32" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour un tableau générique
export function TableSkeleton({ 
  columns, 
  rows = 8
}: { 
  columns: { width: string }[], 
  rows?: number
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead key={i} className={i === columns.length - 1 ? "text-right" : ""}>
                    <Skeleton className={`h-4 ${col.width}`} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j} className={j === columns.length - 1 ? "text-right" : ""}>
                      {j === columns.length - 1 ? (
                        <Skeleton className="h-8 w-8" />
                      ) : j === 0 ? (
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ) : (
                        <Skeleton className={`h-4 ${col.width}`} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour une grille de cartes (annonces, etc.)
export function CardGridSkeleton({ 
  count = 6, 
  hasImage = true,
  cols = "md:grid-cols-2 lg:grid-cols-3"
}: { 
  count?: number, 
  hasImage?: boolean,
  cols?: string 
}) {
  return (
    <div className={`grid gap-6 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          {hasImage && (
            <div className="relative">
              <Skeleton className="h-48 w-full" />
              <div className="absolute top-4 right-4">
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          )}
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Composant pour les formulaires
export function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type selection */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        {/* Form fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 pt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour la sidebar admin
export function AdminSidebarSkeleton() {
  return (
    <div className="w-64 border-r bg-background p-6">
      <div className="space-y-6">
        {/* Logo skeleton */}
        <Skeleton className="h-8 w-32" />
        
        {/* Navigation skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Composant pour le header admin
export function AdminHeaderSkeleton() {
  return (
    <div className="border-b p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  );
}

// Composant pour l'indicateur de chargement
export function LoadingIndicator({ text = "Chargement en cours..." }: { text?: string }) {
  return (
    <div className="flex justify-center py-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
} 