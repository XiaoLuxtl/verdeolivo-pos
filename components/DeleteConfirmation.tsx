"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  readonly title: string;
  readonly message: string;
  readonly confirmText?: string;
  readonly onConfirm: () => Promise<void>;
  readonly onCancel: () => void;
};

export default function DeleteConfirmation({
  title,
  message,
  confirmText = "ELIMINAR",
  onConfirm,
  onCancel,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (inputValue !== confirmText) return;

    setLoading(true);
    setError("");

    try {
      await onConfirm();
      onCancel();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
          </div>

          <p className="text-muted-foreground">{message}</p>

          {error && (
            <Alert variant="error">
              <span>{error}</span>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Escribe <strong>{confirmText}</strong> para confirmar
            </label>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmText}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-3 w-full">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              variant="destructive"
              className="flex-1"
              disabled={inputValue !== confirmText || loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Eliminar"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
