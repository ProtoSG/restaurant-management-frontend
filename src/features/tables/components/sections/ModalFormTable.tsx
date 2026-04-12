import { useForm } from "react-hook-form";
import { Variant } from "@/shared/enums/VariantEnum";
import { useModal } from "@/shared/hooks/useModal";
import { useCreateTable, useDeleteTable, useUpdateTable, useTableModal, createTableRequestSchema } from "@/features/tables";
import type { CreateTableRequest } from "@/features/tables";
import { Button, Input, Modal, TitleModal } from "@/shared/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { TableStatus } from "@/features/tables";

interface Props {
  modal: ReturnType<typeof useTableModal>;
}

/**
 * Modal para crear/editar mesa.
 * 
 * Recibe el hook modal como prop para mantener la vista sin lógica de estado global.
 */
export function ModalFormTable({ modal }: Props) {
  const dialogRef = useModal(modal.isOpen);
  const updateTable = useUpdateTable();
  const createTable = useCreateTable();
  const deleteTable = useDeleteTable();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateTableRequest>({
    resolver: zodResolver(createTableRequestSchema)
  });

  useEffect(() => {
    if (modal.isOpen) {
      if (modal.isEdit && modal.selectedTable) {
        reset({
          number: modal.selectedTable.number
        });
      } else {
        reset({
          number: ''
        });
      }
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [modal.isOpen, modal.isEdit, modal.selectedTable, reset]);

  useEffect(() => {
    if (showDeleteModal && deleteModalRef.current) {
      deleteModalRef.current.showModal();
    } else if (!showDeleteModal && deleteModalRef.current) {
      deleteModalRef.current.close();
    }
  }, [showDeleteModal]);

  const onSubmit = async (data: CreateTableRequest) => {
    try {
      if (!modal.isEdit) {
        await createTable.mutateAsync(data);
      } else if (modal.selectedTable?.id) {
        await updateTable.mutateAsync({
          id: modal.selectedTable.id,
          table: { number: data.number }
        });
      }
      modal.close();
      reset();
    } catch (error) {
      console.error(`Error al ${modal.isEdit ? 'actualizar' : 'crear'} mesa:`, error);
    }
  };

  const handleDelete = async () => {
    if (!modal.selectedTable?.id) return;

    if (modal.selectedTable.status === TableStatus.OCCUPIED) {
      setDeleteError('No se puede eliminar una mesa ocupada. Por favor, finaliza o cancela la orden primero.');
      setShowDeleteModal(true);
      return;
    }

    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!modal.selectedTable?.id) return;

    try {
      await deleteTable.mutateAsync(modal.selectedTable.id);
      setShowDeleteModal(false);
      modal.close();
      reset();
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      setDeleteError('Error al eliminar la mesa. Por favor, intenta de nuevo.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteError(null);
  };

  const { ref, ...registerProps } = register("number");

  return (
    <>
      <Modal
        dialogRef={dialogRef}
        setOpen={modal.close}
      >
        <TitleModal>
          {!modal.isEdit ? "Crear Mesa" : `Editar Mesa ${modal.selectedTable?.number}`}
        </TitleModal>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <Input
            type="text"
            placeholder="1"
            label="Número de mesa"
            error={errors.number?.message}
            ref={(e) => {
              ref(e);
              inputRef.current = e;
            }}
            {...registerProps}
          />
          <Button 
            variant={Variant.GREEN}
            disabled={updateTable.isLoading || createTable.isLoading}
          >
            {!modal.isEdit ? 
              (createTable.isLoading ? 'Creando...' : 'Crear Mesa') : 
              (updateTable.isLoading ? 'Actualizando...' : 'Actualizar Mesa')
            }
          </Button>
          {modal.isEdit && (
            <Button
              variant={Variant.RED}
              type="button"
              onClick={handleDelete}
              disabled={deleteTable.isLoading}
            >
              {deleteTable.isLoading ? 'Eliminando...' : 'Eliminar Mesa'}
            </Button>
          )}
          {(updateTable.isError || createTable.isError || deleteTable.isError) && (
            <p className="text-red text-sm">
              Error al {modal.isEdit ? 'actualizar' : 'crear'} la mesa
            </p>
          )}
        </form>
      </Modal>

      {/* Modal de confirmación/error de eliminación */}
      <dialog
        ref={deleteModalRef}
        onClose={() => setShowDeleteModal(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            cancelDelete();
          }
        }}
        className="
          w-full mt-auto mb-0 rounded-t-2xl rounded-b-none
          lg:m-auto lg:w-fit lg:rounded-lg
          bg-foreground border border-gray-200
          backdrop:backdrop-blur-sm shadow-xl focus:outline-none overflow-hidden
        "
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-400" />
        </div>
        <div className="relative px-6 py-5 lg:px-8 lg:py-8 flex flex-col gap-6 lg:min-w-[400px]">
          <button
            onClick={cancelDelete}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
          
          <TitleModal>
            {deleteError ? 'Error' : 'Confirmar Eliminación'}
          </TitleModal>
          
          <p className="text-center">
            {deleteError 
              ? deleteError
              : `¿Estás seguro de que deseas eliminar la Mesa ${modal.selectedTable?.number}?`
            }
          </p>
          
          <div className="flex gap-4">
            {!deleteError ? (
              <>
                <Button
                  variant={Variant.DEFAULT}
                  onClick={cancelDelete}
                  className="flex-1"
                  disabled={deleteTable.isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant={Variant.RED}
                  onClick={confirmDelete}
                  className="flex-1"
                  disabled={deleteTable.isLoading}
                >
                  {deleteTable.isLoading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </>
            ) : (
              <Button
                variant={Variant.DEFAULT}
                onClick={cancelDelete}
                className="w-full"
              >
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
