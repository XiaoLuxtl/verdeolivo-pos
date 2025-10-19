// components/DescuentoSelector.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DescuentoData {
  tipoDescuento: string;
  valorDescuentoOriginal: number;
  descuento: number;
}

interface DescuentoSelectorProps {
  readonly subtotal: number;
  readonly onChange: (descuento: DescuentoData) => void;
}

export function DescuentoSelector({
  subtotal,
  onChange,
}: DescuentoSelectorProps) {
  const [modo, setModo] = useState<"none" | "porcentaje" | "fijo">("none");
  const [valor, setValor] = useState<number>(0);

  const calcularMonto = (): number => {
    if (modo === "porcentaje") {
      return subtotal * (valor / 100);
    } else if (modo === "fijo") {
      return valor;
    }
    return 0;
  };

  useEffect(() => {
    const descuento = calcularMonto();
    onChange({
      tipoDescuento: modo === "none" ? "" : modo,
      valorDescuentoOriginal: valor,
      descuento,
    });
  }, [modo, valor, subtotal, onChange]);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold">Descuento</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipo-descuento">Tipo de Descuento</Label>
          <Select
            value={modo}
            onValueChange={(value: "none" | "porcentaje" | "fijo") =>
              setModo(value)
            }
          >
            <SelectTrigger id="tipo-descuento">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin descuento</SelectItem>
              <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
              <SelectItem value="fijo">Monto fijo ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {modo !== "none" && (
          <div className="space-y-2">
            <Label htmlFor="valor-descuento">
              {modo === "porcentaje" ? "Porcentaje (%)" : "Monto ($)"}
            </Label>
            <Input
              id="valor-descuento"
              type="number"
              step={modo === "porcentaje" ? "0.01" : "0.5"}
              min="0"
              max={modo === "porcentaje" ? "100" : subtotal}
              value={valor}
              onChange={(e) => setValor(Number.parseFloat(e.target.value) || 0)}
              placeholder={modo === "porcentaje" ? "10" : "5.00"}
            />
          </div>
        )}
      </div>

      {modo !== "none" && (
        <div className="text-sm text-muted-foreground">
          <p>
            Descuento: <strong>${calcularMonto().toFixed(2)}</strong>
          </p>
          <p>
            Total con descuento:{" "}
            <strong>${(subtotal - calcularMonto()).toFixed(2)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
