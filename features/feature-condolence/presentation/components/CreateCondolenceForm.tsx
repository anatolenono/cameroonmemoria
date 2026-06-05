"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, MessageCircle, Loader2, CheckCircle } from "lucide-react";
import { condolenceApiService } from "../services/condolenceApiService";
import { CreateCondolenceDto } from "../../domain/types/condolence";

// Schéma de validation Zod
const createCondolenceSchema = z.object({
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(500, "Le message ne peut pas dépasser 500 caractères"),
});

type CreateCondolenceFormData = z.infer<typeof createCondolenceSchema>;

interface CreateCondolenceFormProps {
  announcementId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCondolenceForm({ 
  announcementId, 
  onSuccess, 
  onCancel 
}: CreateCondolenceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateCondolenceFormData>({
    resolver: zodResolver(createCondolenceSchema),
    mode: "onChange",
    defaultValues: {
      message: "",
    }
  });

  const watchedMessage = watch("message");
  const messageLength = watchedMessage?.length || 0;

  const handleFormSubmit = async (data: CreateCondolenceFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const condolenceData: CreateCondolenceDto = {
        message: data.message,
        announcementId,
      };

      await condolenceApiService.createCondolence(condolenceData);
      
      setSubmitSuccess(true);
      reset();
      
      // Appeler le callback de succès après un délai pour montrer le message
      setTimeout(() => {
        setSubmitSuccess(false);
        onSuccess?.();
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de la création de la condoléance:", error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : "Une erreur est survenue lors de l'envoi de votre message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-800 mb-4">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Message envoyé avec succès</span>
          </div>
          <p className="text-green-700 text-sm">
            Votre message de condoléances a été envoyé et sera publié après modération.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          Laisser un message de condoléances
        </CardTitle>
        <CardDescription>
          Partagez vos condoléances et votre soutien à la famille
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Votre message</Label>
            <textarea
              id="message"
              {...register("message")}
              placeholder="Exprimez vos condoléances, partagez un souvenir ou offrez votre soutien..."
              className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              <div>
                {errors.message && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.message.message}</span>
                  </div>
                )}
              </div>
              <span className={`text-xs ${messageLength > 450 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {messageLength}/500
              </span>
            </div>
          </div>

          {/* Erreur de soumission */}
          {submitError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Envoyer le message
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            )}
          </div>

          {/* Note de modération */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <p>
              <strong>Note :</strong> Votre message sera examiné avant publication pour s&apos;assurer qu&apos;il respecte nos conditions d&apos;utilisation. 
              Cela peut prendre quelques heures.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 