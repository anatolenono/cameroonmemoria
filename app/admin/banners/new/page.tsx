"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { BannerType } from "@/features/feature-banner/domain/types/banner";

export default function NewBannerPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: BannerType.COLOR,
    category: "",
    displayOrder: 0,
  });

  // Color/Gradient generation state
  const [colorMode, setColorMode] = useState<"solid" | "gradient">("solid");
  const [solidColor, setSolidColor] = useState("#E57373");
  const [gradientColor1, setGradientColor1] = useState("#667eea");
  const [gradientColor2, setGradientColor2] = useState("#764ba2");
  const [gradientDirection, setGradientDirection] = useState("135");
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

  // File upload state (for PHOTO type)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Redirect if not logged in
  if (!isPending && !session) {
    router.push("/login");
    return null;
  }

  // Generate banner image from color/gradient
  const generateBanner = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions (1200x400)
    canvas.width = 1200;
    canvas.height = 400;

    if (colorMode === "solid") {
      // Solid color
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Gradient
      const angle = (parseInt(gradientDirection) * Math.PI) / 180;
      const x0 = canvas.width / 2 - (Math.cos(angle) * canvas.width) / 2;
      const y0 = canvas.height / 2 - (Math.sin(angle) * canvas.height) / 2;
      const x1 = canvas.width / 2 + (Math.cos(angle) * canvas.width) / 2;
      const y1 = canvas.height / 2 + (Math.sin(angle) * canvas.height) / 2;

      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, gradientColor1);
      gradient.addColorStop(1, gradientColor2);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png");
    setGeneratedPreview(dataUrl);
  };

  // Handle image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Convert data URL to File
  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name) {
      setError("Le nom de la bannière est requis");
      return;
    }

    // Check if we have either generated preview or uploaded image
    const isColorOrGradient = formData.type === BannerType.COLOR || formData.type === BannerType.GRADIENT;
    if (isColorOrGradient && !generatedPreview) {
      setError("Veuillez générer la bannière avant de soumettre");
      return;
    }
    if (formData.type === BannerType.PHOTO && !imageFile) {
      setError("Veuillez sélectionner une image");
      return;
    }

    try {
      setProcessing(true);

      let bannerUrl = "";

      if (isColorOrGradient && generatedPreview) {
        // Upload generated banner
        const bannerFile = dataURLtoFile(
          generatedPreview,
          `${formData.name.toLowerCase().replace(/\s+/g, "-")}-banner.png`
        );

        const bannerFormData = new FormData();
        bannerFormData.append("file", bannerFile);

        const bannerUploadRes = await fetch("/api/upload", {
          method: "POST",
          body: bannerFormData,
        });

        if (!bannerUploadRes.ok) {
          throw new Error("Failed to upload banner image");
        }

        const bannerUploadData = await bannerUploadRes.json();
        console.log("Banner upload response:", bannerUploadData);

        // The upload API returns files array
        if (bannerUploadData.files && bannerUploadData.files.length > 0) {
          bannerUrl = bannerUploadData.files[0].url;
        } else {
          throw new Error("No URL returned from upload");
        }
      } else if (formData.type === BannerType.PHOTO && imageFile) {
        // Upload photo banner
        const photoFormData = new FormData();
        photoFormData.append("file", imageFile);

        const photoUploadRes = await fetch("/api/upload", {
          method: "POST",
          body: photoFormData,
        });

        if (!photoUploadRes.ok) {
          throw new Error("Failed to upload image");
        }

        const photoUploadData = await photoUploadRes.json();
        console.log("Photo upload response:", photoUploadData);

        // The upload API returns files array
        if (photoUploadData.files && photoUploadData.files.length > 0) {
          bannerUrl = photoUploadData.files[0].url;
        } else {
          throw new Error("No URL returned from upload");
        }
      }

      // Verify we have a valid banner URL
      if (!bannerUrl) {
        throw new Error("Banner URL is empty - upload may have failed");
      }

      console.log("Creating banner preset with URL:", bannerUrl);

      // Create banner preset
      const presetFormData = new FormData();
      presetFormData.append("name", formData.name);
      presetFormData.append("type", formData.type);
      presetFormData.append("imageUrl", bannerUrl);
      if (formData.category) presetFormData.append("category", formData.category);
      presetFormData.append("displayOrder", String(formData.displayOrder));

      const createRes = await fetch("/api/admin/banners", {
        method: "POST",
        body: presetFormData,
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(errorData.error || "Failed to create banner preset");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/banners");
      }, 1500);
    } catch (err) {
      console.error("Error creating banner:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la création de la bannière");
    } finally {
      setProcessing(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isColorOrGradient = formData.type === BannerType.COLOR || formData.type === BannerType.GRADIENT;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/admin/banners">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux bannières
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-4">Nouvelle bannière</h1>
          <p className="text-muted-foreground">
            Créez une nouvelle bannière prédéfinie pour les annonces
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <p>Bannière créée avec succès ! Redirection...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column - Form Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Détails de la bannière</CardTitle>
                <CardDescription>
                  Informations de base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Coral Red, Ocean Gradient"
                    required
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      setFormData({ ...formData, type: value as BannerType });
                      setGeneratedPreview(null);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
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

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="ex: Warm, Cool, Space"
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Ordre d&apos;affichage</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Banner Generation/Upload */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isColorOrGradient ? "Générateur de bannière" : "Image de la bannière"}
                </CardTitle>
                <CardDescription>
                  {isColorOrGradient
                    ? "Créez une bannière de couleur ou dégradé"
                    : "Téléchargez une image personnalisée"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isColorOrGradient ? (
                  <>
                    {/* Color/Gradient Generator */}
                    <Tabs value={colorMode} onValueChange={(v) => setColorMode(v as "solid" | "gradient")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="solid">Couleur unie</TabsTrigger>
                        <TabsTrigger value="gradient">Dégradé</TabsTrigger>
                      </TabsList>

                      <TabsContent value="solid" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="solidColor">Couleur</Label>
                          <div className="flex gap-2">
                            <Input
                              id="solidColor"
                              type="color"
                              value={solidColor}
                              onChange={(e) => setSolidColor(e.target.value)}
                              className="w-20 h-10 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={solidColor}
                              onChange={(e) => setSolidColor(e.target.value)}
                              placeholder="#E57373"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="gradient" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="gradientColor1">Couleur 1</Label>
                          <div className="flex gap-2">
                            <Input
                              id="gradientColor1"
                              type="color"
                              value={gradientColor1}
                              onChange={(e) => setGradientColor1(e.target.value)}
                              className="w-20 h-10 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={gradientColor1}
                              onChange={(e) => setGradientColor1(e.target.value)}
                              placeholder="#667eea"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gradientColor2">Couleur 2</Label>
                          <div className="flex gap-2">
                            <Input
                              id="gradientColor2"
                              type="color"
                              value={gradientColor2}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              className="w-20 h-10 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={gradientColor2}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              placeholder="#764ba2"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gradientDirection">Direction (degrés)</Label>
                          <Input
                            id="gradientDirection"
                            type="number"
                            value={gradientDirection}
                            onChange={(e) => setGradientDirection(e.target.value)}
                            min={0}
                            max={360}
                            placeholder="135"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button
                      type="button"
                      onClick={generateBanner}
                      className="w-full"
                      variant="secondary"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Générer l&apos;aperçu
                    </Button>

                    {/* Hidden canvas for generation */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Preview */}
                    {generatedPreview && (
                      <div className="space-y-2">
                        <Label>Aperçu (1200x400px)</Label>
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                          <Image
                            src={generatedPreview}
                            alt="Banner preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="imageFile">
                        Image <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={handleImageFileChange}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Formats acceptés: JPEG, PNG, WebP, GIF, SVG
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dimensions recommandées: 1200x400px
                      </p>
                    </div>

                    {/* Photo Preview */}
                    {imagePreview && (
                      <div className="space-y-2">
                        <Label>Aperçu</Label>
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                          <Image
                            src={imagePreview}
                            alt="Image preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Link href="/admin/banners">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {processing ? "Création..." : "Créer la bannière"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
