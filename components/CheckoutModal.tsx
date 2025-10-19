// Ruta: components/CheckoutModal.tsx
"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { CartItem } from "@/types/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { DescuentoSelector } from "@/components/DescuentoSelector";
import { AlertaStock } from "@/components/AlertaStock";

type Props = {
  readonly cart: CartItem[];
  readonly total: number;
  readonly onClose: () => void;
  readonly onConfirm: (
    recibido: number,
    descuentoData?: any
  ) => Promise<{ alertas?: any[] }>;
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
  const [descuentoData, setDescuentoData] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);

  const subtotal = total;
  const descuento = descuentoData?.descuento || 0;
  const totalConDescuento = subtotal - descuento;
  const recibidoNum = Number.parseFloat(recibido) || 0;
  const cambio = recibidoNum - totalConDescuento;

  const handleConfirm = async () => {
    if (recibidoNum < totalConDescuento) {
      setError("El monto recibido es menor al total");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await onConfirm(recibidoNum, descuentoData);
      if (result?.alertas) {
        setAlertas(result.alertas);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Finalizar Venta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="error">
              <span>{error}</span>
            </Alert>
          )}

          {/* Alertas de Stock */}
          <AlertaStock alertas={alertas} />

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

          {/* Selector de Descuentos */}
          <DescuentoSelector subtotal={subtotal} onChange={setDescuentoData} />

          <div className="border-t my-4"></div>

          {/* Subtotal */}
          {descuento > 0 && (
            <div className="flex justify-between items-center text-lg">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          )}

          {/* Descuento */}
          {descuento > 0 && (
            <div className="flex justify-between items-center text-lg text-green-600">
              <span>Descuento:</span>
              <span>-${descuento.toFixed(2)}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span className="text-primary">
              ${totalConDescuento.toFixed(2)}
            </span>
          </div>

          {/* Monto recibido */}
          <div className="space-y-2">
            <Label htmlFor="monto-recibido" className="font-semibold">
              Monto Recibido
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="monto-recibido"
                type="number"
                step="0.01"
                className="pl-10 text-lg"
                value={recibido}
                onChange={(e) => setRecibido(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          {/* Cambio */}
          {recibidoNum > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Cambio:</span>
                  <span
                    className={`text-2xl font-bold ${
                      cambio >= 0 ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    ${cambio.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
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
              onClick={() => setRecibido(totalConDescuento.toString())}
              variant="outline"
              size="sm"
            >
              Exacto
            </Button>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-3 w-full">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              variant="default"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
