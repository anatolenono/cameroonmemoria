"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteAnnouncementButtonProps {
  id: string;
}

export function DeleteAnnouncementButton({ id }: DeleteAnnouncementButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    const confirmed = window.confirm("Confirmer la suppression de cette annonce ?");
    if (!confirmed) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur HTTP: ${res.status}`);
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      console.error("Erreur de suppression:", e);
      alert("Impossible de supprimer l'annonce. Réessayez.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={onDelete}
      disabled={deleting || isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}


