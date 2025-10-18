"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui";

type Props = {
  value: string | null;
  onChange: (base64: string | null) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
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
    <div className="form-control">
      <label className="label">
        <span className="label-text">Imagen (512x512px recomendado)</span>
      </label>

      {preview ? (
        <div className="relative w-64 h-64 mx-auto">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg border-2 border-base-300"
          />
          <Button
            type="button"
            onClick={handleRemove}
            variant="error"
            size="sm"
            className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-64 h-64 mx-auto border-2 border-dashed border-base-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
        >
          <Upload className="w-12 h-12 text-base-content/30 mb-2" />
          <p className="text-sm text-base-content/50">
            Click para subir imagen
          </p>
          <p className="text-xs text-base-content/30 mt-1">
            PNG, JPG (máx. 2MB)
          </p>
        </div>
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
