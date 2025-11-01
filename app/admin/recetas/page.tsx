"use client";

import { ChefHat } from "lucide-react";
import RecetaForm from "@/components/RecetaForm";
import IngredientesModal from "@/components/recetas/ingredientes/IngredientesModal";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useRecetas } from "@/hooks/useRecetas";
import { RecipesFilters } from "@/components/recetas/RecipesFilters";
import { RecipesList } from "@/components/recetas/RecipesList";

export default function RecetasPage() {
  const {
    filteredRecetas,
    searchTerm,
    loading,
    showForm,
    selectedReceta,
    showIngredientes,
    recetaIngredientes,
    showDeleteConfirm,
    recetaToDelete,
    setSearchTerm,
    fetchRecetas,
    refreshRecetas,
    handleEdit,
    handleDelete,
    handleCloseForm,
    handleShowIngredientes,
    handleCloseIngredientes,
    handleCloseDeleteConfirm,
    handleShowDeleteConfirm,
    setShowForm,
  } = useRecetas();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recetas</h1>
            <p className="text-muted-foreground">
              Gestiona tu catálogo de recetas
            </p>
          </div>
        </div>
      </div>

      <RecipesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewRecipe={() => setShowForm(true)}
      />

      {filteredRecetas.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <CardContent className="text-center">
            <ChefHat className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">
              No hay recetas registradas
            </CardTitle>
            <p className="text-muted-foreground mb-4">
              Crea tu primera receta para comenzar a vender
            </p>
            <Button onClick={() => setShowForm(true)} variant="default">
              Crear primera receta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RecipesList
          recipes={filteredRecetas}
          onEdit={handleEdit}
          onDelete={handleShowDeleteConfirm}
          onShowIngredientes={handleShowIngredientes}
        />
      )}

      {/* Formulario de receta */}
      {showForm && (
        <RecetaForm
          receta={selectedReceta || undefined}
          onClose={handleCloseForm}
          onSave={refreshRecetas}
        />
      )}

      {/* Modal de ingredientes */}
      {showIngredientes && recetaIngredientes && (
        <IngredientesModal
          recetaId={recetaIngredientes.id}
          recetaNombre={recetaIngredientes.nombre}
          onClose={handleCloseIngredientes}
        />
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && recetaToDelete && (
        <DeleteConfirmation
          title="Eliminar Receta"
          message={`¿Estás seguro de eliminar la receta "${recetaToDelete.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={handleCloseDeleteConfirm}
        />
      )}
    </div>
  );
}
