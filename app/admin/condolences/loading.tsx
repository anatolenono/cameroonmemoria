import { 
  PageHeaderSkeleton, 
  StatsCardsSkeleton, 
  FiltersSkeleton, 
  TableSkeleton 
} from "@/components/ui/loading-skeletons";

const condolenceTableColumns = [
  { width: "w-16" }, // Auteur
  { width: "w-20" }, // Contenu
  { width: "w-20" }, // Annonce
  { width: "w-16" }, // Statut
  { width: "w-16" }, // Date
  { width: "w-24" }, // Signalements
  { width: "w-16" }  // Actions
];

export default function AdminCondolencesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton showBackButton />
      <StatsCardsSkeleton />
      <FiltersSkeleton hasMultipleFilters={false} />
      <TableSkeleton columns={condolenceTableColumns} />
    </div>
  );
} 