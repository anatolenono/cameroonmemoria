'use client';

import { useCallback, useState, useRef } from 'react';
import { FileUploadClient } from '@/lib/client/fileUploadClient';

interface UploadDropzoneProps {
  onUploadComplete: (fileUrl: string, fileName: string) => void;
  onUploadError: (error: string) => void;
  onUploadProgress?: (progress: number) => void;
  accept?: string;
  maxSize?: number; // en octets
}

export function UploadDropzone({
  onUploadComplete,
  onUploadError,
  onUploadProgress,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024 // 10MB par défaut
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = useCallback(async (file: File) => {
    // Vérifier le type de fichier
    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      onUploadError(`Type de fichier non supporté. Veuillez sélectionner un fichier ${accept}`);
      return;
    }

    // Vérifier la taille du fichier
    if (file.size > maxSize) {
      onUploadError(`Fichier trop volumineux. La taille maximum est de ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const response = await FileUploadClient.uploadFile(file, {
        onProgress: onUploadProgress
      });

      if (response.success && response.files.length > 0) {
        onUploadComplete(response.files[0].url, file.name);
      } else {
        onUploadError(response.error || "Échec de l'upload");
      }
    } catch (err) {
      onUploadError((err as Error).message || "Une erreur s'est produite");
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input pour permettre l'upload du même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [accept, maxSize, onUploadComplete, onUploadError, onUploadProgress]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && !isUploading) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, [isUploading, processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  return (
    <div 
      className={`relative w-full ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
    >
      <label 
        htmlFor="fileInput" 
        className={`
          block w-full p-8 border-2 border-dashed rounded-lg text-center 
          cursor-pointer transition duration-200 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:bg-gray-50'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <svg 
            className="w-12 h-12 text-gray-400 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-500">
            {isDragging 
              ? "Déposez votre fichier ici" 
              : "Cliquez pour sélectionner ou glissez un fichier ici"
            }
          </p>
          {isUploading && (
            <p className="text-sm text-blue-500 mt-2">Upload en cours...</p>
          )}
        </div>
        <input 
          id="fileInput" 
          ref={fileInputRef}
          type="file" 
          accept={accept} 
          onChange={handleFileChange} 
          className="hidden" 
          disabled={isUploading}
        />
      </label>
    </div>
  );
} 