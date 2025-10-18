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

type Receta = {
  id: number;
  nombre: string;
  precioVenta: number;
  imagen: string | null;
  ingredientes: any[];
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
    } catch (error: any) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Área de productos */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-base-content">
            Punto de Venta — Verde Olivo
          </h1>
          <Link href="/admin" className="btn btn-ghost">
            <Settings className="w-5 h-5 mr-2" />
            Admin
          </Link>
        </div>

        {recetas.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center py-20">
              <h2 className="card-title text-2xl mb-4">
                No hay recetas disponibles
              </h2>
              <p className="text-base-content/70 mb-4">
                Crea recetas desde el panel de administración para comenzar a
                vender.
              </p>
              <Link href="/admin/recetas" className="btn btn-primary">
                Ir a Recetas
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recetas.map((receta) => (
              <button
                key={receta.id}
                onClick={() => addToCart(receta)}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
              >
                <figure className="h-32 bg-base-200">
                  {receta.imagen ? (
                    <img
                      src={receta.imagen}
                      alt={receta.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-base-content/30">
                      <span className="text-5xl">🍽️</span>
                    </div>
                  )}
                </figure>
                <div className="card-body p-4">
                  <h3 className="font-bold text-sm line-clamp-2">
                    {receta.nombre}
                  </h3>
                  <p className="text-lg font-bold text-primary">
                    ${receta.precioVenta.toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carrito lateral */}
      <div className="w-96 bg-base-100 shadow-2xl flex flex-col">
        <div className="p-6 border-b border-base-300">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Carrito</h2>
            <span className="badge badge-primary">{cart.length}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-base-content/50">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Carrito vacío</p>
              <p className="text-sm">Selecciona productos para agregar</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.recetaId} className="card bg-base-200">
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm flex-1">
                      {item.nombre}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.recetaId)}
                      className="btn btn-ghost btn-xs btn-circle"
                    >
                      <Trash2 className="w-4 h-4 text-error" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.recetaId, item.cantidad - 1)
                        }
                        className="btn btn-sm btn-circle"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-8 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.recetaId, item.cantidad + 1)
                        }
                        className="btn btn-sm btn-circle btn-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-lg">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-base-300 space-y-4">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Total:</span>
              <span className="text-primary">${getTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="btn btn-primary btn-lg w-full"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cobrar
            </button>
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
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success">
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold">¡Venta realizada con éxito!</span>
          </div>
        </div>
      )}
    </div>
  );
}
