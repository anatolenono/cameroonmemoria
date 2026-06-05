import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload d\'images - Cameroon Memoria',
  description: 'Démonstration d\'upload d\'images avec MinIO',
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {children}
    </section>
  );
} 