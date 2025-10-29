// app/admin/compras/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Filter, Search, Package } from "lucide-react";

// Importaciones de Componentes Reutilizables
import { CompraForm } from "@/components/forms/CompraForm";
import DeleteConfirmation from "@/components/DeleteConfirmation"; // Tu componente de validación de texto
import { ComprasTable } from "@/components/ComprasTable"; // Componente de tabla refactorizado
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definición del Tipo Compra (debe ser exportado si ComprasTable lo necesita)
export type Compra = {
  id: number;
  fecha: string;
  proveedor: string;
  total: number;
  detalles: Array<{
    producto: { nombre: string; unidad: string };
    cantidad: number;
    costoUnitario: number;
  }>;
};

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [filteredCompras, setFilteredCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProveedor, setFilterProveedor] = useState("all");

  // Estado para la eliminación
  const [compraToDelete, setCompraToDelete] = useState<number | null>(null);

  // --- LÓGICA DE DATOS Y EFECTOS ---

  const fetchCompras = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/compras");
      const data = await response.json();
      setCompras(data);
      setFilteredCompras(data);
    } catch (error) {
      console.error("Error al obtener compras:", error);
      // Opcional: Mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  // Filtros en tiempo real
  useEffect(() => {
    let result = compras;

    // Filtro por búsqueda
    if (searchTerm) {
      result = result.filter(
        (compra) =>
          compra.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          compra.id.toString().includes(searchTerm)
      );
    }

    // Filtro por proveedor
    if (filterProveedor !== "all") {
      result = result.filter((compra) => compra.proveedor === filterProveedor);
    }

    setFilteredCompras(result);
  }, [searchTerm, filterProveedor, compras]);

  // --- LÓGICA DE ELIMINACIÓN ---

  const handleDeleteCompra = async () => {
    if (!compraToDelete) {
      // Debería ser capturado por el error si no hay ID, pero previene errores TS/lógicos
      throw new Error("ID de compra no definido para eliminar.");
    }

    const response = await fetch(`/api/compras/${compraToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Lanza un error para que el modal de confirmación lo capture y lo muestre
      throw new Error(
        errorData.error ||
          "Fallo al eliminar la compra y revertir el inventario."
      );
    }

    // Si tiene éxito, actualiza la lista
    await fetchCompras();
  };

  // --- LÓGICA DE ESTADÍSTICAS Y EXPORTACIÓN ---

  const proveedoresUnicos = [...new Set(compras.map((c) => c.proveedor))];
  const totalGeneral = compras.reduce((sum, c) => sum + c.total, 0);
  const comprasEsteMes = compras.filter((c) => {
    const compraDate = new Date(c.fecha);
    const now = new Date();
    return (
      compraDate.getMonth() === now.getMonth() &&
      compraDate.getFullYear() === now.getFullYear()
    );
  });
  const totalEsteMes = comprasEsteMes.reduce((sum, c) => sum + c.total, 0);

  const exportToCSV = () => {
    const headers = ["ID", "Fecha", "Proveedor", "Productos", "Total"];
    const csvData = filteredCompras.map((compra) => [
      compra.id,
      new Date(compra.fecha).toLocaleDateString(),
      compra.proveedor,
      compra.detalles.length,
      compra.total,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compras-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Lógica para manejar la visualización de detalles (placeholder)
  const handleViewDetails = (compra: Compra) => {
    console.log(`Ver detalles de la Compra #${compra.id}`);
    // Aquí se abriría un modal o se navegaría a una página de detalle
  };

  // --- RENDERIZADO ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="flex flex-col items-center gap-2">
          <Loading size="lg" />
          <p className="text-sm text-muted-foreground">Cargando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
          <p className="text-muted-foreground">
            Gestiona y visualiza todas las compras realizadas
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={compras.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Compra
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card Total Compras */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{compras.length}</div>
            <p className="text-xs text-muted-foreground">Compras registradas</p>
          </CardContent>
        </Card>
        {/* Card Este Mes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalEsteMes.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos del mes actual
            </p>
          </CardContent>
        </Card>
        {/* Card Total General */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total General</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalGeneral.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Inversión total</p>
          </CardContent>
        </Card>
        {/* Card Proveedores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {proveedoresUnicos.length}
            </div>
            <p className="text-xs text-muted-foreground">Proveedores activos</p>
          </CardContent>
        </Card>
      </div>

      <div className="border-t pt-8">
        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID o proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filterProveedor}
                onValueChange={setFilterProveedor}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proveedores</SelectItem>
                  {proveedoresUnicos.map((proveedor) => (
                    <SelectItem key={proveedor} value={proveedor}>
                      {proveedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Compras Refactorizada */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Compras ({filteredCompras.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCompras.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-8 w-8 opacity-50" />
                  <span className="text-sm">
                    {compras.length === 0
                      ? "No hay compras registradas"
                      : "No se encontraron resultados para tu búsqueda"}
                  </span>
                </div>
              </div>
            ) : (
              <ComprasTable
                compras={filteredCompras}
                onViewDetails={handleViewDetails}
                onDelete={setCompraToDelete} // Pasa el setter para abrir el modal de borrado
              />
            )}
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <CompraForm onClose={() => setShowForm(false)} onSave={fetchCompras} />
      )}

      {/* Modal de confirmación de borrado (Usando tu componente) */}
      {compraToDelete !== null && (
        <DeleteConfirmation
          title={`Eliminar Compra #${compraToDelete}`}
          message="Esta acción es irreversible y ANULARÁ el movimiento de inventario asociado a esta compra, RESTANDO la cantidad de productos de tu stock. Debes escribir 'ELIMINAR' para confirmar."
          confirmText="ELIMINAR"
          onConfirm={handleDeleteCompra} // Lógica que hace el fetch DELETE
          onCancel={() => setCompraToDelete(null)} // Función para cerrar el modal
        />
      )}
    </div>
  );
}
