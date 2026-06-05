'use client';

import { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { UploadDropzone } from '@/components/UploadDropzone';
import { ImageGrid, ImageItem } from '@/components/ImageGrid';

export default function UploadPage() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Charger les images déjà uploadées au montage du composant
  useEffect(() => {
    // Dans une application réelle, on ferait un appel API pour récupérer les images existantes
    // Pour cette démo, nous les récupérons depuis localStorage
    const savedImages = localStorage.getItem('uploadedImages');
    if (savedImages) {
      try {
        // Convertir les dates string en objets Date
        const parsedImages = JSON.parse(savedImages).map((img: Omit<ImageItem, 'date'> & { date: string }) => ({
          ...img,
          date: new Date(img.date)
        }));
        setUploadedImages(parsedImages);
      } catch (err) {
        console.error('Erreur lors du chargement des images:', err);
      }
    }
  }, []);

  // Sauvegarder les images dans localStorage quand elles changent
  useEffect(() => {
    if (uploadedImages.length > 0) {
      localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
    }
  }, [uploadedImages]);

  const handleUploadComplete = useCallback((fileUrl: string, fileName: string) => {
    const newImage: ImageItem = {
      url: fileUrl,
      name: fileName,
      date: new Date()
    };
    setUploadedImages(prev => [newImage, ...prev]);
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const handleUploadError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const handleUploadProgress = useCallback((progress: number) => {
    setUploadProgress(progress);
    setIsUploading(true);
  }, []);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Démonstration d&apos;Upload d&apos;Images</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Formulaire d'upload */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Uploader une image</h2>
          
          <UploadDropzone
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadProgress={handleUploadProgress}
            accept="image/*"
            maxSize={10 * 1024 * 1024} // 10MB
          />
          
          {isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center mt-2">{uploadProgress}% Complété</p>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md mt-4">
              {error}
            </div>
          )}
          
          <div className="text-sm text-gray-500 mt-4">
            <p>• Formats supportés: JPG, PNG, GIF, WebP</p>
            <p>• Taille maximum: 10MB</p>
          </div>
        </div>
        
        {/* Grille d'images */}
        <div className="w-full md:w-2/3">
          <h2 className="text-xl font-semibold mb-4">Images uploadées ({uploadedImages.length})</h2>
          
          <ImageGrid
            images={uploadedImages}
            emptyMessage="Aucune image uploadée pour le moment"
            dateFormatter={formatDate}
          />
        </div>
      </div>
    </div>
  );
} 