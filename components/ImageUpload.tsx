"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  value: string | null;
  onChange: (base64: string | null) => void;
};

export default function ImageUpload({ value, onChange }: Readonly<Props>) {
  const [preview, setPreview] = useState<string | null>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen debe ser menor a 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Imagen (512x512px recomendado)
        </Label>
      </div>

      {preview ? (
        <div className="relative w-64 h-64 mx-auto group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg border-2 border-border shadow-sm"
          />
          <Button
            type="button"
            onClick={handleRemove}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-64 h-64 mx-auto border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-transparent"
          aria-label="Subir imagen"
        >
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Click para subir imagen
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG (máx. 2MB)</p>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
