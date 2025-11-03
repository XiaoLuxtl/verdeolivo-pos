// components/recetas/ingredientes/IngredienteCard.tsx

import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ingrediente } from "./IngredientesModal"; // Importar tipo

interface Props {
  readonly ingrediente: Ingrediente;
  readonly onDelete: (ingredienteId: number) => void;
  readonly onEdit: (ingrediente: Ingrediente) => void;
}

export default function IngredienteCard({
  ingrediente,
  onDelete,
  onEdit,
}: Props) {
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
            Costo: ${costoIngrediente.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => onEdit(ingrediente)}
            variant="outline"
            size="sm"
            aria-label={`Editar ingrediente ${ingrediente.producto.nombre}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            onClick={() => onDelete(ingrediente.id)}
            variant="destructive"
            size="sm"
            aria-label={`Eliminar ingrediente ${ingrediente.producto.nombre}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
