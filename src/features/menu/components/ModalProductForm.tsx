import { useForm } from "react-hook-form";
import { Variant } from "@/shared/enums/VariantEnum";
import { useModal } from "@/shared/hooks/useModal";
import { Button, Input, Modal, TitleModal, Select } from "@/shared/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductRequestSchema } from "../schemas/Product.schema";
import type { CreateProductRequest } from "../schemas/Product.schema";
import { useEffect, useRef } from "react";
import { useCategories } from "../hooks/useCategories";
import type { useProductModal } from "../hooks/useProductModal";
import type { useProducts } from "../hooks/useProducts";

interface Props {
  modal: ReturnType<typeof useProductModal>;
  productsHook: ReturnType<typeof useProducts>;
}

const EMPTY_FORM: CreateProductRequest = {
  name: "",
  price: "",
  categoryId: "",
};

export function ModalProductForm({ modal, productsHook }: Props) {
  const dialogRef = useModal(modal.isOpen, modal.sourceRef, true);
  const { categories = [] } = useCategories();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductRequest>({
    resolver: zodResolver(createProductRequestSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!modal.isOpen) return;

    reset(
      modal.isEdit && modal.selectedProduct
        ? {
            name: modal.selectedProduct.name,
            price: modal.selectedProduct.price.toString(),
            categoryId: modal.selectedProduct.categoryId.toString(),
          }
        : EMPTY_FORM
    );

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [modal.isOpen, modal.isEdit, modal.selectedProduct, reset]);

  const onSubmit = async (data: CreateProductRequest) => {
    try {
      if (modal.isEdit && modal.selectedProduct) {
        await productsHook.updateProduct(modal.selectedProduct.id, data);
      } else {
        await productsHook.createProduct(data);
      }
      modal.close();
      reset(EMPTY_FORM);
    } catch (error) {
      console.error(`Error al ${modal.isEdit ? "actualizar" : "crear"} producto:`, error);
    }
  };

  const handleDelete = async () => {
    if (!modal.selectedProduct) return;
    if (!confirm(`¿Estás seguro de eliminar "${modal.selectedProduct.name}"?`)) return;

    try {
      await productsHook.deleteProduct(modal.selectedProduct.id);
      modal.close();
      reset(EMPTY_FORM);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const { ref, ...registerProps } = register("name");

  return (
    <Modal dialogRef={dialogRef} setOpen={modal.close} fullScreenMobile>
      <TitleModal>
        {modal.isEdit ? "Editar Producto" : "Crear Producto"}
      </TitleModal>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Ej: Hamburguesa"
          label="Nombre del producto"
          error={errors.name?.message}
          ref={(e) => {
            ref(e);
            inputRef.current = e;
          }}
          {...registerProps}
        />

        <Input
          type="number"
          placeholder="0.00"
          label="Precio (S/)"
          step="0.01"
          error={errors.price?.message}
          {...register("price")}
        />

        <Select
          label="Categoría"
          options={[
            { value: "", label: "Selecciona una categoría" },
            ...categories.map((category) => ({
              value: category.id,
              label: category.name,
            })),
          ]}
          error={errors.categoryId?.message}
          {...register("categoryId")}
        />

        <Button variant={Variant.GREEN} disabled={productsHook.isLoading}>
          {modal.isEdit
            ? productsHook.isLoading ? "Actualizando..." : "Actualizar Producto"
            : productsHook.isLoading ? "Creando..." : "Crear Producto"}
        </Button>

        {modal.isEdit && (
          <Button
            variant={Variant.RED}
            type="button"
            onClick={handleDelete}
            disabled={productsHook.isLoading}
          >
            {productsHook.isLoading ? "Eliminando..." : "Eliminar Producto"}
          </Button>
        )}

        {productsHook.error && (
          <p className="text-red text-sm">Error: {productsHook.error.message}</p>
        )}
      </form>
    </Modal>
  );
}
