import { useForm, useFieldArray } from "react-hook-form";
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
import { FaPlus, FaTrash } from "react-icons/fa";

interface Props {
  modal: ReturnType<typeof useProductModal>;
  productsHook: ReturnType<typeof useProducts>;
}

const EMPTY_FORM: CreateProductRequest = {
  name: "",
  price: "",
  categoryId: "",
  variants: [],
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
    control,
  } = useForm<CreateProductRequest>({
    resolver: zodResolver(createProductRequestSchema),
    defaultValues: EMPTY_FORM,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    if (!modal.isOpen) return;

    reset(
      modal.isEdit && modal.selectedProduct
        ? {
            name: modal.selectedProduct.name,
            price: modal.selectedProduct.price.toString(),
            categoryId: modal.selectedProduct.categoryId.toString(),
            variants: (modal.selectedProduct.variants ?? []).map((v) => ({
              id: v.id,
              name: v.name,
              price: v.price.toString(),
              sortOrder: v.sortOrder,
            })),
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
          label="Precio base (S/)"
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

        {/* Variantes */}
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Precios / Variantes</p>
              <p className="text-xs text-gray-400">Agrega tamaños o porciones con precio diferente</p>
            </div>
            <button
              type="button"
              onClick={() => append({ name: "", price: "", sortOrder: fields.length })}
              className="flex items-center gap-1.5 text-xs font-medium text-orange hover:text-orange/80 transition-colors cursor-pointer"
            >
              <FaPlus className="text-[10px]" />
              Agregar
            </button>
          </div>

          {fields.length === 0 && (
            <p className="text-xs text-gray-400 italic">
              Sin variantes — se usará el precio base del producto
            </p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Ej: Personal, Familiar..."
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange transition-colors bg-white"
                  {...register(`variants.${index}.name`)}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">S/</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-orange transition-colors bg-white tabular-nums"
                    {...register(`variants.${index}.price`)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1 p-2 rounded-lg text-gray-400 hover:text-red hover:bg-red/5 transition-colors cursor-pointer shrink-0"
                aria-label="Eliminar variante"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))}
        </div>

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
