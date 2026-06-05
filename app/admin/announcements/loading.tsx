import { 
  PageHeaderSkeleton, 
  StatsCardsSkeleton, 
  FiltersSkeleton, 
  TableSkeleton 
} from "@/components/ui/loading-skeletons";

const announcementTableColumns = [
  { width: "w-20" }, // Annonce
  { width: "w-16" }, // Défunt
  { width: "w-12" }, // Type
  { width: "w-16" }, // Statut
  { width: "w-24" }, // Soumetteur
  { width: "w-16" }, // Date
  { width: "w-16" }  // Actions
];

export default function AdminAnnouncementsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton showBackButton />
      <StatsCardsSkeleton />
      <FiltersSkeleton />
      <TableSkeleton columns={announcementTableColumns} />
    </div>
  );
} 