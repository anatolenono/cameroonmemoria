import { 
  PageHeaderSkeleton, 
  FiltersSkeleton, 
  CardGridSkeleton 
} from "@/components/ui/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnnouncementsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <FiltersSkeleton />
      <CardGridSkeleton count={9} />
      
      {/* Pagination skeleton */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10" />
          ))}
        </div>
      </div>
    </div>
  );
} 