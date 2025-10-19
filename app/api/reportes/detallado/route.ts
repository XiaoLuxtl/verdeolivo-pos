// Ruta: app/api/reportes/detallado/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calcularFechas(
  periodo: string,
  fechaParam?: string | null
): { start: Date; end: Date } {
  if (fechaParam) {
    const fecha = new Date(fechaParam);
    if (Number.isNaN(fecha.getTime())) {
      throw new TypeError("Fecha inválida. Use formato YYYY-MM-DD");
    }
    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fecha);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const now = new Date();

  switch (periodo) {
    case "dia":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        ),
      };

    case "semana": {
      const diaSemana = now.getDay();
      const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1;
      const start = new Date(now);
      start.setDate(now.getDate() - diasDesdeInicio);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    case "mes": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    case "3meses": {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    default:
      throw new Error(`Periodo no válido: ${periodo}`);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "dia";
    const fecha = searchParams.get("fecha");

    const { start, end } = calcularFechas(periodo, fecha);

    // Obtener todas las ventas del periodo con detalles completos
    const ventas = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: start,
          lte: end,
        },
      },
      include: {
        detalles: {
          include: {
            receta: {
              include: {
                ingredientes: {
                  include: {
                    producto: true,
                  },
                },
              },
            },
          },
        },
        movimientos: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        fecha: "asc",
      },
    });

    // Calcular estadísticas detalladas
    const estadisticas: any = {
      periodo: {
        inicio: start.toISOString(),
        fin: end.toISOString(),
        label: periodo,
      },
      resumen: {
        totalVentas: ventas.length,
        totalIngresos: ventas.reduce((sum, v) => sum + v.total, 0),
        totalDescuentos: ventas.reduce((sum, v) => sum + v.descuento, 0),
        subtotal: ventas.reduce((sum, v) => sum + v.subtotal, 0),
      },
      ventasDetalladas: ventas.map((venta) => ({
        id: venta.id,
        fecha: venta.fecha.toISOString(),
        hora: venta.fecha.toLocaleTimeString("es-MX"),
        subtotal: venta.subtotal,
        descuento: venta.descuento,
        tipoDescuento: venta.tipoDescuento,
        valorDescuentoOriginal: venta.valorDescuentoOriginal,
        total: venta.total,
        metodoPago: venta.metodoPago,
        detalles: venta.detalles.map((detalle) => ({
          receta: detalle.receta.nombre,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.subtotal,
          ingredientes: detalle.receta.ingredientes.map((ing) => ({
            producto: ing.producto.nombre,
            cantidadNecesaria: ing.cantidad * detalle.cantidad,
            unidad: ing.unidad,
            costoEstimado:
              (ing.producto as any).precioPorUnidad *
              ing.cantidad *
              detalle.cantidad,
          })),
        })),
      })),
    };

    // Calcular insumos gastados
    const insumosGastados: {
      [key: string]: { cantidad: number; costo: number; unidad: string };
    } = {};

    for (const venta of ventas) {
      for (const detalle of venta.detalles) {
        for (const ingrediente of detalle.receta.ingredientes) {
          const cantidadGastada = ingrediente.cantidad * detalle.cantidad;
          // Usar precio por unidad pre-calculado
          const costoGastado =
            (ingrediente.producto as any).precioPorUnidad * cantidadGastada;

          if (!insumosGastados[ingrediente.producto.nombre]) {
            insumosGastados[ingrediente.producto.nombre] = {
              cantidad: 0,
              costo: 0,
              unidad: ingrediente.unidad,
            };
          }

          insumosGastados[ingrediente.producto.nombre].cantidad +=
            cantidadGastada;
          insumosGastados[ingrediente.producto.nombre].costo += costoGastado;
        }
      }
    }

    estadisticas.insumosGastados = insumosGastados;

    // Calcular ganancia teórica (ingresos - costo de insumos)
    const costoTotalInsumos = Object.values(insumosGastados).reduce(
      (sum, insumo) => sum + insumo.costo,
      0
    );

    estadisticas.gananciaTeorica =
      estadisticas.resumen.totalIngresos - costoTotalInsumos;

    // Generar HTML del reporte
    const html = generarHTMLReporte(estadisticas);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="reporte-detallado-${periodo}-${
          new Date().toISOString().split("T")[0]
        }.html"`,
      },
    });
  } catch (error) {
    console.error("Error generando reporte detallado:", error);
    return NextResponse.json(
      { error: "Error generando reporte detallado" },
      { status: 500 }
    );
  }
}

function generarHTMLReporte(estadisticas: any): string {
  const {
    periodo,
    resumen,
    ventasDetalladas,
    insumosGastados,
    gananciaTeorica,
  } = estadisticas;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Detallado - ${periodo.label}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .stat-card .currency {
            color: #28a745;
        }
        .section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .section h2 {
            margin: 0 0 20px 0;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        tr:hover {
            background-color: #f8f9fa;
        }
        .venta-row {
            background-color: #f0f8ff;
        }
        .ingrediente-row {
            background-color: #fff8f0;
            font-size: 0.9em;
        }
        .total-row {
            background-color: #e8f5e8;
            font-weight: bold;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 500;
        }
        .badge.descuento {
            background-color: #dc3545;
            color: white;
        }
        .badge.efectivo {
            background-color: #28a745;
            color: white;
        }
        .insumos-summary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .ganancia-card {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }
        .ganancia-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        @media print {
            body { background: white; }
            .header { background: #333 !important; color: white !important; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Reporte Detallado</h1>
        <p>Periodo: ${new Date(periodo.inicio).toLocaleDateString(
          "es-MX"
        )} - ${new Date(periodo.fin).toLocaleDateString("es-MX")}</p>
        <p>Generado el: ${new Date().toLocaleString("es-MX")}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <h3>Total Ventas</h3>
            <div class="value">${resumen.totalVentas}</div>
        </div>
        <div class="stat-card">
            <h3>Ingresos Totales</h3>
            <div class="value currency">$${resumen.totalIngresos.toFixed(
              2
            )}</div>
        </div>
        <div class="stat-card">
            <h3>Descuentos Aplicados</h3>
            <div class="value">$${resumen.totalDescuentos.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>Subtotal</h3>
            <div class="value">$${resumen.subtotal.toFixed(2)}</div>
        </div>
    </div>

    <div class="section">
        <h2>🛒 Ventas Detalladas</h2>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Productos</th>
                    <th>Subtotal</th>
                    <th>Descuento</th>
                    <th>Total</th>
                    <th>Método</th>
                </tr>
            </thead>
            <tbody>
                ${ventasDetalladas
                  .map(
                    (venta: any) => `
                    <tr class="venta-row">
                        <td>${new Date(venta.fecha).toLocaleDateString(
                          "es-MX"
                        )}</td>
                        <td>${venta.hora}</td>
                        <td>
                            ${venta.detalles
                              .map(
                                (det: any) => `${det.cantidad}x ${det.receta}`
                              )
                              .join("<br>")}
                        </td>
                        <td>$${venta.subtotal.toFixed(2)}</td>
                        <td>
                            ${
                              venta.descuento > 0
                                ? `<span class="badge descuento">$${venta.descuento.toFixed(
                                    2
                                  )}</span>`
                                : "-"
                            }
                        </td>
                        <td><strong>$${venta.total.toFixed(2)}</strong></td>
                        <td><span class="badge efectivo">${
                          venta.metodoPago || "efectivo"
                        }</span></td>
                    </tr>
                    ${venta.detalles
                      .map(
                        (det: any) => `
                        <tr class="ingrediente-row">
                            <td colspan="7">
                                <strong>${det.receta}:</strong>
                                ${det.ingredientes
                                  .map(
                                    (ing: any) =>
                                      `${ing.cantidadNecesaria.toFixed(2)} ${
                                        ing.unidad
                                      } ${
                                        ing.producto
                                      } ($${ing.costoEstimado.toFixed(2)})`
                                  )
                                  .join(" + ")}
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                `
                  )
                  .join("")}
            </tbody>
        </table>
    </div>

    <div class="insumos-summary">
        <h2 style="margin: 0 0 20px 0; color: white;">📦 Insumos Gastados</h2>
        <table style="color: white;">
            <thead>
                <tr>
                    <th style="color: white;">Producto</th>
                    <th style="color: white;">Cantidad Gastada</th>
                    <th style="color: white;">Costo Total</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(insumosGastados)
                  .map(
                    ([producto, data]: [string, any]) => `
                    <tr>
                        <td>${producto}</td>
                        <td>${data.cantidad.toFixed(2)} ${data.unidad}</td>
                        <td>$${data.costo.toFixed(2)}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    </div>

    <div class="ganancia-card">
        <h2 style="margin: 0 0 10px 0;">💰 Ganancia Teórica</h2>
        <div class="value">$${gananciaTeorica.toFixed(2)}</div>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">
            Ingresos: $${resumen.totalIngresos.toFixed(
              2
            )} - Costo insumos: $${Object.values(insumosGastados)
    .reduce((sum: number, insumo: any) => sum + insumo.costo, 0)
    .toFixed(2)}
        </p>
    </div>

    <div class="section">
        <h2>📈 Resumen Ejecutivo</h2>
        <ul>
            <li><strong>Periodo analizado:</strong> ${new Date(
              periodo.inicio
            ).toLocaleDateString("es-MX")} - ${new Date(
    periodo.fin
  ).toLocaleDateString("es-MX")}</li>
            <li><strong>Ventas realizadas:</strong> ${resumen.totalVentas}</li>
            <li><strong>Ingresos totales:</strong> $${resumen.totalIngresos.toFixed(
              2
            )}</li>
            <li><strong>Descuentos aplicados:</strong> $${resumen.totalDescuentos.toFixed(
              2
            )}</li>
            <li><strong>Costo de insumos:</strong> $${Object.values(
              insumosGastados
            )
              .reduce((sum: number, insumo: any) => sum + insumo.costo, 0)
              .toFixed(2)}</li>
            <li><strong>Ganancia teórica:</strong> $${gananciaTeorica.toFixed(
              2
            )}</li>
            <li><strong>Margen de ganancia:</strong> ${(
              (gananciaTeorica / resumen.totalIngresos) *
              100
            ).toFixed(1)}%</li>
        </ul>
    </div>
</body>
</html>`;
}
