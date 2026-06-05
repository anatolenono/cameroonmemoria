'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateAnnouncementResponse } from '@/features/feature-announcement/presentation/services/announcementApiService';
import { announcementApiService } from '@/features/feature-announcement/presentation/services/announcementApiService';
import { CreateCondolenceForm } from '@/features/feature-condolence/presentation/components/CreateCondolenceForm';
import type { CondolenceResponse } from '@/features/feature-condolence/presentation/services/condolenceApiService';
import { condolenceApiService } from '@/features/feature-condolence/presentation/services/condolenceApiService';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const PAGE_SIZE = 10;

export default function CondolencesPage() {
  const params = useParams();
  const id = params?.id as string;

  const [announcement, setAnnouncement] = useState<CreateAnnouncementResponse | null>(null);
  const [condolences, setCondolences] = useState<CondolenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageRef = useRef(1);

  // Charger l'annonce au montage
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const ann = await announcementApiService.getAnnouncementById(id);
        if (isMounted) setAnnouncement(ann);
      } catch {
        if (isMounted) setError("Erreur lors du chargement de l'annonce.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Charger la première page de condoléances au montage ou après création
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await condolenceApiService.getCondolencesByAnnouncementId(id, {
          isApproved: true,
          limit: PAGE_SIZE,
          offset: 0,
        });
        if (isMounted) {
          setCondolences(res.condolences);
          setHasMore(res.condolences.length < res.total);
          pageRef.current = 1;
        }
      } catch {
        if (isMounted) setError('Erreur lors du chargement des condoléances.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Fonction pour charger la page suivante (plus de useCallback)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const offset = pageRef.current * PAGE_SIZE;
      const res = await condolenceApiService.getCondolencesByAnnouncementId(id, {
        isApproved: true,
        limit: PAGE_SIZE,
        offset,
      });
      setCondolences((prev) => {
        const newList = [...prev, ...res.condolences];
        // Si on a reçu moins que PAGE_SIZE ou si on a tout reçu, on arrête
        const noMore = res.condolences.length < PAGE_SIZE || newList.length >= res.total;
        setHasMore(!noMore);
        return newList;
      });
      pageRef.current += 1;
    } catch {
      setError('Erreur lors du chargement des condoléances.');
    } finally {
      setLoadingMore(false);
    }
  }, [id, loadingMore, hasMore]);

  // Intersection Observer pour le scroll infini (observer stable)
  useEffect(() => {
    if (!loaderRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadMore();
        }
      },
      { threshold: 1 }
    );
    observerRef.current.observe(loaderRef.current);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadingMore, hasMore, error, loading, loadMore]);

  // handleSuccess classique (plus de useCallback)
  function handleSuccess() {
    setShowForm(false);
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await condolenceApiService.getCondolencesByAnnouncementId(id, {
          isApproved: true,
          limit: PAGE_SIZE,
          offset: 0,
        });
        setCondolences(res.condolences);
        setHasMore(res.condolences.length < res.total);
        pageRef.current = 1;
      } catch {
        setError('Erreur lors du chargement des condoléances.');
      } finally {
        setLoading(false);
      }
    })();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4">
          <MessageCircle className="h-8 w-8 animate-pulse mx-auto" />
          <p className="text-muted-foreground">Chargement des condoléances...</p>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/announcements">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux annonces
          </Link>
        </Button>
        <div className="text-center text-red-600">{error || 'Annonce introuvable.'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={`/announcements/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l&apos;annonce
        </Link>
      </Button>
      <h1 className="text-2xl font-bold mb-2">Condoléances pour : {announcement.title}</h1>
      {/* Bouton ou formulaire en haut */}
      <div className="mb-6">
        {showForm ? (
          <CreateCondolenceForm
            announcementId={id}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <Button onClick={() => setShowForm(true)} className="w-full" variant="default">
            <MessageCircle className="mr-2 h-5 w-5" /> Laisser un message
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Messages de condoléances</CardTitle>
        </CardHeader>
        <CardContent>
          {condolences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="mx-auto h-8 w-8 mb-2" />
              <p>Aucun message de condoléances pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {condolences.map((condolence) => (
                <div key={condolence.id} className="border-l-2 border-muted pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {condolence.isAnonymous ? 'Anonyme' : condolence.user?.name || 'Utilisateur'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(condolence.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{condolence.message}</p>
                </div>
              ))}
              {/* Loader pour le scroll infini */}
              {hasMore && (
                <div ref={loaderRef} className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
