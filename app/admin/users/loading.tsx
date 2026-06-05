import { 
  PageHeaderSkeleton, 
  StatsCardsSkeleton, 
  FiltersSkeleton, 
  TableSkeleton 
} from "@/components/ui/loading-skeletons";

const userTableColumns = [
  { width: "w-24" }, // Utilisateur
  { width: "w-16" }, // Rôle
  { width: "w-16" }, // Statut
  { width: "w-24" }, // Inscription
  { width: "w-32" }, // Dernière connexion
  { width: "w-20" }, // Annonces
  { width: "w-16" }  // Actions
];

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton showBackButton />
      <StatsCardsSkeleton />
      <FiltersSkeleton />
      <TableSkeleton columns={userTableColumns} />
    </div>
  );
} 