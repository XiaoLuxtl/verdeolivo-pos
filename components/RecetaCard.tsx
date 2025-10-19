// Componente para mostrar una tarjeta de receta/producto
import { Card, CardContent } from "@/components/ui/card";
import { Receta } from "@/hooks/useRecetas";

interface RecetaCardProps {
  readonly receta: Receta;
  readonly icon: string;
  readonly onClick: () => void;
}

export function RecetaCard({ receta, icon, onClick }: RecetaCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 overflow-hidden"
      onClick={onClick}
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
            <span className="text-4xl">{icon}</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-sm line-clamp-2 mb-2">{receta.nombre}</h3>
        <p className="text-lg font-bold text-primary">
          ${receta.precioVenta.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}
