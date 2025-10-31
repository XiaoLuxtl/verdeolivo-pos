// types/ui.ts - Tipos para componentes de UI y formularios
export interface CompraFormProps {
  readonly open?: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
}

export interface ModalProps {
  open?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
