// components/recetas/ingredientes/IngredientesCostSummary.tsx

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  readonly costoTotal: number;
}

export default function IngredientesCostSummary({ costoTotal }: Props) {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="p-4">
        <CardTitle className="text-xl text-green-800 flex items-center justify-between">
          Costo Total de Materia Prima
          <span className="text-2xl font-extrabold">
            ${(Math.ceil(costoTotal * 100) / 100).toFixed(2)}{" "}
            {/* Usamos 4 decimales para mayor precisión */}
          </span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
