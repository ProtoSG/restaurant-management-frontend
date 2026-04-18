import { useMutation, useQuery, useQueryClient } from "react-query";
import { OrderServiceImpl } from "../services/OrderServiceImpl";
import type { CreateOrderRequest } from "../schemas/Order.schema";

const orderService = new OrderServiceImpl();

export function useActiveOrders() {
  const { data: orders = [], isLoading, error, refetch } = useQuery(
    'active-orders',
    () => orderService.getActiveOrders(),
    { staleTime: 10000 }
  );

  return { orders, isLoading, error, refetch };
}

export function useOrderById(id: number, enabled = false) {
  const { data: order, isLoading, error } = useQuery(
    ['order', id],
    () => orderService.getOrderById(id),
    {
      enabled: enabled && id > 0,
      staleTime: 10000,
    }
  );

  return { order, isLoading, error };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: CreateOrderRequest) => orderService.createOrder(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('active-orders');
      },
      onError: (error) => {
        console.error('Error al crear la orden:', error);
      }
    }
  );
}

export function useAddItemToOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ orderId, productId, quantity }: { orderId: number; productId: number; quantity?: number }) =>
      orderService.addItemToOrder(orderId, productId, quantity),
    {
      onSuccess: (_, { orderId }) => {
        queryClient.invalidateQueries(['order', orderId]);
        queryClient.invalidateQueries('active-orders');
      },
      onError: (error) => {
        console.error('Error al agregar item:', error);
      }
    }
  );
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ orderId, itemId, quantity }: { orderId: number; itemId: number; quantity: number }) =>
      orderService.updateOrderItem(orderId, itemId, quantity),
    {
      onSuccess: (_, { orderId }) => {
        queryClient.invalidateQueries(['order', orderId]);
        queryClient.invalidateQueries('active-orders');
      },
      onError: (error) => {
        console.error('Error al actualizar item:', error);
      }
    }
  );
}

export function useRemoveOrderItem() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ orderId, itemId }: { orderId: number; itemId: number }) =>
      orderService.removeOrderItem(orderId, itemId),
    {
      onSuccess: (_, { orderId }) => {
        queryClient.invalidateQueries(['order', orderId]);
        queryClient.invalidateQueries('active-orders');
      },
      onError: (error) => {
        console.error('Error al eliminar item:', error);
      }
    }
  );
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id }: { id: number; tableId?: number }) => orderService.cancelOrder(id),
    {
      onSuccess: (_, { id, tableId }) => {
        queryClient.invalidateQueries('active-orders');
        queryClient.invalidateQueries('tables');
        queryClient.invalidateQueries(['order', id]);
        if (tableId) {
          queryClient.invalidateQueries(`order-${tableId}`);
        }
      },
      onError: (error) => {
        console.error('Error al cancelar la orden:', error);
      }
    }
  );
}

export function useMarkOrderAsReady() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ orderId }: { orderId: number }) => orderService.markAsReady(orderId),
    {
      onSuccess: (_, { orderId }) => {
        queryClient.invalidateQueries(['order', orderId]);
        queryClient.invalidateQueries('active-orders');
      },
      onError: (error) => {
        console.error('Error al marcar orden como lista:', error);
      }
    }
  );
}

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ orderId, paymentMethod }: { orderId: number; paymentMethod: string }) =>
      orderService.payOrder(orderId, paymentMethod),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('active-orders');
      },
      onError: (error) => {
        console.error('Error al pagar la orden:', error);
      }
    }
  );
}

export function usePayPartialOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ orderId, amount, paymentMethod }: { orderId: number; amount: number; paymentMethod: string }) =>
      orderService.payPartialOrder(orderId, amount, paymentMethod),
    {
      onSuccess: (_, { orderId }) => {
        queryClient.invalidateQueries(['order', orderId]);
        queryClient.invalidateQueries('active-orders');
      },
      onError: (error) => {
        console.error('Error al pagar parcialmente la orden:', error);
      }
    }
  );
}

export function usePrintThermal() {
  return useMutation(
    ({ orderId }: { orderId: number }) => orderService.printThermal(orderId),
    {
      onError: (error) => {
        console.error('Error al imprimir en impresora térmica:', error);
      }
    }
  );
}