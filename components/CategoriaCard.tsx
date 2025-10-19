// Componente para mostrar una tarjeta de categoría
import { Card, CardContent } from "@/components/ui/card";
import { CategoriaConfig } from "@/hooks/useCategorias";

interface CategoriaCardProps {
  readonly categoria: string;
  readonly config: CategoriaConfig;
  readonly cantidadProductos: number;
  readonly onClick: () => void;
}

export function CategoriaCard({
  categoria,
  config,
  cantidadProductos,
  onClick,
}: CategoriaCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-xl hover:scale-105 overflow-hidden ${config.bgColor} ${config.borderColor} border-2`}
      onClick={onClick}
    >
      <div className="aspect-square flex items-center justify-center">
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-5xl shadow-lg`}
        >
          {config.icon}
        </div>
      </div>
      <CardContent className="p-6 text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">
          {config.nombre}
        </h3>
        <p className="text-muted-foreground mb-4">
          {cantidadProductos}{" "}
          {cantidadProductos === 1 ? "producto" : "productos"}
        </p>
        <div className="text-sm text-primary font-semibold">
          Ver productos →
        </div>
      </CardContent>
    </Card>
  );
}
