import { Modal } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { useSelectedTable, usePaymentConfirmationModal } from "@/features/tables";
import type { Order } from "@/shared/types/Order";
import { PaymentPanel } from "../PaymentPanel";

interface ModalPaymentConfirmationProps {
  order: Order | undefined;
  paymentModal: ReturnType<typeof usePaymentConfirmationModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  orderId?: number;
}

export function ModalPaymentConfirmation({
  order,
  paymentModal,
  selectedTable,
  orderId
}: ModalPaymentConfirmationProps) {
  const isOrderMode = orderId !== undefined && orderId > 0;
  const dialogRef = useModal(paymentModal.isOpen, paymentModal.sourceRef, true);

  if (!order) return null;
  if (!isOrderMode && !selectedTable.selectedTable) return null;

  return (
    <Modal
      dialogRef={dialogRef}
      setOpen={paymentModal.close}
      fullScreenMobile
      className="w-full lg:max-w-sm"
    >
      <PaymentPanel
        order={order}
        isOpen={paymentModal.isOpen}
        selectedTable={selectedTable}
        orderId={orderId}
        onSuccess={() => {
          paymentModal.close();
        }}
      />
    </Modal>
  );
}
