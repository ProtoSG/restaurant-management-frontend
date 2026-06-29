import { useEffect, useRef, useState } from "react";
import { Modal, TitleModal, Input, Button } from "@/shared/components";
import { Variant } from "@/shared/enums/VariantEnum";
import { useModal } from "@/shared/hooks/useModal";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import type { Category } from "../types/Category";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sourceRef: React.RefObject<HTMLElement | null>;
  selected: Category | null;
  onCreate: (name: string) => Promise<unknown>;
  onUpdate: (args: { id: number; name: string }) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
  isSaving: boolean;
  isDeleting: boolean;
}

export function ModalCategoryForm({
  isOpen,
  onClose,
  sourceRef,
  selected,
  onCreate,
  onUpdate,
  onDelete,
  isSaving,
  isDeleting,
}: Props) {
  const dialogRef = useModal(isOpen, sourceRef);
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(selected?.name ?? "");
    setError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, selected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError("El nombre es obligatorio"); return; }

    try {
      if (selected) {
        await onUpdate({ id: selected.id, name: trimmed });
      } else {
        await onCreate(trimmed);
      }
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`¿Eliminar categoría "${selected.name}"? Los productos quedarán sin categoría.`)) return;
    try {
      await onDelete(selected.id);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <Modal dialogRef={dialogRef} setOpen={onClose}>
      <TitleModal>{selected ? "Editar Categoría" : "Nueva Categoría"}</TitleModal>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-[280px]">
        <Input
          ref={inputRef}
          label="Nombre"
          placeholder="Ej: Entradas"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          error={error}
        />

        <Button variant={Variant.GREEN} disabled={isSaving}>
          {isSaving ? "Guardando..." : selected ? "Actualizar" : "Crear"}
        </Button>

        {selected && (
          <Button
            variant={Variant.RED}
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar Categoría"}
          </Button>
        )}
      </form>
    </Modal>
  );
}
