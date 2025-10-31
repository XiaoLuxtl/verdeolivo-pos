// types/reporte.ts
export interface ReporteVentas {
  periodo: string;
  resumen: {
    totalVentas: number;
    totalIngresos: number;
    promedioVenta: number;
  };
  topRecetas: Array<{
    nombre: string;
    cantidad: number;
    ingresos: number;
  }>;
  ventasPorDia: { [key: string]: number };
}

export interface ReporteInventario {
  periodo: string;
  resumen: {
    totalProductos: number;
    sinStock: number;
    stockBajo: number;
    totalMovimientos: number;
  };
  movimientosPorCategoria: Array<{
    categoria: string;
    cantidad: number;
    productos: number;
  }>;
  productosMasMovidos: Array<{
    nombre: string;
    movimientos: number;
    entradas: number;
    salidas: number;
  }>;
  alertas: {
    sinStock: Array<{ id: number; nombre: string; sku: string }>;
    stockBajo: Array<{
      id: number;
      nombre: string;
      sku: string;
      stock: number;
      unidad: string;
    }>;
  };
}
