"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { BannerPreset, BannerType } from '@/features/feature-banner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link as LinkIcon, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BannerSelection {
  presetId?: string;
  customFile?: File;
  customUrl?: string;
  customColor?: string;
}

export interface BannerPickerProps {
  value?: BannerSelection;
  onChange: (selection: BannerSelection) => void;
  onClose?: () => void;
}

export function BannerPicker({ value, onChange, onClose }: BannerPickerProps) {
  const [presets, setPresets] = useState<BannerPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(value?.presetId);
  const [customFile, setCustomFile] = useState<File | undefined>(value?.customFile);
  const [customUrl, setCustomUrl] = useState(value?.customUrl || '');
  const [customColor, setCustomColor] = useState(value?.customColor || '#000000');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/banners/presets');
      const data = await response.json();
      setPresets(data.presets || []);
    } catch (error) {
      console.error('Error fetching banner presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset: BannerPreset) => {
    setSelectedPresetId(preset.id);
    setCustomFile(undefined);
    setCustomUrl('');
    setCustomColor('#000000');
    onChange({ presetId: preset.id });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCustomFile(file);
      setSelectedPresetId(undefined);
      setCustomUrl('');
      setCustomColor('#000000');
      onChange({ customFile: file });
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    setCustomUrl(url);
    setSelectedPresetId(undefined);
    setCustomFile(undefined);
    setCustomColor('#000000');
    if (url.trim()) {
      onChange({ customUrl: url });
    }
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    setSelectedPresetId(undefined);
    setCustomFile(undefined);
    setCustomUrl('');
    onChange({ customColor: color });
  };

  // Group presets by type
  const colorAndGradientPresets = presets.filter(
    p => p.type === BannerType.COLOR || p.type === BannerType.GRADIENT
  );
  const photoPresets = presets.filter(p => p.type === BannerType.PHOTO);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6 mt-4">
          {/* Custom Color Picker Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Couleur personnalisée
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="custom-color">Choisir une couleur</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="custom-color"
                    type="color"
                    value={customColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
              <div
                className="w-24 h-24 rounded-md border-2 border-muted-foreground/20 shadow-sm"
                style={{ backgroundColor: customColor }}
                title="Aperçu de la couleur"
              />
            </div>
            {/* Popular Colors */}
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Couleurs populaires :</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  '#000000', // Black
                  '#FFFFFF', // White
                  '#1E293B', // Slate
                  '#374151', // Gray
                  '#7C2D12', // Brown
                  '#1E40AF', // Blue
                  '#15803D', // Green
                  '#BE185D', // Pink
                  '#9333EA', // Purple
                  '#DC2626', // Red
                ].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      "w-8 h-8 rounded-md border-2 transition-all hover:scale-110",
                      customColor === color && !selectedPresetId && !customFile && !customUrl
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-muted-foreground/20"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Color & Gradient Section */}
          {colorAndGradientPresets.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Color & Gradient
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {colorAndGradientPresets.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      "relative aspect-video rounded-md overflow-hidden border-2 transition-all hover:scale-105",
                      selectedPresetId === preset.id
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent hover:border-muted-foreground/20"
                    )}
                  >
                    <Image
                      src={preset.thumbnailUrl || preset.imageUrl}
                      alt={preset.name}
                      fill
                      className="object-cover"
                    />
                    {selectedPresetId === preset.id && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Photos Section (if any) */}
          {photoPresets.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Photos
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {photoPresets.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      "relative aspect-video rounded-md overflow-hidden border-2 transition-all hover:scale-105",
                      selectedPresetId === preset.id
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent hover:border-muted-foreground/20"
                    )}
                  >
                    <Image
                      src={preset.thumbnailUrl || preset.imageUrl}
                      alt={preset.name}
                      fill
                      className="object-cover"
                    />
                    {selectedPresetId === preset.id && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4 mt-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="banner-file">Upload Image</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="banner-file"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {customFile && (
              <div className="mt-2 p-3 bg-muted rounded-md flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">{customFile.name}</span>
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="banner-url">Or paste image URL</Label>
            <div className="flex items-center gap-2">
              <Input
                id="banner-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={customUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="flex-1"
              />
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {onClose && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      )}
    </div>
  );
}
