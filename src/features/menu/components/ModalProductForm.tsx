import { useForm, useFieldArray } from "react-hook-form";
import { Variant } from "@/shared/enums/VariantEnum";
import { useModal } from "@/shared/hooks/useModal";
import { Button, Input, Modal, TitleModal, Select } from "@/shared/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductRequestSchema } from "../schemas/Product.schema";
import type { CreateProductRequest } from "../schemas/Product.schema";
import { useEffect, useRef, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import type { useProductModal } from "../hooks/useProductModal";
import type { useProducts } from "../hooks/useProducts";
import { FaPlus, FaTrash, FaImage, FaTimes } from "react-icons/fa";
import { getApiErrorMessage } from "@/shared/utils/apiError";

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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
    setImageUrl(modal.selectedProduct?.imageUrl ?? null);
    setImageError(null);

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [modal.isOpen, modal.isEdit, modal.selectedProduct, reset]);

  const handlePickImage = () => imageInputRef.current?.click();

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo si hace falta
    if (!file || !modal.selectedProduct) return;

    setImageError(null);
    setIsUploadingImage(true);
    try {
      const updated = await productsHook.uploadProductImage(modal.selectedProduct.id, file);
      setImageUrl(updated.imageUrl);
    } catch (err) {
      setImageError(getApiErrorMessage(err));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!modal.selectedProduct) return;

    setImageError(null);
    setIsUploadingImage(true);
    try {
      const updated = await productsHook.deleteProductImage(modal.selectedProduct.id);
      setImageUrl(updated.imageUrl);
    } catch (err) {
      setImageError(getApiErrorMessage(err));
    } finally {
      setIsUploadingImage(false);
    }
  };

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

        {/* Foto: solo aplica a un producto que ya existe (necesita un id real para asociarla) —
            se sube/reemplaza al tocar, sin depender del botón "Guardar" del resto del form. */}
        {modal.isEdit && modal.selectedProduct && (
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Foto del plato</p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FaImage className="text-gray-300 text-xl" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelected}
                />
                <button
                  type="button"
                  onClick={handlePickImage}
                  disabled={isUploadingImage}
                  className="text-sm font-semibold text-orange hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-left"
                >
                  {isUploadingImage ? "Subiendo…" : imageUrl ? "Cambiar foto" : "Subir foto"}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                    className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-left"
                  >
                    <FaTimes className="text-[10px]" />
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
            {imageError && <p className="text-red text-xs">{imageError}</p>}
          </div>
        )}

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
