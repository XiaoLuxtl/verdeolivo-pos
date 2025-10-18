"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import ProductoForm from "@/components/ProductoForm";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import {
  Button,
  Input,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@/components/ui";

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
  const [selectedProducto, setSelectedProducto] = useState<any>(null);
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
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-base-content">Productos</h1>
        <Button onClick={() => setShowForm(true)} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Buscador */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <div className="form-control">
            <div className="input-group">
              <span className="bg-base-200">
                <Search className="w-5 h-5" />
              </span>
              <Input
                type="text"
                placeholder="Buscar por nombre, SKU o sabor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <Table zebra hover>
              <Thead>
                <Tr>
                  <Th>SKU</Th>
                  <Th>Nombre</Th>
                  <Th>Sabor</Th>
                  <Th>Precio</Th>
                  <Th>Stock</Th>
                  <Th>Unidad</Th>
                  <Th>Proveedor</Th>
                  <Th className="text-right">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredProductos.length === 0 ? (
                  <Tr>
                    <Td
                      colSpan={8}
                      className="text-center py-8 text-base-content/50"
                    >
                      No hay productos registrados
                    </Td>
                  </Tr>
                ) : (
                  filteredProductos.map((producto) => (
                    <Tr key={producto.id}>
                      <Td className="font-mono">{producto.sku}</Td>
                      <Td className="font-semibold">{producto.nombre}</Td>
                      <Td>{producto.sabor || "-"}</Td>
                      <Td>${producto.precioUnitario.toFixed(2)}</Td>
                      <Td>
                        <Badge
                          variant={
                            (producto.inventario?.cantidadActual || 0) > 0
                              ? "success"
                              : "error"
                          }
                        >
                          {producto.inventario?.cantidadActual || 0}
                        </Badge>
                      </Td>
                      <Td>{producto.unidad}</Td>
                      <Td>{producto.proveedor || "-"}</Td>
                      <Td>
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleEdit(producto)}
                            variant="ghost"
                            size="sm"
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
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>
        </div>
      </div>

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
