'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserPlus, Trash2, Mail, Globe } from 'lucide-react';

interface AnnouncementAdmin {
  id: string;
  announcementId: string;
  userId: string;
  role: string;
  addedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Props {
  announcementId: string;
  isCreator: boolean;
}

export function AnnouncementAdminsManager({ announcementId, isCreator }: Props) {
  const [admins, setAdmins] = useState<AnnouncementAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, [announcementId]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/announcements/${announcementId}/admins`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setAdmins(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!email) return;

    try {
      setInviting(true);
      setError(null);
      const response = await fetch(`/api/announcements/${announcementId}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'invitation');
      }

      await fetchAdmins();
      setEmail('');
      setOpenDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/announcements/${announcementId}/admins/${userId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      await fetchAdmins();
      setRemovingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  if (!isCreator) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Admins de l'annonce
          </CardTitle>
          <CardDescription>
            Gérez qui peut éditer et payer les services pour cette annonce
          </CardDescription>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un admin annonce</DialogTitle>
              <DialogDescription>
                L'administrateur invité pourra éditer l'annonce et payer les prestations.
                Utile pour les familles dans la diaspora.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email du nouvel admin</label>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 flex items-center gap-2 px-3 border rounded-md bg-gray-50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={inviting}
                      className="border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                onClick={handleInvite}
                disabled={!email || inviting}
                className="w-full"
              >
                {inviting ? 'Invitation en cours...' : 'Inviter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Aucun administrateur invité pour le moment
          </p>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{admin.user.name || 'Sans nom'}</p>
                  <p className="text-xs text-muted-foreground">{admin.user.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    {admin.role === 'CREATOR' ? 'Créateur' : 'Admin'}
                  </Badge>

                  {admin.role !== 'CREATOR' && (
                    <AlertDialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemovingId(admin.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Retirer l'administrateur?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {admin.user.name || 'Cet utilisateur'} n'aura plus accès à cette
                            annonce.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3 justify-end">
                          <AlertDialogCancel onClick={() => setRemovingId(null)}>
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemove(admin.userId)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Retirer
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
