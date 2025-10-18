"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
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
            <input
              type="text"
              className="input input-bordered"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmText}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-error"
              disabled={inputValue !== confirmText || loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Eliminar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
