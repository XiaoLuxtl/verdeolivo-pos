// Componente para la vista de selección de categorías
import { CategoriaCard } from "./CategoriaCard";

interface CategoriasViewProps {
  readonly categoriasOrdenadas: Array<{
    categoria: string;
    recetas: any[];
    config: any;
  }>;
  readonly onSeleccionarCategoria: (categoria: string) => void;
}

export function CategoriasView({
  categoriasOrdenadas,
  onSeleccionarCategoria,
}: CategoriasViewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Selecciona una categoría
        </h2>
        <p className="text-muted-foreground">
          Elige el tipo de producto que deseas vender
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoriasOrdenadas.map(({ categoria, recetas, config }) => (
          <CategoriaCard
            key={categoria}
            categoria={categoria}
            config={config}
            cantidadProductos={recetas.length}
            onClick={() => onSeleccionarCategoria(categoria)}
          />
        ))}
      </div>
    </div>
  );
}
