// Ruta: app/admin/compras/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Eye, Package } from "lucide-react";
import CompraForm from "@/components/CompraForm";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { Alert } from "@/components/ui/Alert";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from "@/components/ui/Modal";

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
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-base-content">Compras</h1>
        <Button onClick={() => setShowForm(true)} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Compra
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody>
            <h3 className="text-sm text-base-content/60">Total Compras</h3>
            <p className="text-3xl font-bold text-primary">{compras.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
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
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="text-sm text-base-content/60">Total General</h3>
            <p className="text-3xl font-bold text-accent">
              ${compras.reduce((sum, c) => sum + c.total, 0).toFixed(2)}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Tabla de compras */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Fecha</Th>
                  <Th>Proveedor</Th>
                  <Th>Productos</Th>
                  <Th>Total</Th>
                  <Th className="text-right">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {compras.length === 0 ? (
                  <Tr>
                    <Td
                      colSpan={6}
                      className="text-center py-8 text-base-content/50"
                    >
                      No hay compras registradas
                    </Td>
                  </Tr>
                ) : (
                  compras.map((compra) => (
                    <Tr key={compra.id}>
                      <Td className="font-mono">#{compra.id}</Td>
                      <Td>{formatFecha(compra.fecha)}</Td>
                      <Td className="font-semibold">{compra.proveedor}</Td>
                      <Td>
                        <Badge variant="primary">
                          {compra.detalles.length} item(s)
                        </Badge>
                      </Td>
                      <Td className="font-bold text-success">
                        ${compra.total.toFixed(2)}
                      </Td>
                      <Td>
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              setSelectedCompra(compra);
                              setShowDetalle(true);
                            }}
                            variant="ghost"
                            size="sm"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Formulario de nueva compra */}
      {showForm && (
        <CompraForm onClose={() => setShowForm(false)} onSave={fetchCompras} />
      )}

      {/* Modal de detalle */}
      {showDetalle && selectedCompra && (
        <Modal
          open={true}
          onClose={() => {
            setShowDetalle(false);
            setSelectedCompra(null);
          }}
        >
          <ModalHeader>
            <h2 className="text-2xl font-bold">
              Detalle de Compra #{selectedCompra.id}
            </h2>
            <p className="text-sm text-base-content/60 mt-1">
              {formatFecha(selectedCompra.fecha)} - {selectedCompra.proveedor}
            </p>
          </ModalHeader>

          <ModalBody>
            {selectedCompra.notas && (
              <Alert variant="info">
                <span>{selectedCompra.notas}</span>
              </Alert>
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
                      <p className="font-semibold">{detalle.producto.nombre}</p>
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
          </ModalBody>

          <ModalActions>
            <Button
              onClick={() => {
                setShowDetalle(false);
                setSelectedCompra(null);
              }}
              variant="primary"
              className="w-full"
            >
              Cerrar
            </Button>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
}
