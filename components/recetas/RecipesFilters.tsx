// components/recetas/RecipesFilters.tsx
interface RecipesFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNewRecipe: () => void;
}

export function RecipesFilters({
  searchTerm,
  onSearchChange,
  onNewRecipe,
}: RecipesFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Buscar recetas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        onClick={onNewRecipe}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Nueva Receta
      </button>
    </div>
  );
}
