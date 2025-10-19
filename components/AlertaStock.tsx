// components/AlertaStock.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface AlertaStock {
  producto: string;
  stockActual: number;
  umbral: number;
  restantes: number;
  mensaje: string;
}

interface AlertaStockProps {
  readonly alertas: readonly AlertaStock[];
}

export function AlertaStock({ alertas }: AlertaStockProps) {
  if (!alertas || alertas.length === 0) return null;

  return (
    <div className="space-y-2">
      {alertas.map((alerta) => (
        <Alert key={alerta.producto} variant="error">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{alerta.producto}</strong>: {alerta.mensaje}
            <br />
            <small>
              Stock actual: {alerta.stockActual} | Umbral: {alerta.umbral} |
              Restantes: ~{alerta.restantes} unidades
            </small>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
