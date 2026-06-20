import { useRef, useState } from "react";
import { useUsers } from "./hooks/useUsers";
import { ModalUserForm } from "./components/ModalUserForm";
import { ROLE_LABELS, ROLE_COLORS } from "@/shared/enums/RoleLabels";
import { HeaderSection, SkeletonCard, ErrorState, EmptyState, Pagination } from "@/shared/components";
import { useAuth } from "@/features/auth";
import type { User } from "./types/User";
import { MdEdit, MdDelete, MdPeople } from "react-icons/md";
import { getApiErrorMessage } from "@/shared/utils/apiError";

export function Users() {
  const { users, isLoading, error, page, setPage, pagination, createUser, updateUser, toggleActive, deleteUser, isCreating, isUpdating, isTogglingId, isDeletingId } = useUsers();
  const { user: me } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const sourceRef = useRef<HTMLElement | null>(null);

  const openCreate = (src: HTMLElement) => {
    sourceRef.current = src;
    setSelectedUser(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (u: User, src: HTMLElement) => {
    sourceRef.current = src;
    setSelectedUser(u);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleToggle = async (u: User) => {
    setActionError(null);
    try {
      await toggleActive(u.id);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`¿Eliminar usuario "${u.name}" (@${u.username})?`)) return;
    setActionError(null);
    try {
      await deleteUser(u.id);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <main className="flex flex-col gap-6 w-full p-6">
        <HeaderSection
          title="Usuarios"
          subTitle="Gestión de cuentas y roles del sistema"
          buttonLabel="Crear Usuario"
          buttonFunction={openCreate}
        />

        {actionError && (
          <div className="bg-red/10 border border-red/30 text-red text-sm rounded-xl px-4 py-3">
            {actionError}
          </div>
        )}

        {isLoading && <SkeletonCard count={4} />}
        {!isLoading && error && <ErrorState message="Error al cargar usuarios" />}
        {!isLoading && !error && users.length === 0 && (
          <EmptyState message="No hay usuarios" icon={<MdPeople className="text-4xl text-gray-300" />} />
        )}

        {!isLoading && !error && users.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Usuario</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Activo</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u.id === me?.id;
                  const isToggling = isTogglingId === u.id;
                  const isDeleting = isDeletingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-gray-50 last:border-0 transition-colors ${
                        !u.isActive ? "opacity-50" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{u.name}</span>
                          {isMe && (
                            <span className="text-[10px] font-semibold bg-orange/10 text-orange px-1.5 py-0.5 rounded-full">
                              tú
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="font-mono text-xs text-gray-500">@{u.username}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <label className={`relative inline-block w-[42px] h-5 ${isMe ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}>
                          <input
                            type="checkbox"
                            checked={u.isActive}
                            onChange={() => handleToggle(u)}
                            disabled={isMe || isToggling}
                            className="opacity-0 w-0 h-0 peer"
                          />
                          <span className="absolute inset-0 bg-gray-300 rounded-full transition-all duration-300
                                          before:content-[''] before:absolute before:h-[14px] before:w-[14px]
                                          before:left-[3px] before:bottom-[3px] before:bg-white before:rounded-full
                                          before:transition-all before:duration-300
                                          peer-checked:bg-green peer-checked:before:translate-x-[22px]
                                          peer-disabled:opacity-50" />
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => openEdit(u, e.currentTarget as HTMLElement)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-orange transition-colors cursor-pointer"
                            title="Editar usuario"
                          >
                            <MdEdit size={16} />
                          </button>
                          {!isMe && (
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-lg hover:bg-red/10 text-gray-400 hover:text-red transition-colors cursor-pointer disabled:opacity-40"
                              title="Eliminar usuario"
                            >
                              <MdDelete size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && pagination.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </main>

      <ModalUserForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sourceRef={sourceRef}
        mode={modalMode}
        user={selectedUser}
        onCreate={createUser}
        onUpdate={updateUser}
        isSubmitting={isCreating || isUpdating}
      />
    </>
  );
}
