// app/admin/productos/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import ProductoForm, {
  type Producto as ProductoFormType,
} from "@/components/ProductoForm"; // ← Importar el tipo
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Loading } from "@/components/ui/loading";

// Tipo para los productos de la BD
type Producto = {
  id: number;
  sku: string;
  nombre: string;
  sabor: string | null;
  proveedor: string | null;
  precioUnitario: number;
  peso: number | null;
  unidad: string;
  descripcion: string | null;
  inventario: {
    cantidadActual: number;
    unidad: string;
  } | null;
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducto, setSelectedProducto] =
    useState<ProductoFormType | null>(null); // ← Usar el tipo importado
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(
    null
  );

  const fetchProductos = async () => {
    try {
      const response = await fetch("/api/productos");
      const data = await response.json();
      setProductos(data);
      setFilteredProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    const filtered = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sabor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProductos(filtered);
  }, [searchTerm, productos]);

  const handleEdit = (producto: Producto) => {
    setSelectedProducto({
      id: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      sabor: producto.sabor || "",
      proveedor: producto.proveedor || "",
      precioUnitario: producto.precioUnitario.toString(),
      peso: producto.peso?.toString() || "",
      unidad: producto.unidad,
      descripcion: producto.descripcion || "",
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!productoToDelete) return;

    const response = await fetch(`/api/productos/${productoToDelete.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }

    await fetchProductos();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProducto(null);
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
          <Package className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground">
              Gestiona tu inventario de productos
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} variant="default">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, SKU o sabor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Sabor</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProductos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No hay productos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProductos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-mono">
                        {producto.sku}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {producto.nombre}
                      </TableCell>
                      <TableCell>{producto.sabor || "-"}</TableCell>
                      <TableCell>
                        ${producto.precioUnitario.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (producto.inventario?.cantidadActual || 0) > 0
                              ? "default"
                              : "destructive"
                          }
                        >
                          {producto.inventario?.cantidadActual || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{producto.unidad}</TableCell>
                      <TableCell>{producto.proveedor || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleEdit(producto)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setProductoToDelete(producto);
                              setShowDeleteConfirm(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Formulario */}
      {showForm && (
        <ProductoForm
          producto={selectedProducto}
          onClose={handleCloseForm}
          onSave={fetchProductos}
        />
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && productoToDelete && (
        <DeleteConfirmation
          title="Eliminar Producto"
          message={`¿Estás seguro de eliminar el producto "${productoToDelete.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setProductoToDelete(null);
          }}
        />
      )}
    </div>
  );
}
