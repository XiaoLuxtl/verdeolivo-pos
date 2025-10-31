// components/recetas/ingredientes/IngredienteCard.tsx

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ingrediente } from "./IngredientesModal"; // Importar tipo

interface Props {
  readonly ingrediente: Ingrediente;
  readonly onDelete: (ingredienteId: number) => void;
}

export default function IngredienteCard({ ingrediente, onDelete }: Props) {
  // 💡 Cálculo del costo individual
  const costoIngrediente =
    ingrediente.cantidad * (ingrediente.producto.precioPorUnidad || 0);

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0 pr-4">
          <p className="font-semibold">{ingrediente.producto.nombre}</p>
          <p className="text-sm text-muted-foreground">
            {ingrediente.cantidad.toFixed(2)} {ingrediente.unidad.toLowerCase()}
          </p>
          <p className="text-xs text-green-600 font-medium mt-1">
            Costo: **${costoIngrediente.toFixed(4)}**
          </p>
        </div>
        <Button
          type="button"
          onClick={() => onDelete(ingrediente.id)}
          variant="destructive"
          size="sm"
          aria-label={`Eliminar ingrediente ${ingrediente.producto.nombre}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
