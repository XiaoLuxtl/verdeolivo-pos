// components/ProductoSearchSelect.tsx
"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// --- INTERFACES --- (Alinea con types.ts del padre; agrega categoria si falta allí)

interface Producto {
  readonly id: number;
  readonly nombre: string;
  readonly sku: string;
  readonly categoria: string;
  readonly precioUnitario: number;
  readonly unidad: string;
  readonly peso: number | null;
  readonly proveedor: string | null;
}

interface ProductoSearchSelectProps {
  productos: Producto[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// --- FUNCIONES DE UTILIDAD ---

/**
 * Normaliza la cadena para la búsqueda: minúsculas, elimina tildes y símbolos.
 * Esto asegura que 'TÉ' coincida con 'te'.
 */
const normalizeForSearch = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD") // Descompone caracteres con tildes
    .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos (tildes)
    .replace(/[^a-z0-9\s]/g, "") // Permite solo letras, números y espacios
    .trim();
};

/**
 * Crea una cadena unificada con los campos buscables para el 'value' de CommandItem.
 * Concatena Nombre, SKU y Categoría (sin ID, para evitar matches no deseados).
 */
const createSearchValue = (producto: Producto) => {
  // Concatenamos Nombre, SKU y Categoría (priorizando SKU y nombre como pediste).
  const rawValue = `${producto.nombre} ${producto.sku} ${producto.categoria}`;

  // Normalizamos toda la cadena para que Command filtre insensible a tildes.
  return normalizeForSearch(rawValue);
};

// --- COMPONENTE PRINCIPAL ---

export function ProductoSearchSelect({
  productos,
  value,
  onValueChange,
  placeholder = "Seleccionar producto...",
  disabled = false,
}: ProductoSearchSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedProducto = productos.find((p) => p.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span
            className={cn(
              "truncate",
              !selectedProducto && "text-muted-foreground"
            )}
          >
            {selectedProducto
              ? `${selectedProducto.nombre} - ${selectedProducto.sku} (${
                  selectedProducto.peso ?? 0
                }${selectedProducto.unidad})`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        {/* Usamos el filtro nativo de Command (shouldFilter=true por default) */}
        <Command>
          <CommandInput
            placeholder="Buscar por nombre, SKU o categoría..."
            className="h-9"
            // Command gestiona internamente el valor del input y el filtrado
          />
          <CommandList>
            {/* Mensaje de vacío manejado por Command */}
            <CommandEmpty>No se encontraron productos.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {/* Iteramos sobre todos los productos; Command filtra por value */}
              {productos.map((producto) => (
                <CommandItem
                  key={producto.id}
                  // **CLAVE:** value unificado para buscar en nombre + SKU + categoria
                  value={createSearchValue(producto)}
                  onSelect={() => {
                    onValueChange(producto.id.toString());
                    setOpen(false);
                  }}
                  className="flex flex-col items-start py-2"
                >
                  <div className="flex items-center w-full">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 flex-shrink-0",
                        value === producto.id.toString()
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {producto.nombre}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        SKU: {producto.sku} • Cat: {producto.categoria} •{" "}
                        {producto.peso ?? 0}
                        {producto.unidad}
                        {producto.proveedor && ` • ${producto.proveedor}`}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
