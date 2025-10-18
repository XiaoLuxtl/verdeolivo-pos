"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Alert } from "./ui/Alert";
import { Modal, ModalBody, ModalActions } from "./ui/Modal";

type Props = {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
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
    } catch (err: any) {
      setError(err.message || "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onCancel}>
      <ModalBody>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-error/10 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6 text-error" />
          </div>
          <h3 className="text-xl font-bold text-base-content">{title}</h3>
        </div>

        <p className="text-base-content/70 mb-4">{message}</p>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">
              Escribe <strong>{confirmText}</strong> para confirmar
            </span>
          </label>
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmText}
            disabled={loading}
          />
        </div>
      </ModalBody>

      <ModalActions>
        <div className="flex gap-3 justify-end">
          <Button onClick={onCancel} variant="ghost" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="error"
            disabled={inputValue !== confirmText || loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Eliminar"
            )}
          </Button>
        </div>
      </ModalActions>
    </Modal>
  );
}
