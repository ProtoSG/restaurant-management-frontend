import { Button } from "./Button";
import { Variant } from "@/shared/enums/VariantEnum";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "red" | "orange" | "green";
  loading?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  variant = "red",
  loading = false,
}: ConfirmDialogProps) {
  const variantMap = {
    red: Variant.RED,
    orange: Variant.ORANGE,
    green: Variant.GREEN,
  };

  return (
    <div className="rounded-xl border-2 border-current border-opacity-30 p-4 space-y-3">
      <div className="text-center space-y-1">
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500">{message}</p>
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant={Variant.DEFAULT}
          styleButton="Secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          className="flex-1"
          variant={variantMap[variant]}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Procesando..." : confirmLabel}
        </Button>
      </div>
    </div>
  );
}
