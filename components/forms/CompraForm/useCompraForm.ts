import { useState, useEffect, useCallback, useMemo } from "react";
import { Producto, DetalleCompra, CompraFormData } from "./types";

// Función para generar IDs únicos
export const generateId = (): string =>
  `detalle-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export function useCompraForm(onSave: () => void, onClose: () => void) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("");
  const [formData, setFormData] = useState<CompraFormData>({
    fecha: new Date().toISOString().split("T")[0],
    proveedor: "",
    notas: "",
  });
  const [detalles, setDetalles] = useState<DetalleCompra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setProductoSeleccionado("");
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      proveedor: "",
      notas: "",
    });
    setDetalles([]);
    setError("");
  }, []);

  const handleFormDataChange = useCallback(
    (field: keyof CompraFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
    },
    [error]
  );

  // Cargar productos
  useEffect(() => {
    const loadProductos = async () => {
      try {
        setIsLoadingProductos(true);
        const response = await fetch("/api/productos");
        if (!response.ok) throw new Error("Error al cargar productos");
        const data: Producto[] = await response.json();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("Error al cargar la lista de productos");
      } finally {
        setIsLoadingProductos(false);
      }
    };
    loadProductos();
  }, []);

  // Pre-llenar campos cuando se selecciona un producto
  useEffect(() => {
    if (productoSeleccionado && productos.length > 0) {
      const producto = productos.find(
        (p) => p.id.toString() === productoSeleccionado
      );
      if (producto) {
        setFormData((prev) => ({
          ...prev,
          proveedor: producto.proveedor || prev.proveedor,
          notas: prev.notas || `${producto.nombre} - ${producto.sku}`,
        }));

        const nuevoDetalle: DetalleCompra = {
          id: generateId(),
          productoId: productoSeleccionado,
          cantidad: "1",
          costoUnitario: producto.precioUnitario.toString(),
          subtotal: producto.precioUnitario,
        };
        setDetalles([nuevoDetalle]);
        setError("");
      }
    } else {
      setDetalles([]);
    }
  }, [productoSeleccionado, productos]);

  const agregarDetalle = useCallback(() => {
    const nuevoDetalle: DetalleCompra = {
      id: generateId(),
      productoId: "",
      cantidad: "",
      costoUnitario: "",
      subtotal: 0,
    };
    setDetalles((prev) => [...prev, nuevoDetalle]);
  }, []);

  const eliminarDetalle = useCallback((index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const actualizarDetalle = useCallback(
    (index: number, field: keyof DetalleCompra, value: string) => {
      setDetalles((prev) => {
        const nuevosDetalles = [...prev];
        nuevosDetalles[index] = { ...nuevosDetalles[index], [field]: value };

        if (field === "cantidad" || field === "costoUnitario") {
          const cantidad =
            Number.parseFloat(nuevosDetalles[index].cantidad) || 0;
          const costo =
            Number.parseFloat(nuevosDetalles[index].costoUnitario) || 0;
          nuevosDetalles[index].subtotal = cantidad * costo;
        }
        return nuevosDetalles;
      });

      if (field === "productoId" && value && !formData.proveedor) {
        const producto = productos.find((p) => p.id.toString() === value);
        if (producto?.proveedor) {
          setFormData((prev) => ({ ...prev, proveedor: producto.proveedor! }));
        }
      }
    },
    [productos, formData.proveedor]
  );

  const calcularTotal = useMemo(() => {
    return detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  }, [detalles]);

  const validarFormulario = (): string | null => {
    if (!productoSeleccionado) return "Selecciona un producto primero";
    if (detalles.length === 0)
      return "No se pudo crear el detalle del producto";
    if (!formData.proveedor.trim()) return "El proveedor es obligatorio";
    if (!formData.fecha) return "La fecha es obligatoria";

    const detalleInvalido = detalles.find(
      (d) =>
        !d.productoId ||
        !d.cantidad ||
        !d.costoUnitario ||
        Number.parseFloat(d.cantidad) <= 0 ||
        Number.parseFloat(d.costoUnitario) <= 0
    );
    if (detalleInvalido) {
      return "Completa todos los campos correctamente (cantidad y costo deben ser mayores a 0)";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        total: calcularTotal,
        detalles: detalles.map((d) => ({
          ...d,
          cantidad: Number.parseFloat(d.cantidad),
          costoUnitario: Number.parseFloat(d.costoUnitario),
        })),
      };

      const response = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      setError("");
      onSave();
      resetForm();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido al guardar";
      setError(errorMessage);
      console.error("Error al guardar compra:", err);
    } finally {
      setLoading(false);
    }
  };

  const getProductoInfo = useCallback(
    (productoId: string) => {
      const producto = productos.find(
        (p) => p.id === Number.parseInt(productoId)
      );
      return {
        peso: producto?.peso || 0,
        unidad: producto?.unidad || "",
        nombre: producto?.nombre || "",
      };
    },
    [productos]
  );

  const calcularCantidadTotal = useCallback(
    (detalle: DetalleCompra) => {
      const cantidad = Number.parseFloat(detalle.cantidad) || 0;
      const { peso } = getProductoInfo(detalle.productoId);
      return cantidad * peso;
    },
    [getProductoInfo]
  );

  return {
    productos,
    productoSeleccionado,
    setProductoSeleccionado,
    formData,
    handleFormDataChange,
    detalles,
    agregarDetalle,
    eliminarDetalle,
    actualizarDetalle,
    loading,
    error,
    isLoadingProductos,
    calcularTotal,
    handleSubmit,
    getProductoInfo,
    calcularCantidadTotal,
    resetForm,
  };
}
