// Hook para manejar el estado y lógica del carrito de compras
import { useState } from "react";
import { CartItem } from "@/types/cart";
import { Receta } from "./useRecetas";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  };

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + item.cantidad, 0);
  };

  const isEmpty = cart.length === 0;

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    getItemCount,
    isEmpty,
  };
}
