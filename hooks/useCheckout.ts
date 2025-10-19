// Hook para manejar el proceso de checkout
import { useState } from "react";
import { CartItem } from "@/types/cart";

export function useCheckout() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const openCheckout = () => setShowCheckout(true);
  const closeCheckout = () => setShowCheckout(false);

  const handleCheckout = async (
    cart: CartItem[],
    recibido: number,
    descuentoData?: any
  ) => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );
    const descuento = descuentoData?.descuento || 0;
    const totalConDescuento = subtotal - descuento;
    const cambio = recibido - totalConDescuento;

    setLoading(true);

    try {
      const response = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtotal,
          descuento,
          tipoDescuento: descuentoData?.tipoDescuento || null,
          valorDescuentoOriginal: descuentoData?.valorDescuentoOriginal || null,
          total: totalConDescuento,
          recibido,
          cambio,
          metodoPago: "efectivo",
          detalles: cart.map((item) => ({
            recetaId: item.recetaId,
            recetaNombre: item.nombre,
            cantidad: item.cantidad,
            precioUnitario: item.precio,
            subtotal: item.precio * item.cantidad,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const result = await response.json();

      // Éxito
      setShowCheckout(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      // Retornar alertas de stock si existen
      return { alertas: result.alertas || [] };
    } catch (error: unknown) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    showCheckout,
    showSuccess,
    loading,
    openCheckout,
    closeCheckout,
    handleCheckout,
  };
}
