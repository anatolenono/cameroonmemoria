import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Edit, Eye, Clock } from "lucide-react";
import Link from "next/link";
import { auth } from "@/core/infrastructure/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { announcementService } from "@/features/feature-announcement/application/services/announcementService";
import { DeleteAnnouncementButton } from "@/components/DeleteAnnouncementButton";
import { PageSizeSelect } from "@/components/PageSizeSelect";

// Use domain announcement shape from the backend service
type UserAnnouncement = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  deceasedName: string;
  ceremonyDate?: Date | null;
  ceremonyLocation?: string | null;
  createdAt: Date;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PUBLISHED":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Publié</Badge>;
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>;
    case "REJECTED":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejeté</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getTypeLabel = (type: string) => {
  const upper = (type || "").toUpperCase();
  if (upper === "FUNERAL") return "Funérailles";
  if (upper === "ANNIVERSARY") return "Anniversaire";
  if (upper === "THANKS") return "Remerciements";
  return "Annonce";
};

export default async function MyAnnouncementsPage({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const pageParam = typeof params?.page === 'string' ? params?.page : Array.isArray(params?.page) ? params?.page[0] : undefined;
  const sizeParam = typeof params?.pageSize === 'string' ? params?.pageSize : Array.isArray(params?.pageSize) ? params?.pageSize[0] : undefined;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(sizeParam || '10', 10) || 10));
  const offset = (currentPage - 1) * pageSize;

  let userAnnouncements: UserAnnouncement[] = [];
  let total = 0;
  try {
    const data = await announcementService.getAllAnnouncements({ userId: session.user.id, limit: pageSize, offset });
    userAnnouncements = (data.announcements || []) as unknown as UserAnnouncement[];
    total = Number(data.total || 0);
  } catch {
    userAnnouncements = [];
    total = 0;
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-gris-lavande">Mes annonces</h1>
          <p className="text-muted-foreground">
            Gérez vos annonces de funérailles et commémorations
          </p>
        </div>
        
        <Button asChild>
          <Link href="/announcements/create">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              annonces créées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userAnnouncements.filter(a => a.status === "PUBLISHED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              visibles publiquement
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userAnnouncements.filter(a => a.status === "PENDING").length}
            </div>
            <p className="text-xs text-muted-foreground">
              en cours de validation
            </p>
          </CardContent>
        </Card>
        
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {userAnnouncements.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune annonce</h3>
              <p className="text-muted-foreground mb-4">
                Vous n&apos;avez pas encore créé d&apos;annonce.
              </p>
              <Button asChild>
                <Link href="/announcements/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre première annonce
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          userAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      {getStatusBadge(announcement.status)}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {announcement.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/announcements/${announcement.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/announcements/${announcement.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Link>
                    </Button>
                    <DeleteAnnouncementButton id={announcement.id} />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>{announcement.deceasedName}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Type: {getTypeLabel(announcement.type)}</span>
                    <span>Créé le {new Date(announcement.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  {announcement.status === "PENDING" && (
                    <div className="text-sm text-muted-foreground">
                      En cours de validation par notre équipe
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Page {Math.min(currentPage, totalPages)} sur {totalPages}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">Taille:</div>
          <PageSizeSelect value={pageSize} options={[5,10,20]} />
          <div className="w-px h-6 bg-border" />
          <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
            <Link href={`/announcements/my?page=${currentPage - 1}&pageSize=${pageSize}`}>Précédent</Link>
          </Button>
          <Button variant="outline" size="sm" asChild disabled={currentPage >= totalPages}>
            <Link href={`/announcements/my?page=${currentPage + 1}&pageSize=${pageSize}`}>Suivant</Link>
          </Button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <h3 className="font-semibold">Statuts des annonces :</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li><strong>Brouillon :</strong> Annonce sauvegardée mais non soumise</li>
              <li><strong>En attente :</strong> Annonce soumise et en cours de validation</li>
              <li><strong>Publié :</strong> Annonce validée et visible publiquement</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 