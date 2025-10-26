// Ruta: app/api/reportes/detallado/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calcularFechas(
  periodo: string,
  fechaParam?: string | null,
  fechaInicio?: string | null,
  fechaFin?: string | null
): { start: Date; end: Date } {
  if (periodo === "personalizado" && fechaInicio && fechaFin) {
    // Rango de fechas personalizado
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new TypeError("Fechas inválidas. Use formato YYYY-MM-DD");
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

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
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");

    const { start, end } = calcularFechas(
      periodo,
      fecha,
      fechaInicio,
      fechaFin
    );

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
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 15px;
            background: #fff;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 11px;
        }
        .stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .stat {
            flex: 1;
            min-width: 120px;
            text-align: center;
            padding: 8px;
            border: 1px solid #ccc;
            margin: 0 2px;
        }
        .stat h3 {
            margin: 0 0 5px 0;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: bold;
        }
        .stat .value {
            font-size: 14px;
            font-weight: bold;
        }
        .section {
            margin-bottom: 15px;
        }
        .section h2 {
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 11px;
        }
        th, td {
            padding: 6px 4px;
            text-align: left;
            border-bottom: 1px solid #ccc;
        }
        th {
            font-weight: bold;
            background: #f5f5f5;
        }
        .summary {
            border: 1px solid #000;
            padding: 10px;
            margin: 10px 0;
        }
        .summary h2 {
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: bold;
        }
        .profit {
            text-align: center;
            border: 1px solid #000;
            padding: 10px;
            margin: 10px 0;
        }
        .profit .value {
            font-size: 16px;
            font-weight: bold;
            margin: 5px 0;
        }
        @media print {
            body { background: white !important; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte Detallado</h1>
        <p>Periodo: ${new Date(periodo.inicio).toLocaleDateString(
          "es-MX"
        )} - ${new Date(periodo.fin).toLocaleDateString("es-MX")}</p>
        <p>Generado: ${new Date().toLocaleString("es-MX")}</p>
    </div>

    <div class="stats">
        <div class="stat">
            <h3>Total Ventas</h3>
            <div class="value">${resumen.totalVentas}</div>
        </div>
        <div class="stat">
            <h3>Ingresos</h3>
            <div class="value">$${resumen.totalIngresos.toFixed(2)}</div>
        </div>
        <div class="stat">
            <h3>Descuentos</h3>
            <div class="value">$${resumen.totalDescuentos.toFixed(2)}</div>
        </div>
        <div class="stat">
            <h3>Subtotal</h3>
            <div class="value">$${resumen.subtotal.toFixed(2)}</div>
        </div>
    </div>

    <div class="section">
        <h2>Ventas Detalladas</h2>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Productos</th>
                    <th>Subtotal</th>
                    <th>Desc.</th>
                    <th>Total</th>
                    <th>Metodo</th>
                </tr>
            </thead>
            <tbody>
                ${ventasDetalladas
                  .map(
                    (venta: any) => `
                    <tr>
                        <td>${new Date(venta.fecha).toLocaleDateString(
                          "es-MX"
                        )}</td>
                        <td>${venta.hora}</td>
                        <td>
                            ${venta.detalles
                              .map(
                                (det: any) => `${det.cantidad}x ${det.receta}`
                              )
                              .join("<br>")}</td>
                        <td>$${venta.subtotal.toFixed(2)}</td>
                        <td>${
                          venta.descuento > 0
                            ? `$${venta.descuento.toFixed(2)}`
                            : "-"
                        }</td>
                        <td><strong>$${venta.total.toFixed(2)}</strong></td>
                        <td>${venta.metodoPago || "efectivo"}</td>
                    </tr>
                    ${venta.detalles
                      .map(
                        (det: any) => `
                        <tr style="font-size: 10px; background: #f9f9f9;">
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

    <div class="summary">
        <h2>Insumos Gastados</h2>
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Costo</th>
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

    <div class="profit">
        <h2>Ganancia Teórica</h2>
        <div class="value">$${gananciaTeorica.toFixed(2)}</div>
        <p style="margin: 5px 0 0 0; font-size: 11px;">
            Ingresos: $${resumen.totalIngresos.toFixed(2)} -
            Costo insumos: $${Object.values(insumosGastados)
              .reduce((sum: number, insumo: any) => sum + insumo.costo, 0)
              .toFixed(2)}
        </p>
    </div>

    <div class="section">
        <h2>Resumen</h2>
        <div style="font-size: 11px; line-height: 1.5;">
            <p><strong>Periodo:</strong> ${new Date(
              periodo.inicio
            ).toLocaleDateString("es-MX")} - ${new Date(
    periodo.fin
  ).toLocaleDateString("es-MX")}</p>
            <p><strong>Ventas:</strong> ${resumen.totalVentas}</p>
            <p><strong>Ingresos:</strong> $${resumen.totalIngresos.toFixed(
              2
            )}</p>
            <p><strong>Descuentos:</strong> $${resumen.totalDescuentos.toFixed(
              2
            )}</p>
            <p><strong>Costo insumos:</strong> $${Object.values(insumosGastados)
              .reduce((sum: number, insumo: any) => sum + insumo.costo, 0)
              .toFixed(2)}</p>
            <p><strong>Ganancia:</strong> $${gananciaTeorica.toFixed(2)}</p>
            <p><strong>Margen:</strong> ${(
              (gananciaTeorica / resumen.totalIngresos) *
              100
            ).toFixed(1)}%</p>
        </div>
    </div>
</body>
</html>`;
}
