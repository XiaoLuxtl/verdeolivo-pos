"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, List, Search, ChefHat } from "lucide-react";
import RecetaForm from "@/components/RecetaForm";
import IngredientesModal from "@/components/IngredientesModal";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

type IngredienteReceta = {
  id: number;
  cantidad: number;
  producto: {
    id: number;
    nombre: string;
    unidad: string;
    precioUnitario: number;
  };
};

type Receta = {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  precioVenta: number;
  imagen: string | null;
  ingredientes: IngredienteReceta[];
};

type RecetaFormData = {
  id?: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precioVenta: string;
  imagen: string | null;
};

export default function RecetasPage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [filteredRecetas, setFilteredRecetas] = useState<Receta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState<RecetaFormData | null>(
    null
  );
  const [showIngredientes, setShowIngredientes] = useState(false);
  const [recetaIngredientes, setRecetaIngredientes] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recetaToDelete, setRecetaToDelete] = useState<Receta | null>(null);

  const fetchRecetas = async () => {
    try {
      const response = await fetch("/api/recetas");
      const data = await response.json();
      setRecetas(data);
      setFilteredRecetas(data);
    } catch (error) {
      console.error("Error al cargar recetas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecetas();
  }, []);

  useEffect(() => {
    const filtered = recetas.filter((r) =>
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecetas(filtered);
  }, [searchTerm, recetas]);

  const handleEdit = (receta: Receta) => {
    setSelectedReceta({
      id: receta.id,
      nombre: receta.nombre,
      categoria: receta.categoria,
      descripcion: receta.descripcion || "",
      precioVenta: receta.precioVenta.toString(),
      imagen: receta.imagen,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!recetaToDelete) return;

    const response = await fetch(`/api/recetas/${recetaToDelete.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }

    await fetchRecetas();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedReceta(null);
  };

  const handleShowIngredientes = (receta: Receta) => {
    setRecetaIngredientes({ id: receta.id, nombre: receta.nombre });
    setShowIngredientes(true);
  };

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
        <Button onClick={() => setShowForm(true)} variant="default">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Receta
        </Button>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar recetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recetas agrupadas por categoría */}
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
              <Plus className="w-4 h-4 mr-2" />
              Crear primera receta
            </Button>
          </CardContent>
        </Card>
      ) : (
        (() => {
          // Agrupar recetas por categoría
          const recetasPorCategoria = filteredRecetas.reduce((acc, receta) => {
            const categoria = receta.categoria;
            if (!acc[categoria]) {
              acc[categoria] = [];
            }
            acc[categoria].push(receta);
            return acc;
          }, {} as Record<string, Receta[]>);

          return Object.entries(recetasPorCategoria).map(
            ([categoria, recetasCategoria]) => (
              <div key={categoria} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground capitalize">
                    {categoria.toLowerCase().replace("_", " ")}
                  </h2>
                  <Badge variant="outline" className="text-sm">
                    {recetasCategoria.length} receta
                    {recetasCategoria.length === 1 ? "" : "s"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recetasCategoria.map((receta) => (
                    <Card
                      key={receta.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Imagen */}
                      <div className="h-48 bg-muted flex items-center justify-center">
                        {receta.imagen ? (
                          <img
                            src={receta.imagen}
                            alt={receta.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-muted-foreground/50">
                            <span className="text-6xl">🍽️</span>
                          </div>
                        )}
                      </div>

                      <CardHeader>
                        <CardTitle className="text-lg">
                          {receta.nombre}
                        </CardTitle>
                        {receta.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {receta.descripcion}
                          </p>
                        )}
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            ${receta.precioVenta.toFixed(2)}
                          </span>
                          <Badge variant="secondary">
                            {receta.ingredientes.length} ingredientes
                          </Badge>
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleShowIngredientes(receta)}
                          variant="ghost"
                          size="sm"
                          title="Ver ingredientes"
                          className="h-8 w-8 p-0"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleEdit(receta)}
                          variant="ghost"
                          size="sm"
                          title="Editar"
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setRecetaToDelete(receta);
                            setShowDeleteConfirm(true);
                          }}
                          variant="ghost"
                          size="sm"
                          title="Eliminar"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )
          );
        })()
      )}

      {/* Formulario de receta */}
      {showForm && (
        <RecetaForm
          receta={selectedReceta || undefined}
          onClose={handleCloseForm}
          onSave={fetchRecetas}
        />
      )}

      {/* Modal de ingredientes */}
      {showIngredientes && recetaIngredientes && (
        <IngredientesModal
          recetaId={recetaIngredientes.id}
          recetaNombre={recetaIngredientes.nombre}
          onClose={() => {
            setShowIngredientes(false);
            setRecetaIngredientes(null);
            fetchRecetas(); // Refrescar para actualizar el contador de ingredientes
          }}
        />
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && recetaToDelete && (
        <DeleteConfirmation
          title="Eliminar Receta"
          message={`¿Estás seguro de eliminar la receta "${recetaToDelete.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setRecetaToDelete(null);
          }}
        />
      )}
    </div>
  );
}
