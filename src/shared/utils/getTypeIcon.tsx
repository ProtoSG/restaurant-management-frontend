import { FaConciergeBell, FaShoppingBag, FaTruck } from "react-icons/fa";
import type { ReactNode } from "react";
import { OrderType } from "@/shared/enums/OrderType";

export function getTypeIcon(type: OrderType | string): ReactNode {
  switch (type) {
    case OrderType.DINE_IN:
      return <FaConciergeBell className="text-lg" />;
    case OrderType.TAKEAWAY:
      return <FaShoppingBag className="text-lg" />;
    case OrderType.DELIVERY:
      return <FaTruck className="text-lg" />;
    default:
      return <FaConciergeBell className="text-lg" />;
  }
}
