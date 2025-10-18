-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DetalleCompra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compraId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    "costoUnitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "DetalleCompra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DetalleCompra_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DetalleCompra" ("cantidad", "compraId", "costoUnitario", "id", "productoId", "subtotal") SELECT "cantidad", "compraId", "costoUnitario", "id", "productoId", "subtotal" FROM "DetalleCompra";
DROP TABLE "DetalleCompra";
ALTER TABLE "new_DetalleCompra" RENAME TO "DetalleCompra";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
