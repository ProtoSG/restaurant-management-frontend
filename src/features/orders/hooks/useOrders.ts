import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderServiceImpl } from "../services/OrderServiceImpl";
import type { CreateOrderRequest } from "../schemas/Order.schema";

const orderService = new OrderServiceImpl();

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
    }
  });
}

export function useAddItemToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, productId, quantity, notes }: { orderId: number; productId: number; quantity?: number; notes?: string }) =>
      orderService.addItemToOrder(orderId, productId, quantity, notes),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    },
    onError: (error) => {
      console.error('Error al agregar item:', error);
    }
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
    }
  });
}

export function useMarkOrderAsReady() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId }: { orderId: number }) => orderService.markAsReady(orderId),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    },
    onError: (error) => {
      console.error('Error al marcar orden como lista:', error);
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
