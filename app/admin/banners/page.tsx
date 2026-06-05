"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image as ImageIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { BannerType } from "@/features/feature-banner/domain/types/banner";
import { Label } from "@/components/ui/label";

interface BannerPreset {
  id: string;
  name: string;
  type: BannerType;
  imageUrl: string;
  thumbnailUrl: string | null;
  category: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerTypeLabels = {
  COLOR: "Couleur",
  GRADIENT: "Dégradé",
  PHOTO: "Photo",
};

const getBannerTypeBadgeColor = (type: BannerType) => {
  switch (type) {
    case BannerType.COLOR:
      return "bg-blue-500";
    case BannerType.GRADIENT:
      return "bg-purple-500";
    case BannerType.PHOTO:
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export default function BannersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [banners, setBanners] = useState<BannerPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedBanner, setSelectedBanner] = useState<BannerPreset | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: "",
    type: BannerType.COLOR,
    category: "",
    isActive: true,
    displayOrder: 0,
  });

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/banners");
      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }

      const data = await response.json();
      console.log("Fetched banners:", data.presets);
      setBanners(data.presets || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Impossible de charger les bannières");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchBanners();
    }
  }, [session, isPending, router, fetchBanners]);

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      banner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.category || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "ALL" || banner.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleEdit = (banner: BannerPreset) => {
    setSelectedBanner(banner);
    setEditForm({
      name: banner.name,
      type: banner.type,
      category: banner.category || "",
      isActive: banner.isActive,
      displayOrder: banner.displayOrder,
    });
    setShowEditDialog(true);
  };

  const handleDelete = (banner: BannerPreset) => {
    setSelectedBanner(banner);
    setShowDeleteDialog(true);
  };

  const handleToggleActive = async (banner: BannerPreset) => {
    try {
      setProcessing(true);

      const formData = new FormData();
      formData.append("isActive", String(!banner.isActive));

      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update banner");
      }

      await fetchBanners();
    } catch (error) {
      console.error("Error toggling banner status:", error);
      setError("Impossible de mettre à jour le statut de la bannière");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedBanner) return;

    try {
      setProcessing(true);

      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("type", editForm.type);
      formData.append("category", editForm.category);
      formData.append("isActive", String(editForm.isActive));
      formData.append("displayOrder", String(editForm.displayOrder));

      const response = await fetch(`/api/admin/banners/${selectedBanner.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update banner");
      }

      setShowEditDialog(false);
      setSelectedBanner(null);
      await fetchBanners();
    } catch (error) {
      console.error("Error updating banner:", error);
      setError("Impossible de mettre à jour la bannière");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBanner) return;

    try {
      setProcessing(true);

      const response = await fetch(`/api/admin/banners/${selectedBanner.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete banner");
      }

      setShowDeleteDialog(false);
      setSelectedBanner(null);
      await fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      setError("Impossible de supprimer la bannière");
    } finally {
      setProcessing(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Bannières</h1>
          <p className="text-muted-foreground">
            Gérez les bannières prédéfinies pour les annonces
          </p>
        </div>
        <Link href="/admin/banners/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle bannière
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Couleurs</CardTitle>
            <div className="h-3 w-3 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners.filter((b) => b.type === BannerType.COLOR).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dégradés</CardTitle>
            <div className="h-3 w-3 rounded-full bg-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners.filter((b) => b.type === BannerType.GRADIENT).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photos</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners.filter((b) => b.type === BannerType.PHOTO).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bannières</CardTitle>
          <CardDescription>
            {filteredBanners.length} bannière(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de bannière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les types</SelectItem>
                <SelectItem value="COLOR">Couleurs</SelectItem>
                <SelectItem value="GRADIENT">Dégradés</SelectItem>
                <SelectItem value="PHOTO">Photos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Banners Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Aperçu</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune bannière trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBanners.map((banner) => {
                    const imageUrl = (banner.thumbnailUrl && banner.thumbnailUrl.trim()) || (banner.imageUrl && banner.imageUrl.trim());
                    return (
                      <TableRow key={banner.id}>
                        <TableCell>
                          {imageUrl ? (
                            <div className="relative w-20 h-10 rounded overflow-hidden border">
                              <Image
                                src={imageUrl}
                                alt={banner.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-10 rounded overflow-hidden border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              Pas d&apos;image
                            </div>
                          )}
                        </TableCell>
                      <TableCell className="font-medium">{banner.name}</TableCell>
                      <TableCell>
                        <Badge className={getBannerTypeBadgeColor(banner.type)}>
                          {bannerTypeLabels[banner.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {banner.category || "—"}
                        </span>
                      </TableCell>
                      <TableCell>{banner.displayOrder}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(banner)}
                          disabled={processing}
                        >
                          {banner.isActive ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Cachée
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(banner)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la bannière</DialogTitle>
            <DialogDescription>
              Modifiez les détails de la bannière
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedBanner && selectedBanner.imageUrl && (
              <div className="relative w-full h-32 rounded overflow-hidden border mb-4">
                <Image
                  src={selectedBanner.imageUrl}
                  alt={selectedBanner.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, type: value as BannerType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLOR">Couleur</SelectItem>
                  <SelectItem value="GRADIENT">Dégradé</SelectItem>
                  <SelectItem value="PHOTO">Photo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                placeholder="Optionnel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Ordre d&apos;affichage</Label>
              <Input
                id="displayOrder"
                type="number"
                value={editForm.displayOrder}
                onChange={(e) =>
                  setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive">Visible pour les utilisateurs</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la bannière</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette bannière ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          {selectedBanner && (
            <div className="py-4">
              {selectedBanner.imageUrl && (
                <div className="relative w-full h-32 rounded overflow-hidden border mb-4">
                  <Image
                    src={selectedBanner.imageUrl}
                    alt={selectedBanner.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <p className="font-medium">{selectedBanner.name}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={processing}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
