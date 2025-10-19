// Componente para la vista de productos de una categoría específica
import { Button } from "@/components/ui/button";
import { RecetaCard } from "./RecetaCard";
import { Receta } from "@/hooks/useRecetas";

interface ProductosViewProps {
  readonly categoriaSeleccionada: string;
  readonly categoriaData:
    | {
        categoria: string;
        recetas: Receta[];
        config: any;
      }
    | undefined;
  readonly onVolver: () => void;
  readonly onAgregarAlCarrito: (receta: Receta) => void;
}

export function ProductosView({
  categoriaSeleccionada,
  categoriaData,
  onVolver,
  onAgregarAlCarrito,
}: ProductosViewProps) {
  if (!categoriaData) return null;

  const { config, recetas } = categoriaData;

  return (
    <div className="space-y-6">
      {/* Header con botón de volver */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onVolver}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          ← Volver a categorías
        </Button>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-lg`}
          >
            {config.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {config.nombre}
            </h2>
            <p className="text-muted-foreground">
              {recetas.length}{" "}
              {recetas.length === 1
                ? "receta disponible"
                : "recetas disponibles"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {recetas.map((receta) => (
          <RecetaCard
            key={receta.id}
            receta={receta}
            icon={config.icon}
            onClick={() => onAgregarAlCarrito(receta)}
          />
        ))}
      </div>
    </div>
  );
}
