-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Receta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'OTRO',
    "descripcion" TEXT,
    "precioVenta" REAL NOT NULL,
    "imagen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Receta" ("categoria", "createdAt", "descripcion", "id", "imagen", "nombre", "precioVenta") SELECT coalesce("categoria", 'OTRO') AS "categoria", "createdAt", "descripcion", "id", "imagen", "nombre", "precioVenta" FROM "Receta";
DROP TABLE "Receta";
ALTER TABLE "new_Receta" RENAME TO "Receta";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
