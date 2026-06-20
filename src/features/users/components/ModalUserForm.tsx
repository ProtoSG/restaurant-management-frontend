import { useEffect, useRef, useState } from "react";
import { Modal, TitleModal, Input, Button, Select } from "@/shared/components";
import { Variant } from "@/shared/enums/VariantEnum";
import { useModal } from "@/shared/hooks/useModal";
import type { User, CreateUserRequest, UpdateUserRequest } from "../types/User";
import type { RoleName } from "@/features/auth/types/Login";

const ROLES: { value: RoleName; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "CASHIER", label: "Cajero" },
  { value: "WAITER", label: "Mesero" },
  { value: "CHEF", label: "Cocinero" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sourceRef: React.RefObject<HTMLElement | null>;
  mode: "create" | "edit";
  user: User | null;
  onCreate: (req: CreateUserRequest) => Promise<void>;
  onUpdate: (args: { id: number; req: UpdateUserRequest }) => Promise<void>;
  isSubmitting: boolean;
}

export function ModalUserForm({ isOpen, onClose, sourceRef, mode, user, onCreate, onUpdate, isSubmitting }: Props) {
  const dialogRef = useModal(isOpen, sourceRef);
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleName>("WAITER");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    if (mode === "edit" && user) {
      setName(user.name);
      setUsername(user.username);
      setPassword("");
      setRole(user.role);
    } else {
      setName("");
      setUsername("");
      setPassword("");
      setRole("WAITER");
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, mode, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError("El nombre es obligatorio"); return; }

    try {
      if (mode === "create") {
        const trimmedUser = username.trim();
        if (!trimmedUser) { setError("El username es obligatorio"); return; }
        if (!password.trim()) { setError("La contraseña es obligatoria"); return; }
        await onCreate({ name: trimmed, username: trimmedUser, password: password.trim(), role });
      } else {
        if (!user) return;
        await onUpdate({ id: user.id, req: { name: trimmed, role } });
      }
      onClose();
    } catch {
      setError(mode === "create" ? "Error al crear el usuario" : "Error al actualizar el usuario");
    }
  };

  const isCreate = mode === "create";

  return (
    <Modal dialogRef={dialogRef} setOpen={onClose}>
      <TitleModal>{isCreate ? "Crear Usuario" : "Editar Usuario"}</TitleModal>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-[280px]">
        {!isCreate && (
          <div className="text-sm text-gray-500">
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{user?.username}</span>
          </div>
        )}

        <Input
          ref={inputRef}
          label="Nombre"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          error={error}
        />

        {isCreate && (
          <>
            <Input
              label="Username"
              placeholder="nombre.usuario"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
          </>
        )}

        <Select
          label="Rol"
          value={role}
          onChange={(e) => setRole(e.target.value as RoleName)}
          options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
        />

        <Button variant={Variant.GREEN} disabled={isSubmitting}>
          {isSubmitting
            ? (isCreate ? "Creando..." : "Guardando...")
            : (isCreate ? "Crear Usuario" : "Guardar Cambios")
          }
        </Button>
      </form>
    </Modal>
  );
}
