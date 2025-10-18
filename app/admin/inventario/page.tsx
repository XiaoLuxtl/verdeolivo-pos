// Ruta: app/admin/inventario/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Edit3,
} from "lucide-react";
import MovimientoForm from "@/components/MovimientoForm";

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

  const getBadgeClass = (cantidad: number) => {
    if (cantidad === 0) return "badge-error";
    if (cantidad < 100) return "badge-warning";
    return "badge-success";
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
      return <TrendingUp className="w-4 h-4 text-success" />;
    return <TrendingDown className="w-4 h-4 text-error" />;
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "insumo":
        return "badge-success";
      case "venta":
        return "badge-primary";
      case "merma":
        return "badge-error";
      case "ajuste":
        return "badge-warning";
      default:
        return "badge-ghost";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const productosFiltrados = getProductosFiltrados();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-base-content">Inventario</h1>
        <button
          onClick={() => {
            setSelectedProducto(undefined);
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar Movimiento
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="text-sm text-base-content/60">Total Productos</h3>
            <p className="text-3xl font-bold text-primary">
              {productos.length}
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="text-sm text-base-content/60">Sin Stock</h3>
            <p className="text-3xl font-bold text-error">
              {
                productos.filter(
                  (p) => (p.inventario?.cantidadActual || 0) === 0
                ).length
              }
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="text-sm text-base-content/60">Stock Bajo</h3>
            <p className="text-3xl font-bold text-warning">
              {
                productos.filter((p) => {
                  const stock = p.inventario?.cantidadActual || 0;
                  return stock > 0 && stock < 100;
                }).length
              }
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="text-sm text-base-content/60">Con Stock</h3>
            <p className="text-3xl font-bold text-success">
              {
                productos.filter(
                  (p) => (p.inventario?.cantidadActual || 0) >= 100
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("todos")}
              className={`btn btn-sm ${
                filter === "todos" ? "btn-primary" : "btn-ghost"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("sin-stock")}
              className={`btn btn-sm ${
                filter === "sin-stock" ? "btn-error" : "btn-ghost"
              }`}
            >
              Sin Stock
            </button>
            <button
              onClick={() => setFilter("bajo")}
              className={`btn btn-sm ${
                filter === "bajo" ? "btn-warning" : "btn-ghost"
              }`}
            >
              Stock Bajo
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla de inventario */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-0">
            <div className="p-4 border-b border-base-300">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Stock Actual
              </h2>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="table table-sm table-pin-rows">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-8 text-base-content/50"
                      >
                        No hay productos
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((producto) => {
                      const stock = producto.inventario?.cantidadActual || 0;
                      return (
                        <tr key={producto.id}>
                          <td>
                            <div>
                              <p className="font-semibold">{producto.nombre}</p>
                              <p className="text-xs text-base-content/60">
                                {producto.sku}
                              </p>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getBadgeClass(stock)}`}>
                              {stock} {producto.unidad}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedProducto({
                                  id: producto.id,
                                  nombre: producto.nombre,
                                });
                                setShowForm(true);
                              }}
                              className="btn btn-ghost btn-xs"
                              title="Registrar movimiento"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Historial de movimientos */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-0">
            <div className="p-4 border-b border-base-300">
              <h2 className="text-xl font-bold">Últimos Movimientos</h2>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              <div className="p-4 space-y-2">
                {movimientos.length === 0 ? (
                  <div className="text-center py-8 text-base-content/50">
                    No hay movimientos registrados
                  </div>
                ) : (
                  movimientos.map((mov) => (
                    <div key={mov.id} className="card bg-base-200">
                      <div className="card-body p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            {getCategoriaIcon(mov.tipo, mov.categoria)}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {mov.producto.nombre}
                              </p>
                              <p className="text-xs text-base-content/60">
                                {mov.tipo === "entrada" ? "+" : "-"}
                                {mov.cantidad} {mov.producto.unidad}
                              </p>
                              {mov.notas && (
                                <p className="text-xs text-base-content/50 mt-1 line-clamp-2">
                                  {mov.notas}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`badge badge-sm ${getCategoriaColor(
                                mov.categoria
                              )}`}
                            >
                              {mov.categoria}
                            </span>
                            <p className="text-xs text-base-content/50 mt-1">
                              {formatFecha(mov.fecha)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
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
