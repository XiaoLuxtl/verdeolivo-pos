// Ruta: app/admin/inventario/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Package,
  TrendingDown,
  TrendingUp,
  Edit3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MovimientoForm from "@/components/MovimientoForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Loading } from "@/components/ui/loading";

type Producto = {
  id: number;
  nombre: string;
  sku: string;
  unidad: string;
  inventario: {
    id: number;
    cantidadActual: number;
    actualizadoEn: string;
  } | null;
};

type Movimiento = {
  id: number;
  tipo: string;
  categoria: string;
  cantidad: number;
  fecha: string;
  notas: string | null;
  referencia: string | null;
  producto: {
    nombre: string;
    unidad: string;
  };
};

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [movimientosOpen, setMovimientosOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<
    { id: number; nombre: string } | undefined
  >();
  const [filter, setFilter] = useState<"todos" | "bajo" | "sin-stock">("todos");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productosRes, movimientosRes] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/inventario/movimientos"),
      ]);

      const productosData = await productosRes.json();
      const movimientosData = await movimientosRes.json();

      setProductos(productosData);
      setMovimientos(movimientosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductosFiltrados = () => {
    switch (filter) {
      case "bajo":
        return productos.filter(
          (p) => (p.inventario?.cantidadActual || 0) < 100
        );
      case "sin-stock":
        return productos.filter(
          (p) => (p.inventario?.cantidadActual || 0) === 0
        );
      default:
        return productos;
    }
  };

  const getBadgeVariant = (cantidad: number) => {
    if (cantidad === 0) return "destructive";
    if (cantidad < 100) return "warning";
    return "success";
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoriaIcon = (tipo: string, categoria: string) => {
    if (tipo === "entrada")
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getCategoriaBadgeVariant = (categoria: string) => {
    switch (categoria) {
      case "insumo":
        return "success";
      case "venta":
        return "default";
      case "merma":
        return "destructive";
      case "ajuste":
        return "warning";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  const productosFiltrados = getProductosFiltrados();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Inventario</h1>
        <Button
          onClick={() => {
            setSelectedProducto(undefined);
            setShowForm(true);
          }}
          variant="default"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar Movimiento
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground">Total Productos</h3>
            <p className="text-3xl font-bold text-primary">
              {productos.length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground">Sin Stock</h3>
            <p className="text-3xl font-bold text-red-600">
              {
                productos.filter(
                  (p) => (p.inventario?.cantidadActual || 0) === 0
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground">Stock Bajo</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {
                productos.filter((p) => {
                  const stock = p.inventario?.cantidadActual || 0;
                  return stock > 0 && stock < 100;
                }).length
              }
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground">Con Stock</h3>
            <p className="text-3xl font-bold text-green-600">
              {
                productos.filter(
                  (p) => (p.inventario?.cantidadActual || 0) >= 100
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Button
              onClick={() => setFilter("todos")}
              variant={filter === "todos" ? "default" : "ghost"}
              size="sm"
            >
              Todos
            </Button>
            <Button
              onClick={() => setFilter("sin-stock")}
              variant={filter === "sin-stock" ? "destructive" : "ghost"}
              size="sm"
            >
              Sin Stock
            </Button>
            <Button
              onClick={() => setFilter("bajo")}
              variant={filter === "bajo" ? "secondary" : "ghost"}
              size="sm"
            >
              Stock Bajo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Layout principal con sidebar */}
      <div className="flex gap-6">
        {/* Tabla de inventario - ocupa el espacio disponible */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            movimientosOpen ? "flex-1 max-w-[calc(100%-320px)]" : "flex-1"
          }`}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Stock Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No hay productos
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosFiltrados.map((producto) => {
                        const stock = producto.inventario?.cantidadActual || 0;
                        return (
                          <TableRow key={producto.id}>
                            <TableCell>
                              <div>
                                <p className="font-semibold">
                                  {producto.nombre}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {producto.sku}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getBadgeVariant(stock)}>
                                {stock} {producto.unidad}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                onClick={() => {
                                  setSelectedProducto({
                                    id: producto.id,
                                    nombre: producto.nombre,
                                  });
                                  setShowForm(true);
                                }}
                                variant="ghost"
                                size="sm"
                                title="Registrar movimiento"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar de movimientos */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            movimientosOpen ? "w-80" : "w-12"
          }`}
        >
          <Collapsible open={movimientosOpen} onOpenChange={setMovimientosOpen}>
            <Card className="shadow-lg h-full">
              <CardHeader
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  movimientosOpen ? "" : "p-2"
                }`}
                onClick={() => setMovimientosOpen(!movimientosOpen)}
              >
                {movimientosOpen ? (
                  <CardTitle className="flex items-center justify-between">
                    Últimos Movimientos
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {movimientos.length}
                      </Badge>
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardTitle>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {movimientos.length}
                    </Badge>
                    <div
                      className="text-sm font-semibold text-muted-foreground text-center"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                      }}
                    >
                      Últimos Movimientos
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="p-0">
                  <div className="overflow-y-auto max-h-[600px]">
                    <div className="p-4 space-y-2">
                      {movimientos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay movimientos registrados
                        </div>
                      ) : (
                        movimientos.map((mov) => (
                          <Card key={mov.id} className="bg-muted/50">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2 flex-1">
                                  {getCategoriaIcon(mov.tipo, mov.categoria)}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">
                                      {mov.producto.nombre}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {mov.tipo === "entrada" ? "+" : "-"}
                                      {mov.cantidad} {mov.producto.unidad}
                                    </p>
                                    {mov.notas && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {mov.notas}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge
                                    variant={getCategoriaBadgeVariant(
                                      mov.categoria
                                    )}
                                    className="text-xs"
                                  >
                                    {mov.categoria}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatFecha(mov.fecha)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>

      {/* Formulario de movimiento */}
      {showForm && (
        <MovimientoForm
          productoSeleccionado={selectedProducto}
          onClose={() => {
            setShowForm(false);
            setSelectedProducto(undefined);
          }}
          onSave={fetchData}
        />
      )}
    </div>
  );
}
