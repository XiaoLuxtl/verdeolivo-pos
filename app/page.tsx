// Ruta: app/page.tsx
"use client";

import { useState } from "react";
import { Settings, CheckCircle } from "lucide-react";
import CheckoutModal from "@/components/CheckoutModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Alert } from "@/components/ui/alert";
import { useRecetas } from "@/hooks/useRecetas";
import { useCategorias } from "@/hooks/useCategorias";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { CategoriasView } from "@/components/CategoriasView";
import { ProductosView } from "@/components/ProductosView";
import { CartSidebar } from "@/components/CartSidebar";

export default function POSPage() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    string | null
  >(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Hooks personalizados
  const { recetas, loading, error } = useRecetas();
  const { categoriasOrdenadas } = useCategorias(recetas);
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    getTotal,
    clearCart,
  } = useCart();
  const { handleCheckout } = useCheckout();

  // Funciones de navegación
  const seleccionarCategoria = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
  };

  const volverACategorias = () => {
    setCategoriaSeleccionada(null);
  };

  // Handler para checkout
  const onCheckout = async (recibido: number, descuentoData?: any) => {
    try {
      const result = await handleCheckout(cart, recibido, descuentoData);

      // Éxito
      setShowCheckout(false);
      setShowSuccess(true);
      clearCart();

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      return result;
    } catch (error) {
      console.error("Error en checkout:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <Alert className="max-w-md">
          <span className="font-bold">Error al cargar datos:</span> {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col lg:flex-row">
      {/* Área de productos */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">
            Punto de Venta — Verde Olivo
          </h1>
          <Link href="/admin">
            <Button variant="ghost">
              <Settings className="w-5 h-5 mr-2" />
              Admin
            </Button>
          </Link>
        </div>

        {recetas.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                No hay recetas disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Crea recetas desde el panel de administración para comenzar a
                vender.
              </p>
              <Link href="/admin/recetas">
                <Button variant="default">Ir a Recetas</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div>
            {categoriaSeleccionada ? (
              <ProductosView
                categoriaSeleccionada={categoriaSeleccionada}
                categoriaData={categoriasOrdenadas.find(
                  (c) => c.categoria === categoriaSeleccionada
                )}
                onVolver={volverACategorias}
                onAgregarAlCarrito={addToCart}
              />
            ) : (
              <CategoriasView
                categoriasOrdenadas={categoriasOrdenadas}
                onSeleccionarCategoria={seleccionarCategoria}
              />
            )}
          </div>
        )}
      </div>

      {/* Carrito lateral */}
      <CartSidebar
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => setShowCheckout(true)}
        total={getTotal()}
      />

      {/* Modal de checkout */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={getTotal()}
          onClose={() => setShowCheckout(false)}
          onConfirm={onCheckout}
        />
      )}

      {/* Toast de éxito */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold">¡Venta realizada con éxito!</span>
          </Alert>
        </div>
      )}
    </div>
  );
}
