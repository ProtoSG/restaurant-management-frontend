import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderServiceImpl } from "../services/OrderServiceImpl";
import { printKitchenTicket } from "@/shared/printing/printer";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import type { CreateOrderRequest } from "../schemas/Order.schema";

const orderService = new OrderServiceImpl();

// Unique negative ids for optimistic items (Date.now() alone collides within the same ms).
let optimisticSeq = 0;
const nextOptimisticId = () => -(Date.now() * 1000 + (++optimisticSeq % 1000));

export function useActiveOrders() {
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['active-orders'],
    queryFn: () => orderService.getActiveOrders(),
    staleTime: 10000
  });

  return { orders, isLoading, error, refetch };
}

export function useOrderById(id: number, enabled = false) {
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: enabled && id > 0,
    staleTime: 10000,
  });

  return { order, isLoading, error };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    },
    onError: (error) => {
      console.error('Error al crear la orden:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useAddItemToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, productId, quantity, notes, isTakeaway }: {
      orderId: number;
      productId: number;
      quantity?: number;
      notes?: string;
      isTakeaway?: boolean;
      product?: import("@/shared/types/OrderProduct").OrderProduct;
    }) => orderService.addItemToOrder(orderId, productId, quantity, notes, isTakeaway),

    onMutate: async ({ orderId, quantity = 1, product }) => {
      if (!product) return undefined;
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });
      const previous = queryClient.getQueryData<import("@/shared/types/Order").Order>(['order', orderId]);
      if (previous) {
        const optimisticItem: import("@/shared/types/OrderItem").OrderItem = {
          id: nextOptimisticId(),
          quantity,
          subTotal: product.price * quantity,
          product,
        };
        queryClient.setQueryData<import("@/shared/types/Order").Order>(['order', orderId], {
          ...previous,
          items: [...previous.items, optimisticItem],
          total: previous.total + optimisticItem.subTotal,
        });
      }
      return { previous };
    },

    onError: (error, { orderId }, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['order', orderId], ctx.previous);
      console.error('Error al agregar item:', error);
      toast.error(getApiErrorMessage(error));
    },

    onSettled: (_, __, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    },
  });
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId, quantity }: { orderId: number; itemId: number; quantity: number }) =>
      orderService.updateOrderItem(orderId, itemId, quantity),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    },
    onError: (error) => {
      console.error('Error al actualizar item:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useRemoveOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) =>
      orderService.removeOrderItem(orderId, itemId),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    },
    onError: (error) => {
      console.error('Error al eliminar item:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; tableId?: number }) => orderService.cancelOrder(id),
    onSuccess: (_, { id, tableId }) => {
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      if (tableId) {
        queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
      }
    },
    onError: (error) => {
      console.error('Error al cancelar la orden:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useMarkOrderAsReady() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId }: { orderId: number; tableId?: number }) => orderService.markAsReady(orderId),
    onSuccess: (_, { orderId, tableId }) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      if (tableId) queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
    },
    onError: (error) => {
      console.error('Error al marcar orden como lista:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentMethod }: { orderId: number; paymentMethod: string }) =>
      orderService.payOrder(orderId, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    },
    onError: (error) => {
      console.error('Error al pagar la orden:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function usePayPartialOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, amount, paymentMethod }: { orderId: number; amount: number; paymentMethod: string }) =>
      orderService.payPartialOrder(orderId, amount, paymentMethod),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    },
    onError: (error) => {
      console.error('Error al pagar parcialmente la orden:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function usePrintThermal() {
  return useMutation({
    mutationFn: ({ order }: { order: import("@/shared/types/Order").Order }) => orderService.printThermal(order),
    onError: (error) => {
      console.error('Error al imprimir en impresora térmica:', error);
    }
  });
}

export function usePrintKitchen() {
  return useMutation({
    // Imprime PRIMERO el delta, y solo si la impresión sale bien lo marca como enviado.
    mutationFn: async ({ orderId }: { orderId: number }): Promise<{ printed: number }> => {
      const delta = await orderService.getKitchenPending(orderId);
      if (!delta.items?.length) return { printed: 0 };
      await printKitchenTicket(delta);
      await orderService.confirmKitchen(
        orderId,
        delta.items.map((i) => ({ itemId: i.id, quantity: i.quantity }))
      );
      return { printed: delta.items.length };
    },
    onError: (error) => {
      console.error('Error al imprimir comanda de cocina:', error);
    }
  });
}
