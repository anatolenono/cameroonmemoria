import { 
  StatsCardsSkeleton, 
  CardGridSkeleton, 
  LoadingIndicator 
} from "@/components/ui/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton with staggered animation */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-80 animate-pulse" style={{ animationDelay: '0ms' }} />
        <Skeleton className="h-5 w-96 animate-pulse" style={{ animationDelay: '100ms' }} />
      </div>

      {/* Hero section skeleton */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3 animate-pulse" style={{ animationDelay: '200ms' }} />
          <Skeleton className="h-6 w-3/4 animate-pulse" style={{ animationDelay: '300ms' }} />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-40 animate-pulse" style={{ animationDelay: '400ms' }} />
            <Skeleton className="h-12 w-32 animate-pulse" style={{ animationDelay: '500ms' }} />
          </div>
        </div>
      </div>

      <StatsCardsSkeleton />

      {/* Features section skeleton */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto animate-pulse" style={{ animationDelay: '1000ms' }} />
          <Skeleton className="h-5 w-96 mx-auto animate-pulse" style={{ animationDelay: '1100ms' }} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="text-center animate-pulse" style={{ animationDelay: `${1200 + i * 100}ms` }}>
              <CardHeader>
                <div className="mx-auto mb-4">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                </div>
                <Skeleton className="h-6 w-32 mx-auto" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent announcements skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 animate-pulse" style={{ animationDelay: '1500ms' }} />
          <Skeleton className="h-10 w-32 animate-pulse" style={{ animationDelay: '1600ms' }} />
        </div>
        
        <CardGridSkeleton count={6} />
      </div>

      <LoadingIndicator />
    </div>
  );
} 