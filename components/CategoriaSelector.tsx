// components/CategoriaSelector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type CategoriaReceta = "MALTEADA" | "ALOE" | "SHAKE" | "SUPLEMENTO" | "OTRO";

interface CategoriaSelectorProps {
  readonly value: CategoriaReceta;
  readonly onChange: (value: CategoriaReceta) => void;
  readonly label?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
}

const categorias: {
  value: CategoriaReceta;
  label: string;
  descripcion: string;
}[] = [
  { value: "MALTEADA", label: "Malteada", descripcion: "Bebidas malteadas" },
  { value: "ALOE", label: "Aloe", descripcion: "Productos de aloe vera" },
  { value: "SHAKE", label: "Shake", descripcion: "Shakes proteicos" },
  {
    value: "SUPLEMENTO",
    label: "Suplemento",
    descripcion: "Suplementos nutricionales",
  },
  { value: "OTRO", label: "Otro", descripcion: "Otra categoría" },
];

export function CategoriaSelector({
  value,
  onChange,
  label = "Categoría",
  placeholder = "Seleccionar categoría",
  required = false,
}: CategoriaSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="categoria">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={(newValue) => onChange(newValue as CategoriaReceta)}
      >
        <SelectTrigger id="categoria">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categorias.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              <div className="flex flex-col">
                <span className="font-medium">{cat.label}</span>
                <span className="text-xs text-muted-foreground">
                  {cat.descripcion}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
