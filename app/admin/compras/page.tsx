// Ruta: app/admin/compras/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Eye, Package } from "lucide-react";
import CompraForm from "@/components/CompraForm";

type Compra = {
  id: number;
  fecha: string;
  proveedor: string;
  total: number;
  notas: string | null;
  detalles: {
    id: number;
    cantidad: number;
    costoUnitario: number;
    subtotal: number;
    producto: {
      nombre: string;
      sku: string;
      unidad: string;
    };
  }[];
};

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);

  const fetchCompras = async () => {
    try {
      const response = await fetch("/api/compras");
      const data = await response.json();
      setCompras(data);
    } catch (error) {
      console.error("Error al cargar compras:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        <h1 className="text-3xl font-bold text-base-content">Compras</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Compra
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="text-sm text-base-content/60">Total Compras</h3>
            <p className="text-3xl font-bold text-primary">{compras.length}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="text-sm text-base-content/60">Este Mes</h3>
            <p className="text-3xl font-bold text-secondary">
              $
              {compras
                .filter(
                  (c) => new Date(c.fecha).getMonth() === new Date().getMonth()
                )
                .reduce((sum, c) => sum + c.total, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="text-sm text-base-content/60">Total General</h3>
            <p className="text-3xl font-bold text-accent">
              ${compras.reduce((sum, c) => sum + c.total, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de compras */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compras.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-base-content/50"
                    >
                      No hay compras registradas
                    </td>
                  </tr>
                ) : (
                  compras.map((compra) => (
                    <tr key={compra.id}>
                      <td className="font-mono">#{compra.id}</td>
                      <td>{formatFecha(compra.fecha)}</td>
                      <td className="font-semibold">{compra.proveedor}</td>
                      <td>
                        <span className="badge badge-primary">
                          {compra.detalles.length} item(s)
                        </span>
                      </td>
                      <td className="font-bold text-success">
                        ${compra.total.toFixed(2)}
                      </td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setSelectedCompra(compra);
                              setShowDetalle(true);
                            }}
                            className="btn btn-ghost btn-sm"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Formulario de nueva compra */}
      {showForm && (
        <CompraForm onClose={() => setShowForm(false)} onSave={fetchCompras} />
      )}

      {/* Modal de detalle */}
      {showDetalle && selectedCompra && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-base-300">
              <h2 className="text-2xl font-bold">
                Detalle de Compra #{selectedCompra.id}
              </h2>
              <p className="text-sm text-base-content/60 mt-1">
                {formatFecha(selectedCompra.fecha)} - {selectedCompra.proveedor}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {selectedCompra.notas && (
                <div className="alert alert-info">
                  <span>{selectedCompra.notas}</span>
                </div>
              )}

              <div className="space-y-2">
                {selectedCompra.detalles.map((detalle) => (
                  <div
                    key={detalle.id}
                    className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">
                          {detalle.producto.nombre}
                        </p>
                        <p className="text-sm text-base-content/60">
                          {detalle.cantidad} {detalle.producto.unidad} × $
                          {detalle.costoUnitario.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold">
                      ${detalle.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-base-300 pt-4 flex justify-between items-center">
                <span className="text-xl font-semibold">Total:</span>
                <span className="text-3xl font-bold text-primary">
                  ${selectedCompra.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-base-300">
              <button
                onClick={() => {
                  setShowDetalle(false);
                  setSelectedCompra(null);
                }}
                className="btn btn-primary w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
