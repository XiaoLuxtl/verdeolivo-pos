-- Add precioPorUnidad column to Producto table
ALTER TABLE "Producto" ADD COLUMN "precioPorUnidad" REAL;

-- Update existing products to calculate precioPorUnidad
UPDATE "Producto" SET "precioPorUnidad" = CASE
  WHEN "peso" IS NOT NULL AND "peso" > 0 THEN "precioUnitario" / "peso"
  ELSE "precioUnitario"
END;