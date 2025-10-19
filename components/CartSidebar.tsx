// Componente para el sidebar del carrito de compras
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { CartItem } from "@/types/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CartSidebarProps {
  readonly cart: CartItem[];
  readonly onUpdateQuantity: (recetaId: number, cantidad: number) => void;
  readonly onRemoveItem: (recetaId: number) => void;
  readonly onCheckout: () => void;
  readonly total: number;
}

export function CartSidebar({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  total,
}: CartSidebarProps) {
  return (
    <div className="w-full sm:w-96 bg-background shadow-2xl flex flex-col border-l">
      {/* Header del carrito */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Carrito</h2>
          <Badge variant="default">{cart.length}</Badge>
        </div>
      </div>

      {/* Lista de items */}
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
                    onClick={() => onRemoveItem(item.recetaId)}
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
                        onUpdateQuantity(item.recetaId, item.cantidad - 1)
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
                        onUpdateQuantity(item.recetaId, item.cantidad + 1)
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

      {/* Footer con total y botón de checkout */}
      {cart.length > 0 && (
        <div className="p-6 border-t space-y-4">
          <div className="flex justify-between items-center text-2xl font-bold">
            <span>Total:</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
          <Button
            onClick={onCheckout}
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
  );
}
