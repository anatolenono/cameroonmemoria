"use client";

import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heart, AlertCircle, Loader2, CalendarIcon, Upload, X, Eye, EyeOff, Plus, Trash2, Image as ImageIcon, ImagePlus, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createAnnouncementSchema, CreateAnnouncementFormData } from "../schemas";
import { announcementApiService } from "../services";
import { useSession } from '@/lib/auth-client';
import { CountryCombobox } from '@/features/feature-auth/presentation/components/CountryCombobox';
import { countries } from '@/features/feature-auth/presentation/components/countries';
import { BannerPicker, type BannerSelection } from '@/components/ui/banner-picker';
import { AnnouncementPreview } from './AnnouncementPreview';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';

// Composant utilitaire pour les labels avec indicateur de champ requis
const RequiredLabel = ({ children, required = false }: { children: React.ReactNode; required?: boolean }) => (
  <span className="flex items-center gap-1">
    {children}
    {required && <span className="text-red-500 text-sm">*</span>}
  </span>
);

// Composant pour la sélection d'année et de mois
const CustomCalendarHeader = ({ 
  date, 
  onMonthChange, 
  onYearChange, 
  fromYear, 
  toYear 
}: { 
  date: Date; 
  onMonthChange: (month: number) => void; 
  onYearChange: (year: number) => void;
  fromYear: number;
  toYear: number;
}) => {
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);

  return (
    <div className="flex items-center justify-between p-3 border-b">
      <Select
        value={date.getMonth().toString()}
        onValueChange={(value) => onMonthChange(parseInt(value))}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, index) => (
            <SelectItem key={index} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={date.getFullYear().toString()}
        onValueChange={(value) => onYearChange(parseInt(value))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export interface ExistingMedia {
  id: string;
  url: string;
  type: string;
}

export interface EditContext {
  bannerPresetId?: string;
  bannerCustomUrl?: string;
  bannerPresetImageUrl?: string;
  existingMedia?: ExistingMedia[];
  deceasedPhotoUrl?: string;
}

export interface CreateAnnouncementFormProps {
  onSubmit: (data: CreateAnnouncementFormData, files?: File[]) => void;
  onSaveDraft: (data: CreateAnnouncementFormData, files?: File[]) => void;
  isLoading?: boolean;
  initialValues?: CreateAnnouncementFormData;
  mode?: 'create' | 'edit';
  editContext?: EditContext;
}

// Helper to safely parse a date string
function safeDate(val: unknown): Date | undefined {
  if (typeof val === 'string' && val) {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

export function CreateAnnouncementForm({
  onSubmit,
  onSaveDraft,
  isLoading = false,
  initialValues,
  mode = 'create',
  editContext,
}: CreateAnnouncementFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingMediaList, setExistingMediaList] = useState<ExistingMedia[]>([]);
  const [deceasedPhotoFile, setDeceasedPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États pour les calendriers
  // Défaut à 60 ans en arrière pour la date de naissance (plus pratique pour les utilisateurs)
  const [birthCalendarDate, setBirthCalendarDate] = useState<Date>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 60);
    return date;
  });
  const [deathCalendarDate, setDeathCalendarDate] = useState<Date>(new Date());

  // Banner picker state
  const [bannerSelection, setBannerSelection] = useState<BannerSelection | null>(null);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);

  // Preview dialog state
  const [showPreview, setShowPreview] = useState(false);
  const [deceasedPhotoPreview, setDeceasedPhotoPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const form = useForm<CreateAnnouncementFormData>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      type: undefined,
      title: "",
      description: "",
      deceasedName: "",
      deceasedPronoun: undefined,
      birthPlace: "",
      relationship: "",
      relationshipOther: "",
      events: [{ date: { from: '', to: '' }, name: '', location: '' }],
    },
    mode: "onChange",
  });

  const { control, register, formState, setValue, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "events",
  });

  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  // Charger les valeurs initiales (édition) ou un brouillon (création)
  useEffect(() => {
    if (initialValues) {
      form.reset({
        ...initialValues,
        events: Array.isArray(initialValues.events)
          ? initialValues.events.map((event: { date: { from?: string | Date; to?: string | Date }; name: string; location: string; }) => ({
              ...event,
              date: {
                from: event.date?.from ? (typeof event.date.from === 'string' ? event.date.from : event.date.from.toISOString().split('T')[0]) : '',
                to: event.date?.to ? (typeof event.date.to === 'string' ? event.date.to : event.date.to.toISOString().split('T')[0]) : '',
              },
            }))
          : [{ date: { from: '', to: '' }, name: '', location: '' }],
      });
      return;
    }
    const draft = announcementApiService.getDraft();
    if (draft) {
      form.reset({
        type: draft.type,
        title: draft.title,
        description: draft.description,
        deceasedName: draft.deceasedName,
        birthDate: draft.birthDate || "",
        deathDate: draft.deathDate,
        relationship: draft.relationship || "",
        relationshipOther: draft.relationshipOther || "",
        events: Array.isArray(draft.events)
          ? draft.events.map((event: {
              date: { from?: string | Date; to?: string | Date };
              name: string;
              location: string;
            }) => ({
              ...event,
              date: {
                from: event.date?.from ? (typeof event.date.from === 'string' ? event.date.from : event.date.from.toISOString().split('T')[0]) : '',
                to: event.date?.to ? (typeof event.date.to === 'string' ? event.date.to : event.date.to.toISOString().split('T')[0]) : '',
              },
            }))
          : [{ date: { from: '', to: '' }, name: '', location: '' }],
      });
    }
  }, [form, initialValues]);

  // Initialize banner and gallery state in edit mode
  useEffect(() => {
    if (mode !== 'edit' || !editContext) return;

    if (editContext.bannerPresetId) {
      setBannerSelection({ presetId: editContext.bannerPresetId });
      if (editContext.bannerPresetImageUrl) {
        setBannerPreviewUrl(editContext.bannerPresetImageUrl);
      }
    } else if (editContext.bannerCustomUrl) {
      setBannerSelection({ customUrl: editContext.bannerCustomUrl });
      setBannerPreviewUrl(editContext.bannerCustomUrl);
    }

    if (editContext.deceasedPhotoUrl) {
      setDeceasedPhotoPreview(editContext.deceasedPhotoUrl);
    }

    if (editContext.existingMedia && editContext.existingMedia.length > 0) {
      setExistingMediaList(editContext.existingMedia);
      setGalleryPreviews(editContext.existingMedia.map(m => m.url));
    }
  }, [mode, editContext]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration form schema for non-logged-in users
  const registrationForm = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      country: 'CM',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle banner selection from picker
  const handleBannerChange = async (selection: BannerSelection) => {
    setBannerSelection(selection);
    setBannerError(null);
    setShowBannerPicker(false);

    // Generate preview URL
    if (selection.presetId) {
      // Fetch preset details to get image URL
      try {
        const response = await fetch('/api/banners/presets');
        const data = await response.json();
        const preset = data.presets.find((p: { id: string; imageUrl: string }) => p.id === selection.presetId);
        if (preset) {
          setBannerPreviewUrl(preset.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching preset:', error);
      }
    } else if (selection.customFile) {
      setBannerPreviewUrl(URL.createObjectURL(selection.customFile));
    } else if (selection.customUrl) {
      setBannerPreviewUrl(selection.customUrl);
    } else if (selection.customColor) {
      // For custom color, we'll use a data URL with the solid color
      setBannerPreviewUrl(selection.customColor);
    }
  };

  // Create preview URLs for deceased photo and gallery
  useEffect(() => {
    if (deceasedPhotoFile) {
      const url = URL.createObjectURL(deceasedPhotoFile);
      setDeceasedPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setDeceasedPhotoPreview(null);
    }
  }, [deceasedPhotoFile]);

  useEffect(() => {
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setGalleryPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  // Handle preview button click
  const handlePreview = () => {
    // Validate form before showing preview
    form.trigger().then(isValid => {
      if (isValid) {
        setShowPreview(true);
      }
    });
  };

  // Handle confirm from preview (submits the form)
  const handleConfirmFromPreview = () => {
    setShowPreview(false);
    const data = form.getValues();
    handleFormSubmit(data);
  };

  const handleFormSubmit = (data: CreateAnnouncementFormData) => {
    console.log('handleFormSubmit called', { data, bannerSelection, mode });

    if (mode === 'create' && bannerSelection) {
      setBannerError(null);
    }
    // Inject registration fields if not logged in
    if (!isLoggedIn) {
      const reg = registrationForm.getValues();
      const country = countries.find(c => c.code === reg.country);
      const phoneNumber = country ? `${country.countryCode}${reg.phone}` : reg.phone;
      data.registerName = reg.name;
      data.registerEmail = reg.email;
      data.registerPhoneNumber = phoneNumber;
      data.registerPassword = reg.password;
      data.registerConfirmPassword = reg.confirmPassword;
    }
    // If relationship is 'Autre', use relationshipOther as the value
    if (data.relationship === 'Autre') {
      data.relationship = data.relationshipOther ?? "";
    }

    // Add banner information to data in both create and edit modes
    if (bannerSelection) {
      data.bannerPresetId = bannerSelection.presetId;
      data.bannerCustomUrl = bannerSelection.customUrl;
      data.bannerCustomColor = bannerSelection.customColor;
    }

    // Prepare files array: banner file (if custom) + deceased photo + gallery images
    let files: File[] = [];
    if (bannerSelection?.customFile) {
      files.push(bannerSelection.customFile);
    }
    if (deceasedPhotoFile) {
      // Add deceased photo with a special naming to identify it in the API
      const renamedFile = new File([deceasedPhotoFile], 'deceasedPhoto', { type: deceasedPhotoFile.type });
      files.push(renamedFile);
    }
    files = [...files, ...selectedFiles];

    console.log('About to call onSubmit', { data, filesCount: files.length });
    onSubmit(data, files.length > 0 ? files : undefined);
  };

  const handleSaveDraft = () => {
    console.log('handleSaveDraft called');
    const currentData = form.getValues();
    console.log('Calling onSaveDraft with', { currentData, filesCount: selectedFiles.length });
    onSaveDraft(currentData, selectedFiles.length > 0 ? selectedFiles : undefined);
  };

  // Gestion des fichiers de galerie
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 images
    }
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  return (
    <div>
      {/* Banner Preview Section */}
      {bannerPreviewUrl ? (
        <div className="relative h-48 rounded-lg overflow-hidden mb-6 group">
          <Image
            src={bannerPreviewUrl}
            alt="Banner preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Dialog open={showBannerPicker} onOpenChange={setShowBannerPicker}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Modifier l&apos;image
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Choisir une image</DialogTitle>
                  <DialogDescription>
                    Sélectionnez une image prédéfinie ou téléchargez la vôtre
                  </DialogDescription>
                </DialogHeader>
                <BannerPicker value={bannerSelection || undefined} onChange={handleBannerChange} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        <Card className="mb-6 border-2 border-dashed">
          <CardContent className="pt-6">
            <Dialog open={showBannerPicker} onOpenChange={setShowBannerPicker}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-32" type="button">
                  <div className="flex flex-col items-center gap-2">
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Ajouter une image</span>
                    <span className="text-xs text-muted-foreground">
                      Choisissez parmi les images prédéfinies ou téléchargez la vôtre
                    </span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Choisir une image</DialogTitle>
                  <DialogDescription>
                    Sélectionnez une image prédéfinie ou téléchargez la vôtre
                  </DialogDescription>
                </DialogHeader>
                <BannerPicker value={bannerSelection || undefined} onChange={handleBannerChange} />
              </DialogContent>
            </Dialog>
            {bannerError && (
              <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {bannerError}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            Informations de l&apos;annonce
          </CardTitle>
          <CardDescription>Remplissez les informations pour créer votre annonce</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Type d'annonce */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel required>Type d&apos;annonce</RequiredLabel>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choisissez le type d'annonce" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="death_notice">
                          <div className="flex items-center">
                            Avis de décès
                          </div>
                        </SelectItem>
                        <SelectItem value="funeral">
                          <div className="flex items-center">
                            Funérailles
                          </div>
                        </SelectItem>
                        <SelectItem value="anniversary">
                          <div className="flex items-center">
                            Anniversaire
                          </div>
                        </SelectItem>
                        <SelectItem value="thanks">
                          <div className="flex items-center">
                            Remerciements
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Titre */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  <RequiredLabel required>Titre de l&apos;annonce</RequiredLabel>
                </Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Ex: En mémoire de..."
                  className="w-full"
                />
                {form.formState.errors.title && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{form.formState.errors.title.message}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  <RequiredLabel required>Description</RequiredLabel>
                </Label>
                <textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Décrivez l'annonce, partagez vos souvenirs..."
                  className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {form.formState.errors.description && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{form.formState.errors.description.message}</span>
                  </div>
                )}
              </div>

              {/* Informations sur le défunt */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations sur la personne décédée</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deceasedPronoun">
                      <RequiredLabel required>Civilité</RequiredLabel>
                    </Label>
                    <Select
                      value={form.watch('deceasedPronoun')}
                      onValueChange={val => form.setValue('deceasedPronoun', val as "M." | "Mme" | "Mlle", { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M.">M.</SelectItem>
                        <SelectItem value="Mme">Mme</SelectItem>
                        <SelectItem value="Mlle">Mlle</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.deceasedPronoun && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{form.formState.errors.deceasedPronoun.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deceasedName">
                      <RequiredLabel required>Nom complet</RequiredLabel>
                    </Label>
                    <Input
                      id="deceasedName"
                      {...form.register('deceasedName')}
                      placeholder="Nom et prénom"
                      className="w-full"
                    />
                    {form.formState.errors.deceasedName && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{form.formState.errors.deceasedName.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace">
                      Lieu de naissance (optionnel)
                    </Label>
                    <LocationAutocomplete
                      id="birthPlace"
                      value={form.watch('birthPlace') || ''}
                      onChange={(value) => form.setValue('birthPlace', value, { shouldValidate: true })}
                      placeholder="Ex: Yaoundé, Cameroun"
                      className="w-full"
                    />
                    {form.formState.errors.birthPlace && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{form.formState.errors.birthPlace.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deceasedPhoto">
                      Photo du défunt (optionnel)
                    </Label>
                    <Input
                      id="deceasedPhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDeceasedPhotoFile(file);
                        }
                      }}
                      className="w-full"
                    />
                    {deceasedPhotoFile && (
                      <div className="mt-2">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <Image
                            src={URL.createObjectURL(deceasedPhotoFile)}
                            alt="Photo du défunt"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="relationship">
                      <RequiredLabel required>Lien avec le défunt</RequiredLabel>
                    </Label>
                    <Select
                      value={form.watch('relationship')}
                      onValueChange={val => form.setValue('relationship', val, { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Epoux(se)">Epoux(se)</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Frere / Soeur">Frère / Soeur</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.watch('relationship') === 'Autre' && (
                      <Input
                        id="relationshipOther"
                        {...form.register('relationshipOther')}
                        placeholder="Précisez le lien"
                        className="w-full mt-2"
                      />
                    )}
                    {form.formState.errors.relationship && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{form.formState.errors.relationship.message}</span>
                      </div>
                    )}
                    {form.watch('relationship') === 'Autre' && form.formState.errors.relationshipOther && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{form.formState.errors.relationshipOther.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de naissance</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), 'PPP', { locale: fr })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CustomCalendarHeader
                              date={birthCalendarDate}
                              onMonthChange={(month) => setBirthCalendarDate(new Date(birthCalendarDate.getFullYear(), month, 1))}
                              onYearChange={(year) => setBirthCalendarDate(new Date(year, birthCalendarDate.getMonth(), 1))}
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                            />
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                              }}
                              disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                              month={birthCalendarDate}
                              onMonthChange={setBirthCalendarDate}
                              locale={fr}
                              components={{
                                Caption: () => null, // Masquer le header par défaut
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deathDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          <RequiredLabel required>Date de décès</RequiredLabel>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), 'PPP', { locale: fr })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CustomCalendarHeader
                              date={deathCalendarDate}
                              onMonthChange={(month) => setDeathCalendarDate(new Date(deathCalendarDate.getFullYear(), month, 1))}
                              onYearChange={(year) => setDeathCalendarDate(new Date(year, deathCalendarDate.getMonth(), 1))}
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                            />
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                              }}
                              disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                              month={deathCalendarDate}
                              onMonthChange={setDeathCalendarDate}
                              locale={fr}
                              components={{
                                Caption: () => null, // Masquer le header par défaut
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Informations sur la cérémonie */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Événements</h3>
                {/* Display error for events array */}
                {formState.errors.events && typeof formState.errors.events.message === 'string' && (
                  <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{formState.errors.events.message}</span>
                  </div>
                )}
                {fields.map((event, idx) => (
                  <div key={event.id} className="flex flex-row gap-2 items-start border p-4 rounded-md min-h-[92px]">
                    <div className="flex flex-col flex-1 justify-start">
                      <Label className="mb-1">Date / Plage de dates</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal min-h-[44px]',
                              !watch(`events.${idx}.date.from`) && 'text-muted-foreground'
                            )}
                          >
                            {safeDate(watch(`events.${idx}.date.from`)) ? format(safeDate(watch(`events.${idx}.date.from`))!, 'PPP', { locale: fr }) : ''}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={{
                              from: safeDate(watch(`events.${idx}.date.from`)),
                              to: safeDate(watch(`events.${idx}.date.to`)),
                            }}
                            onSelect={range => {
                              setValue(`events.${idx}.date.from`, range?.from ? format(range.from, 'yyyy-MM-dd') : '');
                              setValue(`events.${idx}.date.to`, range?.to ? format(range.to, 'yyyy-MM-dd') : '');
                            }}
                            locale={fr}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      {formState.errors.events && Array.isArray(formState.errors.events) && formState.errors.events[idx]?.date && (
                        <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{formState.errors.events[idx]?.date?.from?.message || formState.errors.events[idx]?.date?.message}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 justify-start">
                      <Label htmlFor={`event-name-${idx}`} className="mb-1">Nom de l&apos;événement</Label>
                      <Input
                        id={`event-name-${idx}`}
                        {...register(`events.${idx}.name`)}
                        placeholder="Ex: Veillée, Messe, Inhumation..."
                        className="w-full min-h-[44px]"
                      />
                      {formState.errors.events && Array.isArray(formState.errors.events) && formState.errors.events[idx]?.name && (
                        <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{formState.errors.events[idx]?.name?.message}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 justify-start">
                      <Label htmlFor={`event-location-${idx}`} className="mb-1">Lieu</Label>
                      <LocationAutocomplete
                        id={`event-location-${idx}`}
                        value={watch(`events.${idx}.location`) || ''}
                        onChange={(value) => setValue(`events.${idx}.location`, value, { shouldValidate: true })}
                        placeholder="Adresse ou nom du lieu"
                        className="w-full min-h-[44px]"
                      />
                      {formState.errors.events && Array.isArray(formState.errors.events) && formState.errors.events[idx]?.location && (
                        <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{formState.errors.events[idx]?.location?.message}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center h-full">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-2 text-red-600 hover:bg-red-50"
                        onClick={() => remove(idx)}
                        disabled={fields.length === 1}
                        aria-label="Supprimer l'événement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ date: { from: '', to: '' }, name: '', location: '' })} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un événement
                </Button>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <Label>Photos (optionnel)</Label>

                {/* Input file caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Zone de drop */}
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={handleFileDropZoneClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez-déposez vos photos ici ou cliquez pour sélectionner
                  </p>
                  <Button type="button" variant="outline">
                    Choisir des fichiers
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formats acceptés : JPG, PNG, GIF (max 5 images)
                  </p>
                </div>

                {/* Preview des images existantes (mode édition) */}
                {existingMediaList.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Photos existantes</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {existingMediaList.map((media) => (
                        <div key={media.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-border relative">
                            <Image
                              src={media.url}
                              alt="Photo existante"
                              className="object-cover"
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setExistingMediaList(prev => prev.filter(m => m.id !== media.id))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview des nouvelles images sélectionnées */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {existingMediaList.length > 0 && (
                      <p className="text-sm text-muted-foreground">Nouvelles photos</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-border relative">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="object-cover"
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleFileRemove(selectedFiles.findIndex(f => f === file))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="mt-1 text-xs text-muted-foreground text-center truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message si aucune image */}
                {selectedFiles.length === 0 && existingMediaList.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>Aucune photo sélectionnée</span>
                  </div>
                )}
              </div>

              {/* Note sur les champs requis */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                <span className="text-red-500">*</span>
                <span>Champs obligatoires</span>
              </div>

              {/* Registration fields for non-logged-in users */}
              {!isLoggedIn && (
                <div className="space-y-6 pt-6">
                  <h3 className="text-lg font-semibold">Créer un compte pour publier l&apos;annonce</h3>
                  <FormField
                    control={registrationForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="registerName">Nom</FormLabel>
                        <FormControl>
                          <Input {...field} id="registerName" autoComplete="name" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registrationForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="registerEmail">Email</FormLabel>
                        <FormControl>
                          <Input {...field} id="registerEmail" type="email" autoComplete="email" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registrationForm.control}
                    name="country"
                    render={() => <></>}
                  />
                  <FormField
                    control={registrationForm.control}
                    name="phone"
                    render={({ field }) => {
                      const country = countries.find(c => c.code === registrationForm.watch('country'));
                      return (
                        <FormItem>
                          <FormLabel htmlFor="registerPhone">Numéro de téléphone</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <div className="w-32">
                                <CountryCombobox
                                  field={{
                                    ...registrationForm.register('country'),
                                    value: registrationForm.watch('country'),
                                    onChange: (val: string) => registrationForm.setValue('country', val),
                                    name: 'country',
                                    ref: () => {},
                                    onBlur: () => {},
                                    disabled: isLoading,
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                              <Input
                                {...field}
                                id="registerPhone"
                                type="tel"
                                autoComplete="tel"
                                placeholder={country ? `Ex: ${country.countryCode} 612345678` : 'Numéro sans indicatif'}
                                required
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={registrationForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="registerPassword">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} id="registerPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required />
                            <button
                              type="button"
                              onClick={() => setShowPassword(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registrationForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="registerConfirmPassword">Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} id="registerConfirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              aria-label={showConfirmPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    'Enregistrer comme brouillon'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={handlePreview}
                  disabled={isLoading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Prévisualiser
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'edit' ? 'Mise à jour...' : 'Publication...'}
                    </>
                  ) : (
                    mode === 'edit' ? "Mettre à jour l'annonce" : "Publier l'annonce"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <AnnouncementPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        data={form.getValues()}
        onConfirm={handleConfirmFromPreview}
        isLoading={isLoading}
        mode={mode}
        bannerPreviewUrl={bannerPreviewUrl}
        deceasedPhotoPreview={deceasedPhotoPreview}
        galleryPreviews={galleryPreviews}
      />
    </div>
  );
} 