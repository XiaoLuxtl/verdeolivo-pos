-- CreateTable
CREATE TABLE "Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sabor" TEXT,
    "proveedor" TEXT,
    "precioUnitario" REAL NOT NULL,
    "peso" REAL,
    "precioPorUnidad" REAL,
    "unidad" TEXT NOT NULL DEFAULT 'gr',
    "descripcion" TEXT,
    "stockMinimo" REAL DEFAULT 5,
    "descripcionUmbral" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoria" TEXT NOT NULL DEFAULT 'EXTRA'
);

-- CreateTable
CREATE TABLE "Inventario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "cantidadActual" REAL NOT NULL DEFAULT 0,
    "unidad" TEXT NOT NULL,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Inventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "costoUnitario" REAL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT,
    "notas" TEXT,
    "ventaRef" INTEGER,
    "motivoMerma" TEXT,
    CONSTRAINT "MovimientoInventario_ventaRef_fkey" FOREIGN KEY ("ventaRef") REFERENCES "Venta" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MovimientoInventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proveedor" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "notas" TEXT
);

-- CreateTable
CREATE TABLE "DetalleCompra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compraId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    "costoUnitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "DetalleCompra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DetalleCompra_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Receta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'OTRO',
    "descripcion" TEXT,
    "precioVenta" REAL NOT NULL,
    "imagen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecetaIngrediente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recetaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    "unidad" TEXT NOT NULL,
    CONSTRAINT "RecetaIngrediente_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecetaIngrediente_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "Receta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    "tipoDescuento" TEXT,
    "valorDescuentoOriginal" REAL,
    "total" REAL NOT NULL,
    "recibido" REAL NOT NULL,
    "cambio" REAL NOT NULL,
    "metodoPago" TEXT NOT NULL DEFAULT 'efectivo',
    "notas" TEXT
);

-- CreateTable
CREATE TABLE "DetalleVenta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ventaId" INTEGER NOT NULL,
    "recetaId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "movimientoRef" TEXT,
    CONSTRAINT "DetalleVenta_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "Receta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DetalleVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Inventario_productoId_key" ON "Inventario"("productoId");

-- CreateIndex
CREATE INDEX "MovimientoInventario_categoria_fecha_idx" ON "MovimientoInventario"("categoria", "fecha");

-- CreateIndex
CREATE INDEX "Venta_fecha_idx" ON "Venta"("fecha");
