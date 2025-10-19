// Ruta: app/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Settings,
  CheckCircle,
} from "lucide-react";
import { CartItem } from "@/types/cart";
import CheckoutModal from "@/components/CheckoutModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { Alert } from "@/components/ui/alert";

type RecetaIngrediente = {
  id: number;
  recetaId: number;
  productoId: number;
  cantidad: number;
  unidad: string;
  producto: {
    id: number;
    nombre: string;
    sku: string;
  };
};

type Receta = {
  id: number;
  nombre: string;
  precioVenta: number;
  imagen: string | null;
  ingredientes: RecetaIngrediente[];
};

export default function POSPage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchRecetas();
  }, []);

  const fetchRecetas = async () => {
    try {
      const response = await fetch("/api/recetas");
      const data = await response.json();
      setRecetas(data);
    } catch (error) {
      console.error("Error al cargar recetas:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (receta: Receta) => {
    const existingItem = cart.find((item) => item.recetaId === receta.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.recetaId === receta.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          recetaId: receta.id,
          nombre: receta.nombre,
          precio: receta.precioVenta,
          cantidad: 1,
          imagen: receta.imagen,
        },
      ]);
    }
  };

  const updateQuantity = (recetaId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(recetaId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.recetaId === recetaId ? { ...item, cantidad } : item
      )
    );
  };

  const removeFromCart = (recetaId: number) => {
    setCart(cart.filter((item) => item.recetaId !== recetaId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  };

  const handleCheckout = async (recibido: number) => {
    const total = getTotal();
    const cambio = recibido - total;

    try {
      const response = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total,
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

      // Éxito
      setShowCheckout(false);
      setShowSuccess(true);
      setCart([]);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error: unknown) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recetas.map((receta) => (
              <Card
                key={receta.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 overflow-hidden"
                onClick={() => addToCart(receta)}
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {receta.imagen ? (
                    <img
                      src={receta.imagen}
                      alt={receta.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      <span className="text-5xl">🍽️</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm line-clamp-2 mb-2">
                    {receta.nombre}
                  </h3>
                  <p className="text-lg font-bold text-primary">
                    ${receta.precioVenta.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Carrito lateral */}
      <div className="w-full sm:w-96 bg-background shadow-2xl flex flex-col border-l">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Carrito</h2>
            <Badge variant="default">{cart.length}</Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Carrito vacío</p>
              <p className="text-sm">Selecciona productos para agregar</p>
            </div>
          ) : (
            cart.map((item) => (
              <Card key={item.recetaId} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm flex-1">
                      {item.nombre}
                    </h3>
                    <Button
                      onClick={() => removeFromCart(item.recetaId)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          updateQuantity(item.recetaId, item.cantidad - 1)
                        }
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-bold text-lg w-8 text-center">
                        {item.cantidad}
                      </span>
                      <Button
                        onClick={() =>
                          updateQuantity(item.recetaId, item.cantidad + 1)
                        }
                        size="sm"
                        variant="default"
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="font-bold text-lg">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t space-y-4">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Total:</span>
              <span className="text-primary">${getTotal().toFixed(2)}</span>
            </div>
            <Button
              onClick={() => setShowCheckout(true)}
              variant="default"
              size="lg"
              className="w-full"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cobrar
            </Button>
          </div>
        )}
      </div>

      {/* Modal de checkout */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={getTotal()}
          onClose={() => setShowCheckout(false)}
          onConfirm={handleCheckout}
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
