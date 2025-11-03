import { useForm } from "react-hook-form";
import { Variant } from "../../enums/VariantEnum";
import { useTableEditModal } from "../../hooks/useModal";
import { useCreateTable, useDeleteTable, useUpdateTable } from "../../hooks/useTables";
import { useTableEditModalStore } from "../../stores/ModalStore";
import { useTableStore } from "../../stores/TableStore";
import { Button, Input, Modal, TitelModal } from "../../components/UI";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTableRequestSchema, type CreateTableRequest } from "../../models/Table.model";
import { useEffect, useRef, useState } from "react";
import { TableStatus } from "../../enums/Table.enum";

export function ModalFormTable() {
  const { isOpen, setOpen } = useTableEditModalStore();
  const dialogRef = useTableEditModal(isOpen);
  const { table, isEdit } = useTableStore();
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
    if (isOpen) {
      if (isEdit && table) {
        reset({
          number: table.number
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
  }, [isOpen, isEdit, table, reset]);

  useEffect(() => {
    if (showDeleteModal && deleteModalRef.current) {
      deleteModalRef.current.showModal();
    } else if (!showDeleteModal && deleteModalRef.current) {
      deleteModalRef.current.close();
    }
  }, [showDeleteModal]);

  const onSubmit = async (data: CreateTableRequest) => {
    try {
      if (!isEdit) {
        await createTable.mutateAsync(data);
      } else if (table?.id) {
        await updateTable.mutateAsync({
          id: table.id,
          table: { number: data.number }
        });
      }
      setOpen(false);
      reset();
    } catch (error) {
      console.error(`Error al ${isEdit ? 'actualizar' : 'crear'} mesa:`, error);
    }
  };

  const handleDelete = async () => {
    if (!table?.id) return;

    if (table.status === TableStatus.OCCUPIED) {
      setDeleteError('No se puede eliminar una mesa ocupada. Por favor, finaliza o cancela la orden primero.');
      setShowDeleteModal(true);
      return;
    }

    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!table?.id) return;

    try {
      await deleteTable.mutateAsync(table.id);
      setShowDeleteModal(false);
      setOpen(false);
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
        setOpen={setOpen}
      >
        <TitelModal>
          {!isEdit ? "Crear Mesa" : `Editar Mesa ${table?.number}`}
        </TitelModal>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <Input 
            type="text"
            placeholder="1"
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
            {!isEdit ? 
              (createTable.isLoading ? 'Creando...' : 'Crear Mesa') : 
              (updateTable.isLoading ? 'Actualizando...' : 'Actualizar Mesa')
            }
          </Button>
          {isEdit && (
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
            <p className="text-red-500 text-sm">
              Error al {isEdit ? 'actualizar' : 'crear'} la mesa
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
        className="m-auto bg-foreground border-2 rounded-lg backdrop:backdrop-blur-sm shadow-[12px_12px_5px_1px] shadow-background focus:outline-none"
      >
        <div className="relative px-8 py-8 flex flex-col gap-6 min-w-[400px]">
          <button
            onClick={cancelDelete}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
          
          <TitelModal>
            {deleteError ? 'Error' : 'Confirmar Eliminación'}
          </TitelModal>
          
          <p className="text-center">
            {deleteError 
              ? deleteError
              : `¿Estás seguro de que deseas eliminar la Mesa ${table?.number}?`
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
