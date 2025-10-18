// Ruta: components/CheckoutModal.tsx
"use client";

import { useState } from "react";
import { X, DollarSign } from "lucide-react";
import { CartItem } from "@/types/cart";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold text-base-content">
            Finalizar Venta
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
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
              <button
                key={monto}
                type="button"
                onClick={() => setRecibido(monto.toString())}
                className="btn btn-sm btn-outline"
              >
                ${monto}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRecibido(total.toString())}
              className="btn btn-sm btn-outline"
            >
              Exacto
            </button>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-primary flex-1"
              disabled={loading || recibidoNum < total}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Confirmar Venta"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
