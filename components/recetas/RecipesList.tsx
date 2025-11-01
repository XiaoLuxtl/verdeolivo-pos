// components/recetas/RecipesList.tsx
import { RecetaConIngredientes } from "@/types";

type Receta = RecetaConIngredientes & { id: number };

interface RecipesListProps {
  recipes: Receta[];
  onEdit: (receta: Receta) => void;
  onDelete: (receta: Receta) => void;
  onShowIngredientes: (receta: Receta) => void;
}

export function RecipesList({
  recipes,
  onEdit,
  onDelete,
  onShowIngredientes,
}: RecipesListProps) {
  // Agrupar recetas por categoría
  const groupedRecipes = recipes.reduce((acc, recipe) => {
    const category = recipe.categoria || "Sin categoría";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(recipe);
    return acc;
  }, {} as Record<string, Receta[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedRecipes).map(([category, categoryRecipes]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
            <p className="text-sm text-gray-600">
              {categoryRecipes.length} receta
              {categoryRecipes.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {categoryRecipes.map((receta) => (
              <div key={receta.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {receta.imagen && (
                      <img
                        src={receta.imagen}
                        alt={receta.nombre}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {receta.nombre}
                      </h4>
                      {receta.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">
                          {receta.descripcion}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          ${receta.precioVenta.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {receta.ingredientes?.length || 0} ingredientes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onShowIngredientes(receta)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Ingredientes
                    </button>
                    <button
                      onClick={() => onEdit(receta)}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(receta)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
