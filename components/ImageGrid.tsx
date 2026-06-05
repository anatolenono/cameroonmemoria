'use client';

import Image from 'next/image';

export interface ImageItem {
  id?: string;
  url: string;
  name: string;
  date?: Date;
  alt?: string;
}

interface ImageGridProps {
  images: ImageItem[];
  onImageClick?: (image: ImageItem) => void;
  emptyMessage?: string;
  dateFormatter?: (date: Date) => string;
}

export function ImageGrid({
  images,
  onImageClick,
  emptyMessage = "Aucune image disponible",
  dateFormatter = (date: Date) => date.toLocaleDateString()
}: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div 
          key={image.id || index} 
          className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-[1.02]"
          onClick={() => onImageClick && onImageClick(image)}
          role={onImageClick ? "button" : undefined}
          tabIndex={onImageClick ? 0 : undefined}
        >
          <div className="relative h-40">
            <Image
              src={image.url}
              alt={image.alt || image.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="p-3">
            <p className="font-medium text-sm truncate" title={image.name}>{image.name}</p>
            {image.date && (
              <p className="text-xs text-gray-500">{dateFormatter(image.date)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 