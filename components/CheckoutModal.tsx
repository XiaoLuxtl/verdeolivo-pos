// Ruta: components/CheckoutModal.tsx
"use client";

import { useState } from "react";
import { X, DollarSign } from "lucide-react";
import { CartItem } from "@/types/cart";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Alert } from "./ui/Alert";
import { Modal, ModalHeader, ModalBody, ModalActions } from "./ui/Modal";

type Props = {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onConfirm: (recibido: number) => Promise<void>;
};

export default function CheckoutModal({
  cart,
  total,
  onClose,
  onConfirm,
}: Props) {
  const [recibido, setRecibido] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recibidoNum = parseFloat(recibido) || 0;
  const cambio = recibidoNum - total;

  const handleConfirm = async () => {
    if (recibidoNum < total) {
      setError("El monto recibido es menor al total");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onConfirm(recibidoNum);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <ModalHeader>
        <h2 className="text-2xl font-bold">Finalizar Venta</h2>
        <Button onClick={onClose} variant="ghost" size="sm" shape="circle">
          <X className="w-5 h-5" />
        </Button>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {error && (
            <Alert variant="error">
              <span>{error}</span>
            </Alert>
          )}

          {/* Resumen */}
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.recetaId} className="flex justify-between text-sm">
                <span>
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="font-semibold">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="divider"></div>

          {/* Total */}
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>

          {/* Monto recibido */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Monto Recibido</span>
            </label>
            <label className="input-group">
              <span className="bg-primary text-primary-content">
                <DollarSign className="w-5 h-5" />
              </span>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full text-lg"
                value={recibido}
                onChange={(e) => setRecibido(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </label>
          </div>

          {/* Cambio */}
          {recibidoNum > 0 && (
            <div className="card bg-base-200">
              <div className="card-body py-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Cambio:</span>
                  <span
                    className={`text-2xl font-bold ${
                      cambio >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    ${cambio.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acceso rápido */}
          <div className="grid grid-cols-3 gap-2">
            {[50, 100, 200, 500, 1000].map((monto) => (
              <Button
                key={monto}
                type="button"
                onClick={() => setRecibido(monto.toString())}
                variant="outline"
                size="sm"
              >
                ${monto}
              </Button>
            ))}
            <Button
              type="button"
              onClick={() => setRecibido(total.toString())}
              variant="outline"
              size="sm"
            >
              Exacto
            </Button>
          </div>
        </div>
      </ModalBody>

      <ModalActions>
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
            className="flex-1"
            disabled={loading || recibidoNum < total}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Confirmar Venta"
            )}
          </Button>
        </div>
      </ModalActions>
    </Modal>
  );
}
