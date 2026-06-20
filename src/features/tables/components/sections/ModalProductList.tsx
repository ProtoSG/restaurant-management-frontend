import { Modal, TitleModal } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { useSelectedCategory } from "@/features/menu";
import { useSelectedTable, useProductListModal } from "@/features/tables";
import { ProductCatalogPanel } from "../ProductCatalogPanel";

interface Props {
  productListModal: ReturnType<typeof useProductListModal>;
  selectedCategory: ReturnType<typeof useSelectedCategory>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  orderId?: number;
}

export function ModalProductList({ productListModal, selectedCategory, selectedTable, orderId }: Props) {
  const dialogRef = useModal(productListModal.isOpen, productListModal.sourceRef, true);

  return (
    <Modal
      dialogRef={dialogRef}
      setOpen={productListModal.close}
      fullScreenMobile
      className="w-full lg:w-[620px] lg:h-[620px] lg:overflow-hidden"
    >
      <TitleModal>Carta</TitleModal>
      <ProductCatalogPanel
        selectedCategory={selectedCategory}
        selectedTable={selectedTable}
        orderId={orderId}
      />
    </Modal>
  );
}
