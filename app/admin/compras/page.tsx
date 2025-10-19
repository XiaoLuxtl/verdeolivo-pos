// app/admin/compras/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Eye, Package, Download, Filter, Search } from "lucide-react";
import CompraForm from "@/components/CompraForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Compra = {
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

  const fetchCompras = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/compras");
      const data = await response.json();
      setCompras(data);
      setFilteredCompras(data);
    } catch (error) {
      console.error("Error:", error);
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
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

        {/* Tabla */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Compras ({filteredCompras.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompras.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 opacity-50" />
                        <span className="text-sm">
                          {compras.length === 0
                            ? "No hay compras registradas"
                            : "No se encontraron resultados para tu búsqueda"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompras.map((compra) => (
                    <TableRow
                      key={compra.id}
                      className="group hover:bg-muted/50"
                    >
                      <TableCell className="font-mono font-medium">
                        #{compra.id}
                      </TableCell>
                      <TableCell>
                        {new Date(compra.fecha).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {compra.proveedor}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {compra.detalles.length}{" "}
                          {compra.detalles.length === 1 ? "item" : "items"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                        ${compra.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">Ver detalles</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <CompraForm onClose={() => setShowForm(false)} onSave={fetchCompras} />
      )}
    </div>
  );
}
